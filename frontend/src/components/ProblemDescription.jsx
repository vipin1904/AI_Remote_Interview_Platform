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
    <div className="h-full flex flex-col bg-base-200">
      {/* HEADER SECTION */}
      <div className="p-5 bg-base-100 border-b border-base-300">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-base-content">{problem?.title || "Problem"}</h1>
          <span className={`badge ${getDifficultyBadgeClass(problem?.difficulty)}`}>
            {problem?.difficulty || "Medium"}
          </span>
        </div>
        <p className="text-xs text-base-content/60">{problem?.category || "Algorithms"}</p>

        {/* Problem selector */}
        {allProblems && allProblems.length > 0 && (
          <div className="mt-3">
            <select
              className="select select-bordered select-xs w-full text-xs"
              value={currentProblemId}
              onChange={(e) => onProblemChange(e.target.value)}
            >
              {allProblems.map((p) => (
                <option key={p.id || p.slug} value={p.id || p.slug}>
                  {p.title} - {p.difficulty}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TABS BAR */}
      <div className="bg-base-100 border-b border-base-300 px-4 pt-1 flex gap-2">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "description"
              ? "bg-base-200 text-primary border-t-2 border-primary"
              : "text-base-content/60 hover:text-base-content"
          }`}
        >
          <FileTextIcon className="size-3.5" />
          <span>Description</span>
        </button>

        {hints.length > 0 && (
          <button
            onClick={() => setActiveTab("hints")}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "hints"
                ? "bg-base-200 text-warning border-t-2 border-warning"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <LightbulbIcon className="size-3.5" />
            <span>Hints ({hints.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "submissions"
              ? "bg-base-200 text-primary border-t-2 border-primary"
              : "text-base-content/60 hover:text-base-content"
          }`}
        >
          <HistoryIcon className="size-3.5" />
          <span>Submissions {attempts.length > 0 && `(${attempts.length})`}</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* TAB 1: DESCRIPTION */}
        {activeTab === "description" && (
          <>
            {/* PROBLEM DESC */}
            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
              <h2 className="text-base font-bold text-base-content mb-2">Description</h2>
              <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-base-content/90">
                <p>{descText}</p>
                {descNotes.map((note, idx) => (
                  <p key={idx} className="text-xs text-base-content/80 italic">
                    Note: {note}
                  </p>
                ))}
              </div>
            </div>

            {/* EXAMPLES SECTION */}
            {examples.length > 0 && (
              <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                <h2 className="text-base font-bold mb-3 text-base-content">Examples</h2>
                <div className="space-y-3">
                  {examples.map((example, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-xs badge-neutral">Example {idx + 1}</span>
                      </div>
                      <div className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1">
                        <div className="flex gap-2">
                          <span className="text-primary font-bold min-w-[55px]">Input:</span>
                          <span className="text-base-content/90">{example.input}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-secondary font-bold min-w-[55px]">Output:</span>
                          <span className="text-base-content/90">{example.output}</span>
                        </div>
                        {example.explanation && (
                          <div className="pt-2 border-t border-base-300 mt-1.5">
                            <span className="text-base-content/70 font-sans text-xs">
                              <span className="font-semibold">Explanation:</span> {example.explanation}
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
              <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                <h2 className="text-base font-bold mb-3 text-base-content">Constraints</h2>
                <ul className="space-y-1.5 text-xs text-base-content/90">
                  {constraints.map((constraint, idx) => (
                    <li key={idx} className="flex gap-2 items-center">
                      <span className="text-primary font-bold">•</span>
                      <code className="bg-base-200 px-2 py-0.5 rounded font-mono text-xs">
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
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
              <h3 className="text-sm font-bold flex items-center gap-2 text-warning mb-1">
                <LightbulbIcon className="size-4" /> Practice Hints
              </h3>
              <p className="text-xs text-base-content/70">
                Try solving the problem on your own first! Reveal hints if you are stuck.
              </p>
            </div>

            {hints.map((hint, idx) => {
              const isOpen = openHintIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-base-100 rounded-xl border border-base-300 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenHintIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-base-200/50 transition-colors"
                  >
                    <span className="text-xs font-bold text-base-content flex items-center gap-2">
                      <span className="badge badge-warning badge-xs">Hint {idx + 1}</span>
                      <span>Show Clue</span>
                    </span>
                    {isOpen ? (
                      <ChevronUpIcon className="size-4 text-base-content/60" />
                    ) : (
                      <ChevronDownIcon className="size-4 text-base-content/60" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-base-200 bg-base-200/30 text-xs text-base-content/85 leading-relaxed">
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
              <h3 className="text-sm font-bold text-base-content flex items-center gap-1.5">
                <HistoryIcon className="size-4 text-primary" /> Past Submissions
              </h3>
              <span className="text-xs text-base-content/60">
                {attempts.length} attempt{attempts.length === 1 ? "" : "s"} saved
              </span>
            </div>

            {attempts.length === 0 ? (
              <div className="bg-base-100 rounded-xl p-8 border border-base-300 text-center space-y-2">
                <Code2Icon className="size-8 mx-auto text-base-content/40" />
                <p className="text-xs font-semibold text-base-content/70">No submissions yet</p>
                <p className="text-xs text-base-content/50">
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
                          ? "bg-success/5 border-success/30 hover:border-success/60"
                          : "bg-base-100 border-base-300 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <CheckCircle2Icon className="size-4 text-success shrink-0" />
                          ) : (
                            <XCircleIcon className="size-4 text-error shrink-0" />
                          )}
                          <span
                            className={`text-xs font-bold ${
                              isAccepted ? "text-success" : "text-error"
                            }`}
                          >
                            {att.status || "Submitted"}
                          </span>
                          <span className="badge badge-xs badge-neutral font-mono uppercase">
                            {att.language || "code"}
                          </span>
                        </div>

                        <span className="text-[11px] text-base-content/50 flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {dateStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-base-content/70 pt-1 border-t border-base-200">
                        <div className="flex items-center gap-3">
                          <span>
                            Tests:{" "}
                            <strong className="text-base-content">
                              {att.passedCount ?? 0}/{att.totalCount ?? 0}
                            </strong>
                          </span>
                          {att.executionTimeMs !== undefined && (
                            <span>
                              Runtime:{" "}
                              <strong className="text-base-content">{att.executionTimeMs}ms</strong>
                            </span>
                          )}
                        </div>

                        {onLoadAttemptCode && att.code && (
                          <button
                            onClick={() => onLoadAttemptCode(att.code)}
                            className="btn btn-ghost btn-xs text-primary font-semibold hover:bg-primary/10"
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
