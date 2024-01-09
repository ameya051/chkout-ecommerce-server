const Order = require("../models/Order.js");
const User = require("../models/User.js");
const Product = require("../models/Product.js");
const dotenv = require("dotenv");
dotenv.config();

const fetchSummary = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const products = await Product.aggregate([
      {
        $group: {
          _id: null,
          numProducts: { $sum: 1 },
        },
      },
    ]);
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          orders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, products, salesData, productCategories });
  } catch (error) {
    console.error(error);
  }
};

const fetchOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name");
    res.status(200).send(orders);
  } catch (error) {
    console.error(error);
  }
};

const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).send({ message: "Order not found" });
    } else if (order?.isPaid) {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      const updatedOrder = await order.save();
      res.status(201).json(updatedOrder);
    } else {
      res
        .status(500)
        .send({ message: "Order wasn't able to be set delivered." });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateOrdertoPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).send({ message: "Order not found" });
    } else if (order?.paymentMethod === "Cash On Delivery") {
      order.isPaid = true;
      order.paidAt = new Date();
      const updatedOrder = await order.save();
      res.status(201).json(updatedOrder);
    } else {
      res.status(500).send({ message: "Order wasn't able to be set paid." });
    }
  } catch (error) {
    console.error(error);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.status(200).send({ message: "Order Deleted" });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  } catch (error) {
    console.error(error);
  }
};

const createProduct = async (req, res) => {
  const { name, slug, category, price, brand, countInStock, description } =
    req.body;
  const image = req.file.path;
  const product = new Product({
    name,
    slug,
    image: image,
    category,
    price,
    brand,
    countInStock,
    description,
  });

  product
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Product created successfully",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

const editProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.image = req.body.image;
    product.images = req.body.images;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    await product.save();
    res.send({ message: "Product Updated" });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.findOneAndRemove({ _id: req.params.id });
    res.status(200).send({ message: "Product Deleted" });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

const fetchProduct = async (req, res) => {
  const products = await Product.find();
};

const fetchProducts = async (req, res) => {
  try {
    // const { query } = req;
    // const page = query.page || 1;
    // const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find();
    // .skip(pageSize * (page - 1))
    // .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      // page,
      // pages: Math.ceil(countProducts / pageSize),
    });
  } catch (error) {
    console.error(error);
  }
};

const fetchUsers = async (req, res) => {
  const users = await User.find({});
  res.send(users);
};

const fetchUserByID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  } catch (error) {
    console.error(error);
  }
};

const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  } catch (error) {
    console.error(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === "admin@example.com") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      await user.remove();
      res.send({ message: "User Deleted" });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  fetchSummary,
  fetchOrders,
  updateOrderToDelivered,
  updateOrdertoPaid,
  deleteOrder,
  createProduct,
  editProduct,
  deleteProduct,
  fetchProducts,
  fetchUsers,
  fetchUserByID,
  editUser,
  deleteUser,
};
