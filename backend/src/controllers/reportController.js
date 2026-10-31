import reportService from "../services/reportService.js";
import pdfService from "../services/pdfService.js";
import mlClient from "../services/mlClient.js";
import Attempt from "../models/Attempt.js";

export const generateReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { interviewerNotes, interviewerScore, interviewerRecommendation } = req.body;

    const report = await reportService.generateSessionReport({
      sessionId,
      requestingUser: req.user,
      interviewerNotes,
      interviewerScore: Number(interviewerScore) || 0,
      interviewerRecommendation,
    });

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      report,
    });
  } catch (error) {
    console.error("[generateReport Error]:", error);
    res.status(error.message.includes("Access denied") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to generate report",
    });
  }
};

export const getReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const report = await reportService.getReportBySessionId(sessionId, req.user);

    if (!report) {
      return res.status(200).json({
        success: true,
        report: null,
        message: "No report generated yet for this session.",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("[getReport Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch report",
    });
  }
};

export const downloadReportPdf = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const report = await reportService.getReportBySessionId(sessionId, req.user);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found for this session.",
      });
    }

    const requestingUserId = req.user?._id?.toString() || req.user?.id?.toString();
    const candidateId = report.candidate?._id?.toString() || report.candidate?.toString();
    const interviewerId = report.interviewer?._id?.toString() || report.interviewer?.toString();
    const isInterviewerOrAdmin =
      requestingUserId === interviewerId || req.user?.role === "interviewer" || req.user?.role === "admin";

    // Select report type based on role and authorized view
    const isCandidate = requestingUserId === candidateId && !isInterviewerOrAdmin;

    if (isCandidate || !report.interviewerReport) {
      // Stream Candidate Learning Report PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Candidate_Learning_Report_${sessionId.slice(-6)}.pdf"`
      );
      pdfService.generateCandidatePdf(report, res);
    } else {
      // Stream Interviewer Assessment Report PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Interviewer_Assessment_${sessionId.slice(-6)}.pdf"`
      );
      pdfService.generateInterviewerPdf(report, res);
    }
  } catch (error) {
    console.error("[downloadReportPdf Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate report PDF",
    });
  }
};

export const getPracticeRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const attempts = await Attempt.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

    const total = attempts.length;
    const passed = attempts.filter((a) => a.status === "ACCEPTED").length;
    const passRate = total > 0 ? passed / total : 0.5;

    // Identify weak topics
    const failedTopics = attempts
      .filter((a) => a.status !== "ACCEPTED")
      .map((a) => a.questionSlug);

    const recs = await mlClient.recommendPractice({
      current_topic: failedTopics[0] || "arrays",
      difficulty: passRate > 0.7 ? "Medium" : "Easy",
      success_probability: passRate,
      weak_topics: failedTopics.slice(0, 3),
      pass_rate: passRate,
    });

    res.status(200).json({
      success: true,
      recommendations: recs,
    });
  } catch (error) {
    console.error("[getPracticeRecommendations Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recommendations",
    });
  }
};
