const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const categoryController = require("../controllers/categoriesController");

const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategory);

// Admin-only routes
router.post(
  "/",
  authMiddleware(["admin"]),
  [body("name").notEmpty().withMessage("Name is required")],
  categoryController.createCategory
);

router.put(
  "/:id",
  authMiddleware(["admin"]),
  [body("name").notEmpty().withMessage("Name is required")],
  categoryController.updateCategory
);

router.delete("/:id", authMiddleware(["admin"]), categoryController.deleteCategory);

module.exports = router;
