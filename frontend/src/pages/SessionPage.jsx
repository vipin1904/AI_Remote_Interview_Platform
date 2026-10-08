import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  Loader2Icon,
  LogOutIcon,
  PhoneOffIcon,
  UserPlusIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  UserCheckIcon,
  ClockIcon,
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import InterviewerToolsPanel from "../components/InterviewerToolsPanel";
import CandidateProblemPanel from "../components/CandidateProblemPanel";
import InviteCandidateModal from "../components/InviteCandidateModal";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });

    // remove the joinSessionMutation, refetch from dependencies to avoid infinite loop
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM / INTERVIEWER TOOL PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200 flex flex-col">
                  {/* HEADER SECTION - ROLE DIFFERENTIATED */}
                  <div className="p-4 sm:p-5 bg-base-100 border-b border-base-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h1 className="text-xl sm:text-2xl font-black text-base-content">
                            {session?.problem || "Loading..."}
                          </h1>
                          <span
                            className={`badge badge-sm ${getDifficultyBadgeClass(
                              session?.difficulty
                            )}`}
                          >
                            {session?.difficulty
                              ? session.difficulty.slice(0, 1).toUpperCase() + session.difficulty.slice(1)
                              : "Easy"}
                          </span>
                          {/* ROLE BADGE */}
                          {isHost ? (
                            <span className="badge badge-primary badge-sm gap-1 font-bold">
                              <BriefcaseIcon className="size-3" />
                              Interviewer Mode
                            </span>
                          ) : (
                            <span className="badge badge-secondary badge-sm gap-1 font-bold">
                              <GraduationCapIcon className="size-3" />
                              Candidate Mode
                            </span>
                          )}
                        </div>

                        {/* STATUS SUBTITLE */}
                        <div className="flex items-center gap-3 text-xs text-base-content/70 flex-wrap">
                          {isHost ? (
                            <>
                              <span>Host: <strong className="text-base-content">{session?.host?.name || "You"}</strong></span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {session?.participant ? (
                                  <>
                                    <span className="size-2 bg-success rounded-full"></span>
                                    <span className="text-success font-medium">
                                      Candidate: {session.participant.name}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="size-2 bg-warning rounded-full animate-pulse"></span>
                                    <span className="text-warning font-medium">
                                      Waiting for candidate to join
                                    </span>
                                  </>
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>Interviewer: <strong className="text-base-content">{session?.host?.name || "Host"}</strong></span>
                              <span>•</span>
                              <span className="text-success flex items-center gap-1 font-medium">
                                <span className="size-2 bg-success rounded-full"></span>
                                Connected as Candidate
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* HEADER ACTIONS */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isHost && (
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="btn btn-primary btn-outline btn-sm gap-1.5"
                            title="Invite candidate with direct link or code"
                          >
                            <UserPlusIcon className="size-4" />
                            <span className="text-xs">Invite Candidate</span>
                          </button>
                        )}

                        {isHost && session?.status === "active" && (
                          <button
                            onClick={handleEndSession}
                            disabled={endSessionMutation.isPending}
                            className="btn btn-error btn-sm gap-1.5"
                          >
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                              <LogOutIcon className="size-4" />
                            )}
                            <span className="text-xs">End Session</span>
                          </button>
                        )}

                        {!isHost && (
                          <button
                            onClick={() => navigate("/dashboard")}
                            className="btn btn-ghost btn-sm gap-1.5 border border-base-300"
                          >
                            <LogOutIcon className="size-4" />
                            <span className="text-xs">Leave Session</span>
                          </button>
                        )}

                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DEDICATED VIEW PANELS */}
                  <div className="flex-1 overflow-hidden">
                    {isHost ? (
                      <InterviewerToolsPanel
                        problemData={problemData}
                        session={session}
                        sessionId={id}
                      />
                    ) : (
                      <CandidateProblemPanel
                        problemData={problemData}
                        session={session}
                      />
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => setCode(value)}
                      onRunCode={handleRunCode}
                      onResetCode={() => {
                        if (problemData?.starterCode?.[selectedLanguage]) {
                          setCode(problemData.starterCode[selectedLanguage]);
                        }
                      }}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <InviteCandidateModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        sessionId={id}
        session={session}
      />
    </div>
  );
}

export default SessionPage;
