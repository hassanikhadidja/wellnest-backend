const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { getJwtSecret } = require("../config/jwtSecret");

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : header.split(" ")[1];

    if (!token) return next();

    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded && decoded._id) {
      const user = await User.findById(decoded._id).select("-password");
      if (user) req.user = user;
    }
  } catch {
    // ignore invalid token for public routes
  }
  next();
}

module.exports = optionalAuth;
