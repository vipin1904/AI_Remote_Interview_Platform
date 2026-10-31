import express from "express";
import { getMyAttempts, getQuestionAttempts } from "../controllers/codeController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/my", protectRoute, getMyAttempts);
router.get("/question/:questionSlug", protectRoute, getQuestionAttempts);

export default router;
