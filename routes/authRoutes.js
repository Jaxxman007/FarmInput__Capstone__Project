const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/signup", signup); // POST /api/auth/signup
router.post("/login", login); // POST /api/auth/login
router.post("/forgotpassword", forgotPassword); // POST /api/auth/forgotpassword
router.put("/resetpassword/:token", resetPassword); // PUT /api/auth/resetpassword/:token

module.exports = router;
