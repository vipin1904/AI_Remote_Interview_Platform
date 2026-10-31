import test from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";

import { executeInSandbox, runTestCases } from "../src/services/codeRunner/isolatedRunner.js";
import { pdfService } from "../src/services/pdfService.js";
import { reportService } from "../src/services/reportService.js";
import { mlClient } from "../src/services/mlClient.js";

test("Isolated Runner: JavaScript basic execution & custom input", async () => {
  const code = `
    const fs = require('fs');
    const input = fs.readFileSync(0, 'utf-8').trim();
    console.log("HELLO " + input);
  `;
  const result = await executeInSandbox("javascript", code, "WORLD", 4000);

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout.trim(), "HELLO WORLD");
});

test("Isolated Runner: Python isolated execution with test case assertions", async () => {
  const code = `
print("olleh")
print("radar")
  `;
  const testCases = [
    { input: "hello", expectedOutput: "olleh" },
    { input: "radar", expectedOutput: "radar" },
  ];

  const result = await runTestCases("python", code, testCases);

  assert.equal(result.passedCount, 2);
  assert.equal(result.totalCount, 2);
  assert.equal(result.success, true);
});

test("Isolated Runner: Security timeout prevents infinite loops", async () => {
  const infiniteLoopCode = `while True: pass`;
  const result = await executeInSandbox("python", infiniteLoopCode, "", 1500);

  assert.equal(result.timedOut, true);
});

test("Report Service: Role-based filtering strictly redacts interviewer assessments for candidates", () => {
  const mockReport = {
    _id: "report_123",
    candidate: { _id: "cand_999", name: "Alice" },
    interviewer: { _id: "host_888", name: "Bob" },
    candidateReport: {
      summary: "Candidate solved problem efficiently.",
      approachAnalysis: { approach: "Two-pointer", timeComplexity: "O(n)" },
    },
    interviewerReport: {
      overallRecommendation: "Strong Hire",
      overallScore: 4.8,
      interviewerPrivateNotes: "Extremely sharp, candidate should be leveled at Senior.",
    },
  };

  // Test when requesting user is candidate
  const candidateUser = { _id: "cand_999", role: "candidate" };
  const filteredForCandidate = reportService.filterReportByRole(mockReport, candidateUser);

  assert.ok(filteredForCandidate.candidateReport);
  assert.equal(filteredForCandidate.interviewerReport, undefined, "Interviewer report MUST be stripped for candidate!");

  // Test when requesting user is interviewer
  const interviewerUser = { _id: "host_888", role: "interviewer" };
  const filteredForInterviewer = reportService.filterReportByRole(mockReport, interviewerUser);

  assert.ok(filteredForInterviewer.interviewerReport, "Interviewer report MUST be present for interviewer!");
  assert.equal(filteredForInterviewer.interviewerReport.overallRecommendation, "Strong Hire");
});

test("PDF Service: Candidate Learning PDF streams valid PDF buffer", async () => {
  const mockReport = {
    session: "session_abc",
    candidate: { name: "Test Candidate" },
    generatedAt: new Date(),
    candidateReport: {
      summary: "Completed test suite successfully.",
      problemSummary: "Two Sum",
      executionSummary: { passedTests: 3, totalTests: 3, executionStatus: "Accepted", language: "python" },
      approachAnalysis: { approach: "Hash Map", timeComplexity: "O(n)", spaceComplexity: "O(n)", complexityNotes: "Linear time map lookup" },
      codeImprovements: ["Check integer overflow"],
      missedEdgeCases: ["No missed cases"],
      studyPlan7Days: [
        { day: 1, focus: "Arrays", tasks: ["Practice two sum variations"], recommendedProblems: ["two-sum"] }
      ],
      mlPracticeRecommendations: ["Container With Most Water"],
    },
  };

  const chunks = [];
  const writeStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
    pdfService.generateCandidatePdf(mockReport, writeStream);
  });

  const pdfBuffer = Buffer.concat(chunks);
  assert.ok(pdfBuffer.length > 500, "PDF should contain valid content");
  assert.equal(pdfBuffer.subarray(0, 5).toString(), "%PDF-", "PDF header must start with %PDF-");
});

test("PDF Service: Interviewer Assessment PDF streams valid PDF buffer", async () => {
  const mockReport = {
    session: "session_xyz",
    candidate: { name: "Test Candidate", email: "candidate@example.com" },
    interviewer: { name: "Lead Interviewer" },
    generatedAt: new Date(),
    interviewerReport: {
      candidateName: "Test Candidate",
      candidateEmail: "candidate@example.com",
      problemTitle: "Reverse String",
      difficulty: "Easy",
      overallRecommendation: "Hire",
      overallScore: 4.5,
      technicalCompetencies: [
        { skill: "Data Structures", score: 4.5, evidence: "Understands array mutations" }
      ],
      codeCorrectnessEvidence: "All test cases passed",
      codeQualityNotes: "Clean idiomatic code",
      interviewerPrivateNotes: "Strong communications skills",
      rubricAssessment: [{ criteria: "Code Correctness", met: true, notes: "Verified" }],
      strengths: ["Fast implementation"],
      concerns: [],
    },
  };

  const chunks = [];
  const writeStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
    pdfService.generateInterviewerPdf(mockReport, writeStream);
  });

  const pdfBuffer = Buffer.concat(chunks);
  assert.ok(pdfBuffer.length > 500, "PDF should contain valid content");
  assert.equal(pdfBuffer.subarray(0, 5).toString(), "%PDF-", "PDF header must start with %PDF-");
});

test("ML Client: Statistical heuristic fallback generates bounded predictions and rationale", async () => {
  const fallback = mlClient._statisticalFallback({
    historical_pass_rate: 0.9,
    topic_historical_accuracy: 0.85,
    past_failed_tests_ratio: 0.1,
    difficulty: "Medium",
  });

  assert.ok(fallback.success_probability >= 0.70);
  assert.equal(fallback.predicted_category, "High Likelihood of Success");
  assert.match(fallback.limitations, /heuristic/i);
});
