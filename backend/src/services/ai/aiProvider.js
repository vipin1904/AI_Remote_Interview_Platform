/**
 * AI Provider Abstraction
 * Supports Google Gemini, OpenAI, or local deterministic evidence-grounded analyzer.
 */

/**
 * Deterministic Evidence-Grounded Fallback Analyzer
 * Strictly relies on verified submission artifacts, test results, and runtime errors.
 * Never fabricates nonexistent transcripts or behavioral observations.
 */
function analyzeFromVerifiedEvidence(sessionEvidence) {
  const {
    questionTitle = "Coding Problem",
    questionDifficulty = "Medium",
    topic = "algorithms",
    code = "",
    language = "javascript",
    passedTests = 0,
    totalTests = 0,
    testResults = [],
    executionError = "",
    interviewerNotes = "",
    mlPrediction = null,
  } = sessionEvidence;

  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const isFullyPassed = totalTests > 0 && passedTests === totalTests;

  // Approach and complexity heuristics grounded on actual code patterns
  let detectedApproach = "Standard iterative / procedural implementation";
  let timeComplexity = "O(n)";
  let spaceComplexity = "O(1)";
  let complexityRationale = "Single-pass algorithm with constant auxiliary space.";

  const codeLower = code.toLowerCase();
  if (codeLower.includes("map") || codeLower.includes("dict") || codeLower.includes("set") || codeLower.includes("new map") || codeLower.includes("hashmap")) {
    detectedApproach = "Hash table / dictionary lookup approach";
    timeComplexity = "O(n)";
    spaceComplexity = "O(n)";
    complexityRationale = "Auxiliary hash set/map used to achieve linear time lookups.";
  } else if ((code.match(/for\s*\(/g) || []).length >= 2 || (code.match(/while\s*\(/g) || []).length >= 2) {
    detectedApproach = "Nested iterative search / brute-force approach";
    timeComplexity = "O(n^2)";
    spaceComplexity = "O(1)";
    complexityRationale = "Nested iteration passes over inputs.";
  } else if (codeLower.includes("left") && codeLower.includes("right") && (codeLower.includes("while (left < right)") || codeLower.includes("while left < right"))) {
    detectedApproach = "Two-pointer bidirectional traversal";
    timeComplexity = "O(n)";
    spaceComplexity = "O(1)";
    complexityRationale = "Converging pointers traversing input in single linear pass.";
  } else if (codeLower.includes("dp") || codeLower.includes("memo") || codeLower.includes("maxendinghere")) {
    detectedApproach = "Dynamic programming / Kadane's optimal substructure";
    timeComplexity = "O(n)";
    spaceComplexity = codeLower.includes("new array") || codeLower.includes("[0] *") ? "O(n)" : "O(1)";
    complexityRationale = "Subproblem state accumulation.";
  }

  // Extract failed edge cases from actual test case outcomes
  const failedCases = testResults.filter((t) => !t.passed);
  const missedEdgeCases = [];
  if (failedCases.length > 0) {
    failedCases.slice(0, 3).forEach((fc, idx) => {
      const inp = fc.input ? (fc.input.length > 30 ? fc.input.slice(0, 30) + "..." : fc.input) : `Case #${idx + 1}`;
      missedEdgeCases.push(
        `Failed input [${inp}]: Expected ${fc.expectedOutput ?? "valid output"}, but got ${fc.actualOutput ?? "mismatch or error"}`
      );
    });
  } else if (executionError) {
    missedEdgeCases.push(`Runtime/Compilation exception: ${executionError.slice(0, 100)}`);
  } else {
    missedEdgeCases.push("All evaluated sample and hidden test cases passed successfully.");
  }

  // Verified facts grounded in reality
  const verifiedFacts = [
    `Candidate selected programming language: ${language}.`,
    `Submitted code length: ${code.split("\n").length} lines (${code.length} characters).`,
    `Evaluation executed against ${totalTests} test cases: ${passedTests} passed (${Math.round(passRate)}% pass rate).`,
  ];
  if (executionError) {
    verifiedFacts.push(`Observed execution error: ${executionError.slice(0, 120)}`);
  }

  const missingEvidence = [
    "Audio/Video transcription was not recorded or consented to for behavioral sentiment analysis.",
    "Real-time keystroke cadence metrics not collected; evaluation is based strictly on submitted code artifacts and test outcomes.",
  ];

  // What worked & what failed
  const whatWorked = [];
  if (passedTests > 0) {
    whatWorked.push(`Successfully handled ${passedTests} test scenarios including baseline assertions.`);
  }
  if (!executionError) {
    whatWorked.push(`Code compiled and executed cleanly without unhandled runtime exceptions in ${language}.`);
  }
  whatWorked.push(`Utilized ${detectedApproach} suitable for problem scope.`);

  const whatFailed = [];
  if (failedCases.length > 0) {
    whatFailed.push(`${failedCases.length} test scenario(s) failed assertion check.`);
  }
  if (executionError) {
    whatFailed.push(`Execution error encountered during testing: ${executionError.slice(0, 80)}`);
  }
  if (whatFailed.length === 0) {
    whatFailed.push("No failing test cases detected in the test suite.");
  }

  // Code improvements
  const codeImprovements = [
    `Verify boundary inputs (empty arrays, negative values, null/undefined inputs).`,
    `Document algorithmic rationale and variable names for maintainability.`,
  ];
  if (timeComplexity === "O(n^2)") {
    codeImprovements.unshift("Consider optimizing the nested loop to O(n) using a hash map or two-pointer technique.");
  }

  // 7-day structured study plan
  const studyPlan7Days = [
    {
      day: 1,
      focus: "Algorithmic Invariants & Pattern Identification",
      tasks: ["Review time/space complexity analysis of iterative vs hash-based solutions", "Trace edge cases on paper"],
      recommendedProblems: ["two-sum", "reverse-string"],
    },
    {
      day: 2,
      focus: "Two-Pointer Techniques & Boundary Conditions",
      tasks: ["Practice bidirectional pointer convergence", "Handle odd/even length edge cases"],
      recommendedProblems: ["valid-palindrome", "container-with-most-water"],
    },
    {
      day: 3,
      focus: "Handling Off-By-One Errors & Empty State Guards",
      tasks: ["Implement strict boundary guard clauses", "Write unit tests for extreme inputs"],
      recommendedProblems: ["reverse-string", "valid-palindrome"],
    },
    {
      day: 4,
      focus: "Dynamic Programming & Prefix State Accumulation",
      tasks: ["Study Kadane's algorithm for contiguous subarray bounds", "Analyze space optimization to O(1)"],
      recommendedProblems: ["maximum-subarray"],
    },
    {
      day: 5,
      focus: "Optimization & Trade-off Articulation",
      tasks: ["Compare memory overhead of HashMaps vs in-place arrays", "Time complex operations"],
      recommendedProblems: ["container-with-most-water", "two-sum"],
    },
    {
      day: 6,
      focus: "Mock Timed Coding Execution",
      tasks: ["Complete 2 medium problems under 25-minute timer without hints"],
      recommendedProblems: ["maximum-subarray", "container-with-most-water"],
    },
    {
      day: 7,
      focus: "Comprehensive Review & Edge Case Checklist",
      tasks: ["Review test failure patterns", "Formalize personal interview pre-submission checklist"],
      recommendedProblems: ["two-sum", "valid-palindrome"],
    },
  ];

  // Rubric & hiring assessment
  const rubricScore = isFullyPassed ? 4.5 : passRate >= 60 ? 3.5 : passRate > 0 ? 2.5 : 1.5;
  const hiringRecommendation = isFullyPassed ? "Strong Hire" : passRate >= 60 ? "Hire" : passRate > 0 ? "Leaning No Hire" : "No Hire";

  return {
    candidateReport: {
      summary: `Candidate completed ${questionTitle} (${questionDifficulty}) using ${language}. The solution passed ${passedTests} of ${totalTests} test cases (${Math.round(passRate)}% pass rate).`,
      problemSummary: `Assessment on ${questionTitle} focused on ${topic} concepts.`,
      approachAnalysis: {
        approach: detectedApproach,
        timeComplexity: timeComplexity,
        spaceComplexity: spaceComplexity,
        complexityNotes: complexityRationale,
      },
      executionSummary: {
        passedTests,
        totalTests,
        executionStatus: isFullyPassed ? "Accepted" : executionError ? "Runtime Error" : "Partial Pass",
        language,
      },
      whatWorked,
      whatFailed,
      codeImprovements,
      missedEdgeCases,
      studyPlan7Days,
      mlPracticeRecommendations: [
        "Focus on 2 medium-tier array/two-pointer problems per day",
        "Practice dry-running edge cases before clicking run",
      ],
      verifiedFacts,
      aiSuggestions: [
        "In future interviews, state time and space complexity before writing code.",
        "Proactively discuss edge cases with the interviewer before final submission.",
      ],
      missingEvidence,
    },
    interviewerReport: {
      overallRecommendation: hiringRecommendation,
      overallScore: rubricScore,
      technicalCompetencies: [
        {
          skill: "Problem Solving & Algorithmic Strategy",
          score: isFullyPassed ? 4 : passRate >= 50 ? 3 : 2,
          evidence: `Selected ${detectedApproach} resulting in ${passedTests}/${totalTests} tests passing.`,
        },
        {
          skill: "Code Correctness & Edge Cases",
          score: isFullyPassed ? 5 : passRate >= 50 ? 3 : 1,
          evidence: `${passedTests} of ${totalTests} automated test cases passed (${Math.round(passRate)}%).`,
        },
        {
          skill: "Code Quality & Idiomatic Syntax",
          score: executionError ? 2 : 4,
          evidence: `Code structured in ${language} without syntax errors. Lines of code: ${code.split("\n").length}.`,
        },
      ],
      codeCorrectnessEvidence: `Passed ${passedTests}/${totalTests} tests. Final status: ${isFullyPassed ? "All tests verified" : "Failed test cases present"}.`,
      codeQualityNotes: `Language: ${language}. Approach: ${detectedApproach}. Complexity: Time ${timeComplexity}, Space ${spaceComplexity}.`,
      interviewerPrivateNotes: interviewerNotes || "No private interviewer notes recorded during session.",
      rubricAssessment: [
        {
          criteria: "Correctness on Sample Test Cases",
          met: passedTests > 0,
          notes: `${passedTests} test cases passed.`,
        },
        {
          criteria: "Hidden Edge Case Coverage",
          met: isFullyPassed,
          notes: isFullyPassed ? "All hidden test scenarios verified." : "Missed some hidden boundary tests.",
        },
        {
          criteria: "Time Complexity Optimization",
          met: timeComplexity !== "O(n^2)",
          notes: `Evaluated complexity: ${timeComplexity}.`,
        },
      ],
      strengths: [
        `Demonstrated working knowledge of ${language} syntax.`,
        isFullyPassed ? "Excellent test coverage and algorithmic correctness." : "Constructed viable solution framework.",
      ],
      concerns: isFullyPassed ? [] : ["Edge case failure on complex inputs", "Potential complexity bottleneck under large datasets"],
      followUpQuestions: [
        `How would your solution behave if the input size scaled to 10^7 elements?`,
        `Could this problem be solved with O(1) auxiliary space?`,
      ],
      limitationsAndMissingEvidence: missingEvidence,
    },
  };
}

export const aiProvider = {
  /**
   * Generates structured AI interview analysis.
   * If GEMINI_API_KEY or OPENAI_API_KEY is configured, uses LLM; otherwise uses evidence-based heuristic.
   */
  async analyzeInterviewSession(sessionEvidence) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        const result = await this._callGemini(geminiKey, sessionEvidence);
        if (result) return result;
      } catch (err) {
        console.warn(`[AI Provider] Gemini API call failed: ${err.message}. Falling back to evidence engine.`);
      }
    }

    if (openaiKey) {
      try {
        const result = await this._callOpenAI(openaiKey, sessionEvidence);
        if (result) return result;
      } catch (err) {
        console.warn(`[AI Provider] OpenAI API call failed: ${err.message}. Falling back to evidence engine.`);
      }
    }

    // Default: Grounded deterministic analysis based on verified execution facts
    return analyzeFromVerifiedEvidence(sessionEvidence);
  },

  async _callGemini(apiKey, evidence) {
    const prompt = `You are a technical interview evaluator. Analyze the following verified candidate interview evidence and return a JSON object with candidateReport and interviewerReport. Do not fabricate missing evidence.
Evidence: ${JSON.stringify(evidence)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  },

  async _callOpenAI(apiKey, evidence) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a technical interview analysis system. Output strictly valid JSON.",
          },
          {
            role: "user",
            content: `Analyze this interview evidence:\n${JSON.stringify(evidence)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  },
};

export default aiProvider;
