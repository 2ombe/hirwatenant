const mongoose = require("mongoose");

const EvidenceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileType: { type: String, default: "image" }, // image, pdf, document
    title: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MediationMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    senderRole: { type: String, enum: ["landlord", "tenant", "mediator", "admin"], required: true },
    message: { type: String, required: true },
    attachments: [String],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ClaimSchema = new mongoose.Schema(
  {
    claimReference: {
      type: String,
      unique: true,
      default: () => `CLM-${Date.now().toString().slice(-6)}-RW`,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    recipientEmail: { type: String, required: true },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    claimType: {
      type: String,
      enum: [
        "unpaid_rent",
        "property_damage",
        "repair_neglect",
        "illegal_eviction",
        "deposit_withholding",
        "breach_of_terms",
        "noise_nuisance",
        "utility_dispute",
        "other",
      ],
      default: "repair_neglect",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    amountClaimed: { type: Number, default: 0 },
    currency: { type: String, default: "RWF" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    desiredResolution: { type: String },

    evidence: [EvidenceSchema],

    status: {
      type: String,
      enum: [
        "filed",
        "in_discussion",
        "mediation_requested",
        "mediator_assigned",
        "settled",
        "escalated_to_abunzi",
        "closed",
      ],
      default: "filed",
    },

    assignedMediator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },

    mediationThread: [MediationMessageSchema],

    settlementAgreement: {
      agreedAt: { type: Date },
      terms: { type: String },
      monetarySettlement: { type: Number, default: 0 },
      signedByClaimant: { type: Boolean, default: false },
      signedByRespondent: { type: Boolean, default: false },
    },

    abunziEscalation: {
      escalatedAt: { type: Date },
      localDistrict: { type: String },
      localSector: { type: String },
      localCell: { type: String },
      formalDossierReference: { type: String },
      summaryOfFacts: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", ClaimSchema);

