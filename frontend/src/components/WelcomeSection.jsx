import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, ZapIcon, BriefcaseIcon, CodeIcon, LogInIcon } from "lucide-react";
import { useRole } from "../context/roleStore";

function WelcomeSection({ onCreateSession, onJoinByCode }) {
  const { user } = useUser();
  const { isInterviewer, role, setShowRoleModal } = useRole();

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  isInterviewer
                    ? "bg-gradient-to-br from-primary to-accent"
                    : "bg-gradient-to-br from-secondary to-primary"
                }`}
              >
                {isInterviewer ? <BriefcaseIcon className="w-6 h-6" /> : <CodeIcon className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {user?.firstName ? `Hello, ${user.firstName}!` : "Welcome to Talent IQ!"}
                  </h1>
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className={`badge badge-sm cursor-pointer hover:scale-105 transition-transform ${
                      isInterviewer ? "badge-primary" : "badge-secondary"
                    }`}
                    title="Click to switch workspace mode"
                  >
                    {isInterviewer ? "👔 Interviewer" : "🎓 Candidate"} ▾
                  </button>
                </div>
              </div>
            </div>
            <p className="text-base md:text-xl text-base-content/70 ml-15">
              {isInterviewer
                ? "Conduct structured technical evaluations and assess candidate code in real-time."
                : "Ace your technical interviews — practice algorithmic challenges and join live sessions."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isInterviewer ? (
              <button
                onClick={onCreateSession}
                className="group px-7 py-3.5 bg-gradient-to-r from-primary to-secondary rounded-2xl transition-all duration-200 hover:opacity-90 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-2.5 text-white font-bold text-base">
                  <ZapIcon className="w-5 h-5" />
                  <span>Host Interview Session</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <>
                <button
                  onClick={onJoinByCode}
                  className="group px-7 py-3.5 bg-gradient-to-r from-secondary to-primary rounded-2xl transition-all duration-200 hover:opacity-90 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center gap-2.5 text-white font-bold text-base">
                    <LogInIcon className="w-5 h-5" />
                    <span>Join with Invite Code</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                <button
                  onClick={onCreateSession}
                  className="btn btn-outline btn-md rounded-2xl"
                >
                  <ZapIcon className="w-4 h-4" />
                  Practice Room
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
