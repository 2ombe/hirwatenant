const express = require("express");
const {
  raiseClaim,
  getAllClaims,
  getClaimById,
  addMediationMessage,
  updateClaimStatus,
  generateAbunziDossier,
} = require("../controllers/helpDesk");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/raise", verifyToken, raiseClaim);
router.get("/", verifyToken, getAllClaims);
router.get("/:id", verifyToken, getClaimById);
router.post("/:id/message", verifyToken, addMediationMessage);
router.patch("/:id/status", verifyToken, updateClaimStatus);
router.post("/:id/escalate-abunzi", verifyToken, generateAbunziDossier);

module.exports = router;
