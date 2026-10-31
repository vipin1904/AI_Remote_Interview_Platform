import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import { executeInSandbox, runTestCases } from "../services/codeRunner/isolatedRunner.js";

export async function runCode(req, res) {
  try {
    const { language, code, questionSlug, customInput } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Language and code are required" });
    }

    if (!["javascript", "python", "java"].includes(language)) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    let question = null;
    if (questionSlug) {
      question = await Question.findOne({ slug: questionSlug });
    }

    const testCasesToRun = question?.sampleTestCases?.length
      ? question.sampleTestCases
      : [{ id: "custom", name: "Sample Run", input: customInput || "", expectedOutput: "" }];

    // If custom input is provided, run with custom stdin
    if (customInput !== undefined && customInput !== null && customInput.trim()) {
      const singleRun = await executeInSandbox(language, code, customInput, 4000);
      return res.status(200).json({
        success: singleRun.success,
        status: singleRun.timedOut ? "Time Limit Exceeded" : singleRun.success ? "Accepted" : "Runtime Error",
        stdout: singleRun.stdout,
        stderr: singleRun.stderr,
        executionTimeMs: singleRun.executionTimeMs,
        passedCount: singleRun.success ? 1 : 0,
        totalCount: 1,
        testResults: [
          {
            id: "custom",
            name: "Custom Input Case",
            passed: singleRun.success,
            input: customInput,
            expectedOutput: "",
            actualOutput: singleRun.stdout.trim() || (singleRun.stderr ? "" : "No output"),
            error: singleRun.stderr,
            isHidden: false,
          },
        ],
      });
    }

    const results = await runTestCases(language, code, testCasesToRun, {
      isSubmission: false,
      timeoutPerRunMs: 4000,
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error in runCode controller:", error);
    res.status(500).json({ message: "Execution server error", error: error.message });
  }
}

export async function submitCode(req, res) {
  try {
    const { language, code, questionSlug, sessionId } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!language || !code || !questionSlug) {
      return res.status(400).json({ message: "Language, code, and questionSlug are required" });
    }

    const question = await Question.findOne({ slug: questionSlug });
    if (!question) {
      return res.status(404).json({ message: `Question not found: ${questionSlug}` });
    }

    // Combine sample test cases and hidden test cases for full evaluation
    const allTestCases = [
      ...(question.sampleTestCases || []).map((t) => ({ ...t.toObject ? t.toObject() : t, isHidden: false })),
      ...(question.hiddenTestCases || []).map((t) => ({ ...t.toObject ? t.toObject() : t, isHidden: true })),
    ];

    const results = await runTestCases(language, code, allTestCases, {
      isSubmission: true,
      timeoutPerRunMs: 4000,
    });

    const passRate = results.totalCount > 0 ? results.passedCount / results.totalCount : 0;

    // Persist attempt in MongoDB
    const attempt = await Attempt.create({
      user: userId,
      clerkId,
      questionSlug: question.slug,
      questionTitle: question.title,
      difficulty: question.difficulty,
      category: question.category,
      sessionId: sessionId || null,
      code,
      language,
      status: results.status,
      passedCount: results.passedCount,
      totalCount: results.totalCount,
      passRate,
      executionTimeMs: results.executionTimeMs,
      stdout: results.stdout,
      stderr: results.stderr,
      testResults: results.testResults,
      isSubmission: true,
    });

    // Sanitized results for candidate response (mask hidden test inputs if needed)
    const sanitizedTestResults = results.testResults.map((t) => {
      if (t.isHidden) {
        return {
          id: t.id,
          name: t.name || "Hidden Test Case",
          passed: t.passed,
          input: "[Hidden Test Case]",
          expectedOutput: "[Hidden]",
          actualOutput: t.passed ? "[Matched]" : "[Output Mismatch]",
          error: t.error ? "Test Failed" : "",
          isHidden: true,
        };
      }
      return t;
    });

    res.status(201).json({
      attemptId: attempt._id,
      status: results.status,
      success: results.success,
      passedCount: results.passedCount,
      totalCount: results.totalCount,
      passRate,
      executionTimeMs: results.executionTimeMs,
      stdout: results.stdout,
      stderr: results.stderr,
      testResults: sanitizedTestResults,
    });
  } catch (error) {
    console.error("Error in submitCode controller:", error);
    res.status(500).json({ message: "Submission failed", error: error.message });
  }
}

export async function getMyAttempts(req, res) {
  try {
    const userId = req.user._id;

    const attempts = await Attempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ attempts });
  } catch (error) {
    console.error("Error in getMyAttempts:", error.message);
    res.status(500).json({ message: "Failed to fetch attempt history", error: error.message });
  }
}

export async function getQuestionAttempts(req, res) {
  try {
    const { questionSlug } = req.params;
    const userId = req.user._id;

    const attempts = await Attempt.find({ user: userId, questionSlug })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ attempts });
  } catch (error) {
    console.error("Error in getQuestionAttempts:", error.message);
    res.status(500).json({ message: "Failed to fetch question attempts", error: error.message });
  }
}
