import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
    candidateEmail: {
      type: String,
      default: "",
    },
    interviewerNotes: {
      type: String,
      default: "",
    },
    evaluation: {
      rating: {
        type: Number,
        default: 0,
      },
      recommendation: {
        type: String,
        enum: ["", "Strong Hire", "Hire", "Leaning No Hire", "No Hire"],
        default: "",
      },
      feedback: {
        type: String,
        default: "",
      },
    },
    revealedHints: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
