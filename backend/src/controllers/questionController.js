import Question from "../models/Question.js";
import { DEFAULT_QUESTIONS, seedQuestionsIfEmpty } from "../lib/seedQuestions.js";

export async function getAllQuestions(req, res) {
  try {
    let questions = await Question.find()
      .select("-hiddenTestCases -interviewerGuide.optimalApproach")
      .sort({ order: 1 });

    if (!questions || questions.length === 0) {
      await seedQuestionsIfEmpty();
      questions = await Question.find()
        .select("-hiddenTestCases -interviewerGuide.optimalApproach")
        .sort({ order: 1 });
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error in getAllQuestions:", error.message);
    res.status(500).json({ message: "Failed to retrieve coding questions", error: error.message });
  }
}

export async function getQuestionBySlug(req, res) {
  try {
    const { slug } = req.params;

    let question = await Question.findOne({ slug });

    if (!question) {
      // Check in DEFAULT_QUESTIONS
      const defaultQ = DEFAULT_QUESTIONS.find((q) => q.slug === slug);
      if (defaultQ) {
        question = await Question.create(defaultQ);
      } else {
        return res.status(404).json({ message: `Question not found: ${slug}` });
      }
    }

    // Never leak hidden test cases to client
    const safeQuestion = question.toObject ? question.toObject() : { ...question };
    delete safeQuestion.hiddenTestCases;

    res.status(200).json({ question: safeQuestion });
  } catch (error) {
    console.error("Error in getQuestionBySlug:", error.message);
    res.status(500).json({ message: "Failed to retrieve question details", error: error.message });
  }
}
