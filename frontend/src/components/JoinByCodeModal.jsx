import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRightIcon, KeyRoundIcon, LinkIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

function JoinByCodeModal({ isOpen, onClose }) {
  const [codeOrUrl, setCodeOrUrl] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoin = (e) => {
    e.preventDefault();
    if (!codeOrUrl.trim()) {
      toast.error("Please enter a session code or invite link");
      return;
    }

    let sessionId = codeOrUrl.trim();

    // If candidate pasted a full URL like http://localhost:5173/session/68e...
    if (sessionId.includes("/session/")) {
      const match = sessionId.match(/\/session\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        sessionId = match[1];
      }
    }

    onClose();
    navigate(`/session/${sessionId}?role=candidate`);
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md bg-base-100 border border-base-300 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
              <KeyRoundIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-base-content">Join Interview Session</h3>
              <p className="text-xs text-base-content/60">Enter the room code or invite link provided by your interviewer</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close">
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 my-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <LinkIcon className="size-4 text-primary" />
                Session Code or Invite URL
              </span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. 68e8c1b... or paste full invite URL"
              className="input input-bordered w-full font-mono text-sm"
              value={codeOrUrl}
              onChange={(e) => setCodeOrUrl(e.target.value)}
            />
          </div>

          <div className="modal-action mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!codeOrUrl.trim()}
              className="btn btn-secondary gap-2"
            >
              <span>Enter Room</span>
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/60" onClick={onClose}></div>
    </div>
  );
}

export default JoinByCodeModal;
