const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

// Cart Operations
router.get("/", authMiddleware(), cartController.getCart);
router.post("/create", authMiddleware(), cartController.createCart);
router.post("/add", authMiddleware(), cartController.addItemToCart);
router.put("/update/:itemId", authMiddleware(), cartController.updateCartItem);
router.delete("/remove/:itemId", authMiddleware(), cartController.removeItemFromCart);
router.delete("/clear", authMiddleware(), cartController.clearCart);
router.delete("/delete", authMiddleware(), cartController.deleteCart);

module.exports = router;
