const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const userRouter = require("./routes/user.route.js");
const productRoute = require("./routes/product.route.js");
const orderRoute = require("./routes/order.route.js");
const adminRoute = require("./routes/admin.route.js");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");

dotenv.config();
connectDB();

const app = express();

//configuring middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("Welcome to ChkOut API");
});

// middleware to act as fallback for all 404 errors
app.use(notFound);
// configure a custome error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`server listening on http://localhost:${PORT}`)
);
