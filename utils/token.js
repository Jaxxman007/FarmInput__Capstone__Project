const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // Payload
    process.env.JWT_SECRET, // Secret
    { expiresIn: process.env.JWT_EXPIRES_IN } // Expiration
  );
};

module.exports = generateToken;
