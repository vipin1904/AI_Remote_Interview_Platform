import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Problem</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <select
              className="select w-full"
              value={roomConfig.problem}
              onChange={(e) => {
                const selectedProblem = problems.find((p) => p.title === e.target.value);
                setRoomConfig({
                  difficulty: selectedProblem.difficulty,
                  problem: e.target.value,
                });
              }}
            >
              <option value="" disabled>
                Choose a coding problem...
              </option>

              {problems.map((problem) => (
                <option key={problem.id} value={problem.title}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* CANDIDATE EMAIL (OPTIONAL) */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Candidate Email or Name (Optional)</span>
              <span className="label-text-alt text-base-content/50">Used to assign session</span>
            </label>
            <input
              type="text"
              placeholder="e.g. candidate@example.com or Jane Doe"
              className="input input-bordered w-full"
              value={roomConfig.candidateEmail || ""}
              onChange={(e) => setRoomConfig({ ...roomConfig, candidateEmail: e.target.value })}
            />
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.problem && (
            <div className="alert alert-info bg-info/10 border-info/30 text-base-content">
              <Code2Icon className="size-5 text-info" />
              <div className="text-sm">
                <p className="font-semibold text-info">Interview Room Config:</p>
                <p>
                  Problem: <span className="font-bold">{roomConfig.problem}</span> ({roomConfig.difficulty})
                </p>
                <p className="text-xs opacity-75 mt-1">
                  A shareable Candidate Invite Link will be generated immediately once the room is created.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
