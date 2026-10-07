const express = require("express");
const {
  createContract,
  getContractsByProperty,
  terminateContract,
  getLandlordContracts,
  getTenantContracts,
  getContractsByStatus,
  getPendingContractsByLandlord,
  getActiveContractsByLandlord,
  getTerminatedContractsByLandlord,
  downloadContract,
  getTenantContractsByActive,
  getPendingContractsByTenant,
  getPendingContracts,
  getActiveContract,
  signContract,
} = require("../controllers/Contract");

const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/", verifyToken, createContract);
router.post("/:id/sign", verifyToken, signContract);
router.get("/tenant-contracts", verifyToken, getTenantContracts);
router.get("/property/:propertyId", verifyToken, getContractsByProperty);
router.get("/landlord-contracts", verifyToken, getLandlordContracts);
router.patch("/terminate/:contractId", verifyToken, terminateContract);
router.get("/status/:status", verifyToken, getContractsByStatus);
router.get("/pending", verifyToken, getPendingContractsByLandlord);
router.get("/active", verifyToken, getActiveContractsByLandlord);
router.get("/terminated", verifyToken, getTerminatedContractsByLandlord);
router.get("/download/:id", downloadContract);
router.get("/tentant/active", verifyToken, getTenantContractsByActive);
router.get("/tentant/pending", verifyToken, getPendingContractsByTenant);
router.get("/admin/pending", verifyToken, getPendingContracts);
router.get("/admin/active", verifyToken, getActiveContract);
module.exports = router;
