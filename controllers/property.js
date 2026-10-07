const Property = require("../models/Property");
const Member = require("../models/users");

const registerProperty = async (req, res) => {
  try {
    const {
      propertyName,
      contactEmail,
      contactPhone,
      price,
      area,
      geographicArea,
      location,
      lentType,
      propertyType,
      currency,
      firstInstallment,
      sundryExpenses,
      exitNoticeDays,
      availability,
      monthlyRent,
      depositAmount,
      terms,
    } = req.body;
// even in backend
    const memberId = req.user.id;
    console.log(memberId);

    const member = await Member.findById(memberId);
    if (!member || member.isLandloard !== true) {
      return res.status(404).json({ message: "Not allowed." });
    }

    const newProperty = new Property({
      propertyName,
      contactEmail,
      contactPhone,
      price,
      area,
      geographicArea,
      location,
      lentType,
      propertyType,
      currency,
      firstInstallment,
      sundryExpenses,
      exitNoticeDays,
      monthlyRent,
      depositAmount,
      terms,
      availability,
      createdBy: memberId,
    });

    await newProperty.save();
    res.status(201).json({
      message: "Property registered successfully.",
      property: newProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
const getPendingRequests = async (req, res) => {
  try {
    const properties = await Property.find({
      "rentRequests.status": "pending",
    }).populate("rentRequests.requestedBy", "name email");

    const requests = properties.flatMap((property) =>
      property.rentRequests
        .filter((request) => request.status === "pending")
        .map((request) => ({
          _id: request._id,
          propertyId: property._id,
          propertyName: property.propertyName,
          requestedBy: request.requestedBy,
          requestedAt: request.requestedAt,
        }))
    );

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending requests." });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const properties = await Property.find({ createdBy: userId });
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch properties." });
  }
};

const getAvailableProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isTaken: false });
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch available properties." });
  }
};
const approveRentRequest = async (req, res) => {
  const { requestId } = req.body;

  try {
    const property = await Property.findById(requestId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property) {
      return res.status(404).json({ message: "Rent request not found" });
    }
    console.log(property.rentRequests[0].status);

    if (property.rentRequests[0].status !== "pending") {
      return res
        .status(400)
        .json({ message: "Rent request has already been processed" });
    }

    property.rentRequests[0].status = "approved";
    property.isTaken = true;
    property.isTakenBy = property.rentRequests[0].requestedBy;
    property.availability = "unavailable";

    await property.save();
    console.log(property);

    res.status(200).json({ message: "Rent request approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve rent request" });
  }
};
const requestRent = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;
  console.log(userId);

  try {
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.isTaken) {
      return res.status(400).json({ message: "Property is already taken" });
    }

    const existingRequest = property.rentRequests.find((req) =>
      req.requestedBy.includes(userId)
    );

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You have already requested to rent this property" });
    }

    property.rentRequests.push({
      requestedBy: [userId],
    });

    await property.save();

    res.status(200).json({ message: "Rent request submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit rent request" });
  }
};

const getTakenProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isTaken: true });
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch taken properties." });
  }
};

module.exports = {
  registerProperty,
  getMyProperties,
  getAvailableProperties,
  getTakenProperties,
  getPendingRequests,
  approveRentRequest,
  requestRent,
};
