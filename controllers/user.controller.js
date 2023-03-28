const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");
const sendMail = require("../utils/sendMail.js");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
// @desc authenticate user and get token
// @route POST /api/users/login
// @access PUBLIC
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user, "access"),
      });
      return;
    }
  }
  res.status(401).send({ message: "Invalid email or password" });
};

// @desc register a new user
// @route POST /api/users/
// @access PUBLIC
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    res.status(400).send({message: "User already exists"});
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
    res.status(400);
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
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    const user = await User.findById(decodedToken._id);

    if (user && password) {
      user.password = bcrypt.hashSync(req.body.password, 8);
      await user.save();
      res.send({
        message: "Password reseted successfully",
      });
    } else {
      res.status(401);
      throw new Error("Unable to update password");
    }
  } catch (error) {
    res.status(400);
    throw new Error("User not found.");
  }
};

module.exports = { login, register, mailForPasswordReset, resetUserPassword };
