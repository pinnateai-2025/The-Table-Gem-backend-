const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const orderController = require("../controllers/ordersController");

const router = express.Router();

router.post("/create", authMiddleware(), orderController.createOrder);
router.get("/:id", authMiddleware(), orderController.getOrder);
router.put("/:id/status", authMiddleware(), adminMiddleware, orderController.updateOrderStatus); // admin only
router.put("/:id/cancel", authMiddleware(), orderController.cancelOrder);
router.get("/", authMiddleware(), orderController.listUserOrders);

module.exports = router;
