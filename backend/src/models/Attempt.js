import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    questionSlug: {
      type: String,
      required: true,
      index: true,
    },
    questionTitle: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    category: {
      type: String,
      default: "Algorithms",
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "java"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Compilation Error",
        "Time Limit Exceeded",
        "Failed",
      ],
      required: true,
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    passRate: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    stdout: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    testResults: [
      {
        id: String,
        name: String,
        passed: Boolean,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        error: String,
        isHidden: { type: Boolean, default: false },
      },
    ],
    isSubmission: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;
