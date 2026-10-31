import mongoose from "mongoose";
import Session from "../models/Session.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import mlClient from "./mlClient.js";
import aiProvider from "./ai/aiProvider.js";

/**
 * Service to orchestrate ML predictions, AI grounded analysis,
 * and dual report generation/persistence.
 */
export const reportService = {
  /**
   * Generates or regenerates both Candidate and Interviewer reports for an interview session.
   */
  async generateSessionReport({
    sessionId,
    requestingUser,
    interviewerNotes = "",
    interviewerScore = 0,
    interviewerRecommendation = "",
  }) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new Error("Invalid session ID format.");
    }

    const session = await Session.findById(sessionId).populate("host participant");
    if (!session) {
      throw new Error("Interview session not found.");
    }

    const hostId = session.host?._id?.toString() || session.host?.toString();
    const participantId = session.participant?._id?.toString() || session.participant?.toString();
    const requestingUserId = requestingUser?._id?.toString() || requestingUser?.id?.toString();

    // The candidate is the participant, or the non-host requester, or the host in solo sessions
    const candidateUser = session.participant || (requestingUserId !== hostId ? requestingUser : session.host);
    const candidateId = candidateUser?._id?.toString() || candidateUser?.toString();

    // Verify requesting user is participant, host, or admin
    const isInterviewer = requestingUserId === hostId || requestingUser?.role === "interviewer";
    const isCandidate = requestingUserId === candidateId || requestingUserId === participantId || requestingUser?.role === "candidate";
    const isAdmin = requestingUser?.role === "admin";

    if (!isInterviewer && !isCandidate && !isAdmin && requestingUserId !== hostId && requestingUserId !== participantId) {
      throw new Error("Access denied: You are not a participant in this interview session.");
    }

    // Determine target question
    const questionSlug = session.problem || "two-sum";
    const question = await Question.findOne({ slug: questionSlug }).lean();

    // Find candidate's attempts
    const attempts = await Attempt.find({
      $or: [
        { sessionId: session._id.toString() },
        { session: session._id },
        { user: candidateId },
        { clerkId: candidateUser?.clerkId || requestingUser?.clerkId },
      ],
    }).sort({ createdAt: -1 });

    const currentAttempt =
      attempts.find(
        (a) =>
          a.session?.toString() === sessionId ||
          a.questionSlug === questionSlug
      ) || attempts[0];

    // Compute candidate historical performance statistics
    const totalPriorAttempts = attempts.length;
    const acceptedAttempts = attempts.filter((a) => a.status === "ACCEPTED").length;
    const historicalPassRate =
      totalPriorAttempts > 0 ? acceptedAttempts / totalPriorAttempts : 0.6;

    const totalTestsRun = attempts.reduce((acc, a) => acc + (a.totalCount || 0), 0);
    const failedTestsSum = attempts.reduce(
      (acc, a) => acc + ((a.totalCount || 0) - (a.passedCount || 0)),
      0
    );
    const pastFailedRatio =
      totalTestsRun > 0 ? failedTestsSum / totalTestsRun : 0.15;

    const code = currentAttempt?.code || "// Candidate did not submit code";
    const language = currentAttempt?.language || "javascript";
    const passedTests = currentAttempt?.passedCount ?? 0;
    const totalTests = currentAttempt?.totalCount ?? 0;
    const executionError = currentAttempt?.executionError || "";

    // 1. Invoke ML Service for Performance Prediction
    const mlPred = await mlClient.predictPerformance({
      historical_pass_rate: historicalPassRate,
      past_failed_tests_ratio: pastFailedRatio,
      past_attempts_count: totalPriorAttempts,
      difficulty: question?.difficulty || "Medium",
      time_spent_minutes: 15.0,
      language: language,
      hints_used: 0,
      topic: question?.topic || "arrays",
      topic_historical_accuracy: historicalPassRate,
    });

    // 2. Invoke ML Service for Adaptive Practice Recommendations
    const mlRecs = await mlClient.recommendPractice({
      current_topic: question?.topic || "arrays",
      difficulty: question?.difficulty || "Medium",
      success_probability: mlPred?.success_probability,
      weak_topics: passedTests < totalTests ? [question?.topic || "arrays"] : [],
      pass_rate: totalTests > 0 ? passedTests / totalTests : 0,
    });

    // 3. Invoke Grounded AI Analysis Engine
    const analysisEvidence = {
      sessionId: session._id.toString(),
      questionTitle: question?.title || "Technical Interview Problem",
      questionDifficulty: question?.difficulty || "Medium",
      topic: question?.topic || "arrays",
      code,
      language,
      passedTests,
      totalTests,
      testResults: currentAttempt?.testResults || [],
      executionError,
      interviewerNotes: isInterviewer ? interviewerNotes : "",
      mlPrediction: mlPred,
    };

    const aiResult = await aiProvider.analyzeInterviewSession(analysisEvidence);

    // Merge ML practice recommendations into candidate report
    if (mlRecs?.recommended_problems && aiResult.candidateReport) {
      aiResult.candidateReport.mlPracticeRecommendations = mlRecs.recommended_problems.map(
        (p) => `${p.title} (${p.difficulty}): ${p.rationale}`
      );
    }
    if (mlRecs?.suggested_study_path && aiResult.candidateReport?.studyPlan7Days) {
      // Enhance study plan days with ML topics
      mlRecs.suggested_study_path.forEach((task, idx) => {
        if (aiResult.candidateReport.studyPlan7Days[idx]) {
          aiResult.candidateReport.studyPlan7Days[idx].tasks.push(task);
        }
      });
    }

    // Populate candidate & interviewer info in interviewer report
    const candidateDisplayUser = session.participant || candidateUser || session.host;
    if (aiResult.interviewerReport) {
      aiResult.interviewerReport.candidateName = candidateDisplayUser?.name || "Candidate";
      aiResult.interviewerReport.candidateEmail = candidateDisplayUser?.email || "";
      aiResult.interviewerReport.problemTitle = question?.title || "Coding Assessment";
      aiResult.interviewerReport.difficulty = question?.difficulty || "Medium";

      // If interviewer explicitly provided recommendation/score, respect it
      if (isInterviewer && interviewerRecommendation) {
        aiResult.interviewerReport.overallRecommendation = interviewerRecommendation;
      }
      if (isInterviewer && interviewerScore > 0) {
        aiResult.interviewerReport.overallScore = interviewerScore;
      }
      if (isInterviewer && interviewerNotes) {
        aiResult.interviewerReport.interviewerPrivateNotes = interviewerNotes;
      }
    }

    // 4. Save or Upsert Report in Database
    const reportData = {
      session: session._id,
      candidate: candidateUser?._id || candidateUser || session.host?._id || session.host,
      interviewer: session.host?._id || session.host,
      status: "COMPLETED",
      generatedAt: new Date(),
      mlPrediction: {
        successProbability: mlPred?.success_probability || 0,
        predictedCategory: mlPred?.predicted_category || "",
        confidence: mlPred?.confidence || 0,
        modelVersion: mlPred?.model_version || "1.0.0",
      },
      candidateReport: aiResult.candidateReport,
      interviewerReport: aiResult.interviewerReport,
    };

    const savedReport = await Report.findOneAndUpdate(
      { session: session._id },
      { $set: reportData, $inc: { version: 1 } },
      { upsert: true, new: true }
    );

    // Mark session as completed if it wasn't already
    if (session.status !== "completed") {
      session.status = "completed";
      await session.save();
    }

    return this.filterReportByRole(savedReport, requestingUser);
  },

  /**
   * Retrieves report by session ID with role-based redaction.
   */
  async getReportBySessionId(sessionId, requestingUser) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new Error("Invalid session ID format.");
    }

    const report = await Report.findOne({ session: sessionId })
      .populate("candidate", "name email profileImage role")
      .populate("interviewer", "name email profileImage role")
      .lean();

    if (!report) return null;

    return this.filterReportByRole(report, requestingUser);
  },

  /**
   * Redacts confidential interviewer assessments if the requester is a candidate.
   */
  filterReportByRole(report, requestingUser) {
    if (!report) return null;
    const reportObj = report.toObject ? report.toObject() : { ...report };

    const requestingUserId =
      requestingUser?._id?.toString() || requestingUser?.id?.toString();
    const candidateId =
      reportObj.candidate?._id?.toString() || reportObj.candidate?.toString();
    const interviewerId =
      reportObj.interviewer?._id?.toString() || reportObj.interviewer?.toString();
    const userRole = requestingUser?.role;

    const isInterviewerOrAdmin =
      requestingUserId === interviewerId || userRole === "interviewer" || userRole === "admin";

    // Strict access control: If user is candidate, completely omit interviewerReport
    if (!isInterviewerOrAdmin && requestingUserId === candidateId) {
      delete reportObj.interviewerReport;
    }

    return reportObj;
  },
};

export default reportService;
