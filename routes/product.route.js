const express = require("express");
const {
  getAllProducts,
  getBySlug,
  getReview,
  postReview,
} = require("../controllers/product.controller.js");
const { verifyToken } = require("../middlewares/authMiddleware.js");

router = express.Router();

router.get("/", getAllProducts);
router.get("/:slug", getBySlug);
router.get("/reviews/:id", getReview);
router.post("/reviews/:id", verifyToken, postReview);

module.exports = router;
