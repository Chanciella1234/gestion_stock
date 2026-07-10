const Commande = require('../models/Commande');
const Panier = require('../models/Panier');
const Produit = require('../models/Produit');
const Promotion = require('../models/Promotion');
const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

exports.creer = async (req, res, next) => {
  try {
    const panier = await Panier.findOne({ utilisateur: req.user._id }).populate('lignes.produit');

    if (!panier || panier.lignes.length === 0) {
      return error(res, 'Le panier est vide.', 400);
    }

    for (const ligne of panier.lignes) {
      if (!ligne.produit) {
        return error(res, `Produit introuvable dans le panier.`, 400);
      }
      if (ligne.produit.stock < ligne.quantite) {
        return error(res, `Stock insuffisant pour "${ligne.produit.nom}".`, 400);
      }
    }

    const lignesCommande = panier.lignes.map(l => ({
      produit: l.produit._id,
      nom_produit: l.produit.nom,
      quantite: l.quantite,
      prix_unitaire: l.produit.prix
    }));

    let montantTotal = lignesCommande.reduce(
      (acc, l) => acc + l.prix_unitaire * l.quantite, 0
    );

    const { codePromo } = req.body;
    let codePromoApplique = null;

    if (codePromo) {
      const promotion = await Promotion.findOne({ code: codePromo.toUpperCase() });
      if (!promotion || !promotion.estValide()) {
        return error(res, 'Code promo invalide ou expiré.', 400);
      }

      if (promotion.type === 'pourcentage') {
        montantTotal -= montantTotal * (promotion.valeur / 100);
      } else {
        montantTotal = Math.max(0, montantTotal - promotion.valeur);
      }

      codePromoApplique = promotion.code;
    }

    montantTotal = Math.round(montantTotal * 100) / 100;

    const commande = await Commande.create({
      utilisateur: req.user._id,
      lignes: lignesCommande,
      montant_total: montantTotal,
      statut: 'en_attente',
      code_promo_applique: codePromoApplique,
      historique_statuts: [{ statut: 'en_attente', date: new Date() }]
    });

    panier.lignes = [];
    await panier.save();

    await Notification.create({
      utilisateur: req.user._id,
      message: `Votre commande #${commande._id.toString().slice(-6).toUpperCase()} a été créée avec succès.`,
      type: 'commande'
    });

    success(res, commande, 'Commande créée avec succès', 201);
  } catch (err) {
    next(err);
  }
};

exports.mesCommandes = async (req, res, next) => {
  try {
    const commandes = await Commande.find({ utilisateur: req.user._id })
      .sort('-createdAt');
    success(res, commandes);
  } catch (err) {
    next(err);
  }
};

exports.toutesLesCommandes = async (req, res, next) => {
  try {
    const commandes = await Commande.find()
      .populate('utilisateur', 'nom email')
      .sort('-createdAt');
    success(res, commandes);
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('utilisateur', 'nom email');
    if (!commande) {
      return error(res, 'Commande non trouvée.', 404);
    }
    success(res, commande);
  } catch (err) {
    next(err);
  }
};

exports.changerStatut = async (req, res, next) => {
  try {
    const { statut } = req.body;
    const statutsValides = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];

    if (!statut || !statutsValides.includes(statut)) {
      return error(res, 'Statut invalide.', 400);
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return error(res, 'Commande non trouvée.', 404);
    }

    const transitions = {
      en_attente: ['confirmee', 'annulee'],
      confirmee: ['expediee', 'annulee'],
      expediee: ['livree'],
      livree: [],
      annulee: []
    };

    const suivants = transitions[commande.statut];
    if (!suivants || !suivants.includes(statut)) {
      return error(res, `Transition invalide : "${commande.statut}" → "${statut}".`, 400);
    }

    // Quand l'admin confirme la commande, déduire le stock
    if (statut === 'confirmee') {
      for (const ligne of commande.lignes) {
        await Produit.findByIdAndUpdate(ligne.produit, {
          $inc: { stock: -ligne.quantite }
        });
        await Produit.creerSiNecessaire(ligne.produit);
      }
    }

    // Si annulée, remettre le stock si elle était confirmée
    if (statut === 'annulee' && commande.statut === 'confirmee') {
      for (const ligne of commande.lignes) {
        await Produit.findByIdAndUpdate(ligne.produit, {
          $inc: { stock: ligne.quantite }
        });
        await Produit.creerSiNecessaire(ligne.produit);
      }
    }

    commande.statut = statut;
    commande.historique_statuts.push({ statut, date: new Date() });
    await commande.save();

    const etiquettesStatut = {
      en_attente: 'en attente',
      confirmee: 'confirmée',
      expediee: 'expédiée',
      livree: 'livrée',
      annulee: 'annulée'
    };

    await Notification.create({
      utilisateur: commande.utilisateur,
      message: `Votre commande #${commande._id.toString().slice(-6).toUpperCase()} est maintenant "${etiquettesStatut[statut] || statut}".`,
      type: 'commande'
    });

    success(res, commande, 'Statut mis à jour');
  } catch (err) {
    next(err);
  }
};
