const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { getJwtSecret } = require("../config/jwtSecret");

exports.Auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.code === "JWT_SECRET_MISSING") {
      return res.status(503).json({ msg: error.message });
    }
    return res.status(500).json({ msg: error.message });
  }
};
