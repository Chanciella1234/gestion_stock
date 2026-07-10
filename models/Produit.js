const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  seuil_alerte: {
    type: Number,
    default: 5,
    min: [0, 'Le seuil d\'alerte ne peut pas être négatif']
  },
  alerte_active: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: 'default-product.png'
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    required: [true, 'La catégorie est requise']
  },
  moyenne_notes: {
    type: Number,
    default: 0
  },
  nb_avis: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'produits'
});

produitSchema.pre('save', function () {
  this.alerte_active = this.stock <= this.seuil_alerte;
});

produitSchema.methods.mettreAJourAlerte = function () {
  this.alerte_active = this.stock <= this.seuil_alerte;
  return this.save();
};

produitSchema.statics.creerSiNecessaire = async function (produitId) {
  const produit = await this.findById(produitId);
  if (!produit) return null;
  const alerteAvait = produit.alerte_active;
  produit.alerte_active = produit.stock <= produit.seuil_alerte;
  if (alerteAvait !== produit.alerte_active) {
    await produit.save();
  }
  return produit;
};

module.exports = mongoose.model('Produit', produitSchema);
