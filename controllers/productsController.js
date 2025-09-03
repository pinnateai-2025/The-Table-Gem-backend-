const { Product, Category, User } = require("../models");
const { Op } = require("sequelize");

// ======================= Get all products =======================
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category,
          as: "category", 
          attributes: ["id", "name", "parentId"],
          include: [{ model: Category, as: "parent", attributes: ["id", "name"] }],
        },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
      ],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ======================= Get product by ID ======================
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category,
          as: "category",
          attributes: ["id", "name", "parentId"],
          include: [{ model: Category, as: "parent", attributes: ["id", "name"] }],
        },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
      ],
    });

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ======================== Search products =======================
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      res.status(400);
      throw new Error("Search query is required");
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
      ],
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ======================= Create a new product (Admin only) ======

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      image_url: req.file ? req.file.path : null, // ✅ use image_url
      categoryId,
      createdBy: req.user.id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======================= Update a product (Admin only) ==========

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.categoryId = categoryId || product.categoryId;

    // ✅ update image_url if file is uploaded
    product.image_url = req.file ? req.file.path : product.image_url;

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======================= Delete a product (Admin only) ==========
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};
