import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Code2,
  Calendar,
  Sparkles,
  ShieldAlert,
  Loader,
  X,
  Award,
  LogOut,
} from "lucide-react";
import { getReport, generateReport, downloadReportPdf } from "../api/reports";

function ReportModal({
  isOpen,
  onClose,
  sessionId,
  isInterviewer,
  countdown,
  onExitToDashboard,
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isInterviewer ? "interviewer" : "candidate");

  // Interviewer inputs if generating with notes
  const [interviewerNotes, setInterviewerNotes] = useState("");
  const [interviewerScore, setInterviewerScore] = useState(4);
  const [recommendation, setRecommendation] = useState("Hire");

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    loadReport();
  }, [isOpen, sessionId]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(sessionId);
      if (data?.report) {
        setReport(data.report);
        if (!data.report.interviewerReport) {
          setActiveTab("candidate");
        }
      } else {
        setReport(null);
        // If session already finished, auto-generate report
        if (countdown !== undefined) {
          handleAutoGenerate();
        }
      }
    } catch (err) {
      if (err.response?.status === 404 || err.message?.includes("404")) {
        setReport(null);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      setGenerating(true);
      const data = await generateReport(sessionId, {
        interviewerNotes: "",
        interviewerScore: 4,
        interviewerRecommendation: "Hire",
      });
      if (data?.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.warn("Auto-generate error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateReport(sessionId, {
        interviewerNotes,
        interviewerScore,
        interviewerRecommendation: recommendation,
      });
      if (data?.report) {
        setReport(data.report);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const filename =
        activeTab === "interviewer"
          ? `Interviewer_Assessment_${sessionId.slice(-6)}.pdf`
          : `Candidate_Learning_Report_${sessionId.slice(-6)}.pdf`;
      await downloadReportPdf(sessionId, filename);
    } catch (err) {
      alert("Failed to download PDF: " + (err.response?.data?.message || err.message));
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  const cr = report?.candidateReport;
  const ir = report?.interviewerReport;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* 1-MINUTE POST-SESSION COUNTDOWN BANNER */}
        {countdown !== undefined && countdown !== null && countdown > 0 && (
          <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 p-2.5 px-6 border-b border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Clock className="w-4 h-4 animate-spin" />
              <span>
                Post-Session Report Window: {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")} remaining
              </span>
            </div>
            <span className="badge badge-primary badge-sm font-semibold">Active Review</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Interview Performance Intelligence
                <span className="badge badge-primary badge-sm font-semibold">AI + ML</span>
              </h3>
              <p className="text-xs text-base-content/60">Session #{sessionId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn btn-sm btn-primary gap-2"
              >
                {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
            )}

            {onExitToDashboard && (
              <button
                onClick={onExitToDashboard}
                className="btn btn-sm btn-outline btn-error gap-1.5"
                title="Finish review and go to dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit to Dashboard
              </button>
            )}

            <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (If Interviewer and report has both views) */}
        {report && ir && isInterviewer && (
          <div className="flex border-b border-base-200 px-6 bg-base-200/20">
            <button
              onClick={() => setActiveTab("interviewer")}
              className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "interviewer"
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <Award className="w-4 h-4" />
              Interviewer Hiring Assessment
              <span className="badge badge-xs badge-error">CONFIDENTIAL</span>
            </button>
            <button
              onClick={() => setActiveTab("candidate")}
              className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "candidate"
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Candidate Learning & 7-Day Plan
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading || generating ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-base-content/60">
                {generating
                  ? "Synthesizing AI & ML performance intelligence..."
                  : "Retrieving report intelligence..."}
              </p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : !report ? (
            /* Report Not Yet Generated View */
            <div className="text-center py-12 max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold">Generate Comprehensive Interview Report</h4>
              <p className="text-sm text-base-content/70">
                Synthesizes code artifacts, automated test case results, machine learning success predictions, and personalized study roadmaps.
              </p>

              {isInterviewer && (
                <div className="bg-base-200 p-4 rounded-xl text-left space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                    Interviewer Initial Scoring (Optional)
                  </div>
                  <div>
                    <label className="label label-text text-xs font-semibold">Hiring Recommendation</label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                    >
                      <option value="Strong Hire">Strong Hire</option>
                      <option value="Hire">Hire</option>
                      <option value="Leaning No Hire">Leaning No Hire</option>
                      <option value="No Hire">No Hire</option>
                    </select>
                  </div>
                  <div>
                    <label className="label label-text text-xs font-semibold">Technical Score (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.5"
                      className="input input-bordered input-sm w-full"
                      value={interviewerScore}
                      onChange={(e) => setInterviewerScore(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label label-text text-xs font-semibold">Private Notes</label>
                    <textarea
                      rows="3"
                      className="textarea textarea-bordered text-sm w-full"
                      placeholder="Candidate's communication, problem decomposition, and problem-solving velocity..."
                      value={interviewerNotes}
                      onChange={(e) => setInterviewerNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn btn-primary gap-2 w-full max-w-xs mx-auto"
              >
                {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Report Now
              </button>
            </div>
          ) : activeTab === "interviewer" && ir ? (
            /* Interviewer Assessment View */
            <div className="space-y-6">
              {/* Score & Recommendation Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-5 rounded-2xl border flex items-center justify-between ${
                    ir.overallRecommendation?.toLowerCase().includes("no hire")
                      ? "bg-error/10 border-error/30 text-error"
                      : "bg-success/10 border-success/30 text-success"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                      Recommendation
                    </div>
                    <div className="text-2xl font-black mt-1">{ir.overallRecommendation || "Hire"}</div>
                  </div>
                  <Award className="w-10 h-10 opacity-80" />
                </div>

                <div className="p-5 rounded-2xl border border-base-300 bg-base-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Overall Score
                    </div>
                    <div className="text-2xl font-black text-primary mt-1">
                      {ir.overallScore || 4.0} <span className="text-sm font-normal text-base-content/60">/ 5.0</span>
                    </div>
                  </div>
                  <Code2 className="w-10 h-10 text-primary opacity-60" />
                </div>
              </div>

              {/* Technical Competencies */}
              <div className="bg-base-200/50 border border-base-300 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Technical Competencies Breakdown
                </h4>
                <div className="space-y-2">
                  {ir.technicalCompetencies?.map((c, i) => (
                    <div key={i} className="p-3 bg-base-100 rounded-xl border border-base-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm">{c.skill}</span>
                        <span className="badge badge-sm badge-primary font-bold">{c.score} / 5</span>
                      </div>
                      <p className="text-xs text-base-content/70">{c.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Notes & Rubric */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                  <h4 className="font-bold text-amber-500 text-sm mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Confidential Interviewer Notes
                  </h4>
                  <p className="text-xs text-base-content/80 whitespace-pre-wrap">
                    {ir.interviewerPrivateNotes || "No private notes recorded."}
                  </p>
                </div>

                <div className="bg-base-200/50 border border-base-300 rounded-2xl p-5">
                  <h4 className="font-bold text-sm mb-3">Rubric Criteria Alignment</h4>
                  <div className="space-y-2">
                    {ir.rubricAssessment?.map((r, i) => (
                      <div key={i} className="text-xs flex items-start gap-2">
                        {r.met ? (
                          <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-semibold">{r.criteria}: </span>
                          <span className="text-base-content/70">{r.notes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-success/5 border border-success/20 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase text-success tracking-wider">Identified Strengths</div>
                  <ul className="text-xs space-y-1">
                    {ir.strengths?.map((s, i) => (
                      <li key={i} className="text-base-content/80">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-error/5 border border-error/20 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase text-error tracking-wider">Potential Concerns</div>
                  <ul className="text-xs space-y-1">
                    {ir.concerns?.map((c, i) => (
                      <li key={i} className="text-base-content/80">• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Candidate Learning View */
            <div className="space-y-6">
              {/* Summary & Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-base-200 border border-base-300 rounded-2xl">
                  <div className="text-xs text-base-content/60 font-semibold">Test Pass Rate</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {cr?.executionSummary?.totalTests > 0
                      ? Math.round(
                          (cr.executionSummary.passedTests / cr.executionSummary.totalTests) * 100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-base-content/60 mt-1">
                    {cr?.executionSummary?.passedTests || 0} of {cr?.executionSummary?.totalTests || 0} passed
                  </div>
                </div>

                <div className="p-4 bg-base-200 border border-base-300 rounded-2xl">
                  <div className="text-xs text-base-content/60 font-semibold">Algorithm Approach</div>
                  <div className="text-base font-bold truncate mt-1">
                    {cr?.approachAnalysis?.approach || "Standard Iterative"}
                  </div>
                  <div className="text-xs text-base-content/60 mt-1">
                    Complexity: {cr?.approachAnalysis?.timeComplexity || "O(n)"} time
                  </div>
                </div>

                <div className="p-4 bg-base-200 border border-base-300 rounded-2xl">
                  <div className="text-xs text-base-content/60 font-semibold">ML Success Forecast</div>
                  <div className="text-base font-bold text-accent mt-1">
                    {report?.mlPrediction?.predictedCategory || "Moderate Likelihood"}
                  </div>
                  <div className="text-xs text-base-content/60 mt-1">
                    v{report?.mlPrediction?.modelVersion || "1.0.0"} model
                  </div>
                </div>
              </div>

              {/* Approach & Complexity Notes */}
              <div className="p-4 bg-base-200/50 border border-base-300 rounded-2xl space-y-2">
                <h4 className="font-bold text-sm text-base-content flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" /> Complexity Analysis & Observations
                </h4>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {cr?.approachAnalysis?.complexityNotes || "Algorithm executed within linear bounds."}
                </p>
              </div>

              {/* Code Improvements & Missed Edge Cases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase text-primary tracking-wider">
                    Targeted Code Improvements
                  </div>
                  <ul className="text-xs space-y-1.5">
                    {cr?.codeImprovements?.map((imp, i) => (
                      <li key={i} className="text-base-content/80">• {imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-warning/5 border border-warning/20 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase text-warning tracking-wider">
                    Missed Edge Cases & Pitfalls
                  </div>
                  <ul className="text-xs space-y-1.5">
                    {cr?.missedEdgeCases?.map((ec, i) => (
                      <li key={i} className="text-base-content/80">• {ec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 7-Day Personalized Study Roadmap */}
              <div className="border border-base-300 rounded-2xl p-5 bg-base-200/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> 7-Day Targeted Study Roadmap
                  </h4>
                  <span className="badge badge-sm badge-outline">Adaptive Schedule</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cr?.studyPlan7Days?.map((day) => (
                    <div key={day.day} className="p-3 bg-base-100 rounded-xl border border-base-200 space-y-1">
                      <div className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Day {day.day}: {day.focus}</span>
                      </div>
                      <ul className="text-xs text-base-content/70 space-y-1">
                        {day.tasks?.map((t, ti) => (
                          <li key={ti}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* ML Practice Recommendations */}
              {cr?.mlPracticeRecommendations?.length > 0 && (
                <div className="p-4 bg-base-200 border border-base-300 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase text-accent tracking-wider">
                    Machine Learning Problem Recommendations
                  </div>
                  <ul className="text-xs space-y-1 text-base-content/80">
                    {cr.mlPracticeRecommendations.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
