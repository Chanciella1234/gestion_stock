const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const Alerte = require('../models/Alerte');
const Utilisateur = require('../models/Utilisateur');
const { success } = require('../utils/apiResponse');

exports.stats = async (req, res, next) => {
  try {
    const [
      totalCommandes,
      commandesParStatut,
      chiffreAffaires,
      produitsVendus,
      totalProduits,
      alertesActives,
      totalClients,
      produitsFaibleStock,
      commandesParJour,
      topProduits,
      dernieresCommandes
    ] = await Promise.all([
      Commande.countDocuments(),
      Commande.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]),
      Commande.aggregate([
        { $match: { statut: { $ne: 'annulee' } } },
        { $group: { _id: null, total: { $sum: '$montant_total' } } }
      ]),
      Commande.aggregate([
        { $unwind: '$lignes' },
        { $group: { _id: null, total: { $sum: '$lignes.quantite' } } }
      ]),
      Produit.countDocuments(),
      Alerte.countDocuments({ resolu: false }),
      Utilisateur.countDocuments({ role: 'client' }),
      Produit.find({ alerte_active: true }).select('nom stock seuil_alerte').sort('stock'),
      Commande.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            total: { $sum: '$montant_total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Commande.aggregate([
        { $unwind: '$lignes' },
        { $group: { _id: '$lignes.nom_produit', totalVendu: { $sum: '$lignes.quantite' } } },
        { $sort: { totalVendu: -1 } },
        { $limit: 5 }
      ]),
      Commande.find()
        .populate('utilisateur', 'nom email')
        .sort('-createdAt')
        .limit(5)
    ]);

    success(res, {
      commandes: {
        total: totalCommandes,
        parStatut: commandesParStatut.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      chiffreAffaires: chiffreAffaires.length > 0 ? chiffreAffaires[0].total : 0,
      produitsVendus: produitsVendus.length > 0 ? produitsVendus[0].total : 0,
      stock: {
        totalProduits,
        alerteActive: alertesActives,
        produitsFaibleStock
      },
      clients: totalClients,
      commandesParJour,
      topProduits,
      dernieresCommandes
    });
  } catch (err) {
    next(err);
  }
};
