const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const generateToken = require("../utils/generateToken.js");
const sendMail = require("../utils/sendMail.js");
const User = require("../models/User.js");

dotenv.config();

// @desc authenticate user and get token
// @route POST /api/users/login
// @access PUBLIC
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      const jwtToken = generateToken(user, "access");
      res.status(200).json({
        token: jwtToken,
      });
      return;
    }
  }
  res.status(401).json({ message: "Invalid email or password" });
};

// @desc register a new user
// @route POST /api/users/
// @access PUBLIC
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({error: "Please enter all the fields"});
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user, "access"),
    });
  } else {
    res.status(500);
    throw new Error("Failed to create the user");
  }
};

// @desc send a mail with the link to reset password
// @route POST /api/users/reset
// @access PUBLIC
const mailForPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // send a link to reset password if user exists
    if (user) {
      await sendMail(user, email);

      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401);
    throw new Error("Could not send the mail. Please retry.");
  }
};

// @desc reset password of any verified user
// @route PATCH /api/users/reset
// @access PUBLIC
const resetUserPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);

    if (user && password) {
      user.password = req.body.password;
      await user.save();
      res.json({
        message: "Password reseted successfully",
      });
    } else {
      res.status(401).json("Unable to update password");
    }
  } catch (error) {
    res.status(400).json("User not found.");
  }
};

module.exports = { login, register, mailForPasswordReset, resetUserPassword };
