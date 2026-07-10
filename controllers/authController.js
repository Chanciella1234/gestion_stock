const Utilisateur = require('../models/Utilisateur');
const Panier = require('../models/Panier');
const Commande = require('../models/Commande');
const Avis = require('../models/Avis');
const Notification = require('../models/Notification');
const { genererToken } = require('../utils/jwtUtils');
const { success, error } = require('../utils/apiResponse');
const { validerEmail, validerMotDePasse } = require('../utils/validators');

exports.inscription = async (req, res, next) => {
  try {
    const { nom, email, mot_de_passe, telephone, adresse } = req.body;

    if (!nom || !email || !mot_de_passe) {
      return error(res, 'Tous les champs sont requis.', 400);
    }
    if (!validerEmail(email)) {
      return error(res, 'Email invalide.', 400);
    }
    if (!validerMotDePasse(mot_de_passe)) {
      return error(res, 'Le mot de passe doit faire au moins 6 caractères.', 400);
    }

    const existe = await Utilisateur.findOne({ email });
    if (existe) {
      return error(res, 'Cet email est déjà utilisé.', 400);
    }

    const utilisateur = await Utilisateur.create({ nom, email, mot_de_passe, telephone, adresse });
    const token = genererToken({ id: utilisateur._id, role: utilisateur.role });

    success(res, {
      _id: utilisateur._id,
      nom: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.role,
      token
    }, 'Inscription réussie', 201);
  } catch (err) {
    next(err);
  }
};

exports.connexion = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return error(res, 'Email et mot de passe requis.', 400);
    }

    const utilisateur = await Utilisateur.findOne({ email }).select('+mot_de_passe');
    if (!utilisateur) {
      return error(res, 'Email ou mot de passe incorrect.', 401);
    }

    const estValide = await utilisateur.comparerMotDePasse(mot_de_passe);
    if (!estValide) {
      return error(res, 'Email ou mot de passe incorrect.', 401);
    }

    const token = genererToken({ id: utilisateur._id, role: utilisateur.role });

    success(res, {
      _id: utilisateur._id,
      nom: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.role,
      token
    }, 'Connexion réussie');
  } catch (err) {
    next(err);
  }
};

exports.supprimerCompte = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Panier.deleteMany({ utilisateur: userId }),
      Commande.deleteMany({ utilisateur: userId }),
      Avis.deleteMany({ utilisateur: userId }),
      Notification.deleteMany({ utilisateur: userId })
    ]);

    await Utilisateur.findByIdAndDelete(userId);

    success(res, null, 'Compte supprimé avec succès.');
  } catch (err) {
    next(err);
  }
};

exports.listeClients = async (req, res, next) => {
  try {
    const clients = await Utilisateur.find({ role: 'client' })
      .select('-mot_de_passe')
      .sort('nom');
    success(res, clients);
  } catch (err) {
    next(err);
  }
};

exports.profil = async (req, res, next) => {
  try {
    const utilisateur = await Utilisateur.findById(req.user._id);
    success(res, {
      _id: utilisateur._id,
      nom: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.role,
      date_inscription: utilisateur.date_inscription
    });
  } catch (err) {
    next(err);
  }
};

exports.modifierProfil = async (req, res, next) => {
  try {
    const { nom, email, telephone, adresse } = req.body;
    const update = {};
    if (nom) update.nom = nom;
    if (email) {
      if (!(await validerEmail(email))) {
        return error(res, 'Email invalide.', 400);
      }
      const existe = await Utilisateur.findOne({ email, _id: { $ne: req.user._id } });
      if (existe) {
        return error(res, 'Cet email est déjà utilisé.', 400);
      }
      update.email = email;
    }
    if (telephone !== undefined) update.telephone = telephone;
    if (adresse !== undefined) update.adresse = adresse;

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );
    success(res, {
      _id: utilisateur._id,
      nom: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.role
    }, 'Profil mis à jour');
  } catch (err) {
    next(err);
  }
};

exports.modifierUtilisateur = async (req, res, next) => {
  try {
    const { actif } = req.body;
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      { actif },
      { new: true }
    );
    if (!utilisateur) {
      return error(res, 'Utilisateur non trouvé.', 404);
    }
    success(res, {
      _id: utilisateur._id,
      nom: utilisateur.nom,
      email: utilisateur.email,
      actif: utilisateur.actif
    }, actif ? 'Compte activé' : 'Compte désactivé');
  } catch (err) {
    next(err);
  }
};
