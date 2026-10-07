const mongoose = require("mongoose");

const AgentCommissionSchema = new mongoose.Schema(
  {
    commissionCode: {
      type: String,
      unique: true,
      default: () => `COM-${Date.now().toString().slice(-6)}-RW`,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },

    agreedCommissionRatePercent: { type: Number, default: 10 }, // Standard 10% or fixed sum
    agreedCommissionAmountRwf: { type: Number, required: true },
    monthlyRentRwf: { type: Number, required: true },

    payoutStatus: {
      type: String,
      enum: ["pending_lease_activation", "approved_by_landlord", "paid_via_momo", "disputed"],
      default: "pending_lease_activation",
    },

    agentMomoPhone: { type: String, required: true },
    momoTransactionRef: { type: String },
    paidAt: { type: Date },

    verifiedBadge: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgentCommission", AgentCommissionSchema);
