import { BriefcaseIcon, CodeIcon, CheckCircle2Icon, SparklesIcon, XIcon } from "lucide-react";
import { useRole } from "../context/roleStore";

function RoleSelectionModal() {
  const { role, selectRole, showRoleModal, setShowRoleModal } = useRole();

  if (!showRoleModal) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
              <SparklesIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-base-content">Choose Your Workspace Mode</h2>
              <p className="text-sm text-base-content/60">
                Tailor your Talent IQ experience like HackerRank. You can change this anytime.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRoleModal(false)}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close modal"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          {/* INTERVIEWER CARD */}
          <div
            onClick={() => selectRole("interviewer")}
            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between ${
              role === "interviewer"
                ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30"
                : "border-base-300 hover:border-primary/50 bg-base-200/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="size-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <BriefcaseIcon className="size-6" />
                </div>
                {role === "interviewer" && (
                  <span className="badge badge-primary gap-1 font-semibold">
                    <CheckCircle2Icon className="size-3.5" /> Selected
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-base-content">Interviewer Mode</h3>
              <p className="text-xs text-base-content/70 mt-1 mb-4 leading-relaxed">
                Host live coding interviews, evaluate candidate solutions, reveal hints, and take private grading notes.
              </p>
            </div>

            <ul className="text-xs space-y-1.5 text-base-content/80 border-t border-base-300/80 pt-3">
              <li className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Create 1-on-1 interview rooms
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Generate Candidate Invite Links
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Solution Rubric & Private Grading
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Reveal step-by-step hints
              </li>
            </ul>

            <button
              onClick={() => selectRole("interviewer")}
              className={`btn btn-sm w-full mt-4 ${
                role === "interviewer" ? "btn-primary" : "btn-outline"
              }`}
            >
              Continue as Interviewer 👔
            </button>
          </div>

          {/* CANDIDATE CARD */}
          <div
            onClick={() => selectRole("candidate")}
            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between ${
              role === "candidate"
                ? "border-secondary bg-secondary/10 shadow-lg ring-2 ring-secondary/30"
                : "border-base-300 hover:border-secondary/50 bg-base-200/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="size-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                  <CodeIcon className="size-6" />
                </div>
                {role === "candidate" && (
                  <span className="badge badge-secondary gap-1 font-semibold">
                    <CheckCircle2Icon className="size-3.5" /> Selected
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-base-content">Candidate Mode</h3>
              <p className="text-xs text-base-content/70 mt-1 mb-4 leading-relaxed">
                Join scheduled interviews, solve algorithmic challenges in real-time, execute code, and communicate with the interviewer.
              </p>
            </div>

            <ul className="text-xs space-y-1.5 text-base-content/80 border-t border-base-300/80 pt-3">
              <li className="flex items-center gap-1.5">
                <span className="text-secondary font-bold">✓</span> Join rooms via invite link or code
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-secondary font-bold">✓</span> Live Monaco code editor
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-secondary font-bold">✓</span> Instant multi-language execution
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-secondary font-bold">✓</span> HD video and in-call chat
              </li>
            </ul>

            <button
              onClick={() => selectRole("candidate")}
              className={`btn btn-sm w-full mt-4 ${
                role === "candidate" ? "btn-secondary" : "btn-outline"
              }`}
            >
              Continue as Candidate 🎓
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-base-content/50">
          💡 You can toggle between Interviewer and Candidate modes anytime using the role badge in the navbar.
        </div>
      </div>
      <div className="modal-backdrop bg-black/60" onClick={() => setShowRoleModal(false)}></div>
    </div>
  );
}

export default RoleSelectionModal;
