const { redis } = require("../config/redis.js");
const Product = require("../models/Product.js");

const PAGE_SIZE = 3;

const getAllProducts = async (req, res) => {
  const cachedVal = await redis.get("products");
  if (cachedVal) {
    res.status(200).send(JSON.parse(cachedVal));
  } else {
    const products = await Product.find();
    if (!products) res.status(404).send({ message: "Products not found" });
    await redis.set("products", JSON.stringify(products));
    res.status(200).send(products);
  }
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true });
  res.status(200).send(products);
};

const searchProduct = async (req, res) => {
  const { query } = req;
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || "";
  const brand = query.brand || "";
  const price = query.price || "";
  const rating = query.rating || "";
  const sort = query.sort || "";
  const searchQuery = query.query || "";

  const queryFilter =
    searchQuery && searchQuery !== "all"
      ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
      : {};
  const categoryFilter = category && category !== "all" ? { category } : {};
  const brandFilter = brand && brand !== "all" ? { brand } : {};
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};
  // 10-50
  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
      : {};

  const order =
    sort === "featured"
      ? { isFeatured: -1 }
      : sort === "lowest"
      ? { price: 1 }
      : sort === "highest"
      ? { price: -1 }
      : sort === "toprated"
      ? { rating: -1 }
      : sort === "newest"
      ? { createdAt: -1 }
      : { _id: -1 };

  const [categories, brands, products, countProducts] = await Promise.all([
    Product.find().distinct("category"),
    Product.find().distinct("brand"),
    Product.find(
      {
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...brandFilter,
        ...ratingFilter,
      },
      "-reviews"
    )
      .sort(order)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean(),
    Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    }),
  ]);

  res.send({
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
    categories,
    brands,
  });
};

const getCategory = async (req, res) => {
  const categories = await Product.find().distinct("category");
  res.send(categories);
};

const getBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

const getById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

const getReview = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    res.send(product.reviews);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};

const postReview = async (req, res) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;
  const user = req.user;
  console.log(user);
  const product = await Product.findById(productId);
  if (product) {
    if (product.reviews.find((x) => x.name === req.user.name)) {
      return res
        .status(400)
        .send({ message: "You already submitted a review" });
    }

    const review = {
      user: user._id,
      name: user.name,
      rating: Number(rating),
      comment: comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      message: "Review Created",
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      numReviews: product.numReviews,
      rating: product.rating,
    });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getBySlug,
  getById,
  getReview,
  postReview,
  searchProduct,
  getCategory,
};
