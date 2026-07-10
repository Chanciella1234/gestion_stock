const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code promo est requis'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['pourcentage', 'montant_fixe'],
    required: [true, 'Le type de promotion est requis']
  },
  valeur: {
    type: Number,
    required: [true, 'La valeur est requise'],
    min: [0, 'La valeur ne peut pas être négative']
  },
  date_debut: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  date_fin: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  actif: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  produits_applicables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  }],
  categories_applicables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie'
  }]
}, {
  timestamps: true,
  collection: 'promotions'
});

promotionSchema.methods.estValide = function () {
  const maintenant = new Date();
  return this.actif && this.date_debut <= maintenant && this.date_fin >= maintenant;
};

module.exports = mongoose.model('Promotion', promotionSchema);
