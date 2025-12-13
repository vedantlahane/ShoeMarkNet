const express = require('express');
const {
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
  respondToContact
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/', getContacts);
router.get('/stats', getContactStats);
router.get('/:id', getContactById);
router.patch('/:id/status', updateContactStatus);
router.post('/:id/respond', respondToContact);
router.delete('/:id', deleteContact);

module.exports = router;
