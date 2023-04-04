const Order = require("../models/Order.js");

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

    if (
      !orderItems ||
      !shippingAddress ||
      !paymentMethod ||
      !itemsPrice ||
      !shippingPrice ||
      !taxPrice ||
      !totalPrice
    ) {
      res.status(400).send({ error: "Please enter all fields" });
    } else {
      const newOrder = await Order.create({
        user: user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });
      if (newOrder) {
        res.status(201).send(newOrder);
      } else {
        res.status(500).send({ error: "Failed to create order" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const fetchOrderByID = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.status(200).send(order);
    } else {
      res.status(404).send({ message: "Order not found." });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createOrder, fetchOrderByID };
