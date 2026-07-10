const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  mot_de_passe: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  telephone: {
    type: String,
    trim: true
  },
  adresse: {
    type: String,
    trim: true
  },
  actif: {
    type: Boolean,
    default: true
  },
  date_inscription: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'utilisateurs'
});

utilisateurSchema.pre('save', async function () {
  if (!this.isModified('mot_de_passe')) return;

  const salt = await bcrypt.genSalt(10);
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
});

utilisateurSchema.methods.comparerMotDePasse = async function (motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.mot_de_passe);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);