const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    college: {
      name: { type: String, default: "" },
      year: { type: Number, min: 1, max: 8, default: null },
      branch: { type: String, default: "" },
    },
    career: {
      domain: {
        type: String,
        enum: ["software-engineering", "ai-ml", "data-analytics"],
        default: "software-engineering",
      },
      path: { type: String, default: "" },
      experience: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
    },
    problemsSolved: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
        solvedAt: { type: Date, default: Date.now },
      },
    ],
    questionsPracticed: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        confidence: { type: Number, min: 1, max: 5, default: 3 },
        practicedAt: { type: Date, default: Date.now },
      },
    ],
    topicsCompleted: [
      {
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      totalProblems: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      totalTopics: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
    },
    savedItems: {
      problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
      questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
      resources: [
        {
          title: { type: String, required: true },
          link: { type: String, required: true },
          type: {
            type: String,
            enum: ["video", "article", "course", "other"],
            default: "other",
          },
          savedAt: { type: Date, default: Date.now },
        },
      ],
    },
    aiChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIChat" }],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
