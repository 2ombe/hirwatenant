const nodemailer = require("nodemailer");
const Claim = require("../models/Claim");
const Contract = require("../models/Contract");
const Property = require("../models/Property");

// Optional transporter for email alerts
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// 1. Raise or File a Claim / Dispute
const raiseClaim = async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientId,
      contractId,
      propertyId,
      claimType,
      priority,
      amountClaimed,
      subject,
      message,
      desiredResolution,
      evidence,
    } = req.body;

    const claimantId = req.user.id;

    const newClaim = new Claim({
      raisedBy: claimantId,
      recipient: recipientId || undefined,
      recipientEmail: recipientEmail || "support@hirwa.rw",
      contract: contractId || undefined,
      property: propertyId || undefined,
      claimType: claimType || "repair_neglect",
      priority: priority || "medium",
      amountClaimed: amountClaimed ? Number(amountClaimed) : 0,
      subject,
      message,
      desiredResolution: desiredResolution || "",
      evidence: Array.isArray(evidence) ? evidence : [],
      status: "filed",
    });

    // Also initialize the mediation thread with the original statement
    newClaim.mediationThread.push({
      sender: claimantId,
      senderRole: req.user.isLandloard ? "landlord" : "tenant",
      message: message,
      createdAt: new Date(),
    });

    await newClaim.save();

    // If an associated contract exists, mark contract as in_dispute if it's severe
    if (contractId && ["unpaid_rent", "illegal_eviction", "deposit_withholding"].includes(claimType)) {
      await Contract.findByIdAndUpdate(contractId, { status: "in_dispute" });
    }

    // Try sending email if configured
    if (transporter && recipientEmail) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `[Hirwa Legal Notice] Case ${newClaim.claimReference}: ${subject}`,
        text: `A formal tenancy claim has been filed on Hirwa Platform.\n\nCase ID: ${newClaim.claimReference}\nType: ${newClaim.claimType}\nDetails: ${message}\nDesired Resolution: ${desiredResolution || "Not specified"}\n\nPlease log in to your Hirwa portal to respond or request mediation.`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) console.error("Email notification could not be sent:", err.message);
      });
    }

    res.status(201).json({
      message: "Dispute claim submitted successfully.",
      claim: newClaim,
    });
  } catch (error) {
    console.error("Error raising claim:", error);
    res.status(500).json({ message: "Server error while filing dispute claim." });
  }
};

// 2. Fetch All Claims (Supports filtering by role & status)
const getAllClaims = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    let filter = {};

    // If user is neither admin nor mediator, only show claims where they are claimant or recipient
    if (!req.user.isAdmin && !req.user.isMediator) {
      filter.$or = [{ raisedBy: userId }, { recipient: userId }];
    }

    if (status) filter.status = status;
    if (type) filter.claimType = type;

    const claims = await Claim.find(filter)
      .populate("raisedBy", "firstName lastName email phone_number nationalId")
      .populate("recipient", "firstName lastName email phone_number nationalId")
      .populate("property", "propertyName upiNumber location district sector")
      .populate("contract", "startDate endDate monthlyRent status")
      .populate("assignedMediator", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    console.error("Error getting claims:", error);
    res.status(500).json({ message: "Server error fetching claims." });
  }
};

