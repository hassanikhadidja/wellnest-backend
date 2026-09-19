const mongoose = require("mongoose");
const {
  EBOOK_CATEGORIES,
  ALLOWED_EBOOK_CATEGORIES,
} = require("../constants/ebookCategories");

const recipeMetaSchema = new mongoose.Schema(
  {
    time: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["facile", "moyen", "difficile"],
      default: "facile",
    },
    people: { type: String, default: "" },
  },
  { _id: false },
);

const ebookSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["fr", "ar"],
      default: "fr",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    categories: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          return (
            Array.isArray(arr) &&
            arr.every((c) => ALLOWED_EBOOK_CATEGORIES.includes(c))
          );
        },
        message: "Invalid ebook category",
      },
    },
    isRecipe: { type: Boolean, default: false },
    recipeMeta: { type: recipeMetaSchema, default: () => ({}) },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    author: { type: String, default: "" },
    delivery: {
      type: String,
      enum: ["immediate", "email-after-pay"],
      default: "immediate",
    },
    pages: { type: String, default: "" },
    /** Cover image URL (Cloudinary or external) */
    image: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    pdfFileName: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    about: { type: String, default: "" },
    summary: { type: [String], default: [] },
    tip: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ebook", ebookSchema);
module.exports.EBOOK_CATEGORIES = EBOOK_CATEGORIES;
module.exports.ALLOWED_EBOOK_CATEGORIES = ALLOWED_EBOOK_CATEGORIES;
