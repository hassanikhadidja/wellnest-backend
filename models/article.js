const mongoose = require("mongoose");

const CONTENT_CATEGORIES = [
  "Nutrition Maman",
  "Bébé & Enfant",
  "Enfants & Adolescents",
  "Santé Globale",
  "Bien-être & Équilibre",
];

const articleSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    note: { type: String, default: "" },
    text: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const articleSchema = new mongoose.Schema(
  {
    categories: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.every((c) => CONTENT_CATEGORIES.includes(c));
        },
        message: "Invalid article category",
      },
    },
    image: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    author: { type: String, default: "" },
    introduction: { type: String, default: "" },
    sections: { type: [articleSectionSchema], default: [] },
    tip: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("article", articleSchema);
module.exports.CONTENT_CATEGORIES = CONTENT_CATEGORIES;
