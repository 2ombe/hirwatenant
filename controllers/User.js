const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");
const Member = require("../models/users");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      address,
      phone_number,
      googleId,
    } = req.body;

    const existingUser = await Member.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = new Member({
      firstName,
      lastName,
      username,
      email,
      address,
      phone_number,
      googleId,
      password: hashedPassword,
    });

    const savedMember = await newMember.save();

    const token = jwt.sign({ id: savedMember._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // send verfication email
    const verficationLink = `${process.env.FRONTEND_URL}/api/auth/Verify-email/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verficationLink}">Here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: "Member registered. Verify your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findByIdAndUpdate(decoded.id, {
      isVerified: true,
    });
    if (!member) {
      return res.status(400).json({ message: "Invalid token." });
    }
    res.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const loginMember = async (req, res) => {
  try {
    const { username, password } = req.body;
    const member = await Member.findOne({ username });
    if (!member) {
      return res.status(404).json({ message: "User not found." });
    }

    const isValidPassword = await bcrypt.compare(password, member.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: member._id,
        username: member.username,
        role: member.role,
        isAdmin: member.isAdmin,
        isTenant: member.isTenant,
        isLandloard: member.isLandloard,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        username: member.username,
        role: member.role,
        isAdmin: member.isAdmin,
        isTenant: member.isTenant,
        isLandloard: member.isLandloard,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
const requestLandlord = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Member.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isLandloard) {
      return res.status(400).json({ message: "You are already a landlord" });
    }

    user.landlordRequest = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Landlord request submitted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const approveLandlord = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.id;
    const admin = await Member.findById(adminId);

    if (!admin || !admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    const user = await Member.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.landlordRequest) {
      return res
        .status(400)
        .json({ message: "User has not requested to become a landlord" });
    }

    user.isLandloard = true;
    user.isTenant = false;
    user.landlordRequest = false;
    await user.save();

    res.status(200).json({ message: "User approved as landlord successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getLandlordRequestsCount = async (req, res) => {
  try {
    const count = await Member.countDocuments({
      isTenant: true,
      isLandloard: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching landlord requests count", error });
  }
};
const getPendingLandlordRequests = async (req, res) => {
  try {
    const pendingRequests = await Member.find({
      landlordRequest: true,
    }).select("firstName lastName username email isTenant isLandloard");
    res.status(200).json(pendingRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching landlord requests", error });
  }
};

module.exports = {
  registerMember,
  loginMember,
  requestLandlord,
  verifyEmail,
  approveLandlord,
  getLandlordRequestsCount,
  getPendingLandlordRequests,
};
