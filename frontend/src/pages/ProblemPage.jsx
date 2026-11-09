import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode, submitCode } from "../lib/piston";
import { questionApi } from "../api/questions";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Responsive layout state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [currentProblemId, setCurrentProblemId] = useState(id || "two-sum");
  const [currentProblem, setCurrentProblem] = useState(PROBLEMS[id || "two-sum"] || PROBLEMS["two-sum"]);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(PROBLEMS[id || "two-sum"]?.starterCode?.javascript || "");
  const [output, setOutput] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState([]);

  // Fetch question and attempts from backend
  useEffect(() => {
    const slug = id || "two-sum";
    setCurrentProblemId(slug);

    // Initial fallback from local dictionary
    if (PROBLEMS[slug]) {
      setCurrentProblem(PROBLEMS[slug]);
      if (PROBLEMS[slug].starterCode?.[selectedLanguage]) {
        setCode(PROBLEMS[slug].starterCode[selectedLanguage]);
      }
    }

    // Fetch live question details from backend
    questionApi
      .getQuestionBySlug(slug)
      .then((data) => {
        if (data?.question) {
          setCurrentProblem(data.question);
          if (data.question.starterCode?.[selectedLanguage] && !code) {
            setCode(data.question.starterCode[selectedLanguage]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch backend question, using local definition:", err.message);
      });

    // Fetch user's persisted attempts for this question
    questionApi
      .getQuestionAttempts(slug)
      .then((data) => {
        if (data?.attempts) {
          setAttempts(data.attempts);
        }
      })
      .catch(() => {
        // Unauthenticated or first-time
      });
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starter = currentProblem?.starterCode?.[newLang] || "";
    setCode(starter);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code, currentProblemId, customInput);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      if (result.status === "Accepted") {
        toast.success("Sample test cases passed!");
      } else {
        toast("Tests ran. Check test outputs below.", { icon: "ℹ️" });
      }
    } else {
      toast.error(result.status || "Execution failed!");
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setOutput(null);

    const result = await submitCode(selectedLanguage, code, currentProblemId);
    setOutput(result);
    setIsSubmitting(false);

    if (result.success && result.status === "Accepted") {
      triggerConfetti();
      toast.success("Submission Accepted! All test cases passed! 🎉");
    } else if (result.status === "Wrong Answer") {
      toast.error(`Tests failed: ${result.passedCount}/${result.totalCount} passed.`);
    } else {
      toast.error(result.status || "Submission failed!");
    }

    // Refresh attempts history
    questionApi.getQuestionAttempts(currentProblemId).then((data) => {
      if (data?.attempts) setAttempts(data.attempts);
    }).catch(() => {});
  };

  return (
    <div className="h-screen bg-[#1a1a1a] text-[#eff1f6] flex flex-col overflow-hidden select-text font-sans">
      <Navbar />

      {/* MAIN WORKSPACE - INDEPENDENT SCROLLING PANELS */}
      <main className="flex-1 overflow-hidden relative">
        {isMobile ? (
          /* MOBILE / TABLET VERTICAL STACK */
          <div className="flex flex-col h-full overflow-hidden">
            {/* TOP: PROBLEM DESCRIPTION (SCROLLS INDEPENDENTLY) */}
            <div className="h-1/2 overflow-hidden border-b border-[#383838]">
              <ProblemDescription
                problem={currentProblem}
                currentProblemId={currentProblemId}
                onProblemChange={handleProblemChange}
                allProblems={Object.values(PROBLEMS)}
                attempts={attempts}
                onLoadAttemptCode={(attemptCode) => {
                  setCode(attemptCode);
                  toast.success("Loaded previous code into editor!");
                }}
              />
            </div>

            {/* BOTTOM: EDITOR & TESTCASES (SCROLLS INDEPENDENTLY) */}
            <div className="flex-1 overflow-hidden">
              <PanelGroup direction="vertical" className="h-full">
                <Panel defaultSize={60} minSize={25} className="h-full overflow-hidden">
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={setCode}
                    onRunCode={handleRunCode}
                    onSubmitCode={handleSubmitCode}
                    onResetCode={() => {
                      const starter = currentProblem?.starterCode?.[selectedLanguage] || "";
                      setCode(starter);
                    }}
                  />
                </Panel>

                <PanelResizeHandle className="h-1.5 bg-[#333333] hover:bg-[#00b8a3] transition-colors cursor-row-resize select-none" />

                <Panel defaultSize={40} minSize={20} className="h-full overflow-hidden">
                  <OutputPanel
                    output={output}
                    customInput={customInput}
                    onCustomInputChange={setCustomInput}
                    isRunning={isRunning || isSubmitting}
                    sampleCases={currentProblem?.examples?.map((ex, idx) => ({
                      name: `Case ${idx + 1}`,
                      input: ex.input,
                      expected: ex.output,
                    }))}
                  />
                </Panel>
              </PanelGroup>
            </div>
          </div>
        ) : (
          /* DESKTOP SIDE-BY-SIDE SPLIT */
          <PanelGroup direction="horizontal" className="h-full">
            {/* LEFT PANEL - PROBLEM DESCRIPTION (SCROLLS INDEPENDENTLY) */}
            <Panel defaultSize={42} minSize={25} className="h-full overflow-hidden">
              <ProblemDescription
                problem={currentProblem}
                currentProblemId={currentProblemId}
                onProblemChange={handleProblemChange}
                allProblems={Object.values(PROBLEMS)}
                attempts={attempts}
                onLoadAttemptCode={(attemptCode) => {
                  setCode(attemptCode);
                  toast.success("Loaded previous code into editor!");
                }}
              />
            </Panel>

            <PanelResizeHandle className="w-1.5 bg-[#333333] hover:bg-[#00b8a3] transition-colors cursor-col-resize select-none" />

            {/* RIGHT PANEL - CODE EDITOR & OUTPUT (SCROLLS INDEPENDENTLY) */}
            <Panel defaultSize={58} minSize={30} className="h-full overflow-hidden">
              <PanelGroup direction="vertical" className="h-full">
                {/* TOP: CODE EDITOR */}
                <Panel defaultSize={62} minSize={25} className="h-full overflow-hidden">
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={setCode}
                    onRunCode={handleRunCode}
                    onSubmitCode={handleSubmitCode}
                    onResetCode={() => {
                      const starter = currentProblem?.starterCode?.[selectedLanguage] || "";
                      setCode(starter);
                    }}
                  />
                </Panel>

                <PanelResizeHandle className="h-1.5 bg-[#333333] hover:bg-[#00b8a3] transition-colors cursor-row-resize select-none" />

                {/* BOTTOM: OUTPUT PANEL */}
                <Panel defaultSize={38} minSize={20} className="h-full overflow-hidden">
                  <OutputPanel
                    output={output}
                    customInput={customInput}
                    onCustomInputChange={setCustomInput}
                    isRunning={isRunning || isSubmitting}
                    sampleCases={currentProblem?.examples?.map((ex, idx) => ({
                      name: `Case ${idx + 1}`,
                      input: ex.input,
                      expected: ex.output,
                    }))}
                  />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        )}
      </main>
    </div>
  );
}

export default ProblemPage;
