const express = require("express");
const {
  createCommissionAgreement,
  getCommissions,
  payoutCommission,
  getVerifiedAgents,
} = require("../controllers/agentController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/agreement", verifyToken, createCommissionAgreement);
router.get("/my-commissions", verifyToken, getCommissions);
router.patch("/:id/payout", verifyToken, payoutCommission);
router.get("/verified-directory", getVerifiedAgents);

module.exports = router;
