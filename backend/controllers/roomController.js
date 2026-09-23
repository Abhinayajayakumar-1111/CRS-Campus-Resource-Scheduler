const Room = require('../models/Room');
const Booking = require('../models/Booking');
const {
  ALL_SLOTS,
  ACTIVE_STATUSES,
  computeRoomSlotAvailability,
} = require('../utils/slots');

// @desc   Create a room (Admin only)
// @route  POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const { name, capacity, location } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ message: 'Room name and capacity are required' });
    }

    const existing = await Room.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A room with this name already exists' });
    }

    const room = await Room.create({
      name: name.trim(),
      capacity,
      location,
      createdBy: req.user._id,
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all rooms
// @route  GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a room (Admin only)
// @route  PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const { name, capacity, location } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (name) room.name = name.trim();
    if (capacity) room.capacity = capacity;
    if (location !== undefined) room.location = location;

    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a room (Admin only)
// @route  DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.deleteOne();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get live slot availability for a single room on a given date
// @route  GET /api/rooms/:id/availability?date=YYYY-MM-DD
const getRoomAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'A date query param (YYYY-MM-DD) is required' });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const activeBookings = await Booking.find({
      room: room._id,
      date,
      status: { $in: ACTIVE_STATUSES },
      roomReleased: false,
    });

    const availability = computeRoomSlotAvailability(activeBookings);
    res.json({ roomId: room._id, date, availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get slot availability for ALL rooms on a given date (used by
//         Faculty/Student booking forms to render live status)
// @route  GET /api/rooms/availability/all?date=YYYY-MM-DD
const getAllRoomsAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'A date query param (YYYY-MM-DD) is required' });

    const rooms = await Room.find().sort({ name: 1 });
    const bookings = await Booking.find({
      date,
      status: { $in: ACTIVE_STATUSES },
      roomReleased: false,
    });

    const result = rooms.map((room) => {
      const roomBookings = bookings.filter((b) => String(b.room) === String(room._id));
      return {
        _id: room._id,
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        availability: computeRoomSlotAvailability(roomBookings),
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getRoomAvailability,
  getAllRoomsAvailability,
};
