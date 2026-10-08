import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
  LoaderIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { getDifficultyBadgeClass } from "../lib/utils";
import { useUser } from "@clerk/clerk-react";

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  const { user } = useUser();
  const [copiedId, setCopiedId] = useState(null);

  const copyInviteLink = (sessionId) => {
    const inviteUrl = `${window.location.origin}/session/${sessionId}?role=candidate`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(sessionId);
    toast.success("Candidate invite link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="lg:col-span-2 card bg-base-100 border-2 border-primary/20 hover:border-primary/30 h-full">
      <div className="card-body">
        {/* HEADERS SECTION */}
        <div className="flex items-center justify-between mb-6">
          {/* TITLE AND ICON */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <ZapIcon className="size-5" />
            </div>
            <h2 className="text-2xl font-black">Live Interview Sessions</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-2 bg-success rounded-full" />
            <span className="text-sm font-medium text-success">{sessions.length} active</span>
          </div>
        </div>

        {/* SESSIONS LIST */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoaderIcon className="size-10 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => {
              const isHost = session.host?.clerkId === user?.id;
              const isParticipant = session.participant?.clerkId === user?.id;

              return (
                <div
                  key={session._id}
                  className="card bg-base-200 border-2 border-base-300 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative size-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                        <Code2Icon className="size-7 text-white" />
                        <div className="absolute -top-1 -right-1 size-4 bg-success rounded-full border-2 border-base-100" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-lg truncate">{session.problem}</h3>
                          <span
                            className={`badge badge-sm ${getDifficultyBadgeClass(
                              session.difficulty
                            )}`}
                          >
                            {session.difficulty.slice(0, 1).toUpperCase() +
                              session.difficulty.slice(1)}
                          </span>
                          {isHost && (
                            <span className="badge badge-primary badge-sm gap-1">
                              👔 You're Interviewer
                            </span>
                          )}
                          {isParticipant && (
                            <span className="badge badge-secondary badge-sm gap-1">
                              🎓 You're Candidate
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs sm:text-sm opacity-80 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <CrownIcon className="size-4 text-warning" />
                            <span className="font-medium">
                              Host: {session.host?.name || "Interviewer"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UsersIcon className="size-4" />
                            <span>{session.participant ? "2/2 (Candidate Joined)" : "1/2 (Waiting)"}</span>
                          </div>
                          {session.participant && !isUserInSession(session) ? (
                            <span className="badge badge-error badge-xs">FULL</span>
                          ) : (
                            <span className="badge badge-success badge-xs">OPEN</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isHost && (
                        <button
                          onClick={() => copyInviteLink(session._id)}
                          className="btn btn-ghost btn-sm gap-1.5 border border-base-300"
                          title="Copy direct invite link for the candidate"
                        >
                          {copiedId === session._id ? (
                            <CheckIcon className="size-4 text-success" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                          <span className="text-xs hidden md:inline">
                            {copiedId === session._id ? "Copied" : "Invite Link"}
                          </span>
                        </button>
                      )}

                      {session.participant && !isUserInSession(session) ? (
                        <button className="btn btn-disabled btn-sm">Full</button>
                      ) : (
                        <Link
                          to={`/session/${session._id}`}
                          className={`btn btn-sm gap-2 ${
                            isHost ? "btn-primary" : "btn-secondary"
                          }`}
                        >
                          {isHost
                            ? "Enter 👔"
                            : isParticipant
                            ? "Rejoin 🎓"
                            : "Join as Candidate 🎓"}
                          <ArrowRightIcon className="size-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                <SparklesIcon className="w-10 h-10 text-primary/50" />
              </div>
              <p className="text-lg font-semibold opacity-70 mb-1">No active sessions</p>
              <p className="text-sm opacity-50">Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ActiveSessions;
