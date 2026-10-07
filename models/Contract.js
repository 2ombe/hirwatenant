const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "RWF" },

    status: {
      type: String,
      enum: ["pending", "active", "in_dispute", "terminated", "expired"],
      default: "pending",
    },

    depositStatus: {
      type: String,
      enum: ["unpaid", "held_in_escrow", "partially_deducted", "refunded", "disputed"],
      default: "unpaid",
    },

    paymentFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "semi-annually", "annually"],
      default: "monthly",
    },
    gracePeriodDays: { type: Number, default: 5 },

    landlordSigned: { type: Boolean, default: false },
    landlordSignedAt: { type: Date },
    tenantSigned: { type: Boolean, default: false },
    tenantSignedAt: { type: Date },

    digitalSignatureLog: {
      landlordPhone: String,
      tenantPhone: String,
      landlordSignedIp: String,
      tenantSignedIp: String,
      landlordSignatureHash: String,
      tenantSignatureHash: String,
    },

    governingLaw: {
      type: String,
      default: "Law N° 45/2011 on the Law of Contracts (Republic of Rwanda)",
    },
    specialTerms: { type: String },
    terminationReason: { type: String },
    terminatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", ContractSchema);

