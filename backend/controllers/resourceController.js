const Resource = require("../models/Resource");
const Booking = require("../models/Booking");
// const {
//   ACTIVE_STATUSES,
//   computeResourceAvailabilityAllSlots,
// } = require('../utils/slots');
//new code
const {
  ACTIVE_STATUSES,
  computeResourceAvailability,
} = require("../utils/slots");

// @desc   Create a resource / equipment type (Admin only)
// @route  POST /api/resources
const createResource = async (req, res) => {
  try {
    const { name, totalCount, unit } = req.body;
    if (!name || !totalCount) {
      return res
        .status(400)
        .json({ message: "Resource name and total count are required" });
    }

    const existing = await Resource.findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "A resource with this name already exists" });
    }

    const resource = await Resource.create({
      name: name.trim(),
      totalCount,
      unit: unit || "units",
      createdBy: req.user._id,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all resources
// @route  GET /api/resources
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ name: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a resource (Admin only)
// @route  PUT /api/resources/:id
const updateResource = async (req, res) => {
  try {
    const { name, totalCount, unit } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    if (name) resource.name = name.trim();
    if (totalCount) resource.totalCount = totalCount;
    if (unit) resource.unit = unit;

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a resource (Admin only)
// @route  DELETE /api/resources/:id
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    await resource.deleteOne();
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get live availability (remaining quantity per slot) for ALL
//         resources on a given date
// @route  GET /api/resources/availability/all?date=YYYY-MM-DD
// const getAllResourceAvailability = async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date)
//       return res
//         .status(400)
//         .json({ message: "A date query param (YYYY-MM-DD) is required" });

//     const resources = await Resource.find().sort({ name: 1 });

//     // Pull every active booking on this date that reserves at least one resource
//     const bookings = await Booking.find({
//       date,
//       status: { $in: ACTIVE_STATUSES },
//       resourcesReleased: false,
//       "resources.0": { $exists: true },
//     });

//     const result = resources.map((resource) => {
//       const entries = [];
//       bookings.forEach((b) => {
//         b.resources.forEach((r) => {
//           if (String(r.resource) === String(resource._id)) {
//             entries.push({ slot: b.slot, quantity: r.quantity });
//           }
//         });
//       });

//       return {
//         _id: resource._id,
//         name: resource.name,
//         unit: resource.unit,
//         totalCount: resource.totalCount,
//         availability: computeResourceAvailabilityAllSlots(
//           resource.totalCount,
//           entries,
//         ),
//       };
//     });

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
//new code
// @desc   Get live availability (remaining quantity for the WHOLE DAY)
//         for ALL resources on a given date
// @route  GET /api/resources/availability/all?date=YYYY-MM-DD
const getAllResourceAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date)
      return res
        .status(400)
        .json({ message: "A date query param (YYYY-MM-DD) is required" });

    const resources = await Resource.find().sort({ name: 1 });

    // Pull every active booking on this date that reserves at least one
    // resource - slot is irrelevant now, resources are reserved for the
    // entire day once requested.
    const bookings = await Booking.find({
      date,
      status: { $in: ACTIVE_STATUSES },
      resourcesReleased: false,
      "resources.0": { $exists: true },
    });

    const result = resources.map((resource) => {
      const quantities = [];
      bookings.forEach((b) => {
        b.resources.forEach((r) => {
          if (String(r.resource) === String(resource._id)) {
            quantities.push(r.quantity);
          }
        });
      });

      return {
        _id: resource._id,
        name: resource.name,
        unit: resource.unit,
        totalCount: resource.totalCount,
        available: computeResourceAvailability(resource.totalCount, quantities),
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createResource,
  getResources,
  updateResource,
  deleteResource,
  getAllResourceAvailability,
};
