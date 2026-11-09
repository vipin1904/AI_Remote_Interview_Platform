import { useState } from "react";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  FileTextIcon,
  HistoryIcon,
  LightbulbIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  Code2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

function ProblemDescription({
  problem,
  currentProblemId,
  onProblemChange,
  allProblems,
  attempts = [],
  onLoadAttemptCode,
}) {
  const [activeTab, setActiveTab] = useState("description");
  const [openHintIndex, setOpenHintIndex] = useState(null);

  // Normalize description safely
  const descText =
    typeof problem?.description === "string"
      ? problem.description
      : problem?.description?.text || "";

  const descNotes = Array.isArray(problem?.description?.notes)
    ? problem.description.notes
    : [];

  const hints = Array.isArray(problem?.hints) ? problem.hints : [];
  const examples = Array.isArray(problem?.examples) ? problem.examples : [];
  const constraints = Array.isArray(problem?.constraints) ? problem.constraints : [];

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-[#eff1f6] border-r border-[#383838] overflow-hidden select-text font-sans">
      {/* HEADER SECTION */}
      <div className="p-4 bg-[#262626] border-b border-[#383838]">
        <div className="flex items-start justify-between mb-1.5">
          <h1 className="text-xl font-bold text-[#eff1f6]">{problem?.title || "Problem"}</h1>
          <span className={`badge badge-sm ${getDifficultyBadgeClass(problem?.difficulty)}`}>
            {problem?.difficulty || "Medium"}
          </span>
        </div>
        <p className="text-xs text-[#9ca3af]">{problem?.category || "Algorithms"}</p>

        {/* Problem selector */}
        {allProblems && allProblems.length > 0 && (
          <div className="mt-3">
            <select
              className="select select-bordered select-xs w-full text-xs bg-[#1a1a1a] text-[#eff1f6] border-[#383838] focus:border-[#ffa116]"
              value={currentProblemId}
              onChange={(e) => onProblemChange(e.target.value)}
            >
              {allProblems.map((p) => (
                <option key={p.id || p.slug} value={p.id || p.slug} className="bg-[#262626] text-[#eff1f6]">
                  {p.title} - {p.difficulty}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TABS BAR (LeetCode tab styling) */}
      <div className="bg-[#262626] border-b border-[#383838] px-3 pt-1 flex gap-1">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "description"
              ? "bg-[#1a1a1a] text-[#eff1f6] border-[#ffa116] font-bold"
              : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
          }`}
        >
          <FileTextIcon className="size-3.5 text-[#00b8a3]" />
          <span>Description</span>
        </button>

        {hints.length > 0 && (
          <button
            onClick={() => setActiveTab("hints")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "hints"
                ? "bg-[#1a1a1a] text-[#ffc01e] border-[#ffc01e] font-bold"
                : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <LightbulbIcon className="size-3.5 text-[#ffc01e]" />
            <span>Hints ({hints.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "submissions"
              ? "bg-[#1a1a1a] text-[#eff1f6] border-[#ffa116] font-bold"
              : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
          }`}
        >
          <HistoryIcon className="size-3.5 text-[#3b82f6]" />
          <span>Submissions {attempts.length > 0 && `(${attempts.length})`}</span>
        </button>
      </div>

      {/* TAB CONTENT (INDEPENDENT SCROLL WITH OVERSCROLL-CONTAIN) */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5">
        {/* TAB 1: DESCRIPTION */}
        {activeTab === "description" && (
          <>
            {/* PROBLEM DESC */}
            <div className="bg-[#262626] rounded-xl p-5 border border-[#383838]">
              <h2 className="text-sm font-bold text-[#eff1f6] mb-2 uppercase tracking-wider text-[#9ca3af]">Description</h2>
              <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-[#eff1f6]">
                <p>{descText}</p>
                {descNotes.map((note, idx) => (
                  <p key={idx} className="text-xs text-[#9ca3af] italic">
                    Note: {note}
                  </p>
                ))}
              </div>
            </div>

            {/* EXAMPLES SECTION */}
            {examples.length > 0 && (
              <div className="bg-[#262626] rounded-xl p-5 border border-[#383838]">
                <h2 className="text-sm font-bold mb-3 uppercase tracking-wider text-[#9ca3af]">Examples</h2>
                <div className="space-y-3">
                  {examples.map((example, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-xs bg-[#333333] text-[#eff1f6] border-none font-bold">Example {idx + 1}</span>
                      </div>
                      <div className="bg-[#1e1e1e] rounded-lg p-3 font-mono text-xs space-y-1.5 border border-[#333333]">
                        <div className="flex gap-2">
                          <span className="text-[#ffa116] font-bold min-w-[55px]">Input:</span>
                          <span className="text-[#eff1f6]">{example.input}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#00b8a3] font-bold min-w-[55px]">Output:</span>
                          <span className="text-[#eff1f6]">{example.output}</span>
                        </div>
                        {example.explanation && (
                          <div className="pt-2 border-t border-[#333333] mt-1.5">
                            <span className="text-[#9ca3af] font-sans text-xs">
                              <span className="font-semibold text-[#eff1f6]">Explanation:</span> {example.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONSTRAINTS */}
            {constraints.length > 0 && (
              <div className="bg-[#262626] rounded-xl p-5 border border-[#383838]">
                <h2 className="text-sm font-bold mb-3 uppercase tracking-wider text-[#9ca3af]">Constraints</h2>
                <ul className="space-y-1.5 text-xs text-[#eff1f6]">
                  {constraints.map((constraint, idx) => (
                    <li key={idx} className="flex gap-2 items-center">
                      <span className="text-[#ffa116] font-bold">•</span>
                      <code className="bg-[#1e1e1e] px-2 py-0.5 rounded font-mono text-xs text-[#eff1f6] border border-[#333333]">
                        {constraint}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* TAB 2: HINTS */}
        {activeTab === "hints" && (
          <div className="space-y-3">
            <div className="bg-[#262626] rounded-xl p-4 border border-[#383838]">
              <h3 className="text-sm font-bold flex items-center gap-2 text-[#ffc01e] mb-1">
                <LightbulbIcon className="size-4" /> Practice Hints
              </h3>
              <p className="text-xs text-[#9ca3af]">
                Try solving the problem on your own first! Reveal hints if you are stuck.
              </p>
            </div>

            {hints.map((hint, idx) => {
              const isOpen = openHintIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#262626] rounded-xl border border-[#383838] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenHintIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-[#333333]/50 transition-colors"
                  >
                    <span className="text-xs font-bold text-[#eff1f6] flex items-center gap-2">
                      <span className="badge badge-warning badge-xs">Hint {idx + 1}</span>
                      <span>Show Clue</span>
                    </span>
                    {isOpen ? (
                      <ChevronUpIcon className="size-4 text-[#9ca3af]" />
                    ) : (
                      <ChevronDownIcon className="size-4 text-[#9ca3af]" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#383838] bg-[#1e1e1e] text-xs text-[#eff1f6] leading-relaxed font-sans">
                      {hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SUBMISSIONS HISTORY */}
        {activeTab === "submissions" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#eff1f6] flex items-center gap-1.5">
                <HistoryIcon className="size-4 text-[#ffa116]" /> Past Submissions
              </h3>
              <span className="text-xs text-[#9ca3af]">
                {attempts.length} attempt{attempts.length === 1 ? "" : "s"} saved
              </span>
            </div>

            {attempts.length === 0 ? (
              <div className="bg-[#262626] rounded-xl p-8 border border-[#383838] text-center space-y-2">
                <Code2Icon className="size-8 mx-auto text-[#9ca3af]/40" />
                <p className="text-xs font-semibold text-[#9ca3af]">No submissions yet</p>
                <p className="text-xs text-[#737373]">
                  Click "Submit" to test your solution against sample and hidden test cases.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attempts.map((att, idx) => {
                  const isAccepted = att.status === "Accepted";
                  const dateStr = att.createdAt
                    ? new Date(att.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <div
                      key={att._id || idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isAccepted
                          ? "bg-[#2db55d]/10 border-[#2db55d]/30 hover:border-[#2db55d]/60"
                          : "bg-[#262626] border-[#383838] hover:border-[#ff375f]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <CheckCircle2Icon className="size-4 text-[#2db55d] shrink-0" />
                          ) : (
                            <XCircleIcon className="size-4 text-[#ff375f] shrink-0" />
                          )}
                          <span
                            className={`text-xs font-bold ${
                              isAccepted ? "text-[#2db55d]" : "text-[#ff375f]"
                            }`}
                          >
                            {att.status || "Submitted"}
                          </span>
                          <span className="badge badge-xs bg-[#333333] text-[#eff1f6] border-none font-mono uppercase">
                            {att.language || "code"}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#9ca3af] flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {dateStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#9ca3af] pt-1 border-t border-[#383838]">
                        <div className="flex items-center gap-3">
                          <span>
                            Tests:{" "}
                            <strong className="text-[#eff1f6]">
                              {att.passedCount ?? 0}/{att.totalCount ?? 0}
                            </strong>
                          </span>
                          {att.executionTimeMs !== undefined && (
                            <span>
                              Runtime:{" "}
                              <strong className="text-[#eff1f6]">{att.executionTimeMs}ms</strong>
                            </span>
                          )}
                        </div>

                        {onLoadAttemptCode && att.code && (
                          <button
                            onClick={() => onLoadAttemptCode(att.code)}
                            className="btn btn-ghost btn-xs text-[#ffa116] font-semibold hover:bg-[#ffa116]/10"
                            title="Load this code into the editor"
                          >
                            Load Code
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDescription;
