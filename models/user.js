const mongoose = require("mongoose");

const CONTENT_ROLES = ["user", "admin", "client"];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    name: { type: String, default: "", trim: true },
    role: {
      type: String,
      enum: CONTENT_ROLES,
      default: "user",
      index: true,
      set(value) {
        if (value === "client") return "user";
        return value === "admin" ? "admin" : "user";
      },
    },
  },
  { timestamps: true },
);

if (mongoose.models.user) {
  delete mongoose.models.user;
}

module.exports = mongoose.model("user", userSchema);
module.exports.CONTENT_ROLES = CONTENT_ROLES;
