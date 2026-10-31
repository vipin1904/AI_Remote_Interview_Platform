import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  generateReport,
  getReport,
  downloadReportPdf,
  getPracticeRecommendations,
} from "../controllers/reportController.js";

const router = express.Router();

// Generate / refresh report for session
router.post("/session/:sessionId/generate", protectRoute, generateReport);

// Get report by session ID (role filtered)
router.get("/session/:sessionId", protectRoute, getReport);

// Download PDF report
router.get("/session/:sessionId/download", protectRoute, downloadReportPdf);

// Get practice recommendations for candidate
router.get("/practice/recommendations", protectRoute, getPracticeRecommendations);

export default router;
