const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Technical", "HR", "Aptitude", "System Design", "Behavioral"],
      default: "Technical",
    },
    domain: {
      type: String,
      enum: ["software-engineering", "ai-ml", "data-analytics", "common"],
      default: "common",
    },
    answerLink: {
      type: String,
      default: "",
    },
    videoExplanation: {
      type: String,
      default: "",
    },
    companies: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    topic: [{ type: String }],
    expectedAnswer: {
      type: String,
      default: "",
    },
    tips: {
      type: String,
      default: "",
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

questionSchema.index({ question: "text", topic: "text", companies: "text" });

module.exports = mongoose.model("Question", questionSchema);
