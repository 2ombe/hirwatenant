const mongoose = require("mongoose");

const InspectionItemSchema = new mongoose.Schema(
  {
    areaName: {
      type: String,
      required: true,
      enum: [
        "Living Room",
        "Master Bedroom",
        "Additional Bedroom(s)",
        "Kitchen",
        "Master Bathroom",
        "Guest Bathroom",
        "Balcony / Veranda",
        "Compound / Parking",
        "Water & Plumbing",
        "Electricity & CashPower",
      ],
    },
    condition: {
      type: String,
      enum: ["good", "fair", "damaged", "needs_repair"],
      default: "good",
    },
    notes: { type: String, default: "" },
    photos: [{ type: String }],
  },
  { _id: false }
);

const InspectionSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    inspectionType: {
      type: String,
      enum: ["move_in", "move_out", "routine"],
      required: true,
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    cashPowerInitialUnits: { type: Number, default: 0 },
    waterMeterInitialReading: { type: Number, default: 0 },
    items: [InspectionItemSchema],

    signedByTenant: { type: Boolean, default: false },
    tenantSignedAt: { type: Date },
    signedByLandlord: { type: Boolean, default: false },
    landlordSignedAt: { type: Date },

    generalNotes: { type: String },
    status: {
      type: String,
      enum: ["draft", "pending_signatures", "approved_by_both", "disputed"],
      default: "pending_signatures",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inspection", InspectionSchema);
