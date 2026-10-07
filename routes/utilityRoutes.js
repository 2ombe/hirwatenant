const express = require("express");
const {
  recordUtilityBill,
  getPropertyUtilityBills,
  getTenantUtilityInvoices,
  payUtilityShare,
} = require("../controllers/utilityController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/record-reading", verifyToken, recordUtilityBill);
router.get("/property/:propertyId", verifyToken, getPropertyUtilityBills);
router.get("/my-invoices", verifyToken, getTenantUtilityInvoices);
router.post("/:billId/pay", verifyToken, payUtilityShare);

module.exports = router;
