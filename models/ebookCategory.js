const mongoose = require("mongoose");

const ebookCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ebookCategory", ebookCategorySchema);
