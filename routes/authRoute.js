const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

// Register & Login
router.post("/register", [
  body("name").notEmpty().withMessage("Name required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars")
], authController.register);

router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Profile
router.get("/profile", authMiddleware(), authController.getProfile);
router.put("/profile", authMiddleware(), authController.updateProfile);

// Password Management
router.post("/change-password", authMiddleware(), authController.changePassword);
router.post("/password-reset-request", authController.passwordResetRequest);
router.post("/password-reset", authController.passwordReset);

// Email Verification
router.get("/verify-email/:token", authController.verifyEmail);

// Token Refresh
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
