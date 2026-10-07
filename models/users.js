const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String, unique: true },
  email: { type: String, required: true },
  password: { type: String },
  address: { type: String },
  phone_number: { type: String },
  nationalId: { type: String, trim: true }, // Rwandan 16-digit NIN or Passport
  idType: { type: String, enum: ["nid", "passport", "alien_id"], default: "nid" },
  district: { type: String },
  sector: { type: String },
  cell: { type: String },
  isAdmin: { type: Boolean, default: false, required: true },
  isMediator: { type: Boolean, default: false }, // Legal / Intermediary mediator role
  isLandloard: { type: Boolean, default: false, required: true },
  isTenant: { type: Boolean, default: true },
  landlordRequest: { type: Boolean, default: false },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  momoNumber: { type: String },
}, { timestamps: true });

const Member = mongoose.model("Member", MemberSchema);
module.exports = Member;

