import { useState } from "react";
import { CheckIcon, CopyIcon, LinkIcon, KeyRoundIcon, UserCheckIcon, UsersIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

function InviteCandidateModal({ isOpen, onClose, sessionId, session }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}/session/${sessionId}?role=candidate`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success("Candidate invite link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedCode(true);
    toast.success("Session code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isCandidateConnected = !!session?.participant;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg bg-base-100 border border-base-300 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-base-content">Invite Candidate</h3>
              <p className="text-xs text-base-content/60">Share this link or code with the candidate to join</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close">
            <XIcon className="size-4" />
          </button>
        </div>

        {/* CANDIDATE STATUS BANNER */}
        <div className={`alert text-sm mb-4 ${isCandidateConnected ? "alert-success" : "alert-warning"}`}>
          {isCandidateConnected ? (
            <>
              <UserCheckIcon className="size-5" />
              <div>
                <p className="font-semibold">Candidate Connected!</p>
                <p className="text-xs opacity-90">{session.participant.name} ({session.participant.email})</p>
              </div>
            </>
          ) : (
            <>
              <UsersIcon className="size-5" />
              <div>
                <p className="font-semibold">Waiting for Candidate</p>
                <p className="text-xs opacity-90">Send the link below to your candidate so they can join this room.</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {/* DIRECT INVITE URL */}
          <div>
            <label className="label py-1">
              <span className="label-text font-semibold text-xs flex items-center gap-1.5">
                <LinkIcon className="size-3.5 text-primary" />
                Direct Candidate Invite URL
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="input input-bordered input-sm flex-1 font-mono text-xs select-all bg-base-200"
              />
              <button
                onClick={copyLink}
                className="btn btn-primary btn-sm gap-1.5"
              >
                {copiedLink ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* SESSION CODE */}
          <div>
            <label className="label py-1">
              <span className="label-text font-semibold text-xs flex items-center gap-1.5">
                <KeyRoundIcon className="size-3.5 text-secondary" />
                Session Code
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={sessionId}
                className="input input-bordered input-sm flex-1 font-mono text-xs select-all bg-base-200"
              />
              <button
                onClick={copyCode}
                className="btn btn-outline btn-sm gap-1.5"
              >
                {copiedCode ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-action mt-6">
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/60" onClick={onClose}></div>
    </div>
  );
}

export default InviteCandidateModal;
