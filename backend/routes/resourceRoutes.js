const express = require('express');
const router = express.Router();
const {
  createResource,
  getResources,
  updateResource,
  deleteResource,
  getAllResourceAvailability,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getResources);
router.post('/', protect, authorize('Admin'), createResource);
router.get('/availability/all', protect, getAllResourceAvailability);
router.put('/:id', protect, authorize('Admin'), updateResource);
router.delete('/:id', protect, authorize('Admin'), deleteResource);

module.exports = router;
