const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
const {
  fetchOrderHistory,
  createOrder,
  fetchOrderByID,
  updateOrderOnPay,
  createStripeIntent,
  fetchAdminSummary,
  fetchAdminOrders,
} = require("../controllers/order.controller.js");

const router = express.Router();

router.get("/history", verifyToken, fetchOrderHistory);
router.get("/admin/summary", verifyToken, isAdmin, fetchAdminSummary);
router.get("/admin", verifyToken, isAdmin, fetchAdminOrders);
router.post("/", verifyToken, createOrder);
router.post("/stripe-payment", createStripeIntent);
router.get("/:id", verifyToken, fetchOrderByID);
router.patch("/pay/:id", verifyToken, updateOrderOnPay);

module.exports = router;
