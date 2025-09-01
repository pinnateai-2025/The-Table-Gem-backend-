const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { User } = require("../models/index");
const { generateToken } = require("../utils/jwt");
const { sendEmail } = require("../utils/mailer");

// ======================= REGISTER =======================
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = uuidv4();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "customer",
      emailToken,
      emailTokenExpiry: new Date(Date.now() + 3600000),
      isVerified: true // auto-verified in dev
    });

    console.log(`DEV: Email verification link -> ${process.env.CLIENT_URL}/verify-email/${emailToken}`);

    res.status(201).json({
      message: "Registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
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

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================= LOGOUT =======================
exports.logout = (req, res) => res.json({ message: "Logged out successfully" });

// ======================= REFRESH TOKEN =======================
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    res.json({ token: generateToken(user) });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// ======================= GET PROFILE =======================
exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] }
  });
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
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Both old and new password required" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
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

  console.log(`DEV: Reset link -> ${process.env.CLIENT_URL}/reset-password/${token}`);
  // await sendEmail(email, "Password Reset", `Click: ${process.env.CLIENT_URL}/reset-password/${token}`);

  res.json({ message: "Password reset email sent" });
};

// ======================= PASSWORD RESET =======================
exports.passwordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: { resetToken: token, resetTokenExpiry: { [Op.gt]: new Date() } }
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.json({ message: "Password reset successful" });
};

// ======================= EMAIL VERIFY =======================
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: { emailToken: token, emailTokenExpiry: { [Op.gt]: new Date() } }
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.isVerified = true;
  user.emailToken = null;
  user.emailTokenExpiry = null;
  await user.save();

  res.json({ message: "Email verified successfully" });
};
