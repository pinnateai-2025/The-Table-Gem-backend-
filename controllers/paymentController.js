const { Payment, Order } = require("../models");

// 1. Initiate Payment
exports.initiatePayment = async (req, res, next) => {
  try {
    const { orderId, provider } = req.body;
    const order = await Order.findByPk(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const payment = await Payment.create({
      orderId,
      amount: order.totalAmount,
      provider,
      status: "initiated",
      transactionId: `TXN_${Date.now()}`, // simulate txn ID
    });

    // ⚡ Here you’d call external payment gateway API (PhonePe, Stripe, etc.)

    res.status(201).json({ message: "Payment initiated", payment });
  } catch (err) {
    next(err);
  }
};

// 2. Check Payment Status
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByPk(paymentId, { include: "order" });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json({ status: payment.status, transactionId: payment.transactionId });
  } catch (err) {
    next(err);
  }
};

// 3. Refund Payment
exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByPk(paymentId);

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "successful")
      return res.status(400).json({ message: "Only successful payments can be refunded" });

    // ⚡ Call provider’s refund API here

    payment.status = "refunded";
    await payment.save();

    res.json({ message: "Refund processed successfully", payment });
  } catch (err) {
    next(err);
  }
};
