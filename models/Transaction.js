const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    transactionRef: {
      type: String,
      unique: true,
      default: () => `TX-${Date.now().toString().slice(-8)}`,
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
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "RWF" },
    type: {
      type: String,
      enum: ["monthly_rent", "security_deposit", "repair_compensation", "escrow_refund"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["mtn_momo", "airtel_money", "bank_transfer", "card"],
      default: "mtn_momo",
    },
    phoneNumber: { type: String }, // e.g. 078XXXXXXX for MoMo push
    externalTransactionId: { type: String }, // From MoMo / Paypack / Telco
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "held_in_escrow", "released_to_landlord", "refunded_to_tenant"],
      default: "pending",
    },
    description: { type: String },
    periodMonthYear: { type: String }, // e.g., "10-2026"
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
