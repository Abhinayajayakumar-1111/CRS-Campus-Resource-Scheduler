const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  approveBooking,
  rejectBooking,
  releaseRoom,
  releaseResources,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Faculty', 'Student'), createBooking);
router.get('/my', protect, authorize('Faculty', 'Student'), getMyBookings);
router.get('/', protect, authorize('Admin'), getAllBookings);

router.put('/:id/approve', protect, authorize('Admin'), approveBooking);
router.put('/:id/reject', protect, authorize('Admin'), rejectBooking);
router.put('/:id/release-room', protect, authorize('Admin'), releaseRoom);
router.put('/:id/release-resources', protect, authorize('Admin'), releaseResources);

module.exports = router;
