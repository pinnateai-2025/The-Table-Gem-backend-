const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

// Cart Operations
router.get("/", authMiddleware(), cartController.getCart);
router.post("/create", authMiddleware(), cartController.createCart); // create new cart
router.post("/add", authMiddleware(), cartController.addItemToCart); // add item
router.put("/update/:itemId", authMiddleware(), cartController.updateCartItem); // update quantity
router.delete("/remove/:itemId", authMiddleware(), cartController.removeItemFromCart); // remove single item
router.delete("/clear", authMiddleware(), cartController.clearCart); // clear all items
router.delete("/delete", authMiddleware(), cartController.deleteCart); // delete entire cart

module.exports = router;
