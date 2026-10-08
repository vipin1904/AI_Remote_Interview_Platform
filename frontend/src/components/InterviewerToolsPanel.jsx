import { useState, useEffect } from "react";
import {
  BookOpenIcon,
  HelpCircleIcon,
  SendIcon,
  StarIcon,
  CheckCircle2Icon,
  SaveIcon,
  SparklesIcon,
  FileTextIcon,
  AwardIcon,
} from "lucide-react";
import { useSaveEvaluation, useRevealHint } from "../hooks/useSessions";

function InterviewerToolsPanel({ problemData, session, sessionId }) {
  const [activeTab, setActiveTab] = useState("problem");
  const [rating, setRating] = useState(session?.evaluation?.rating || 0);
  const [recommendation, setRecommendation] = useState(session?.evaluation?.recommendation || "");
  const [feedback, setFeedback] = useState(session?.evaluation?.feedback || "");
  const [interviewerNotes, setInterviewerNotes] = useState(session?.interviewerNotes || "");

  const saveEvaluationMutation = useSaveEvaluation();
  const revealHintMutation = useRevealHint();

  const revealedHints = session?.revealedHints || [];

  useEffect(() => {
    if (session) {
      if (session.evaluation?.rating) setRating(session.evaluation.rating);
      if (session.evaluation?.recommendation) setRecommendation(session.evaluation.recommendation);
      if (session.evaluation?.feedback) setFeedback(session.evaluation.feedback);
      if (session.interviewerNotes) setInterviewerNotes(session.interviewerNotes);
    }
  }, [session]);

  const handleSaveEvaluation = () => {
    saveEvaluationMutation.mutate({
      id: sessionId,
      data: {
        interviewerNotes,
        evaluation: {
          rating,
          recommendation,
          feedback,
        },
      },
    });
  };

  const handleRevealHint = (idx) => {
    revealHintMutation.mutate({
      id: sessionId,
      hintIndex: idx,
    });
  };

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* TABS HEADER */}
      <div className="bg-base-100 border-b border-base-300 px-4 pt-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("problem")}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "problem"
                ? "bg-base-200 text-primary border-t-2 border-primary"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <BookOpenIcon className="size-4" />
            <span>Problem & Hints</span>
          </button>

          <button
            onClick={() => setActiveTab("solution")}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "solution"
                ? "bg-base-200 text-primary border-t-2 border-primary"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <SparklesIcon className="size-4" />
            <span>Solution Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab("evaluation")}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "evaluation"
                ? "bg-base-200 text-primary border-t-2 border-primary"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <AwardIcon className="size-4" />
            <span>Candidate Evaluation</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* TAB 1: PROBLEM & HINTS */}
        {activeTab === "problem" && (
          <>
            {/* PROBLEM DESCRIPTION */}
            {problemData?.description && (
              <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                <h3 className="text-base font-bold mb-3 text-base-content">Description</h3>
                <p className="text-sm leading-relaxed text-base-content/90">
                  {problemData.description.text}
                </p>
                {problemData.description.notes?.map((note, idx) => (
                  <p key={idx} className="text-sm text-base-content/80 mt-2 italic">
                    Note: {note}
                  </p>
                ))}
              </div>
            )}

            {/* HINTS CONTROLLER */}
            {problemData?.hints && problemData.hints.length > 0 && (
              <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircleIcon className="size-5 text-warning" />
                    <h3 className="text-base font-bold text-base-content">Interviewer Hints Control</h3>
                  </div>
                  <span className="text-xs text-base-content/60">
                    Revealed: {revealedHints.length}/{problemData.hints.length}
                  </span>
                </div>
                <p className="text-xs text-base-content/70">
                  You can reveal hints step-by-step to the candidate if they get stuck.
                </p>

                <div className="space-y-3 pt-2">
                  {problemData.hints.map((hint, idx) => {
                    const isRevealed = revealedHints.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-lg border text-sm transition-all ${
                          isRevealed
                            ? "bg-success/10 border-success/30 text-base-content"
                            : "bg-base-200 border-base-300 text-base-content/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="font-bold text-xs uppercase tracking-wide opacity-70 block mb-1">
                              Hint {idx + 1}
                            </span>
                            <p className="text-xs leading-relaxed">{hint}</p>
                          </div>
                          <button
                            onClick={() => handleRevealHint(idx)}
                            disabled={isRevealed || revealHintMutation.isPending}
                            className={`btn btn-xs shrink-0 gap-1 ${
                              isRevealed ? "btn-success btn-outline" : "btn-primary"
                            }`}
                          >
                            {isRevealed ? (
                              <>
                                <CheckCircle2Icon className="size-3" />
                                <span>Revealed</span>
                              </>
                            ) : (
                              <>
                                <SendIcon className="size-3" />
                                <span>Reveal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXAMPLES */}
            {problemData?.examples && problemData.examples.length > 0 && (
              <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                <h3 className="text-base font-bold mb-3 text-base-content">Examples</h3>
                <div className="space-y-3">
                  {problemData.examples.map((example, idx) => (
                    <div key={idx} className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1">
                      <p><span className="text-primary font-bold">Input:</span> {example.input}</p>
                      <p><span className="text-secondary font-bold">Output:</span> {example.output}</p>
                      {example.explanation && (
                        <p className="font-sans text-xs text-base-content/60 pt-1 border-t border-base-300">
                          {example.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: SOLUTION & RUBRIC */}
        {activeTab === "solution" && (
          <div className="space-y-4">
            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300 space-y-4">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <SparklesIcon className="size-5 text-primary" />
                Interviewer Solution Reference
              </h3>

              {problemData?.interviewerGuide ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-base-200 rounded-lg">
                      <span className="text-xs text-base-content/60 block">Expected Time</span>
                      <span className="font-mono font-bold text-primary text-sm">
                        {problemData.interviewerGuide.timeComplexity}
                      </span>
                    </div>
                    <div className="p-3 bg-base-200 rounded-lg">
                      <span className="text-xs text-base-content/60 block">Expected Space</span>
                      <span className="font-mono font-bold text-secondary text-sm">
                        {problemData.interviewerGuide.spaceComplexity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-base-content/70 uppercase mb-1">
                      Optimal Approach
                    </h4>
                    <p className="text-xs leading-relaxed bg-base-200 p-3 rounded-lg text-base-content/90">
                      {problemData.interviewerGuide.optimalApproach}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-base-content/70 uppercase mb-2">
                      Evaluation Rubric Checklist
                    </h4>
                    <ul className="space-y-2">
                      {problemData.interviewerGuide.rubric?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-base-content/85">
                          <span className="text-success font-bold mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-xs text-base-content/60">
                  Standard algorithmic assessment criteria applies.
                </p>
              )}
            </div>

            {/* EXPECTED OUTPUTS */}
            {problemData?.expectedOutput && (
              <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                <h4 className="text-xs font-bold text-base-content/70 uppercase mb-2">
                  Expected Test Outputs
                </h4>
                <div className="space-y-2">
                  {Object.entries(problemData.expectedOutput).map(([lang, exp]) => (
                    <div key={lang} className="bg-base-200 p-2.5 rounded-lg text-xs font-mono">
                      <span className="badge badge-xs badge-neutral mb-1 capitalize">{lang}</span>
                      <pre className="whitespace-pre-wrap text-base-content/80 text-[11px]">{exp}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CANDIDATE EVALUATION */}
        {activeTab === "evaluation" && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <FileTextIcon className="size-5 text-primary" />
                Private Candidate Assessment
              </h3>
              <span className="badge badge-warning badge-xs">Visible Only to Interviewer</span>
            </div>

            {/* RATING */}
            <div>
              <label className="label py-1">
                <span className="label-text font-semibold text-xs">Overall Performance Rating</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} star`}
                  >
                    <StarIcon
                      className={`size-6 ${
                        star <= rating
                          ? "text-warning fill-warning"
                          : "text-base-300 hover:text-warning"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold ml-2 text-base-content/70">
                  {rating === 0
                    ? "Unrated"
                    : rating === 5
                    ? "Exceptional (5/5)"
                    : rating >= 4
                    ? "Strong (4/5)"
                    : rating >= 3
                    ? "Average (3/5)"
                    : "Needs Improvement"}
                </span>
              </div>
            </div>

            {/* HIRING RECOMMENDATION */}
            <div>
              <label className="label py-1">
                <span className="label-text font-semibold text-xs">Hiring Recommendation</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
              >
                <option value="">Select recommendation...</option>
                <option value="Strong Hire">Strong Hire ⭐⭐⭐⭐⭐</option>
                <option value="Hire">Hire 👍</option>
                <option value="Leaning No Hire">Leaning No Hire 🤔</option>
                <option value="No Hire">No Hire ❌</option>
              </select>
            </div>

            {/* FEEDBACK & NOTES */}
            <div>
              <label className="label py-1">
                <span className="label-text font-semibold text-xs">Interviewer Private Notes & Observations</span>
              </label>
              <textarea
                rows={4}
                placeholder="Candidate's approach, communication clarity, edge case consideration, problem-solving agility..."
                className="textarea textarea-bordered w-full text-xs"
                value={interviewerNotes}
                onChange={(e) => setInterviewerNotes(e.target.value)}
              ></textarea>
            </div>

            <button
              onClick={handleSaveEvaluation}
              disabled={saveEvaluationMutation.isPending}
              className="btn btn-primary btn-sm w-full gap-2"
            >
              <SaveIcon className="size-4" />
              <span>{saveEvaluationMutation.isPending ? "Saving..." : "Save Evaluation"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewerToolsPanel;
