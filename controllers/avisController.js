const Avis = require('../models/Avis');
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const { success, error } = require('../utils/apiResponse');
const { validerNote } = require('../utils/validators');

async function recalculerNoteMoyenne(produitId) {
  const resultat = await Avis.aggregate([
    { $match: { produit: produitId, valide: true } },
    { $group: { _id: null, moyenne: { $avg: '$note' }, nb: { $sum: 1 } } }
  ]);
  const moyenne = resultat.length > 0 ? Math.round(resultat[0].moyenne * 10) / 10 : 0;
  const nbAvis = resultat.length > 0 ? resultat[0].nb : 0;
  await Produit.findByIdAndUpdate(produitId, { moyenne_notes: moyenne, nb_avis: nbAvis });
}

exports.liste = async (req, res, next) => {
  try {
    const { produit } = req.query;
    const filter = { valide: true };
    if (produit) filter.produit = produit;

    const avis = await Avis.find(filter)
      .populate('utilisateur', 'nom')
      .populate('produit', 'nom')
      .sort('-createdAt');

    success(res, avis);
  } catch (err) {
    next(err);
  }
};

exports.listeNonValides = async (req, res, next) => {
  try {
    const avis = await Avis.find({ valide: false })
      .populate('utilisateur', 'nom email')
      .populate('produit', 'nom')
      .sort('-createdAt');
    success(res, avis);
  } catch (err) {
    next(err);
  }
};

exports.creer = async (req, res, next) => {
  try {
    const { produit, note, commentaire } = req.body;

    if (!produit || !note) {
      return error(res, 'Produit et note requis.', 400);
    }
    if (!validerNote(note)) {
      return error(res, 'La note doit être un entier entre 1 et 5.', 400);
    }

    const aAchete = await Commande.findOne({
      utilisateur: req.user._id,
      'lignes.produit': produit,
      statut: { $in: ['livree', 'expediee'] }
    });

    if (!aAchete) {
      return error(res, 'Vous devez avoir acheté ce produit pour laisser un avis.', 400);
    }

    const existe = await Avis.findOne({ utilisateur: req.user._id, produit });
    if (existe) {
      return error(res, 'Vous avez déjà laissé un avis sur ce produit.', 400);
    }

    const avis = await Avis.create({
      utilisateur: req.user._id,
      produit,
      note,
      commentaire
    });

    success(res, avis, 'Avis soumis pour validation', 201);
  } catch (err) {
    next(err);
  }
};

exports.valider = async (req, res, next) => {
  try {
    const avis = await Avis.findByIdAndUpdate(
      req.params.id,
      { valide: true },
      { new: true }
    );

    if (!avis) {
      return error(res, 'Avis non trouvé.', 404);
    }

    await recalculerNoteMoyenne(avis.produit);

    success(res, avis, 'Avis validé');
  } catch (err) {
    next(err);
  }
};

exports.supprimer = async (req, res, next) => {
  try {
    const avis = await Avis.findByIdAndDelete(req.params.id);
    if (!avis) {
      return error(res, 'Avis non trouvé.', 404);
    }
    await recalculerNoteMoyenne(avis.produit);
    success(res, null, 'Avis supprimé');
  } catch (err) {
    next(err);
  }
};
