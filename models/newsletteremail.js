const mongoose = require("mongoose");

const newsletterEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, default: "", trim: true },
    source: {
      type: String,
      default: "newsletter",
      index: true,
    },
  },
  { timestamps: true },
);

if (mongoose.models.newsletteremail) {
  delete mongoose.models.newsletteremail;
}

module.exports = mongoose.model("newsletteremail", newsletterEmailSchema);
