import { useState } from "react";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  TerminalIcon,
  PlayIcon,
  ShieldAlertIcon,
  CheckSquareIcon,
  LockIcon,
  CheckIcon,
  TrophyIcon,
} from "lucide-react";

function OutputPanel({
  output,
  customInput = "",
  onCustomInputChange = null,
  isRunning = false,
  sampleCases = [],
}) {
  const [activeTab, setActiveTab] = useState(output ? "result" : "testcases");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(Boolean(customInput));

  const testResults = output?.testResults || [];
  const selectedResult = testResults[selectedCaseIdx] || testResults[0];

  const defaultSampleCases =
    sampleCases && sampleCases.length > 0
      ? sampleCases
      : [
          { name: "Sample Case 0", input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
          { name: "Sample Case 1", input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
          { name: "Sample Case 2", input: "nums = [3,3], target = 6", expected: "[0,1]" },
        ];

  return (
    <div className="h-full bg-[#1a1a1a] text-[#eff1f6] flex flex-col border-t border-[#333333] font-sans select-text">
      {/* RICH LEETCODE / HACKERRANK TAB BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262626] border-b border-[#333333]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("testcases")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "testcases"
                ? "bg-[#1a1a1a] text-[#eff1f6] shadow-sm font-bold border border-[#3e3e3e]"
                : "text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <CheckSquareIcon className="size-3.5 text-[#00b8a3]" />
            <span>Test cases</span>
          </button>

          <button
            onClick={() => setActiveTab("result")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "result"
                ? "bg-[#1a1a1a] text-[#eff1f6] shadow-sm font-bold border border-[#3e3e3e]"
                : "text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <span className="font-mono text-[#00b8a3] font-bold">{`>_`}</span>
            <span>Test Results</span>
            {output && (
              <span
                className={`size-2 rounded-full ${
                  output.status === "Accepted" ? "bg-[#00b8a3]" : "bg-[#ff375f]"
                }`}
              ></span>
            )}
          </button>
        </div>

        {/* Right: HackerRank Test against custom input checkbox */}
        {onCustomInputChange && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#9ca3af] hover:text-[#eff1f6]">
            <input
              type="checkbox"
              checked={showCustomInput}
              onChange={(e) => {
                setShowCustomInput(e.target.checked);
                if (e.target.checked) setActiveTab("testcases");
              }}
              className="checkbox checkbox-xs border-[#444444] checked:bg-[#00b8a3] checked:border-[#00b8a3]"
            />
            <span>Test against custom input</span>
          </label>
        )}
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-auto p-4">
        {/* RUNNING LOADER */}
        {isRunning ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#9ca3af]">
            <span className="loading loading-spinner loading-md text-[#00b8a3]"></span>
            <p className="text-xs font-mono">Running code in isolated LeetCode / HackerRank sandbox...</p>
          </div>
        ) : activeTab === "testcases" ? (
          /* TAB 1: SAMPLE TEST CASES & CUSTOM INPUT */
          <div className="space-y-4">
            {/* Custom input drawer if checked */}
            {showCustomInput && onCustomInputChange && (
              <div className="p-3 bg-[#262626] rounded-2xl border border-[#383838] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#00b8a3]">
                  <span>Custom Input (stdin):</span>
                </div>
                <textarea
                  rows={2}
                  value={customInput}
                  onChange={(e) => onCustomInputChange(e.target.value)}
                  placeholder="Enter custom inputs (e.g. nums = [2,7,11,15], target = 9)..."
                  className="textarea textarea-bordered w-full font-mono text-xs rounded-xl bg-[#1a1a1a] text-[#eff1f6] border-[#383838] focus:border-[#00b8a3]"
                ></textarea>
              </div>
            )}

            {/* HackerRank Case Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {defaultSampleCases.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`btn btn-xs rounded-xl font-mono ${
                    selectedCaseIdx === idx
                      ? "bg-[#262626] font-bold border-[#00b8a3] text-[#00b8a3] ring-1 ring-[#00b8a3]"
                      : "bg-[#262626] border-[#383838] text-[#9ca3af] hover:text-[#eff1f6]"
                  }`}
                >
                  <span>{c.name || `Sample Case ${idx}`}</span>
                </button>
              ))}
            </div>

            {/* Selected Case Preview */}
            {defaultSampleCases[selectedCaseIdx] && (
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#9ca3af] block mb-1">
                    Input (stdin):
                  </span>
                  <div className="bg-[#262626] rounded-2xl p-3.5 font-mono text-xs text-[#eff1f6] border border-[#383838] whitespace-pre-wrap">
                    {defaultSampleCases[selectedCaseIdx].input}
                  </div>
                </div>

                {defaultSampleCases[selectedCaseIdx].expected && (
                  <div>
                    <span className="text-xs font-bold text-[#00b8a3] block mb-1">
                      Expected Output:
                    </span>
                    <div className="bg-[#262626] rounded-2xl p-3.5 font-mono text-xs text-[#00b8a3] border border-[#383838] whitespace-pre-wrap">
                      {defaultSampleCases[selectedCaseIdx].expected}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: TEST RESULT */
          <div className="h-full">
            {output === null ? (
              /* LEETCODE SIGNATURE EMPTY STATE */
              <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]/40 text-sm select-none gap-2">
                <PlayIcon className="size-6 text-[#9ca3af]/20" />
                <p>You must run your code first</p>
                <span className="text-xs text-[#9ca3af]/30">Click "Run Code" or "Submit Code" to view test results</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* HACKERRANK / LEETCODE RESULT BANNER */}
                {output.status === "Accepted" ? (
                  <div className="p-4 bg-[#00b8a3]/15 border border-[#00b8a3]/40 rounded-2xl flex items-center justify-between text-[#00b8a3]">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-[#00b8a3] text-black flex items-center justify-center font-bold">
                        <CheckIcon className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm">Accepted! All test cases passed.</h4>
                        <p className="text-[11px] text-[#00b8a3]/80 font-mono">
                          Score: 100.0 • Runtime: {output.executionTimeMs ? `${output.executionTimeMs} ms` : "42 ms"}
                        </p>
                      </div>
                    </div>
                    <span className="badge bg-[#00b8a3] text-black border-none font-bold text-xs">
                      Accepted
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-[#ff375f]/15 border border-[#ff375f]/40 rounded-2xl flex items-center justify-between text-[#ff375f]">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-[#ff375f] text-white flex items-center justify-center font-bold">
                        <XCircleIcon className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm">{output.status || "Wrong Answer"}</h4>
                        <p className="text-[11px] text-[#ff375f]/80 font-mono">
                          Passed {output.passedCount || 0}/{output.totalCount || 0} test cases
                        </p>
                      </div>
                    </div>
                    <span className="badge bg-[#ff375f] text-white border-none font-bold text-xs">
                      {output.status}
                    </span>
                  </div>
                )}

                {/* TEST CASE PILLS */}
                {testResults.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {testResults.map((tc, idx) => {
                      const isHidden = tc.hidden || idx >= 3;
                      return (
                        <button
                          key={tc.id || idx}
                          onClick={() => setSelectedCaseIdx(idx)}
                          className={`btn btn-xs rounded-xl gap-1.5 font-mono ${
                            selectedCaseIdx === idx
                              ? "bg-[#262626] ring-2 ring-[#00b8a3] text-[#eff1f6] font-bold"
                              : "bg-[#262626] border-[#383838] text-[#9ca3af] hover:text-[#eff1f6]"
                          }`}
                        >
                          {tc.passed ? (
                            <CheckCircle2Icon className="size-3 text-[#00b8a3]" />
                          ) : (
                            <XCircleIcon className="size-3 text-[#ff375f]" />
                          )}
                          <span>{tc.name || `Case ${idx}`}</span>
                          {isHidden && (
                            <span title="Hidden Evaluation Test Case">
                              <LockIcon className="size-2.5 opacity-60" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* SELECTED TEST CASE DETAILS */}
                {selectedResult ? (
                  <div className="space-y-3 pt-1">
                    <div className="text-xs font-mono text-[#9ca3af] flex items-center gap-2">
                      <span>Compiler Message:</span>
                      <strong className={selectedResult.passed ? "text-[#00b8a3]" : "text-[#ff375f]"}>
                        {selectedResult.passed ? "Success" : selectedResult.status || "Wrong Answer"}
                      </strong>
                    </div>

                    {selectedResult.input && (
                      <div>
                        <span className="text-[11px] font-bold text-[#9ca3af] uppercase block mb-1">
                          Input (stdin):
                        </span>
                        <pre className="p-3 bg-[#262626] rounded-2xl text-xs font-mono border border-[#383838] text-[#eff1f6] whitespace-pre-wrap">
                          {selectedResult.input}
                        </pre>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#9ca3af] uppercase block mb-1">
                          Your Output (stdout):
                        </span>
                        <pre
                          className={`p-3 bg-[#262626] rounded-2xl text-xs font-mono border border-[#383838] whitespace-pre-wrap ${
                            selectedResult.passed ? "text-[#00b8a3] font-medium" : "text-[#ff375f] font-medium"
                          }`}
                        >
                          {selectedResult.actualOutput || selectedResult.error || "No output"}
                        </pre>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-[#00b8a3] uppercase block mb-1">
                          Expected Output:
                        </span>
                        <pre className="p-3 bg-[#262626] rounded-2xl text-xs font-mono text-[#00b8a3] font-medium border border-[#383838] whitespace-pre-wrap">
                          {selectedResult.expectedOutput || "[None]"}
                        </pre>
                      </div>
                    </div>

                    {selectedResult.error && (
                      <div className="p-3 bg-[#ff375f]/15 border border-[#ff375f]/40 text-[#ff375f] text-xs rounded-2xl flex items-center gap-2">
                        <ShieldAlertIcon className="size-4 shrink-0" />
                        <span>{selectedResult.error}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="p-3 bg-[#262626] rounded-2xl text-xs font-mono text-[#eff1f6] whitespace-pre-wrap border border-[#383838]">
                    {output.output || output.error || "Execution completed."}
                  </pre>
                )}

                {/* STDOUT MESSAGES */}
                {output.stdout && (
                  <div>
                    <span className="text-xs font-bold text-[#9ca3af] block mb-1">
                      Debug Output (stdout):
                    </span>
                    <pre className="p-3 bg-[#262626] rounded-2xl whitespace-pre-wrap text-[#eff1f6] text-xs font-mono border border-[#383838]">
                      {output.stdout}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
