const Alerte = require('../models/Alerte');
const Produit = require('../models/Produit');
const { success, error } = require('../utils/apiResponse');

exports.liste = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const filter = {};
    if (statut === 'active') filter.resolu = false;
    else if (statut === 'resolue') filter.resolu = true;

    const alertes = await Alerte.find(filter)
      .populate('produit', 'nom stock seuil_alerte')
      .sort('-createdAt');
    success(res, alertes);
  } catch (err) {
    next(err);
  }
};

exports.resoudre = async (req, res, next) => {
  try {
    const { quantiteAjoutee, note } = req.body;

    const alerte = await Alerte.findById(req.params.id);
    if (!alerte) {
      return error(res, 'Alerte non trouvée.', 404);
    }

    alerte.resolu = true;
    await alerte.save();

    if (quantiteAjoutee && quantiteAjoutee > 0) {
      await Produit.findByIdAndUpdate(alerte.produit, {
        $inc: { stock: quantiteAjoutee }
      });
      const produit = await Produit.findById(alerte.produit);
      if (produit) {
        await produit.mettreAJourAlerte();
      }
    }

    success(res, alerte, 'Alerte résolue');
  } catch (err) {
    next(err);
  }
};
