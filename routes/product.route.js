const express = require("express");
const {
  getAllProducts,
  getBySlug,
} = require("../controllers/product.controller.js");

router = express.Router();

router.get("/", getAllProducts);
router.get("/:slug", getBySlug);

module.exports = router;
