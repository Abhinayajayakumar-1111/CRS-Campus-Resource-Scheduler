const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getRoomAvailability,
  getAllRoomsAvailability,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getRooms);
router.post('/', protect, authorize('Admin'), createRoom);
router.get('/availability/all', protect, getAllRoomsAvailability);
router.get('/:id/availability', protect, getRoomAvailability);
router.put('/:id', protect, authorize('Admin'), updateRoom);
router.delete('/:id', protect, authorize('Admin'), deleteRoom);

module.exports = router;
