import express from "express";
import { getAllQuestions, getQuestionBySlug } from "../controllers/questionController.js";

const router = express.Router();

// Questions listing & details are publicly readable (or protected if signed in)
router.get("/", getAllQuestions);
router.get("/:slug", getQuestionBySlug);

export default router;
