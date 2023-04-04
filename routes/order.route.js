const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const {
  createOrder,
  fetchOrderByID,
} = require("../controllers/order.controller.js");

router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/:id", verifyToken, fetchOrderByID);

module.exports = router;
