const jwt = require("jsonwebtoken");

exports.generateToken = (user, expiresIn = "1h") => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn });
};
