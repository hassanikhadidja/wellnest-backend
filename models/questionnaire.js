const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "", index: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    profile: { type: String, required: true, trim: true },
    trimester: { type: String, default: "" },
    goal: { type: String, required: true, trim: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("questionnaire", questionnaireSchema);
