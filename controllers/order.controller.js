const Stripe = require("stripe");
const dotenv = require("dotenv");
const Order = require("../models/Order.js");
const User = require("../models/User.js");
const Product = require("../models/Product.js");
const { default: mongoose } = require("mongoose");

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const fetchOrderHistory = async (req, res) => {
  try {
    const user = req.user;
    const orders = await Order.find({ user: user._id });
    if (orders) {
      res.status(200).send(orders);
    } else {
      res.status(404).send({ message: "No orders found." });
    }
  } catch (error) {
    console.error(error);
  }
};

const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (orderItems && !orderItems.length) {
      res.status(401).send({ message: "No order items" });
    } else {
      const order = new Order({
        user: user._id,
        orderItems: orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });
      const createdOrder = await order.save();
      res.status(201).send(createdOrder);
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchOrderByID = async (req, res) => {
  try {
    const ID = new mongoose.Types.ObjectId(req.params.id);
    const order = await Order.findById(ID);
    if (order) {
      res.status(200).send(order);
    } else {
      res.status(404).send({ message: "Order not found." });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateOrderOnPay = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const { paymentMode } = req.body;
      order.isPaid = true;
      order.paidAt = Date.now();
      if (paymentMode === "Stripe") {
        order.paymentResult = {
          type: "Stripe",
          id: req.body.id,
          status: req.body.status,
          email_address: req.body.receipt_email,
        };
      }
      const updatedOrder = await order.save();
      res.status(201).send(updatedOrder);
    } else {
      res.status(404).send({ message: "Order not found." });
    }
  } catch (error) {
    console.error(error);
  }
};

const createStripeIntent = async (req, res) => {
  try {
    const { price, email } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: "inr",
      receipt_email: email,
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
  }
};

const fetchAdminSummary = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const products = await Product.aggregate([
      {
        $group: {
          _id: null,
          numProducts: { $sum: 1 },
        },
      },
    ]);
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          orders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, products, salesData, productCategories });
  } catch (error) {
    console.error(error);
  }
};

const fetchAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name");
    res.status(200).send(orders);
  } catch (error) {
    console.error(error);
  }
};

const deleteAdminOrders = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.status(200).send({ message: "Order Deleted" });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  fetchOrderHistory,
  createOrder,
  fetchOrderByID,
  updateOrderOnPay,
  createStripeIntent,
  fetchAdminSummary,
  fetchAdminOrders,
  deleteAdminOrders
};
