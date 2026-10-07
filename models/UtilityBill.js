const mongoose = require("mongoose");

const TenantShareSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },
    unitIdentifier: { type: String, required: true }, // e.g. "Apt 1", "Room 3B", "Main House"
    headcount: { type: Number, default: 1 },
    subMeterReadingPrevious: { type: Number, default: 0 },
    subMeterReadingCurrent: { type: Number, default: 0 },
    consumptionUnits: { type: Number, default: 0 }, // m3 or kWh
    calculatedShareRwf: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid_via_momo", "overdue"],
      default: "pending",
    },
    momoTransactionId: { type: String },
    paidAt: { type: Date },
  },
  { _id: false }
);

const UtilityBillSchema = new mongoose.Schema(
  {
    billReference: {
      type: String,
      unique: true,
      default: () => `UTIL-${Date.now().toString().slice(-6)}-RW`,
    },
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
    utilityType: {
      type: String,
      enum: ["wasac_water", "eucl_cashpower", "compound_security", "cleaning_sanitation"],
      required: true,
    },
    billingMonthYear: { type: String, required: true }, // e.g., "10-2026"
    meterNumber: { type: String }, // WASAC meter number or EUCL meter number

    previousMeterReading: { type: Number, default: 0 },
    currentMeterReading: { type: Number, default: 0 },
    totalUnitsConsumed: { type: Number, default: 0 }, // m3 or kWh
    unitTariffRwf: { type: Number, default: 350 }, // Tariff in RWF per unit

    totalBillAmountRwf: { type: Number, required: true },
    meterPhotoUrl: { type: String }, // Proof photo of meter to prevent tenant-landlord disputes

    splitMethod: {
      type: String,
      enum: ["equal_split", "per_headcount", "sub_meter_units", "fixed_percentage"],
      default: "equal_split",
    },

    tenantShares: [TenantShareSchema],

    billStatus: {
      type: String,
      enum: ["draft", "issued_to_tenants", "partially_paid", "settled_in_full"],
      default: "issued_to_tenants",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UtilityBill", UtilityBillSchema);
