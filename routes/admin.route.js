const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
const {
  fetchSummary,
  fetchOrders,
  deleteOrder,
  createProduct,
  editProduct,
  deleteProduct,
  fetchProducts,
  fetchUsers,
  fetchUserByID,
  editUser,
  deleteUser,
} = require("../controllers/admin.controller.js");

const router = express.Router();

router.get("/", verifyToken, isAdmin, fetchSummary);
router.get("/orders", verifyToken, isAdmin, fetchOrders);
router.delete("/orders/:id", verifyToken, isAdmin, deleteOrder);
router.post("/products", verifyToken, isAdmin, createProduct);
router.get("/products/:id", verifyToken, isAdmin, editProduct);
router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);
router.get("/products", verifyToken, isAdmin, fetchProducts);
router.get("/users", verifyToken, isAdmin, fetchUsers);
router.get("/users/:id", verifyToken, isAdmin, fetchUserByID);
router.patch("/users/:id", verifyToken, isAdmin, editUser);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;
