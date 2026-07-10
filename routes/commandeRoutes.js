const express = require('express');
const router = express.Router();
const { creer, mesCommandes, toutesLesCommandes, changerStatut, detail } = require('../controllers/commandeController');
const { protect } = require('../middleware/auth');
const { adminOnly, clientOnly } = require('../middleware/roles');

router.post('/', protect, clientOnly, creer);
router.get('/mes', protect, clientOnly, mesCommandes);
router.get('/', protect, adminOnly, toutesLesCommandes);
router.get('/:id', protect, detail);
router.patch('/:id/statut', protect, adminOnly, changerStatut);

module.exports = router;
