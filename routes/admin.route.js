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
  updateOrderToDelivered,
  updateOrdertoPaid,
} = require("../controllers/admin.controller.js");
const upload = require("../middlewares/uploadFile");

const router = express.Router();

router.get("/", verifyToken, isAdmin, fetchSummary);
router
  .route("/products")
  .get(verifyToken, isAdmin, fetchProducts)
  .post(verifyToken, isAdmin, upload.single("image"), createProduct);
router.get("/orders", verifyToken, isAdmin, fetchOrders);
router.get("/users", verifyToken, isAdmin, fetchUsers);
router.get("/users/:id", verifyToken, isAdmin, fetchUserByID);
router.patch(
  "/orders/set-delivered/:id",
  verifyToken,
  isAdmin,
  updateOrderToDelivered
);
router.patch("/orders/set-paid/:id", verifyToken, isAdmin, updateOrdertoPaid);
router
  .route("/products/:id").get()
  .patch(verifyToken, isAdmin, editProduct)
  .delete(verifyToken, isAdmin, deleteProduct);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);
// router.patch("/users/:id", verifyToken, isAdmin, editUser);
// router.delete("/orders/:id", verifyToken, isAdmin, deleteOrder);
// router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
