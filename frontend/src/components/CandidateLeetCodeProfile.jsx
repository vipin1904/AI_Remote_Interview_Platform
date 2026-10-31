import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
  Target,
  BarChart2,
  Award,
  BookOpen,
} from "lucide-react";
import { questionApi } from "../api/questions";
import { getPracticeRecommendations } from "../api/reports";
import { getDifficultyBadgeClass } from "../lib/utils";

function CandidateLeetCodeProfile({ user }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [attemptsRes, recsRes] = await Promise.allSettled([
        questionApi.getMyAttempts(),
        getPracticeRecommendations(),
      ]);

      if (attemptsRes.status === "fulfilled" && attemptsRes.value?.attempts) {
        setAttempts(attemptsRes.value.attempts);
      }
      if (recsRes.status === "fulfilled" && recsRes.value?.recommendations) {
        setRecommendations(recsRes.value.recommendations);
      }
    } catch (err) {
      console.warn("Error loading candidate profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute LeetCode-style metrics
  const totalSubmissions = attempts.length;
  const acceptedAttempts = attempts.filter((a) => a.status === "Accepted");
  const uniqueAcceptedSlugs = new Set(acceptedAttempts.map((a) => a.questionSlug));
  const totalSolved = uniqueAcceptedSlugs.size;

  // Breakdown by difficulty
  const easySolved = new Set(
    acceptedAttempts.filter((a) => (a.difficulty || "").toLowerCase() === "easy").map((a) => a.questionSlug)
  ).size;
  const mediumSolved = new Set(
    acceptedAttempts.filter((a) => (a.difficulty || "").toLowerCase() === "medium").map((a) => a.questionSlug)
  ).size;
  const hardSolved = new Set(
    acceptedAttempts.filter((a) => (a.difficulty || "").toLowerCase() === "hard").map((a) => a.questionSlug)
  ).size;

  const totalEasyAvailable = 3;
  const totalMediumAvailable = 2;
  const totalHardAvailable = 1;
  const totalProblemsAvailable = totalEasyAvailable + totalMediumAvailable + totalHardAvailable;

  const acceptanceRate =
    totalSubmissions > 0 ? Math.round((acceptedAttempts.length / totalSubmissions) * 100) : 0;

  // Contest / Skill Rating Estimation (LeetCode style starting at 1500)
  const contestRating = Math.max(
    1400,
    Math.round(1500 + easySolved * 35 + mediumSolved * 70 + hardSolved * 120 + (acceptanceRate - 50) * 2)
  );

  return (
    <div className="space-y-6">
      {/* CANDIDATE LEETCODE-STYLE HERO PROFILE CARD */}
      <div className="card bg-base-100 border border-base-300 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/20 via-primary/10 to-accent/20 p-6 border-b border-base-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-16 h-16 rounded-2xl ring ring-secondary ring-offset-base-100 ring-offset-2">
                  <img
                    src={user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=LeetCodeCandidate"}
                    alt={user?.fullName || "Candidate"}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{user?.fullName || "Candidate Developer"}</h2>
                  <span className="badge badge-secondary badge-sm font-bold">LeetCode Track</span>
                </div>
                <p className="text-xs text-base-content/60 font-mono mt-0.5">
                  @{user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "candidate"}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-base-content/70">
                  <span className="flex items-center gap-1 font-semibold text-warning">
                    <Trophy className="w-3.5 h-3.5" />
                    Rating: {contestRating}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-success">
                    <Flame className="w-3.5 h-3.5" />
                    Global Top {contestRating > 1650 ? "10%" : "25%"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <Link
                to="/problems"
                className="btn btn-secondary btn-sm gap-2 flex-1 md:flex-none shadow-md"
              >
                <Code2 className="w-4 h-4" />
                Solve Problems
              </Link>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-base-100">
          {/* TOTAL SOLVED CIRCLE STAT */}
          <div className="p-4 rounded-2xl bg-base-200 border border-base-300 flex items-center gap-4">
            <div
              className="radial-progress text-primary font-black text-sm"
              style={{
                "--value": Math.min(100, Math.round((totalSolved / totalProblemsAvailable) * 100)),
                "--size": "4.2rem",
                "--thickness": "6px",
              }}
              role="progressbar"
            >
              {totalSolved}/{totalProblemsAvailable}
            </div>
            <div>
              <div className="text-xs text-base-content/60 font-semibold uppercase tracking-wider">
                Problems Solved
              </div>
              <div className="text-xl font-black mt-0.5">{totalSolved} Solved</div>
              <div className="text-[11px] text-base-content/50">
                {Math.round((totalSolved / totalProblemsAvailable) * 100)}% completion
              </div>
            </div>
          </div>

          {/* EASY PROGRESS */}
          <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
            <div className="flex items-center justify-between text-xs font-bold text-success mb-1">
              <span>Easy</span>
              <span>
                {easySolved} / {totalEasyAvailable}
              </span>
            </div>
            <progress
              className="progress progress-success w-full h-2"
              value={easySolved}
              max={totalEasyAvailable}
            ></progress>
            <div className="text-[11px] text-base-content/60 mt-2 font-medium">
              Foundational algorithmic patterns
            </div>
          </div>

          {/* MEDIUM PROGRESS */}
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20">
            <div className="flex items-center justify-between text-xs font-bold text-warning mb-1">
              <span>Medium</span>
              <span>
                {mediumSolved} / {totalMediumAvailable}
              </span>
            </div>
            <progress
              className="progress progress-warning w-full h-2"
              value={mediumSolved}
              max={totalMediumAvailable}
            ></progress>
            <div className="text-[11px] text-base-content/60 mt-2 font-medium">
              Standard interview complexity
            </div>
          </div>

          {/* ACCEPTANCE RATE */}
          <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
            <div className="text-xs text-base-content/60 font-semibold uppercase tracking-wider">
              Acceptance Rate
            </div>
            <div className="text-2xl font-black text-secondary mt-0.5">{acceptanceRate}%</div>
            <div className="text-[11px] text-base-content/50 mt-1">
              {acceptedAttempts.length} of {totalSubmissions} submissions accepted
            </div>
          </div>
        </div>
      </div>

      {/* ML ADAPTIVE PROGRESSION & RECOMMENDATIONS */}
      {recommendations && (
        <div className="card bg-gradient-to-r from-primary/10 via-base-100 to-accent/10 border border-primary/20 shadow-md">
          <div className="card-body p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>ML SKILL CALIBRATION & ADAPTIVE STUDY PATH</span>
              </div>
              <span className="badge badge-primary badge-outline badge-sm">
                Level: {recommendations.recommended_difficulty}
              </span>
            </div>

            <p className="text-xs text-base-content/75 mb-4">{recommendations.ml_rationale}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendations.recommended_problems?.slice(0, 3).map((prob, i) => (
                <Link
                  key={i}
                  to={`/problem/${prob.slug}`}
                  className="p-3 bg-base-100 hover:bg-base-200/80 rounded-xl border border-base-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{prob.title}</span>
                      <span className={`badge badge-xs ${getDifficultyBadgeClass(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/60 line-clamp-2">{prob.rationale}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-3">
                    <span>Solve problem</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECENT SUBMISSIONS HISTORY (LEETCODE TABLE STYLE) */}
      <div className="card bg-base-100 border border-base-300 shadow-md">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <BarChart2 className="w-5 h-5 text-primary" />
              <span>Recent Submissions</span>
            </div>
            <Link to="/problems" className="text-xs text-primary hover:underline font-semibold">
              View All Problems →
            </Link>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-12 text-base-content/60 space-y-2">
              <Code2 className="w-10 h-10 mx-auto opacity-30" />
              <p className="font-semibold text-sm">No code submissions recorded yet.</p>
              <p className="text-xs">Solve practice problems to build your LeetCode rating!</p>
              <Link to="/problems" className="btn btn-sm btn-primary mt-2">
                Start Practicing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="border-b border-base-300 text-xs">
                    <th>Status</th>
                    <th>Problem</th>
                    <th>Runtime</th>
                    <th>Language</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(0, 10).map((att, idx) => {
                    const isAccepted = att.status === "Accepted";
                    return (
                      <tr key={att._id || idx} className="hover">
                        <td>
                          <span
                            className={`badge badge-sm font-bold gap-1 ${
                              isAccepted ? "badge-success text-white" : "badge-error text-white"
                            }`}
                          >
                            {isAccepted ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {att.status || "Evaluated"}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/problem/${att.questionSlug}`}
                            className="font-bold text-sm hover:text-primary transition-colors"
                          >
                            {att.questionTitle || att.questionSlug}
                          </Link>
                        </td>
                        <td className="font-mono text-xs">
                          {att.executionTimeMs !== undefined ? `${att.executionTimeMs} ms` : "N/A"}
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-xs uppercase font-mono">
                            {att.language || "code"}
                          </span>
                        </td>
                        <td className="text-xs text-base-content/60">
                          {att.createdAt
                            ? new Date(att.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recently"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateLeetCodeProfile;
