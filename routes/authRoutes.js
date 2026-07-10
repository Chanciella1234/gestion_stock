const express = require('express');
const router = express.Router();
const { inscription, connexion, profil, supprimerCompte, listeClients, modifierProfil, modifierUtilisateur } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

router.post('/register', inscription);
router.post('/login', connexion);
router.get('/me', protect, profil);
router.put('/profil', protect, modifierProfil);
router.delete('/compte', protect, supprimerCompte);
router.get('/clients', protect, adminOnly, listeClients);
router.patch('/utilisateurs/:id', protect, adminOnly, modifierUtilisateur);

module.exports = router;
