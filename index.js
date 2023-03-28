const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRouter = require("./routes/user.route.js");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to ChkOut API");
});

app.listen(
  process.env.PORT,
  console.log(`server listening on http://localhost:${process.env.PORT}`)
);
