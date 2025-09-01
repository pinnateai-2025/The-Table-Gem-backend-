const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const productController = require("../controllers/productsController");

const router = express.Router();

// Public
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProduct);

// Admin
router.post(
  "/",
  authMiddleware(["admin"]),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("categoryId").notEmpty().withMessage("Category ID is required"),
  ],
  productController.createProduct
);

router.put(
  "/:id",
  authMiddleware(["admin"]),
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be positive"),
  ],
  productController.updateProduct
);

router.delete("/:id", authMiddleware(["admin"]), productController.deleteProduct);

module.exports = router;
