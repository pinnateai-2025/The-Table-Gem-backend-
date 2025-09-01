const { Cart, CartItem, Product } = require("../models");

// ================== Get user cart ==================
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [{ model: Product, attributes: ["id", "name", "price", "image_url"] }],
        },
      ],
    });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// ================== Create a new cart for user (if not exists) ==================

exports.createCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (cart) {
      res.status(400);
      throw new Error("Cart already exists");
    }

    cart = await Cart.create({ userId: req.user.id });
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
};

// ================== Add item to cart ==================

exports.addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cartItem,
    });
  } catch (err) {
    next(err);
  }
};


// ================== Update item quantity ==================

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cartItem = await CartItem.findByPk(itemId);
    if (!cartItem) {
      res.status(404);
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({ message: "Item removed from cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (err) {
    next(err);
  }
};

// ================== Remove item from cart ==================

exports.removeItemFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cartItem = await CartItem.findByPk(itemId);
    if (!cartItem) {
      res.status(404);
      throw new Error("Cart item not found");
    }

    await cartItem.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};

// ================== Clear entire cart =======================

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    next(err);
  }
};

// ================== Delete cart =======================

exports.deleteCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    await cart.destroy();
    res.json({ message: "Cart deleted successfully" });
  } catch (err) {
    next(err);
  }
};