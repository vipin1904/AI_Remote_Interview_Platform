import axiosInstance from "./axios";

/**
 * Executes code using the secure backend execution engine.
 * @param {string} language - "javascript" | "python" | "java"
 * @param {string} code - source code
 * @param {string} [questionSlug=""] - optional question slug for test cases
 * @param {string} [customInput=""] - optional custom stdin
 * @returns {Promise<{success: boolean, output?: string, error?: string, status?: string, testResults?: Array, executionTimeMs?: number}>}
 */
export async function executeCode(language, code, questionSlug = "", customInput = "") {
  try {
    const response = await axiosInstance.post("/code/run", {
      language,
      code,
      questionSlug,
      customInput,
    });

    const data = response.data;

    return {
      success: data.success,
      output: data.stdout || (data.success ? "Execution completed successfully" : ""),
      error: data.stderr || (data.success ? "" : data.status || "Execution error"),
      status: data.status,
      testResults: data.testResults || [],
      passedCount: data.passedCount || 0,
      totalCount: data.totalCount || 0,
      executionTimeMs: data.executionTimeMs || 0,
    };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || error.response?.data?.error || error.message || "Failed to execute code";
    return {
      success: false,
      output: "",
      error: `Execution server error: ${errorMsg}`,
      status: "Runtime Error",
      testResults: [],
    };
  }
}

/**
 * Submits code for official evaluation against all test cases (sample + hidden) and persists attempt.
 */
export async function submitCode(language, code, questionSlug, sessionId = null) {
  try {
    const response = await axiosInstance.post("/code/submit", {
      language,
      code,
      questionSlug,
      sessionId,
    });

    return {
      success: response.data.success,
      status: response.data.status,
      attemptId: response.data.attemptId,
      passedCount: response.data.passedCount,
      totalCount: response.data.totalCount,
      passRate: response.data.passRate,
      executionTimeMs: response.data.executionTimeMs,
      output: response.data.stdout,
      error: response.data.stderr,
      testResults: response.data.testResults || [],
    };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || error.response?.data?.error || error.message || "Failed to submit code";
    return {
      success: false,
      status: "Submission Error",
      output: "",
      error: errorMsg,
      testResults: [],
    };
  }
}
