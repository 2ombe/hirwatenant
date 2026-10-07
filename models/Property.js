const mongoose = require("mongoose");

const RentRequestSchema = new mongoose.Schema(
  {
    requestedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    propertyName: { type: String, required: true },
    upiNumber: { type: String, trim: true }, // Rwandan Unique Parcel Identifier (UPI)
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: String, required: true },
    geographicArea: { type: String, required: true },
    location: { type: String, required: true },
    district: { type: String }, // e.g. Gasabo, Kicukiro, Nyarugenge
    sector: { type: String },   // e.g. Remera, Kimironko, Kacyiru
    cell: { type: String },     // e.g. Nyabisindu, Kibagabaga
    village: { type: String },  // Umudugudu
    lentType: { type: String, required: true, enum: ["rent", "sale"] },
    propertyType: { type: String, required: true },
    currency: { type: String, default: "RWF", required: true },
    firstInstallment: { type: Number, required: true },
    sundryExpenses: { type: Number, default: 0 },

    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    cashPowerMeterNumber: { type: String }, // EUCL Cash Power
    wasacWaterMeterNumber: { type: String }, // WASAC Water Meter
    images: [{ type: String }],

    exitNoticeDays: { type: Number, required: true, default: 30 },
    availability: {
      type: String,
      default: "available",
      enum: ["available", "unavailable"],
    },
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    terms: { type: String, required: true },
    isTakenBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    isTaken: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    rentRequests: [RentRequestSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
