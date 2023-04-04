const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const userRouter = require("./routes/user.route.js");
const productRoute = require("./routes/product.route.js");
const orderRoute = require("./routes/order.route.js");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");
const Razorpay = require("razorpay");

dotenv.config();
connectDB();

const app = express();

//configuring middlewares
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);

app.get("/", (req, res) => {
  res.send("Welcome to ChkOut API");
});

// middleware to act as fallback for all 404 errors
app.use(notFound);
// configure a custome error handler middleware
app.use(errorHandler);

PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server listening on http://localhost:${PORT}`));
