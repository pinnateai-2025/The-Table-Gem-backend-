const express = require("express");

const authRoutes = require("./authRoute");
const categoriesRoutes = require("./categoriesRoute");
const productsRoutes = require("./productsRoute");
const cartRoutes = require("./cartRoute");

const router = express.Router();

// Register all route groups here
router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);

module.exports = router;
