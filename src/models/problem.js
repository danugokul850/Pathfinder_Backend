const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      enum: [
        "LeetCode",
        "GeeksforGeeks",
        "CodeChef",
        "CodeForces",
        "HackerRank",
        "InterviewBit",
        "Other",
      ],
      default: "Other",
    },
    questionLink: {
      type: String,
      required: true,
    },
    videoSolutionLink: {
      type: String,
      default: "",
    },
    articleLink: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    topic: [{ type: String }],
    companies: [{ type: String }],
    solutionApproach: {
      type: String,
      default: "",
    },
    timeComplexity: {
      type: String,
      default: "",
    },
    spaceComplexity: {
      type: String,
      default: "",
    },
    likes: {
      type: Number,
      default: 0,
    },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

problemSchema.index({ title: "text", description: "text", companies: "text" });

module.exports = mongoose.model("Problem", problemSchema);
