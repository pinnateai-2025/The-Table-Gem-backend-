const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Payment APIs
router.post("/initiate", authMiddleware(), paymentController.initiatePayment);
router.get("/:paymentId/status", authMiddleware(), paymentController.getPaymentStatus);
router.put("/:paymentId/refund", authMiddleware(), paymentController.refundPayment);

module.exports = router;
