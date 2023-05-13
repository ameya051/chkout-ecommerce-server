const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
    // req.cookies.token
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // token = req.cookies.token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select("-password");

      next();
    } catch (error) {
      res.status(401).send({ error: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).send({ error: "Not authorized, no token" });
  }
};

module.exports = { verifyToken };
