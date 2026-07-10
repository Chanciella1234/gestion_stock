const express = require('express');
const router = express.Router();
const { liste, marquerLue, marquerToutLue } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, liste);
router.patch('/lire-tout', protect, marquerToutLue);
router.patch('/:id/lue', protect, marquerLue);

module.exports = router;
