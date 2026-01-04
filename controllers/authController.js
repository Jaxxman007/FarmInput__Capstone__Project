const User = require("../models/User");
const generateToken = require("../utils/token");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

// SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Do NOT reveal if user exists (prevents email enumeration)
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "Email sent if account exists",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetpassword/${resetToken}`;

  const message = `
You requested a password reset.

Use the link below to reset your password:
${resetUrl}

If you did not request this, please ignore this email.
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent if account exists",
    });
  } catch (err) {
    console.error("EMAIL ERROR:", err);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: "Email could not be sent",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  // Validate input
  if (!password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and confirm password are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  const resetPasswordToken = require("crypto")
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = generateToken(user);

  return res.status(200).json({
    success: true,
    message: "Password reset successful",
    token,
  });
};
