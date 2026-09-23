const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    totalCount: { type: Number, required: true, min: 1 },
    unit: { type: String, trim: true, default: 'units' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', ResourceSchema);
