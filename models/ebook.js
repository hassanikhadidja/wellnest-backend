const mongoose = require("mongoose");

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
