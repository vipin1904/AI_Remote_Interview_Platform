import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: {
      type: String,
      default: "Algorithms",
    },
    order: {
      type: Number,
      default: 0,
    },
    description: {
      text: { type: String, required: true },
      notes: { type: [String], default: [] },
    },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    constraints: {
      type: [String],
      default: [],
    },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    expectedOutput: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    sampleTestCases: [
      {
        id: { type: String, required: true },
        name: { type: String, default: "" },
        input: { type: String, default: "" },
        expectedOutput: { type: String, required: true },
      },
    ],
    hiddenTestCases: [
      {
        id: { type: String, required: true },
        name: { type: String, default: "" },
        input: { type: String, default: "" },
        expectedOutput: { type: String, required: true },
      },
    ],
    hints: {
      type: [String],
      default: [],
    },
    interviewerGuide: {
      optimalApproach: { type: String, default: "" },
      timeComplexity: { type: String, default: "" },
      spaceComplexity: { type: String, default: "" },
      rubric: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
