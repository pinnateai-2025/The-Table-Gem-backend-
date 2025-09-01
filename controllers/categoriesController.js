const { Category } = require("../models/index");

// ================== Get all categories ==================
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// ================== Get category by ID ==================
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
};

// =================== Create category ==================
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// =================== Update category ================== 
exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    category.name = name || category.name;
    await category.save();

    res.json(category);
  } catch (err) {
    next(err);
  }
};

// ================== Delete category ==================
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};
