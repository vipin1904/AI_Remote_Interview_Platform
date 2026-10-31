import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    mlPrediction: {
      successProbability: { type: Number, default: 0 },
      predictedCategory: { type: String, default: "" },
      confidence: { type: Number, default: 0 },
      modelVersion: { type: String, default: "1.0.0" },
    },
    candidateReport: {
      summary: { type: String, default: "" },
      problemSummary: { type: String, default: "" },
      approachAnalysis: {
        approach: { type: String, default: "" },
        timeComplexity: { type: String, default: "" },
        spaceComplexity: { type: String, default: "" },
        complexityNotes: { type: String, default: "" },
      },
      executionSummary: {
        passedTests: { type: Number, default: 0 },
        totalTests: { type: Number, default: 0 },
        executionStatus: { type: String, default: "" },
        language: { type: String, default: "" },
      },
      whatWorked: { type: [String], default: [] },
      whatFailed: { type: [String], default: [] },
      codeImprovements: { type: [String], default: [] },
      missedEdgeCases: { type: [String], default: [] },
      studyPlan7Days: [
        {
          day: Number,
          focus: String,
          tasks: [String],
          recommendedProblems: [String],
        },
      ],
      mlPracticeRecommendations: { type: [String], default: [] },
      verifiedFacts: { type: [String], default: [] },
      aiSuggestions: { type: [String], default: [] },
      missingEvidence: { type: [String], default: [] },
    },
    interviewerReport: {
      candidateName: { type: String, default: "" },
      candidateEmail: { type: String, default: "" },
      interviewDate: { type: Date, default: Date.now },
      problemTitle: { type: String, default: "" },
      difficulty: { type: String, default: "" },
      overallRecommendation: {
        type: String,
        enum: ["", "Strong Hire", "Hire", "Leaning No Hire", "No Hire"],
        default: "",
      },
      overallScore: { type: Number, default: 0 }, // 1 to 5
      technicalCompetencies: [
        {
          skill: String,
          score: Number,
          evidence: String,
        },
      ],
      codeCorrectnessEvidence: { type: String, default: "" },
      codeQualityNotes: { type: String, default: "" },
      interviewerPrivateNotes: { type: String, default: "" },
      rubricAssessment: [
        {
          criteria: String,
          met: Boolean,
          notes: String,
        },
      ],
      strengths: { type: [String], default: [] },
      concerns: { type: [String], default: [] },
      followUpQuestions: { type: [String], default: [] },
      limitationsAndMissingEvidence: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
