const { response } = require("express");
const { Order, OrderItem, Cart, CartItem, Product } = require("../models");

// 1. Create order from cart
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            { model: Product, 
              as: "product",
              attributes: ["id", "name", "price", "stock"]
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    cart.items.forEach((item) => {
      totalAmount += item.quantity * item.product.price;
    });

    const order = await Order.create({ userId, totalAmount, status: "pending" });

    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(201).json({ message: "Order created", orderId: order.id });
  } catch (err) {
    next(err);
  }
};

// 2. View order details
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// 3. Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status || order.status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    next(err);
  }
};

// 4. Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled" });
  } catch (err) {
    next(err);
  }
};

// 5. List user orders
exports.listUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product, 
              as: "product"
            }
          ]
        }
      ]
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};
