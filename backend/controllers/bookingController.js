const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Resource = require("../models/Resource");
// const {
//   ALL_SLOTS,
//   ACTIVE_STATUSES,
//   computeRoomSlotAvailability,
//   computeResourceAvailabilityForSlot,
// } = require('../utils/slots');
//new code
const {
  ALL_SLOTS,
  ACTIVE_STATUSES,
  //new code
  ROOM_SLOT_STATUS,
  //new code for advance booking
  MIN_ADVANCE_DAYS,
  getMinBookableDateString,
  isDateAdvanceCompliant,
  computeRoomSlotAvailability,
  computeResourceAvailability,
} = require("../utils/slots");

// @desc   Create a new booking request
//         Faculty -> room (required) + resources (optional, with quantities)
//         Student -> room only, no resources allowed
// @route  POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { roomId, date, slot, resources, purpose } = req.body;
    const user = req.user;

    if (!["Faculty", "Student"].includes(user.role)) {
      return res.status(403).json({
        message:
          "Only Faculty and Student accounts can create booking requests",
      });
    }

    if (!roomId || !date || !slot) {
      return res
        .status(400)
        .json({ message: "roomId, date and slot are required" });
    }

    if (!ALL_SLOTS.includes(slot)) {
      return res.status(400).json({
        message:
          "Invalid slot. Must be HALF_MORNING, HALF_AFTERNOON or FULL_DAY",
      });
    }

    if (!isDateAdvanceCompliant(date)) {
      return res.status(400).json({
        message: `Bookings must be made at least ${MIN_ADVANCE_DAYS} days in advance. The earliest available date is ${getMinBookableDateString()}.`,
      });
    }

    // Students may only request rooms - never equipment
    if (
      user.role === "Student" &&
      Array.isArray(resources) &&
      resources.length > 0
    ) {
      return res.status(403).json({
        message: "Students may only request rooms, not equipment/resources",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // ---- Validate room slot availability (conflict-free enforcement) ----
    const activeRoomBookings = await Booking.find({
      room: room._id,
      date,
      status: { $in: ACTIVE_STATUSES },
      roomReleased: false,
    });

    // const roomAvailability = computeRoomSlotAvailability(activeRoomBookings);
    // if (!roomAvailability[slot]) {
    //   return res.status(409).json({
    //     message: `Room "${room.name}" is not available for the ${slot.replace("_", " ")} slot on ${date}. Please choose another slot, date or room.`,
    //   });
    // }
    //new code
    const roomAvailability = computeRoomSlotAvailability(activeRoomBookings);
    if (roomAvailability[slot] !== ROOM_SLOT_STATUS.AVAILABLE) {
      return res.status(409).json({
        message: `Room "${room.name}" is not available for the ${slot.replace("_", " ")} slot on ${date}. Please choose another slot, date or room.`,
      });
    }

    // ---- Validate & normalize resources (Faculty only) ----
    let bookingResources = [];
    if (Array.isArray(resources) && resources.length > 0) {
      const resourceIds = resources.map((r) => r.resourceId);
      const foundResources = await Resource.find({ _id: { $in: resourceIds } });

      if (foundResources.length !== resourceIds.length) {
        return res
          .status(404)
          .json({ message: "One or more selected resources were not found" });
      }

      // Gather all active resource-consuming bookings on this date once
      // const activeResourceBookings = await Booking.find({
      //   date,
      //   status: { $in: ACTIVE_STATUSES },
      //   resourcesReleased: false,
      //   "resources.0": { $exists: true },
      // });

      // for (const req_ of resources) {
      //   const quantity = Number(req_.quantity);
      //   if (!quantity || quantity < 1) {
      //     return res
      //       .status(400)
      //       .json({
      //         message:
      //           "Each requested resource must have a quantity of at least 1",
      //       });
      //   }

      //   const resourceDoc = foundResources.find(
      //     (r) => String(r._id) === String(req_.resourceId),
      //   );

      //   const entries = [];
      //   activeResourceBookings.forEach((b) => {
      //     b.resources.forEach((r) => {
      //       if (String(r.resource) === String(resourceDoc._id)) {
      //         entries.push({ slot: b.slot, quantity: r.quantity });
      //       }
      //     });
      //   });

      //   const available = computeResourceAvailabilityForSlot(
      //     resourceDoc.totalCount,
      //     entries,
      //     slot,
      //   );

      //   if (quantity > available) {
      //     return res.status(409).json({
      //       message: `Only ${available} unit(s) of "${resourceDoc.name}" remain available for the requested slot on ${date} (requested ${quantity}).`,
      //     });
      //   }

      //   bookingResources.push({ resource: resourceDoc._id, quantity });
      // }

      //new code
      // Gather all active resource-consuming bookings on this date once.
      // Resources are reserved for the WHOLE DAY once requested, so slot
      // is not part of this filter/aggregation any more.
      const activeResourceBookings = await Booking.find({
        date,
        status: { $in: ACTIVE_STATUSES },
        resourcesReleased: false,
        "resources.0": { $exists: true },
      });

      for (const req_ of resources) {
        const quantity = Number(req_.quantity);
        if (!quantity || quantity < 1) {
          return res.status(400).json({
            message:
              "Each requested resource must have a quantity of at least 1",
          });
        }

        const resourceDoc = foundResources.find(
          (r) => String(r._id) === String(req_.resourceId),
        );

        const quantities = [];
        activeResourceBookings.forEach((b) => {
          b.resources.forEach((r) => {
            if (String(r.resource) === String(resourceDoc._id)) {
              quantities.push(r.quantity);
            }
          });
        });

        const available = computeResourceAvailability(
          resourceDoc.totalCount,
          quantities,
        );

        if (quantity > available) {
          return res.status(409).json({
            message: `Only ${available} unit(s) of "${resourceDoc.name}" remain available for the rest of ${date} (requested ${quantity}).`,
          });
        }

        bookingResources.push({ resource: resourceDoc._id, quantity });
      }
    }

    const booking = await Booking.create({
      requestedBy: user._id,
      requesterRole: user.role,
      purpose: purpose || "",
      room: room._id,
      resources: bookingResources,
      date,
      slot,
      status: "Pending",
    });

    const populated = await booking.populate([
      { path: "room", select: "name capacity location" },
      { path: "resources.resource", select: "name unit totalCount" },
      { path: "requestedBy", select: "name email role" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get bookings created by the logged-in user
// @route  GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ requestedBy: req.user._id })
      .populate("room", "name capacity location")
      .populate("resources.resource", "name unit totalCount")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get ALL bookings - master schedule (Admin only)
// @route  GET /api/bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room", "name capacity location")
      .populate("resources.resource", "name unit totalCount")
      .populate("requestedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Approve a pending booking (Admin only)
// @route  PUT /api/bookings/:id/approve
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: `Only Pending bookings can be approved (current status: ${booking.status})`,
      });
    }

    booking.status = "Approved";
    booking.decidedBy = req.user._id;
    booking.decidedAt = new Date();
    await booking.save();

    const populated = await booking.populate([
      { path: "room", select: "name capacity location" },
      { path: "resources.resource", select: "name unit totalCount" },
      { path: "requestedBy", select: "name email role" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Reject a pending booking with a mandatory reason (Admin only)
// @route  PUT /api/bookings/:id/reject
const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: "A rejection reason is mandatory" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: `Only Pending bookings can be rejected (current status: ${booking.status})`,
      });
    }

    booking.status = "Rejected";
    booking.rejectionReason = reason.trim();
    booking.decidedBy = req.user._id;
    booking.decidedAt = new Date();
    await booking.save();

    // Rejected bookings are automatically excluded from active/blocking
    // queries (status filter), which instantly frees the slot and
    // restores resource inventory - no extra release step required.

    const populated = await booking.populate([
      { path: "room", select: "name capacity location" },
      { path: "resources.resource", select: "name unit totalCount" },
      { path: "requestedBy", select: "name email role" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Helper: mark a booking Completed once every applicable part is released */
function maybeMarkCompleted(booking) {
  const roomDone = booking.roomReleased;
  const resourcesDone =
    booking.resources.length === 0 || booking.resourcesReleased;
  if (roomDone && resourcesDone) {
    booking.status = "Completed";
  }
}

// @desc   Release the ROOM portion of a booking. Frees up the time slot
//         instantly for that room.
// @route  PUT /api/bookings/:id/release-room
const releaseRoom = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!["Approved", "Pending"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot release room for a booking with status ${booking.status}`,
      });
    }

    if (booking.roomReleased) {
      return res
        .status(400)
        .json({ message: "Room has already been released for this booking" });
    }

    booking.roomReleased = true;
    maybeMarkCompleted(booking);
    await booking.save();

    const populated = await booking.populate([
      { path: "room", select: "name capacity location" },
      { path: "resources.resource", select: "name unit totalCount" },
      { path: "requestedBy", select: "name email role" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Release the EQUIPMENT/RESOURCES portion of a booking. Restores
//         the reserved counts back to the total available inventory.
// @route  PUT /api/bookings/:id/release-resources
const releaseResources = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.resources.length === 0) {
      return res.status(400).json({
        message: "This booking does not include any equipment/resources",
      });
    }

    if (!["Approved", "Pending"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot release resources for a booking with status ${booking.status}`,
      });
    }

    if (booking.resourcesReleased) {
      return res.status(400).json({
        message: "Resources have already been released for this booking",
      });
    }

    booking.resourcesReleased = true;
    maybeMarkCompleted(booking);
    await booking.save();

    const populated = await booking.populate([
      { path: "room", select: "name capacity location" },
      { path: "resources.resource", select: "name unit totalCount" },
      { path: "requestedBy", select: "name email role" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  approveBooking,
  rejectBooking,
  releaseRoom,
  releaseResources,
};
