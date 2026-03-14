const mongoose = require("mongoose");

const roadmapTopicSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    week: { type: Number, required: true },
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      enum: ["software-engineering", "ai-ml", "data-analytics"],
      required: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    topics: [roadmapTopicSchema],
    totalWeeks: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    targetJobs: [{ type: String }],
    skills: [{ type: String }],
  },
  { timestamps: true }
);

roadmapSchema.index({ domain: 1, path: 1 });

module.exports = mongoose.model("Roadmap", roadmapSchema);
