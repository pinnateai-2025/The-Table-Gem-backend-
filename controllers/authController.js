const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const User = require("../models/usersModel");
const { Op } = require("sequelize");



// Helper: Generate Token
const generateToken = (user, expiresIn = "15m") => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn });
};


// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use SendGrid, etc.
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// ======================= REGISTER =======================

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: "Email already registered" });

    const emailToken = uuidv4();
    const emailTokenExpiry = new Date(Date.now() + 3600000); // 1h

    user = await User.create({ name, email, password, emailToken, emailTokenExpiry });

    // await transporter.sendMail({
    //   to: email,
    //   subject: "Verify your email",
    //   text: `Click here to verify: ${process.env.CLIENT_URL}/verify-email/${emailToken}`
    // });

    console.log(`DEV MODE: Verification link -> ${process.env.CLIENT_URL}/verify-email/${emailToken}`);


    res.status(201).json({ message: "Registered successfully, check email for verification link" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================= LOGIN =======================

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // if (!user.isVerified) return res.status(401).json({ message: "Email not verified" });

    const accessToken = generateToken(user, "15m");
    const refreshToken = generateToken(user, "7d");

    res.json({ message: "Login successful", accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================= LOGOUT =======================

exports.logout = async (req, res) => {
  // Client should just delete token
  res.json({ message: "Logged out successfully" });
};

// ======================= REFRESH TOKEN =======================

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const accessToken = generateToken(user, "15m");
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// ======================= GET PROFILE =======================

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
  res.json(user);
};

// ======================= UPDATE PROFILE =======================

exports.updateProfile = async (req, res) => {
  const { name } = req.body;
  await User.update({ name }, { where: { id: req.user.id } });
  res.json({ message: "Profile updated" });
};

// ======================= CHANGE PASSWORD =======================

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password are required" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ======================= PASSWORD RESET REQUEST =======================

exports.passwordResetRequest = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: "User not found" });

  const token = uuidv4();
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();

  // await transporter.sendMail({
  //   to: email,
  //   subject: "Password Reset",
  //   text: `Click here to reset password: ${process.env.CLIENT_URL}/reset-password/${token}`
  // });

  console.log(`DEV MODE: Password reset link -> ${process.env.CLIENT_URL}/reset-password/${token}`);


  res.json({ message: "Password reset email sent" });
};

// ======================= PASSWORD RESET =======================

exports.passwordReset = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({ where: { resetToken: token, resetTokenExpiry: { [Op.gt]: new Date() } } });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.json({ message: "Password reset successful" });
};

// ======================= EMAIL VERIFY =======================

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { emailToken: token, emailTokenExpiry: { [Op.gt]: new Date() } } });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.isVerified = true;
  user.emailToken = null;
  user.emailTokenExpiry = null;
  await user.save();

  res.json({ message: "Email verified successfully" });
};