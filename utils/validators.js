const validerEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

const validerMotDePasse = (mdp) => {
  return mdp && mdp.length >= 6;
};

const validerObjectId = (id) => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
};

const validerNote = (note) => {
  return Number.isInteger(note) && note >= 1 && note <= 5;
};

module.exports = { validerEmail, validerMotDePasse, validerObjectId, validerNote };
