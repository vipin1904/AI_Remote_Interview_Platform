import { useState, useEffect } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";

import { PROBLEMS } from "../data/problems";
import {
  ChevronRightIcon,
  Code2Icon,
  Sparkles,
  ArrowRight,
  SearchIcon,
  SlidersHorizontalIcon,
  ShuffleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { getPracticeRecommendations } from "../api/reports";

function ProblemsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

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

  // LeetCode-style category tags matching screenshot
  const topicTags = [
    { name: "All", count: problems.length },
    { name: "Array", count: problems.filter((p) => (p.category || "").toLowerCase().includes("array") || (p.title || "").toLowerCase().includes("sum") || (p.title || "").toLowerCase().includes("array")).length || 12 },
    { name: "String", count: problems.filter((p) => (p.category || "").toLowerCase().includes("string") || (p.title || "").toLowerCase().includes("string") || (p.title || "").toLowerCase().includes("parentheses")).length || 8 },
    { name: "Hash Table", count: 6 },
    { name: "Math", count: 5 },
    { name: "Dynamic Programming", count: 7 },
    { name: "Tree", count: 4 },
  ];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.difficulty || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTag === "All" ||
      (p.category || "").toLowerCase().includes(selectedTag.toLowerCase()) ||
      (p.title || "").toLowerCase().includes(selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#eff1f6] font-sans select-text">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#eff1f6] tracking-tight mb-1">
              Practice <span className="text-[#ffa116]">Problems</span>
            </h1>
            <p className="text-xs md:text-sm text-[#9ca3af]">
              Sharpen your algorithmic skills with curated interview challenges
            </p>
          </div>

          {/* Quick random solve button */}
          {problems.length > 0 && (
            <Link
              to={`/problem/${problems[Math.floor(Math.random() * problems.length)].id}`}
              className="btn btn-sm bg-[#333333] hover:bg-[#3d3d3d] text-[#eff1f6] border border-[#444444] rounded-xl gap-2 font-bold self-start md:self-auto"
            >
              <ShuffleIcon className="size-3.5 text-[#ffa116]" />
              <span>Pick Random</span>
            </Link>
          )}
        </div>

        {/* LEETCODE SIGNATURE TOPIC PILLS (MATCHING SCREENSHOT) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {topicTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(tag.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedTag === tag.name
                  ? "bg-[#333333] text-[#eff1f6] border-[#ffa116] shadow-sm"
                  : "bg-[#262626] text-[#9ca3af] hover:text-[#eff1f6] border-[#383838] hover:bg-[#2e2e2e]"
              }`}
            >
              <span>{tag.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#383838] text-[#9ca3af]">
                {tag.count}
              </span>
            </button>
          ))}
        </div>

        {/* SEARCH BAR & FILTER ROW (MATCHING SCREENSHOT) */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="size-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions by title, category, or difficulty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#262626] text-[#eff1f6] placeholder-[#737373] text-xs md:text-sm pl-10 pr-4 py-2.5 rounded-full border border-[#383838] focus:outline-none focus:border-[#ffa116] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("All");
              }}
              className="btn btn-sm btn-ghost text-[#9ca3af] hover:text-[#eff1f6] text-xs rounded-xl"
              title="Reset Filters"
            >
              <SlidersHorizontalIcon className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* ML PRACTICE RECOMMENDATIONS BANNER */}
        {recommendations?.recommended_problems?.length > 0 && (
          <div className="bg-gradient-to-r from-[#ffa116]/10 via-[#262626] to-[#00b8a3]/10 border border-[#ffa116]/30 rounded-2xl p-5 mb-8 shadow-lg">
            <div className="flex items-center gap-2 text-[#ffa116] font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI / ML Adaptive Recommendations</span>
            </div>
            <h3 className="text-lg font-bold text-[#eff1f6]">Personalized Skill Progression</h3>
            <p className="text-xs text-[#9ca3af] mb-4">
              {recommendations.ml_rationale}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendations.recommended_problems.slice(0, 3).map((rec, idx) => (
                <Link
                  key={idx}
                  to={`/problem/${rec.slug}`}
                  className="p-3.5 bg-[#262626] hover:bg-[#2e2e2e] rounded-xl border border-[#383838] hover:border-[#ffa116]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#eff1f6]">{rec.title}</span>
                      <span className={`badge badge-xs ${getDifficultyBadgeClass(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] line-clamp-2">{rec.rationale}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#ffa116] text-xs font-semibold mt-3">
                    <span>Practice now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* PROBLEMS LIST (LEETCODE CARD STYLING) */}
        <div className="space-y-3">
          {filteredProblems.length === 0 ? (
            <div className="bg-[#262626] rounded-2xl p-10 border border-[#383838] text-center space-y-2">
              <Code2Icon className="size-10 mx-auto text-[#9ca3af]/40" />
              <p className="text-sm font-semibold text-[#eff1f6]">No problems match your query</p>
              <p className="text-xs text-[#9ca3af]">Try searching for different keywords or reset tags.</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.id}`}
                className="block bg-[#262626] hover:bg-[#2a2a2a] border border-[#383838] hover:border-[#ffa116]/50 rounded-2xl p-4 transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="size-9 rounded-xl bg-[#333333] flex items-center justify-center shrink-0">
                        <Code2Icon className="size-4 text-[#ffa116]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-[#eff1f6] group-hover:text-[#ffa116] transition-colors truncate">
                            {problem.title}
                          </h2>
                          <span className={`badge badge-xs ${getDifficultyBadgeClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af]">{problem.category || "Algorithms"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#9ca3af] line-clamp-1 ml-12">
                      {typeof problem.description === "string" ? problem.description : problem.description?.text}
                    </p>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-1.5 text-[#ffa116] text-xs font-bold shrink-0">
                    <span className="hidden sm:inline">Solve Challenge</span>
                    <ChevronRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* STATS FOOTER (LEETCODE PALETTE STATS) */}
        <div className="mt-10 bg-[#262626] border border-[#383838] rounded-2xl p-6 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-[#1e1e1e] rounded-xl border border-[#333333]">
              <div className="text-xs text-[#9ca3af] font-semibold mb-1">Total Problems</div>
              <div className="text-2xl font-black text-[#eff1f6]">{problems.length}</div>
            </div>

            <div className="p-3 bg-[#1e1e1e] rounded-xl border border-[#333333]">
              <div className="text-xs text-[#00b8a3] font-semibold mb-1">Easy</div>
              <div className="text-2xl font-black text-[#00b8a3]">{easyProblemsCount}</div>
            </div>

            <div className="p-3 bg-[#1e1e1e] rounded-xl border border-[#333333]">
              <div className="text-xs text-[#ffa116] font-semibold mb-1">Medium</div>
              <div className="text-2xl font-black text-[#ffa116]">{mediumProblemsCount}</div>
            </div>

            <div className="p-3 bg-[#1e1e1e] rounded-xl border border-[#333333]">
              <div className="text-xs text-[#ff375f] font-semibold mb-1">Hard</div>
              <div className="text-2xl font-black text-[#ff375f]">{hardProblemsCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;
