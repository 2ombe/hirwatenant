const express = require("express");
const {
  registerProperty,
  getMyProperties,
  getAvailableProperties,
  getTakenProperties,
  requestRent,
  approveRentRequest,
  getPendingRequests,
} = require("../controllers/property");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/register", verifyToken, registerProperty);
router.get("/my-properties", verifyToken, getMyProperties);
router.get("/available", verifyToken, getAvailableProperties);
router.get("/taken-properties", verifyToken, getTakenProperties);
router.post("/request-rent", verifyToken, requestRent);
router.post("/approve/rent/now", verifyToken, approveRentRequest);
router.get("/pending", verifyToken, getPendingRequests);

module.exports = router;
