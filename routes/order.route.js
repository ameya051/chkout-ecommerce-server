const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const {
  fetchOrderHistory,
  createOrder,
  fetchOrderByID,
  updateOrderOnPay,
  createStripeIntent,
} = require("../controllers/order.controller.js");

router = express.Router();

router.get("/history", verifyToken, fetchOrderHistory);
router.post("/", verifyToken, createOrder);
router.post("/stripe-payment", createStripeIntent);
router.get("/:id", verifyToken, fetchOrderByID);
router.patch("/pay/:id", verifyToken, updateOrderOnPay);

module.exports = router;
