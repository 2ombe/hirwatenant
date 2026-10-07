const express = require("express");
// done
const {
  registerMember,
  loginMember,
  requestLandlord,
  approveLandlord,
  getLandlordRequestsCount,
  getPendingLandlordRequests,
  verifyEmail,
} = require("../controllers/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerMember);
router.post("/request-landlord", verifyToken, requestLandlord);
router.post("/approve-landlord", verifyToken, approveLandlord);
router.get("/landlord-requests/count", getLandlordRequestsCount);
router.get("/landlord-requests", verifyToken, getPendingLandlordRequests);
router.post("/login", loginMember);
router.get("/verify-email/:token", verifyEmail);
module.exports = router;
