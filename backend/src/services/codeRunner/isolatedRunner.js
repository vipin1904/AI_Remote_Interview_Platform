import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { performance } from "perf_hooks";

const DEFAULT_TIMEOUT_MS = 4000;
const MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB

// Sanitized environment for child execution (blocks access to secrets & database URLs)
const getSanitizedEnv = () => {
  return {
    PATH: process.env.PATH || "",
    SYSTEMROOT: process.env.SYSTEMROOT || "",
    WINDIR: process.env.WINDIR || "",
    TEMP: os.tmpdir(),
    TMP: os.tmpdir(),
    NODE_OPTIONS: "--max-old-space-size=128 --no-warnings",
    PYTHONIOENCODING: "utf-8",
  };
};

/**
 * Executes a single code file in an isolated temporary sandbox.
 * @param {string} language - "javascript" | "python" | "java"
 * @param {string} code - source code to execute
 * @param {string} [stdin=""] - optional standard input
 * @param {number} [timeoutMs=4000] - timeout in milliseconds
 * @returns {Promise<{success: boolean, stdout: string, stderr: string, exitCode: number, executionTimeMs: number, timedOut: boolean}>}
 */
export async function executeInSandbox(language, code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS) {
  // If an external runner is configured via environment variable (e.g. self-hosted Piston or Judge0)
  if (process.env.CODE_RUNNER_URL) {
    return executeExternalRunner(language, code, stdin, timeoutMs);
  }

  const sandboxId = `sandbox_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const sandboxDir = path.join(os.tmpdir(), sandboxId);

  await fs.mkdir(sandboxDir, { recursive: true });

  const fileName = getSourceFileName(language);
  const filePath = path.join(sandboxDir, fileName);

  await fs.writeFile(filePath, code, "utf8");

  const startTime = performance.now();
  let timedOut = false;

  return new Promise((resolve) => {
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let isFinished = false;

    const { command, args } = getExecutionCommand(language, fileName);

    const child = spawn(command, args, {
      cwd: sandboxDir,
      env: getSanitizedEnv(),
      shell: false, // Prevents host-shell injection vulnerabilities
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      if (!isFinished) {
        killProcessTree(child);
      }
    }, timeoutMs);

    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch (e) {
        // Ignore write error if child already closed
      }
    } else if (child.stdin) {
      child.stdin.end();
    }

    child.stdout.on("data", (chunk) => {
      if (stdoutBuffer.length < MAX_OUTPUT_BYTES) {
        stdoutBuffer += chunk.toString("utf8");
      }
    });

    child.stderr.on("data", (chunk) => {
      if (stderrBuffer.length < MAX_OUTPUT_BYTES) {
        stderrBuffer += chunk.toString("utf8");
      }
    });

    child.on("error", (err) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeoutTimer);
      const executionTimeMs = Math.round(performance.now() - startTime);
      cleanupSandbox(sandboxDir).finally(() => {
        resolve({
          success: false,
          stdout: stdoutBuffer,
          stderr: `Process error: ${err.message}`,
          exitCode: -1,
          executionTimeMs,
          timedOut: false,
        });
      });
    });

    child.on("close", (exitCode) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeoutTimer);
      const executionTimeMs = Math.round(performance.now() - startTime);

      cleanupSandbox(sandboxDir).finally(() => {
        if (timedOut) {
          resolve({
            success: false,
            stdout: stdoutBuffer,
            stderr: `Execution timed out after ${timeoutMs}ms (Time Limit Exceeded)`,
            exitCode: -1,
            executionTimeMs,
            timedOut: true,
          });
        } else {
          resolve({
            success: exitCode === 0 && !stderrBuffer.trim(),
            stdout: stdoutBuffer,
            stderr: stderrBuffer,
            exitCode: exitCode ?? 0,
            executionTimeMs,
            timedOut: false,
          });
        }
      });
    });
  });
}

/**
 * Executes code against sample and/or hidden test cases.
 */
export async function runTestCases(language, code, testCases = [], options = {}) {
  const { isSubmission = false, timeoutPerRunMs = 3000 } = options;
  const testResults = [];
  let allPassed = true;
  let totalTimeMs = 0;

  // First run the full source file to capture general output/errors
  const baseRun = await executeInSandbox(language, code, "", timeoutPerRunMs);
  totalTimeMs += baseRun.executionTimeMs;

  if (baseRun.timedOut) {
    return {
      status: "Time Limit Exceeded",
      success: false,
      stdout: baseRun.stdout,
      stderr: baseRun.stderr,
      executionTimeMs: totalTimeMs,
      passedCount: 0,
      totalCount: testCases.length,
      testResults: testCases.map((tc) => ({
        id: tc.id,
        name: tc.name || "Test Case",
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        error: "Time Limit Exceeded",
        isHidden: !!tc.isHidden,
      })),
    };
  }

  if (baseRun.exitCode !== 0 || (baseRun.stderr && !baseRun.stdout)) {
    const isCompileErr = isCompilationError(language, baseRun.stderr);
    return {
      status: isCompileErr ? "Compilation Error" : "Runtime Error",
      success: false,
      stdout: baseRun.stdout,
      stderr: baseRun.stderr,
      executionTimeMs: totalTimeMs,
      passedCount: 0,
      totalCount: testCases.length,
      testResults: testCases.map((tc) => ({
        id: tc.id,
        name: tc.name || "Test Case",
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        error: baseRun.stderr,
        isHidden: !!tc.isHidden,
      })),
    };
  }

  // Parse lines of base output if test cases are bundled in console.log
  const outputLines = normalizeOutputLines(baseRun.stdout);

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const actualOutput = outputLines[i] !== undefined ? outputLines[i] : (outputLines.length === 1 ? outputLines[0] : "");
    const expectedOutput = normalizeSingleOutput(tc.expectedOutput);
    const passed = compareOutputs(actualOutput, expectedOutput);

    if (!passed) allPassed = false;

    testResults.push({
      id: tc.id || `tc_${i + 1}`,
      name: tc.name || `Case ${i + 1}`,
      passed,
      input: tc.input || "",
      expectedOutput: tc.expectedOutput,
      actualOutput: actualOutput || (baseRun.stdout.trim() ? baseRun.stdout.trim() : "No output"),
      error: passed ? "" : "Output mismatch",
      isHidden: !!tc.isHidden,
    });
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const status = allPassed ? "Accepted" : "Wrong Answer";

  return {
    status,
    success: allPassed,
    stdout: baseRun.stdout,
    stderr: baseRun.stderr,
    executionTimeMs: totalTimeMs,
    passedCount,
    totalCount: testCases.length,
    testResults,
  };
}

function getSourceFileName(language) {
  switch (language) {
    case "javascript":
      return "main.js";
    case "python":
      return "main.py";
    case "java":
      return "Main.java";
    default:
      return "main.txt";
  }
}

function getExecutionCommand(language, fileName) {
  switch (language) {
    case "javascript":
      return { command: "node", args: ["--max-old-space-size=128", "--no-warnings", fileName] };
    case "python":
      return { command: "python", args: ["-I", "-X", "utf8", "-B", fileName] };
    case "java":
      // Java 11+ single-file execution with memory caps
      return { command: "java", args: ["-Xmx128m", "-Xms32m", fileName] };
    default:
      throw new Error(`Unsupported programming language: ${language}`);
  }
}

function isCompilationError(language, stderr) {
  if (language === "java") {
    return stderr.includes("error:") || stderr.includes("compilation failed");
  }
  if (language === "javascript") {
    return stderr.includes("SyntaxError");
  }
  if (language === "python") {
    return stderr.includes("SyntaxError") || stderr.includes("IndentationError");
  }
  return false;
}

function normalizeOutputLines(output) {
  if (!output) return [];
  return output
    .trim()
    .split(/\r?\n/)
    .map((line) => normalizeSingleOutput(line))
    .filter((line) => line.length > 0);
}

function normalizeSingleOutput(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .trim()
    .replace(/\r/g, "")
    .replace(/\[\s+/g, "[")
    .replace(/\s+\]/g, "]")
    .replace(/\s*,\s*/g, ",")
    .replace(/'/g, '"');
}

function compareOutputs(actual, expected) {
  if (!actual && !expected) return true;
  if (!actual || !expected) return false;
  return actual.toLowerCase() === expected.toLowerCase();
}

function killProcessTree(childProcess) {
  if (!childProcess || !childProcess.pid) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/F", "/T", "/PID", String(childProcess.pid)], {
        shell: false,
        windowsHide: true,
      });
    } else {
      process.kill(-childProcess.pid, "SIGKILL");
    }
  } catch (e) {
    try {
      childProcess.kill("SIGKILL");
    } catch (_) {}
  }
}

async function cleanupSandbox(sandboxDir) {
  try {
    await fs.rm(sandboxDir, { recursive: true, force: true });
  } catch (err) {
    // Silently continue if temporary folder clean encounters momentary lock
  }
}

async function executeExternalRunner(language, code, stdin, timeoutMs) {
  const runnerUrl = process.env.CODE_RUNNER_URL;
  const apiKey = process.env.CODE_RUNNER_API_KEY || "";
  const startTime = performance.now();

  const response = await fetch(`${runnerUrl}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ language, code, stdin, timeoutMs }),
  });

  const data = await response.json();
  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    success: response.ok && !data.stderr,
    stdout: data.stdout || data.output || "",
    stderr: data.stderr || "",
    exitCode: data.exitCode || (response.ok ? 0 : 1),
    executionTimeMs,
    timedOut: !!data.timedOut,
  };
}
