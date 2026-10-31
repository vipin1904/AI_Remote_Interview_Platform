import { useState, useEffect } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";

import { PROBLEMS } from "../data/problems";
import { ChevronRightIcon, Code2Icon, Sparkles, Target, ArrowRight } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { getPracticeRecommendations } from "../api/reports";

function ProblemsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await getPracticeRecommendations();
      if (res?.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      // Graceful fallback if not signed in or no past attempts
    } finally {
      setLoadingRecs(false);
    }
  };

  const problems = Object.values(PROBLEMS);

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        {/* ML PRACTICE RECOMMENDATIONS BANNER */}
        {recommendations?.recommended_problems?.length > 0 && (
          <div className="card bg-gradient-to-r from-primary/10 via-base-100 to-accent/10 border border-primary/20 shadow-md mb-8">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI / ML ADAPTIVE RECOMMENDATIONS</span>
              </div>
              <h3 className="text-xl font-bold">Personalized Skill Progression</h3>
              <p className="text-xs text-base-content/70 mb-4">
                {recommendations.ml_rationale}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.recommended_problems.slice(0, 3).map((rec, idx) => (
                  <Link
                    key={idx}
                    to={`/problem/${rec.slug}`}
                    className="p-3 bg-base-100 hover:bg-base-200/80 rounded-xl border border-base-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{rec.title}</span>
                        <span className={`badge badge-xs ${getDifficultyBadgeClass(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-base-content/60 line-clamp-2">{rec.rationale}</p>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-2">
                      <span>Practice now</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="card bg-base-100 hover:scale-[1.01] transition-transform"
            >
              <div className="card-body">
                <div className="flex items-center justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code2Icon className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold">{problem.title}</h2>
                          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/60"> {problem.category}</p>
                      </div>
                    </div>
                    <p className="text-base-content/80 mb-3">{problem.description.text}</p>
                  </div>
                  {/* RIGHT SIDE */}

                  <div className="flex items-center gap-2 text-primary">
                    <span className="font-medium">Solve</span>
                    <ChevronRightIcon className="size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{easyProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{mediumProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
