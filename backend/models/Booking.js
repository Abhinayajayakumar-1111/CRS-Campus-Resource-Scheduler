const mongoose = require('mongoose');

// Fixed time-slot options as required by CRS booking rules
const SLOTS = ['HALF_MORNING', 'HALF_AFTERNOON', 'FULL_DAY'];
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed'];

const BookingResourceSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requesterRole: { type: String, enum: ['Faculty', 'Student'], required: true },
    purpose: { type: String, trim: true, default: '' },

    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    resources: { type: [BookingResourceSchema], default: [] },

    date: { type: String, required: true }, // stored as YYYY-MM-DD for simple date-based comparison
    slot: { type: String, enum: SLOTS, required: true },

    status: { type: String, enum: STATUSES, default: 'Pending' },
    rejectionReason: { type: String, default: '' },

    // Independent release flags so Admin can free the room and the
    // equipment inventory separately, as required by CRS.
    roomReleased: { type: Boolean, default: false },
    resourcesReleased: { type: Boolean, default: false },

    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

BookingSchema.statics.SLOTS = SLOTS;
BookingSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Booking', BookingSchema);
