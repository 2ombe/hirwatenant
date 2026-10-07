const AgentCommission = require("../models/AgentCommission");
const Property = require("../models/Property");
const Member = require("../models/users");

// 1. Authorize an Agent with Standardized Commission Agreement
const createCommissionAgreement = async (req, res) => {
  try {
    const {
      agentId,
      agentEmail,
      propertyId,
      commissionRatePercent = 10,
      fixedCommissionAmount,
      agentMomoPhone,
      notes,
    } = req.body;

    const landlordId = req.user.id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found." });

    let agent = null;
    if (agentId) {
      agent = await Member.findById(agentId);
    } else if (agentEmail) {
      agent = await Member.findOne({ email: agentEmail });
    }

    if (!agent) {
      return res.status(404).json({ message: "Agent / Mukomisiyoneri not found." });
    }

    const rent = property.monthlyRent || 0;
    const computedAmount = fixedCommissionAmount
      ? Number(fixedCommissionAmount)
      : Math.round((rent * Number(commissionRatePercent)) / 100);

    const commission = new AgentCommission({
      agent: agent._id,
      property: propertyId,
      landlord: landlordId,
      agreedCommissionRatePercent: commissionRatePercent,
      agreedCommissionAmountRwf: computedAmount,
      monthlyRentRwf: rent,
      agentMomoPhone: agentMomoPhone || agent.phone_number || "0780000000",
      payoutStatus: "pending_lease_activation",
      notes: notes || "Standard Rwandan Certified Agent Commission",
    });

    await commission.save();

    res.status(201).json({
      message: "Commission agreement recorded successfully.",
      commission,
    });
  } catch (error) {
    console.error("Error creating commission agreement:", error);
    res.status(500).json({ message: "Server error creating commission." });
  }
};

// 2. Fetch Commissions for Agent or Landlord
const getCommissions = async (req, res) => {
  try {
    const userId = req.user.id;
    let filter = {};

    if (req.user.isAdmin) {
      // Admins see all
    } else if (req.user.isLandloard) {
      filter.landlord = userId;
    } else {
      filter.agent = userId;
    }

    const commissions = await AgentCommission.find(filter)
      .populate("agent", "firstName lastName email phone_number nationalId")
      .populate("landlord", "firstName lastName email phone_number")
      .populate("tenant", "firstName lastName email phone_number")
      .populate("property", "propertyName upiNumber location district sector")
      .sort({ createdAt: -1 });

    res.status(200).json(commissions);
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({ message: "Server error fetching commissions." });
  }
};

// 3. Release Commission Payout via MTN MoMo / Airtel Money
const payoutCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { momoTransactionRef } = req.body;

    const commission = await AgentCommission.findById(id);
    if (!commission) return res.status(404).json({ message: "Commission record not found." });

    commission.payoutStatus = "paid_via_momo";
    commission.momoTransactionRef =
      momoTransactionRef || `MOMO-RW-${Date.now().toString().slice(-8)}`;
    commission.paidAt = new Date();

    await commission.save();

    res.status(200).json({
      message: `Commission of ${commission.agreedCommissionAmountRwf.toLocaleString()} RWF disbursed to agent phone ${commission.agentMomoPhone}.`,
      commission,
    });
  } catch (error) {
    console.error("Error processing commission payout:", error);
    res.status(500).json({ message: "Server error processing payout." });
  }
};

// 4. Directory of Verified Agents (Abakomisiyoneri b'Umwuga)
const getVerifiedAgents = async (req, res) => {
  try {
    const agents = await Member.find({
      $or: [{ landlordRequest: false, isTenant: false }, { isVerified: true }],
    }).select("firstName lastName email phone_number district sector isVerified");

    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createCommissionAgreement,
  getCommissions,
  payoutCommission,
  getVerifiedAgents,
};
