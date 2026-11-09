import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode, submitCode } from "../lib/piston";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  Loader2Icon,
  LogOutIcon,
  VideoIcon,
  MessageSquareIcon,
  UserPlusIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  ClockIcon,
  FileTextIcon,
  PlayIcon,
  CloudUploadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShuffleIcon,
  SparklesIcon,
  AlertCircleIcon,
  DownloadIcon,
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

import LeetCodeProblemPanel from "../components/LeetCodeProblemPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import FloatingCallAndChat from "../components/FloatingCallAndChat";
import InviteCandidateModal from "../components/InviteCandidateModal";
import ReportModal from "../components/ReportModal";
import useStreamClient from "../hooks/useStreamClient";

function SessionPage() {
  // Responsive layout handling
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [output, setOutput] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);

  // 1-minute countdown after session ends
  const [reportSecondsLeft, setReportSecondsLeft] = useState(null);

  // Session timer (stopwatch)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  // Problem switching logic (HackerRank & LeetCode style)
  const problemKeys = Object.keys(PROBLEMS);
  const initialProblemKey =
    problemKeys.find(
      (k) =>
        PROBLEMS[k].title === session?.problem ||
        k === session?.problem ||
        PROBLEMS[k].id === session?.problem
    ) || "two-sum";

  const [activeProblemKey, setActiveProblemKey] = useState(initialProblemKey);

  useEffect(() => {
    if (session?.problem) {
      const match = problemKeys.find(
        (k) =>
          PROBLEMS[k].title === session.problem ||
          k === session.problem ||
          PROBLEMS[k].id === session.problem
      );
      if (match) setActiveProblemKey(match);
    }
  }, [session?.problem]);

  const problemData = PROBLEMS[activeProblemKey] || PROBLEMS["two-sum"];
  const currentProblemIdx = problemKeys.indexOf(activeProblemKey);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && session?.status !== "completed") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, session?.status]);

  // Format seconds into MM:SS
  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Real-time synchronization of code, test results & problem navigation via Stream Channel
  useEffect(() => {
    if (!channel) return;

    const listener = channel.on((event) => {
      // Don't re-apply events sent by this user
      if (event.user?.id === user?.id) return;

      if (event.type === "code_update") {
        if (event.code !== undefined) setCode(event.code);
        if (event.language !== undefined) setSelectedLanguage(event.language);
      } else if (event.type === "test_result") {
        if (event.output) setOutput(event.output);
      } else if (event.type === "problem_change") {
        if (event.problemKey && PROBLEMS[event.problemKey]) {
          setActiveProblemKey(event.problemKey);
          if (event.starterCode) setCode(event.starterCode);
          if (event.language) setSelectedLanguage(event.language);
          setOutput(null);
          toast.success(`Switched problem to ${PROBLEMS[event.problemKey].title}`);
        }
      }
    });

    return () => {
      if (listener && typeof listener.unsubscribe === "function") {
        listener.unsubscribe();
      }
    };
  }, [channel, user]);

  // Auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // When session completes, start the 1-minute report timer
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed" && reportSecondsLeft === null) {
      setReportSecondsLeft(60);
      setShowReportModal(true);
    }
  }, [session?.status, loadingSession]);

  // Handle 1-minute report countdown timer
  useEffect(() => {
    if (reportSecondsLeft === null || reportSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setReportSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast("Report viewing window completed.", { icon: "⏳" });
          setTimeout(() => navigate("/dashboard"), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reportSecondsLeft, navigate]);

  // Update starter code when problem loads
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage] && !code) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const syncTimeoutRef = useRef(null);
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    // Debounce broadcasting code to peer
    if (channel) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        channel
          .sendEvent({
            type: "code_update",
            code: newCode,
            language: selectedLanguage,
          })
          .catch(() => {});
      }, 350);
    }
  };

  const switchProblem = (key) => {
    setActiveProblemKey(key);
    const newProb = PROBLEMS[key];
    const starter = newProb?.starterCode?.[selectedLanguage] || "";
    setCode(starter);
    setOutput(null);

    if (channel) {
      channel
        .sendEvent({
          type: "problem_change",
          problemKey: key,
          starterCode: starter,
          language: selectedLanguage,
        })
        .catch(() => {});
    }
  };

  const handlePrevProblem = () => {
    const nextIdx = currentProblemIdx > 0 ? currentProblemIdx - 1 : problemKeys.length - 1;
    switchProblem(problemKeys[nextIdx]);
  };

  const handleNextProblem = () => {
    const nextIdx = currentProblemIdx < problemKeys.length - 1 ? currentProblemIdx + 1 : 0;
    switchProblem(problemKeys[nextIdx]);
  };

  const handleRandomProblem = () => {
    const randomIdx = Math.floor(Math.random() * problemKeys.length);
    switchProblem(problemKeys[randomIdx]);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);

    if (channel) {
      channel
        .sendEvent({
          type: "code_update",
          code: starterCode,
          language: newLang,
        })
        .catch(() => {});
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code, problemData?.id, customInput);
    setOutput(result);
    setIsRunning(false);

    if (channel) {
      channel.sendEvent({ type: "test_result", output: result }).catch(() => {});
    }

    if (result.success) {
      toast.success(result.status === "Accepted" ? "Sample test cases passed!" : "Tests executed!");
    } else {
      toast.error(result.status || "Execution failed!");
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setOutput(null);

    const result = await submitCode(selectedLanguage, code, problemData?.id, id);
    setOutput(result);
    setIsSubmitting(false);

    if (channel) {
      channel.sendEvent({ type: "test_result", output: result }).catch(() => {});
    }

    if (result.success && result.status === "Accepted") {
      confetti({ particleCount: 100, spread: 200, origin: { y: 0.6 } });
      toast.success("Submission Accepted! Score: 100.0 🎉");
    } else if (result.status === "Wrong Answer") {
      toast.error(`Tests failed: ${result.passedCount}/${result.totalCount} passed.`);
    } else {
      toast.error(result.status || "Submission failed!");
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this interview session? Both participants will have 60 seconds to review the AI/ML Intelligence Report.")) {
      endSessionMutation.mutate(id, {
        onSuccess: () => {
          setReportSecondsLeft(60);
          setShowReportModal(true);
        },
      });
    }
  };

  return (
    <div className="h-screen bg-[#1a1a1a] text-[#eff1f6] flex flex-col overflow-hidden select-text font-sans">
      {/* 1-MINUTE REPORT BANNER IF SESSION ENDED */}
      {reportSecondsLeft !== null && reportSecondsLeft > 0 && (
        <div className="bg-[#00ea64] text-black px-4 py-2 flex items-center justify-between shadow-lg z-50 text-xs sm:text-sm font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4" />
            <span>
              Session Completed! Your AI & ML Intelligence Report is available for{" "}
              <strong>{reportSecondsLeft} seconds</strong>.
            </span>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-xs bg-black text-[#00ea64] border-none font-black"
          >
            View Report ({reportSecondsLeft}s)
          </button>
        </div>
      )}

      {/* TOP HACKERRANK + LEETCODE HYBRID NAVBAR */}
      <header className="h-12 bg-[#262626] border-b border-[#333333] px-3 flex items-center justify-between select-none z-30">
        {/* Left Section: Brand & Problem Navigation */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group hover:opacity-85 transition-opacity"
          >
            <div className="size-7 rounded-xl bg-gradient-to-br from-[#00ea64] to-[#ffa116] flex items-center justify-center text-black font-black text-xs shadow-sm">
              <SparklesIcon className="size-4" />
            </div>
            <span className="font-black text-sm tracking-wide hidden md:inline bg-gradient-to-r from-[#00ea64] via-[#ffa116] to-[#00b8a3] bg-clip-text text-transparent">
              RemoteInterview
            </span>
          </Link>

          <div className="h-4 w-px bg-[#383838] mx-1 hidden sm:block"></div>

          {/* Problem selector dropdown */}
          <div className="dropdown">
            <label
              tabIndex={0}
              className="btn btn-xs gap-1.5 font-bold text-[#eff1f6] bg-[#1a1a1a] hover:bg-[#333333] text-xs rounded-xl border border-[#383838] shadow-sm"
            >
              <span>{problemData?.title || "Problem List"}</span>
              <ChevronDownIcon className="size-3 opacity-60 text-[#9ca3af]" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-2xl bg-[#262626] rounded-2xl w-60 border border-[#383838] mt-1 max-h-60 overflow-y-auto text-[#eff1f6]"
            >
              <li className="menu-title text-[10px] uppercase font-bold text-[#9ca3af]">
                Select Problem
              </li>
              {problemKeys.map((k) => (
                <li key={k}>
                  <button
                    onClick={() => switchProblem(k)}
                    className={`flex items-center justify-between text-xs py-2 rounded-xl hover:bg-[#333333] ${
                      activeProblemKey === k ? "bg-[#333333] font-bold text-[#00b8a3]" : "text-[#eff1f6]"
                    }`}
                  >
                    <span>{PROBLEMS[k].title}</span>
                    <span className={`badge badge-xs ${getDifficultyBadgeClass(PROBLEMS[k].difficulty)}`}>
                      {PROBLEMS[k].difficulty}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Prev, Next, Shuffle buttons (LeetCode & HackerRank style) */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevProblem}
              className="btn btn-ghost btn-xs btn-square text-[#9ca3af] hover:text-[#eff1f6] rounded-lg"
              title="Previous Problem"
            >
              <ChevronLeftIcon className="size-3.5" />
            </button>
            <button
              onClick={handleNextProblem}
              className="btn btn-ghost btn-xs btn-square text-[#9ca3af] hover:text-[#eff1f6] rounded-lg"
              title="Next Problem"
            >
              <ChevronRightIcon className="size-3.5" />
            </button>
            <button
              onClick={handleRandomProblem}
              className="btn btn-ghost btn-xs btn-square text-[#ffa116] hover:bg-[#ffa116]/10 rounded-lg"
              title="Random Problem"
            >
              <ShuffleIcon className="size-3" />
            </button>
          </div>
        </div>

        {/* Center Section: HackerRank Run Code & Submit Code Buttons */}
        <div className="flex items-center gap-2">
          <button
            className="btn btn-xs gap-1.5 font-bold shadow-sm rounded-lg bg-[#333333] hover:bg-[#3d3d3d] text-[#eff1f6] border border-[#444444]"
            disabled={isRunning || isSubmitting}
            onClick={handleRunCode}
            title="Run Code (Ctrl + Enter)"
          >
            {isRunning ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <PlayIcon className="size-3 text-[#00b8a3] fill-[#00b8a3]" />
            )}
            <span className="hidden sm:inline">Run Code</span>
          </button>

          <button
            className="btn btn-xs gap-1.5 font-black text-white shadow-sm rounded-lg bg-[#00ea64] hover:bg-[#00c853] border-none transition-all"
            disabled={isRunning || isSubmitting}
            onClick={handleSubmitCode}
            title="Submit Code (Ctrl + Shift + Enter)"
          >
            {isSubmitting ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <CloudUploadIcon className="size-3.5" />
            )}
            <span>Submit Code</span>
          </button>
        </div>

        {/* Right Section: CodePair Mode, Timer, Video/Chat Popups, End Session, User */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Pill */}
          {isHost ? (
            <span className="badge badge-sm font-bold gap-1 text-[11px] hidden lg:flex rounded-lg bg-[#00b8a3]/15 text-[#00b8a3] border border-[#00b8a3]/30">
              <BriefcaseIcon className="size-3" />
              Interviewer CodePair
            </span>
          ) : (
            <span className="badge badge-sm font-bold gap-1 text-[11px] hidden lg:flex rounded-lg bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
              <GraduationCapIcon className="size-3" />
              Candidate Mode
            </span>
          )}

          {/* Stopwatch / Session Timer */}
          <div
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="btn btn-xs font-mono text-xs gap-1 text-[#eff1f6] bg-[#1a1a1a] hover:bg-[#333333] cursor-pointer rounded-lg border border-[#383838]"
            title="Click to pause/resume timer"
          >
            <ClockIcon className="size-3 text-[#00ea64]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Floating Video Call popup toggle pill */}
          <button
            onClick={() => setShowFloatingWidget(true)}
            className={`btn btn-xs gap-1.5 font-bold rounded-lg border-none shadow-sm ${
              showFloatingWidget
                ? "bg-[#00b8a3] text-black hover:bg-[#00a38f]"
                : "bg-[#1a1a1a] text-[#00b8a3] border border-[#00b8a3]/40 hover:bg-[#00b8a3]/15"
            }`}
            title="Open/Show Video Call & Chat"
          >
            <VideoIcon className="size-3.5" />
            <span className="hidden md:inline">Video & Chat</span>
            <span className="size-2 bg-white rounded-full animate-pulse"></span>
          </button>

          {/* AI Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-ghost btn-xs gap-1 text-[#ffa116] hover:bg-[#ffa116]/15 rounded-lg"
            title="View AI & ML Interview Intelligence Report"
          >
            <FileTextIcon className="size-3.5" />
            <span className="hidden xl:inline">AI Report</span>
          </button>

          {/* Invite Candidate button for host */}
          {isHost && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-ghost btn-xs btn-square text-[#00b8a3] hover:bg-[#00b8a3]/15 rounded-lg"
              title="Invite Candidate"
            >
              <UserPlusIcon className="size-3.5" />
            </button>
          )}

          {/* End Session button */}
          {isHost ? (
            <button
              onClick={handleEndSession}
              disabled={endSessionMutation.isPending}
              className="btn btn-xs gap-1 font-semibold text-white bg-[#ff375f] hover:bg-[#e03153] border-none rounded-lg"
            >
              {endSessionMutation.isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <LogOutIcon className="size-3.5" />
              )}
              <span className="hidden sm:inline">End Session</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-ghost btn-xs gap-1 text-[#9ca3af] hover:text-[#eff1f6] rounded-lg"
            >
              <LogOutIcon className="size-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}

          {/* User Button */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* MAIN WORKSPACE - 100% SCREEN VIEWPORT */}
      <main className="flex-1 overflow-hidden relative">
        {/* Responsive layout: stack panels on mobile, side-by-side on larger screens */}
{isMobile ? (
  <div className="flex flex-col h-full">
    {/* LEFT PANEL */}
    <div className="h-1/2 overflow-hidden border-b border-[#383838]">
      <LeetCodeProblemPanel
        problemData={problemData}
        session={session}
        isHost={isHost}
        sessionId={id}
        attempts={[]}
      />
    </div>
    {/* RIGHT PANEL */}
    <div className="flex-1 overflow-hidden">
      <PanelGroup direction="vertical">
        <Panel defaultSize={62} minSize={25}>
          <CodeEditorPanel
            selectedLanguage={selectedLanguage}
            code={code}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            onLanguageChange={handleLanguageChange}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onSubmitCode={handleSubmitCode}
            onResetCode={() => {
              if (problemData?.starterCode?.[selectedLanguage]) {
                handleCodeChange(problemData.starterCode[selectedLanguage]);
              }
            }}
          />
        </Panel>
        <PanelResizeHandle className="h-1.5 bg-[#333333] hover:bg-[#00b8a3] transition-colors cursor-row-resize select-none" />
        <Panel defaultSize={38} minSize={20}>
          <OutputPanel
            output={output}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            isRunning={isRunning || isSubmitting}
            sampleCases={problemData?.examples?.map((ex, idx) => ({
              name: `Sample Case ${idx}`,
              input: ex.input,
              expected: ex.output,
            }))}
          />
        </Panel>
      </PanelGroup>
    </div>
  </div>
) : (
  <PanelGroup direction="horizontal">
    {/* LEFT PANEL - PROBLEM DETAILS, RUBRIC & TABS */}
    <Panel defaultSize={42} minSize={25} className="h-full overflow-hidden">
      <LeetCodeProblemPanel
        problemData={problemData}
        session={session}
        isHost={isHost}
        sessionId={id}
        attempts={[]}
      />
    </Panel>
    <PanelResizeHandle className="w-1.5 bg-[#333333] hover:bg-[#00b8a3] transition-colors cursor-col-resize select-none" />
    {/* RIGHT PANEL - CODE EDITOR & TESTCASES */}
    <Panel defaultSize={58} minSize={30} className="h-full overflow-hidden">
      <PanelGroup direction="vertical">
        <Panel defaultSize={62} minSize={25}>
          <CodeEditorPanel
            selectedLanguage={selectedLanguage}
            code={code}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            onLanguageChange={handleLanguageChange}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onSubmitCode={handleSubmitCode}
            onResetCode={() => {
              if (problemData?.starterCode?.[selectedLanguage]) {
                handleCodeChange(problemData.starterCode[selectedLanguage]);
              }
            }}
          />
        </Panel>
        <PanelResizeHandle className="h-1.5 bg-[#333333] hover:bg-[#00b8a3] transition-colors cursor-row-resize select-none" />
        <Panel defaultSize={38} minSize={20}>
          <OutputPanel
            output={output}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            isRunning={isRunning || isSubmitting}
            sampleCases={problemData?.examples?.map((ex, idx) => ({
              name: `Sample Case ${idx}`,
              input: ex.input,
              expected: ex.output,
            }))}
          />
        </Panel>
      </PanelGroup>
    </Panel>
  </PanelGroup>
)}
        {/* FLOATING POPUP VIDEO CALL & CHAT (TOP-RIGHT WITH SIZE CONTROLS) */}
        <FloatingCallAndChat
          isOpen={showFloatingWidget}
          onClose={() => setShowFloatingWidget(false)}
          call={call}
          streamClient={streamClient}
          chatClient={chatClient}
          channel={channel}
          isInitializingCall={isInitializingCall}
          session={session}
        />
      </main>

      {/* MODALS */}
      <InviteCandidateModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        sessionId={id}
        session={session}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        sessionId={id}
        isInterviewer={isHost}
      />
    </div>
  );
}

export default SessionPage;
