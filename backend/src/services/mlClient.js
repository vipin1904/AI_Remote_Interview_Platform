const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 4000;

/**
 * Node.js client for TalentIQ ML Service
 */
export const mlClient = {
  /**
   * Health check for ML Service
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${ML_SERVICE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return { healthy: false, status: res.status };
      const data = await res.json();
      return { healthy: true, ...data };
    } catch (err) {
      return { healthy: false, error: err.message };
    }
  },

  /**
   * Get current loaded model status and test metrics
   */
  async getModelStatus() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${ML_SERVICE_URL}/model/status`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        status: "unavailable",
        model_name: "CodingPerformancePredictor",
        error: err.message,
      };
    }
  },

  /**
   * Predict coding success probability and factors
   */
  async predictPerformance(features) {
    const payload = {
      historical_pass_rate: Number(features.historical_pass_rate ?? 0.5),
      past_failed_tests_ratio: Number(features.past_failed_tests_ratio ?? 0.0),
      past_attempts_count: Number(features.past_attempts_count ?? 0),
      difficulty: String(features.difficulty || "Medium"),
      time_spent_minutes: Number(features.time_spent_minutes ?? 5.0),
      language: String(features.language || "javascript"),
      hints_used: Number(features.hints_used ?? 0),
      topic: String(features.topic || "arrays"),
      topic_historical_accuracy: Number(features.topic_historical_accuracy ?? 0.5),
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${ML_SERVICE_URL}/predict-performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`ML service returned HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.warn(`[ML Client] Service call failed: ${err.message}. Using statistical fallback.`);
      return this._statisticalFallback(payload);
    }
  },

  /**
   * Get adaptive practice problem recommendations
   */
  async recommendPractice(params) {
    const payload = {
      current_topic: params.current_topic || "arrays",
      difficulty: params.difficulty || "Medium",
      success_probability: params.success_probability ?? null,
      weak_topics: params.weak_topics || [],
      pass_rate: params.pass_rate ?? null,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${ML_SERVICE_URL}/recommend-practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`ML service returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[ML Client] Recommendation call failed: ${err.message}. Using catalog fallback.`);
      return this._recommendationFallback(payload);
    }
  },

  /**
   * Graceful statistical fallback when Python ML service is offline
   */
  _statisticalFallback(p) {
    const diffPenalty = p.difficulty.toLowerCase() === "hard" ? 0.25 : p.difficulty.toLowerCase() === "easy" ? -0.15 : 0.0;
    const estProb = Math.min(
      0.95,
      Math.max(0.1, p.historical_pass_rate * 0.65 + p.topic_historical_accuracy * 0.35 - p.past_failed_tests_ratio * 0.2 - diffPenalty)
    );

    let category = "Moderate Likelihood";
    if (estProb >= 0.70) category = "High Likelihood of Success";
    else if (estProb < 0.45) category = "Needs Practice / Review";

    return {
      success_probability: Math.round(estProb * 1000) / 1000,
      predicted_category: category,
      confidence: 0.65,
      top_factors: [
        `Calculated from historical pass rate (${Math.round(p.historical_pass_rate * 100)}%) and problem difficulty (${p.difficulty})`,
      ],
      risk_factors: p.past_failed_tests_ratio > 0.3 ? ["Prior attempts encountered failing test cases"] : [],
      model_version: "heuristic-fallback-1.0",
      limitations: "Computed via empirical heuristic because the Python ML inference service was temporarily unreachable.",
    };
  },

  _recommendationFallback(p) {
    return {
      recommended_difficulty: p.difficulty,
      focus_topics: [p.current_topic, ...(p.weak_topics || [])],
      recommended_problems: [
        {
          slug: "two-sum",
          title: "Two Sum",
          difficulty: "Easy",
          topic: "arrays",
          rationale: "Foundational hash map lookup pattern.",
        },
        {
          slug: "valid-palindrome",
          title: "Valid Palindrome",
          difficulty: "Easy",
          topic: "two-pointers",
          rationale: "Two-pointer boundary edge case verification.",
        },
        {
          slug: "maximum-subarray",
          title: "Maximum Subarray",
          difficulty: "Medium",
          topic: "dynamic-programming",
          rationale: "Standard Kadane algorithm for optimal subarray evaluation.",
        },
      ],
      suggested_study_path: [
        "Day 1-2: Review core data structures and edge case analysis.",
        "Day 3-4: Solve medium difficulty array and two-pointer problems.",
        "Day 5-6: Conduct mock timed coding interviews.",
        "Day 7: Re-attempt previously failed questions.",
      ],
      ml_rationale: "Curated problem progression addressing key technical interview competencies.",
    };
  },
};

export default mlClient;
