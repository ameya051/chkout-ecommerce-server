const express = require("express");
const {
  login,
  register,
  mailForPasswordReset,
  resetUserPassword,
} = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

// @desc send a mail with the link to reset password
// @route POST /api/users/reset
// and
// @desc reset password of any verified user
// @route PUT /api/users/reset
// @access PUBLIC
router.route("/reset").post(mailForPasswordReset).patch(resetUserPassword);

module.exports = router;
