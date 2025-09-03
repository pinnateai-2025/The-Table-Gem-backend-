const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploads")
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
  upload.single("image_url"), 
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be positive"),
  ],
  productController.updateProduct
);

router.delete("/:id", authMiddleware(["admin"]), productController.deleteProduct);

// Upload image or video
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.json({
      message: "File uploaded successfully!",
      url: req.file.path, // Cloudinary URL
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
