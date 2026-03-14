const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      enum: ["software-engineering", "ai-ml", "data-analytics"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    resources: [
      {
        type: {
          type: String,
          enum: ["video", "article", "course"],
          required: true,
        },
        title: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],
    estimatedHours: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "📘",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

topicSchema.index({ domain: 1, order: 1 });

module.exports = mongoose.model("Topic", topicSchema);
