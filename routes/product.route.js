const express = require("express");
const {
  getAllProducts,
  getFeaturedProducts,
  getBySlug,
  getReview,
  postReview,
} = require("../controllers/product.controller.js");
const { verifyToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getBySlug);
router.get("/reviews/:id", getReview);
router.post("/reviews/:id", verifyToken, postReview);

module.exports = router;
