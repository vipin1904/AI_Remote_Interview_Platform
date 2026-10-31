import express from "express";
import { runCode, submitCode } from "../controllers/codeController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Run sample code or test cases
router.post("/run", runCode);

// Submit code against all hidden test cases and persist attempt (authenticated)
router.post("/submit", protectRoute, submitCode);

export default router;