// 3. Get Single Claim by ID
const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findById(id)
      .populate("raisedBy", "firstName lastName email phone_number nationalId")
      .populate("recipient", "firstName lastName email phone_number nationalId")
      .populate("property", "propertyName upiNumber location district sector")
      .populate("contract")
      .populate("assignedMediator", "firstName lastName email")
      .populate("mediationThread.sender", "firstName lastName email");

    if (!claim) {
      return res.status(404).json({ message: "Dispute claim not found." });
    }

    res.status(200).json(claim);
  } catch (error) {
    console.error("Error getting claim:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 4. Add Message / Evidence to Mediation Thread
const addMediationMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;
    const senderId = req.user.id;

    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    let senderRole = "tenant";
    if (req.user.isAdmin) senderRole = "admin";
    else if (req.user.isMediator) senderRole = "mediator";
    else if (req.user.isLandloard) senderRole = "landlord";

    claim.mediationThread.push({
      sender: senderId,
      senderRole,
      message,
      attachments: attachments || [],
      createdAt: new Date(),
    });

    if (claim.status === "filed") {
      claim.status = "in_discussion";
    }

    await claim.save();

    res.status(200).json({
      message: "Message added to mediation thread.",
      thread: claim.mediationThread,
    });
  } catch (error) {
    console.error("Error adding mediation message:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 5. Update Claim Status or Assign Mediator
const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedMediator, settlementAgreement, abunziEscalation } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    if (status) claim.status = status;
    if (assignedMediator) claim.assignedMediator = assignedMediator;
    if (settlementAgreement) claim.settlementAgreement = settlementAgreement;
    if (abunziEscalation) claim.abunziEscalation = abunziEscalation;

    // If claim is settled, restore contract to active if needed
    if (status === "settled" && claim.contract) {
      await Contract.findByIdAndUpdate(claim.contract, { status: "active" });
    }

    await claim.save();

    res.status(200).json({
      message: "Dispute claim status updated successfully.",
      claim,
    });
  } catch (error) {
    console.error("Error updating claim:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 6. Generate Official Abunzi / Legal Dispute Dossier
const generateAbunziDossier = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findById(id)
      .populate("raisedBy")
      .populate("recipient")
      .populate("property")
      .populate("contract")
      .populate("assignedMediator");

    if (!claim) return res.status(404).json({ message: "Claim not found." });

    const sector = req.body.sector || claim.property?.sector || "Local Sector Office";
    const district = req.body.district || claim.property?.district || "Kigali";

    const dossier = {
      dossierTitle: "HIRWA MEDIATION DOSSIER FOR COMMUNITY MEDIATION (KOMITE Y'ABUNZI)",
      dossierReference: `ABUNZI-${claim.claimReference}`,
      generatedDate: new Date().toISOString(),
      jurisdiction: {
        district: district,
        sector: sector,
        courtLevel: "Abunzi / Primary Court (Inkiko z'Ibanze)",
      },
      claimDetails: {
        reference: claim.claimReference,
        type: claim.claimType,
        priority: claim.priority,
        amountInDisputeRwf: claim.amountClaimed,
        subject: claim.subject,
        statementOfClaim: claim.message,
        desiredResolution: claim.desiredResolution,
      },
      claimant: {
        fullName: `${claim.raisedBy?.firstName || ""} ${claim.raisedBy?.lastName || ""}`,
        nationalId: claim.raisedBy?.nationalId || "Not Registered",
        phone: claim.raisedBy?.phone_number || "N/A",
        email: claim.raisedBy?.email || "N/A",
      },
      respondent: {
        fullName: `${claim.recipient?.firstName || ""} ${claim.recipient?.lastName || ""}`,
        nationalId: claim.recipient?.nationalId || "Not Registered",
        phone: claim.recipient?.phone_number || "N/A",
        email: claim.recipientEmail || "N/A",
      },
      property: {
        name: claim.property?.propertyName || "N/A",
        upiNumber: claim.property?.upiNumber || "N/A",
        location: claim.property?.location || "N/A",
        district: claim.property?.district || "N/A",
        sector: claim.property?.sector || "N/A",
      },
      contractStatus: {
        monthlyRent: claim.contract?.monthlyRent || 0,
        depositHeld: claim.contract?.depositAmount || 0,
        startDate: claim.contract?.startDate,
        endDate: claim.contract?.endDate,
      },
      mediationAttempts: claim.mediationThread.length,
      status: "ESCALATED_FOR_OFFICIAL_HEARING",
    };

    // Update claim with escalation information
    claim.status = "escalated_to_abunzi";
    claim.abunziEscalation = {
      escalatedAt: new Date(),
      localDistrict: district,
      localSector: sector,
      formalDossierReference: dossier.dossierReference,
      summaryOfFacts: claim.message,
    };
    await claim.save();

    res.status(200).json({
      message: "Official Abunzi Dossier successfully compiled.",
      dossier,
    });
  } catch (error) {
    console.error("Error generating dossier:", error);
    res.status(500).json({ message: "Failed to generate legal dossier." });
  }
};

module.exports = {
  raiseClaim,
  getAllClaims,
  getClaimById,
  addMediationMessage,
  updateClaimStatus,
  generateAbunziDossier,
};
