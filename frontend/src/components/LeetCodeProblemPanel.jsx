import { useState } from "react";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  FileTextIcon,
  BookOpenIcon,
  LightbulbIcon,
  HistoryIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  StarIcon,
  Share2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  Building2Icon,
  SparklesIcon,
  BriefcaseIcon,
  TrophyIcon,
  AwardIcon,
  Code2Icon,
  MessageSquareIcon,
  CheckIcon,
} from "lucide-react";
import InterviewerToolsPanel from "./InterviewerToolsPanel";

export default function LeetCodeProblemPanel({
  problemData,
  session,
  isHost,
  sessionId,
  attempts = [],
  onLoadAttemptCode = null,
}) {
  const [activeTab, setActiveTab] = useState("problem");
  const [likes, setLikes] = useState(71420);
  const [hasLiked, setHasLiked] = useState(false);
  const [dislikes, setDislikes] = useState(2230);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [openHintIdx, setOpenHintIdx] = useState(null);
  const [showTopics, setShowTopics] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);

  // Normalize description safely
  const descText =
    typeof problemData?.description === "string"
      ? problemData.description
      : problemData?.description?.text || "No description provided.";

  const descNotes = Array.isArray(problemData?.description?.notes)
    ? problemData.description.notes
    : [];

  const hints = Array.isArray(problemData?.hints) ? problemData.hints : [];
  const examples = Array.isArray(problemData?.examples) ? problemData.examples : [];
  const constraints = Array.isArray(problemData?.constraints) ? problemData.constraints : [];

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes(dislikes - 1);
        setHasDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (hasDisliked) {
      setDislikes(dislikes - 1);
      setHasDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes(likes - 1);
        setHasLiked(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-[#eff1f6] border-r border-[#333333] overflow-hidden select-text font-sans">
      {/* RICH LEETCODE TAB BAR */}
      <div className="bg-[#262626] border-b border-[#333333] px-3 pt-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("problem")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "problem"
                ? "bg-[#1a1a1a] text-[#eff1f6] border-[#ffa116] font-bold"
                : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <FileTextIcon className="size-3.5 text-[#00b8a3]" />
            <span>Description</span>
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "submissions"
                ? "bg-[#1a1a1a] text-[#eff1f6] border-[#ffa116] font-bold"
                : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <HistoryIcon className="size-3.5 text-[#3b82f6]" />
            <span>Submissions</span>
            {attempts.length > 0 && (
              <span className="badge badge-xs bg-[#333333] text-[#eff1f6] border-none font-mono">
                {attempts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("editorial")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "editorial"
                ? "bg-[#1a1a1a] text-[#eff1f6] border-[#ffa116] font-bold"
                : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <BookOpenIcon className="size-3.5 text-[#ffc01e]" />
            <span>Editorial</span>
          </button>

          <button
            onClick={() => setActiveTab("solutions")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "solutions"
                ? "bg-[#1a1a1a] text-[#eff1f6] border-[#ffa116] font-bold"
                : "border-transparent text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <SparklesIcon className="size-3.5 text-[#a855f7]" />
            <span>Solutions</span>
          </button>

          {isHost && (
            <button
              onClick={() => setActiveTab("interviewer")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === "interviewer"
                  ? "bg-[#1a1a1a] text-[#00ea64] border-[#00ea64] font-bold"
                  : "border-transparent text-[#00ea64]/70 hover:text-[#00ea64] hover:bg-[#1a1a1a]/50"
              }`}
            >
              <BriefcaseIcon className="size-3.5" />
              <span>Interviewer Rubric</span>
            </button>
          )}
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-6">
        {/* TAB 1: PROBLEM STATEMENT */}
        {activeTab === "problem" && (
          <>
            {/* TITLE & HEADER BADGES (RICH LEETCODE + HACKERRANK) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-2xl font-black text-[#eff1f6] tracking-tight">
                  {problemData?.title || session?.problem || "1. Two Sum"}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm gap-1 font-bold text-[#00b8a3] bg-[#00b8a3]/15 border border-[#00b8a3]/30">
                    <CheckCircle2Icon className="size-3" /> Solved
                  </span>
                  <span className="badge badge-sm gap-1 font-mono text-[11px] text-[#00ea64] bg-[#00ea64]/10 border border-[#00ea64]/30">
                    <TrophyIcon className="size-3 text-[#ffc01e]" /> Score: 100
                  </span>
                </div>
              </div>

              {/* PILLS ROW: Difficulty, Domain, Topics, Companies, Hint */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className={`badge badge-sm font-bold ${getDifficultyBadgeClass(problemData?.difficulty || session?.difficulty || "Easy")}`}>
                  {problemData?.difficulty || session?.difficulty || "Easy"}
                </span>

                <button
                  onClick={() => setShowTopics(!showTopics)}
                  className={`btn btn-xs gap-1 border border-[#3e3e3e] bg-[#262626] hover:bg-[#333333] text-[#9ca3af] hover:text-[#eff1f6] rounded-full`}
                >
                  <TagIcon className="size-3" />
                  <span>Topics</span>
                </button>

                <button
                  onClick={() => setShowCompanies(!showCompanies)}
                  className={`btn btn-xs gap-1 border border-[#3e3e3e] bg-[#262626] hover:bg-[#333333] text-[#9ca3af] hover:text-[#eff1f6] rounded-full`}
                >
                  <Building2Icon className="size-3" />
                  <span>Companies</span>
                </button>

                {hints.length > 0 && (
                  <button
                    onClick={() => setOpenHintIdx(openHintIdx !== null ? null : 0)}
                    className="btn btn-xs border border-[#ffc01e]/30 bg-[#ffc01e]/10 text-[#ffc01e] hover:bg-[#ffc01e]/20 gap-1 rounded-full font-semibold"
                  >
                    <LightbulbIcon className="size-3" />
                    <span>Hint ({hints.length})</span>
                  </button>
                )}
              </div>

              {/* EXPANDABLE TOPICS */}
              {showTopics && (
                <div className="p-3 bg-[#262626] rounded-xl border border-[#383838] flex items-center gap-2 flex-wrap">
                  {["Array", "Hash Table", "Algorithms", "Two Pointers"].map((tag) => (
                    <span key={tag} className="badge badge-xs bg-[#333333] text-[#eff1f6] border border-[#444444] rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* EXPANDABLE COMPANIES */}
              {showCompanies && (
                <div className="p-3 bg-[#262626] rounded-xl border border-[#383838] flex items-center gap-2 flex-wrap">
                  {["Google", "Amazon", "Meta", "Microsoft", "Bloomberg", "Uber"].map((co) => (
                    <span key={co} className="badge badge-xs bg-[#2e2e2e] text-[#9ca3af] border border-[#3e3e3e] rounded-md">
                      {co}
                    </span>
                  ))}
                </div>
              )}

              {/* EXPANDABLE HINTS */}
              {openHintIdx !== null && hints.length > 0 && (
                <div className="p-4 bg-[#ffc01e]/10 border border-[#ffc01e]/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[#ffc01e] font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <LightbulbIcon className="size-4" />
                      Hint {openHintIdx + 1} of {hints.length}
                    </span>
                    <button
                      onClick={() => setOpenHintIdx(null)}
                      className="text-[#ffc01e]/70 hover:text-[#ffc01e]"
                    >
                      <ChevronUpIcon className="size-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#eff1f6]/90 leading-relaxed font-sans">
                    {hints[openHintIdx]}
                  </p>
                  {hints.length > 1 && (
                    <div className="flex gap-1.5 pt-1">
                      {hints.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setOpenHintIdx(idx)}
                          className={`btn btn-xs rounded-lg ${
                            openHintIdx === idx ? "bg-[#ffc01e] text-black font-bold" : "bg-[#262626] text-[#9ca3af] border border-[#3e3e3e]"
                          }`}
                        >
                          Hint {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DESCRIPTION BODY (RICH LEETCODE TYPOGRAPHY) */}
            <div className="space-y-5">
              <div className="text-sm leading-relaxed text-[#eff1f6]/90 space-y-3 font-normal">
                <p>{descText}</p>
                {descNotes.map((note, idx) => (
                  <p key={idx} className="text-xs text-[#9ca3af] italic">
                    Note: {note}
                  </p>
                ))}
              </div>

              {/* EXAMPLES SECTION (RICH LEETCODE / HACKERRANK CARDS) */}
              {examples.length > 0 && (
                <div className="space-y-4">
                  {examples.map((example, idx) => (
                    <div key={idx} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                        Example {idx + 1}:
                      </h3>
                      <div className="bg-[#262626] rounded-2xl p-4 border border-[#383838] font-mono text-xs space-y-2">
                        <div className="flex gap-2">
                          <span className="text-[#00b8a3] font-bold min-w-[70px]">Input:</span>
                          <span className="text-[#eff1f6] font-medium">{example.input}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#ffa116] font-bold min-w-[70px]">Output:</span>
                          <span className="text-[#eff1f6] font-medium">{example.output}</span>
                        </div>
                        {example.explanation && (
                          <div className="pt-2 border-t border-[#383838] font-sans text-xs text-[#9ca3af]">
                            <strong className="text-[#eff1f6]">Explanation:</strong>{" "}
                            {example.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CONSTRAINTS */}
              {constraints.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                    Constraints:
                  </h3>
                  <div className="bg-[#262626] rounded-2xl p-4 border border-[#383838]">
                    <ul className="space-y-2 text-xs text-[#eff1f6]/80 list-disc list-inside">
                      {constraints.map((c, idx) => (
                        <li key={idx} className="font-mono">
                          <code className="bg-[#1a1a1a] px-2.5 py-1 rounded-md border border-[#383838] text-[11px] text-[#eff1f6]">
                            {c}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* LEETCODE FOOTER REACTIONS BAR */}
            <div className="pt-6 border-t border-[#333333] flex items-center justify-between text-xs text-[#9ca3af]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`btn btn-xs btn-ghost gap-1 ${hasLiked ? "text-[#00b8a3] font-bold" : "hover:text-[#eff1f6]"}`}
                >
                  <ThumbsUpIcon className="size-3.5" />
                  <span>{(likes / 1000).toFixed(1)}K</span>
                </button>

                <button
                  onClick={handleDislike}
                  className={`btn btn-xs btn-ghost gap-1 ${hasDisliked ? "text-[#ff375f] font-bold" : "hover:text-[#eff1f6]"}`}
                >
                  <ThumbsDownIcon className="size-3.5" />
                  <span>{(dislikes / 1000).toFixed(1)}K</span>
                </button>

                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`btn btn-xs btn-ghost ${isStarred ? "text-[#ffa116]" : "hover:text-[#eff1f6]"}`}
                  title="Bookmark problem"
                >
                  <StarIcon className={`size-3.5 ${isStarred ? "fill-[#ffa116] text-[#ffa116]" : ""}`} />
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                  className="btn btn-xs btn-ghost hover:text-[#eff1f6]"
                  title="Share problem"
                >
                  <Share2Icon className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 font-medium text-[#00b8a3] text-[11px]">
                <span className="size-2 bg-[#00b8a3] rounded-full animate-pulse"></span>
                <span>658 Candidates Online</span>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: SUBMISSIONS */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#eff1f6]">Submission History</h2>
              <span className="text-xs text-[#9ca3af]">Status: Evaluated</span>
            </div>
            {attempts.length === 0 ? (
              <div className="p-8 text-center bg-[#262626] rounded-2xl border border-[#383838] text-xs text-[#9ca3af]">
                No submissions recorded yet for this session. Click "Submit Code" to evaluate your solution against all test cases.
              </div>
            ) : (
              <div className="space-y-2">
                {attempts.map((att, idx) => (
                  <div
                    key={att._id || idx}
                    className="p-4 bg-[#262626] rounded-2xl border border-[#383838] flex items-center justify-between text-xs hover:border-[#00b8a3] transition-colors cursor-pointer"
                    onClick={() => onLoadAttemptCode && onLoadAttemptCode(att.code)}
                  >
                    <div className="flex items-center gap-3">
                      {att.status === "Accepted" ? (
                        <div className="size-7 rounded-full bg-[#00b8a3]/20 text-[#00b8a3] flex items-center justify-center font-bold">
                          <CheckCircle2Icon className="size-4" />
                        </div>
                      ) : (
                        <div className="size-7 rounded-full bg-[#ff375f]/20 text-[#ff375f] flex items-center justify-center font-bold">
                          <XCircleIcon className="size-4" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`font-black ${
                            att.status === "Accepted" ? "text-[#00b8a3]" : "text-[#ff375f]"
                          }`}
                        >
                          {att.status} (Score: {att.status === "Accepted" ? "100.0" : "0.0"})
                        </div>
                        <div className="text-[11px] text-[#9ca3af]">
                          {att.language} • {att.passedCount || 0}/{att.totalCount || 0} test cases passed
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-[#9ca3af] font-mono">
                      {att.executionTimeMs ? `${att.executionTimeMs} ms` : "0.04s"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EDITORIAL */}
        {activeTab === "editorial" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#eff1f6]">Official Editorial & Complexity</h2>
            <div className="bg-[#262626] rounded-2xl p-5 border border-[#383838] space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-sm text-[#00b8a3]">Optimal Approach: One-Pass Hash Map</h3>
              <p className="text-[#eff1f6]/80">
                Iterate through the array once. For each element, compute its complement (target - num). Check if the complement exists in the hash table. If found, return the pair. Otherwise, store the current element with its index.
              </p>
              <div className="p-3 bg-[#1a1a1a] rounded-xl font-mono text-[11px] text-[#eff1f6]/90 space-y-1 border border-[#383838]">
                <div>• Time Complexity: O(n) — Single pass over input array.</div>
                <div>• Space Complexity: O(n) — Hash table stores at most n elements.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOLUTIONS */}
        {activeTab === "solutions" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#eff1f6]">Top Community Solutions</h2>
            <div className="bg-[#262626] rounded-2xl p-4 border border-[#383838] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#eff1f6]">Python3 / Java / JS 99.8% Speed Solution</span>
                <span className="badge badge-sm bg-[#00b8a3]/15 text-[#00b8a3] border border-[#00b8a3]/30 font-bold">
                  Top Rated
                </span>
              </div>
              <p className="text-[#9ca3af]">
                Detailed step-by-step walkthrough of edge cases and memory optimization.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: INTERVIEWER CODEPAIR RUBRIC */}
        {activeTab === "interviewer" && isHost && (
          <div className="h-full">
            <InterviewerToolsPanel
              problemData={problemData}
              session={session}
              sessionId={sessionId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
