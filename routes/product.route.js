const express = require("express");
const {
  getAllProducts,
  getBySlug,
  postReview,
} = require("../controllers/product.controller.js");

router = express.Router();

router.get("/", getAllProducts);
router.get("/:slug", getBySlug);
router.post('/:id/reviews', postReview)

module.exports = router;
