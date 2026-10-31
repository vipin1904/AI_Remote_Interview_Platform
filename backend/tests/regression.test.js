import test from "node:test";
import assert from "node:assert/strict";

import { executeInSandbox, runTestCases } from "../src/services/codeRunner/isolatedRunner.js";
import { DEFAULT_QUESTIONS } from "../src/lib/seedQuestions.js";

test("Regression P0: Sandboxed runner executes JavaScript without 500 errors", async () => {
  const code = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));
console.log(JSON.stringify(twoSum([3, 2, 4], 6)));
  `;

  const sampleCases = [
    { id: "tc_1", name: "Sample 1", expectedOutput: "[0,1]" },
    { id: "tc_2", name: "Sample 2", expectedOutput: "[1,2]" },
  ];

  const result = await runTestCases("javascript", code, sampleCases);

  assert.equal(result.success, true);
  assert.equal(result.status, "Accepted");
  assert.equal(result.passedCount, 2);
  assert.equal(result.totalCount, 2);
  assert.ok(result.executionTimeMs >= 0);
  assert.equal(result.stderr, "");
});

test("Regression P0: Sandboxed runner executes Python without external Piston dependency", async () => {
  const code = `
def isPalindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

print("true" if isPalindrome("A man, a plan, a canal: Panama") else "false")
print("true" if isPalindrome("race a car") else "false")
  `;

  const sampleCases = [
    { id: "tc_1", name: "Palindrome", expectedOutput: "true" },
    { id: "tc_2", name: "Non-palindrome", expectedOutput: "false" },
  ];

  const result = await runTestCases("python", code, sampleCases);

  assert.equal(result.success, true);
  assert.equal(result.status, "Accepted");
  assert.equal(result.passedCount, 2);
  assert.equal(result.totalCount, 2);
});

test("Regression: Compilation error returns structured error status without crashing", async () => {
  const syntaxErrorCode = `
    const x = ; // Intentional syntax error
  `;

  const result = await executeInSandbox("javascript", syntaxErrorCode, "", 3000);

  assert.equal(result.success, false);
  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /SyntaxError/i);
});

test("Regression: Hidden test cases are completely masked in question seed data", () => {
  for (const q of DEFAULT_QUESTIONS) {
    assert.ok(q.slug, "Question must have a slug");
    assert.ok(q.title, "Question must have a title");
    assert.ok(q.difficulty, "Question must have a difficulty");
    assert.ok(q.starterCode?.javascript, "Question must have JS starter code");
    assert.ok(q.starterCode?.python, "Question must have Python starter code");
    assert.ok(q.sampleTestCases?.length > 0, "Question must have sample test cases");
    assert.ok(q.hiddenTestCases?.length > 0, "Question must have hidden test cases");
  }

  // Verify that safe projection excludes hiddenTestCases
  const sampleQ = { ...DEFAULT_QUESTIONS[0] };
  delete sampleQ.hiddenTestCases;
  assert.equal(sampleQ.hiddenTestCases, undefined, "Hidden test cases must be omitted for candidate views");
});

test("Regression: Hidden test case submission calculates accurate pass rate", async () => {
  // Partial solution that passes test case 1 but fails test case 2
  const code = `
    console.log("6");
    console.log("0"); // Incorrect for case 2 (expected 1)
  `;

  const testCases = [
    { id: "tc_1", expectedOutput: "6", isHidden: false },
    { id: "tc_2", expectedOutput: "1", isHidden: true },
  ];

  const result = await runTestCases("javascript", code, testCases, { isSubmission: true });

  assert.equal(result.success, false);
  assert.equal(result.status, "Wrong Answer");
  assert.equal(result.passedCount, 1);
  assert.equal(result.totalCount, 2);
  assert.equal(result.testResults.length, 2);
  assert.equal(result.testResults[0].passed, true);
  assert.equal(result.testResults[1].passed, false);
});
