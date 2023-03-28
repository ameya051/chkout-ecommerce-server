const jwt = require("jsonwebtoken");

const generateToken = (user, option) => {
  if (option === "access") {
    return jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 60 * 60, // 1 hr
      }
    );
  } else if (option === "forgot password") {
    return jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 60 * 10, // 10 mins
      }
    );
  }
};

module.exports = generateToken;
