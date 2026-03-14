const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
    context: {
      domain: { type: String, default: "" },
      topic: { type: String, default: "" },
      problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", default: null },
    },
  },
  { timestamps: true }
);

aiChatSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("AIChat", aiChatSchema);
