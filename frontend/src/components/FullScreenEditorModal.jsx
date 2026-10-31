import React from "react";
import { X, Loader2Icon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";

function FullScreenEditorModal({
  isOpen,
  onClose,
  selectedLanguage,
  code,
  isRunning,
  isSubmitting,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onSubmitCode,
  onResetCode,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50">
          <h3 className="text-lg font-semibold">Full‑Screen Code Editor</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <CodeEditorPanel
            selectedLanguage={selectedLanguage}
            code={code}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            onLanguageChange={onLanguageChange}
            onCodeChange={onCodeChange}
            onRunCode={onRunCode}
            onSubmitCode={onSubmitCode}
            onResetCode={onResetCode}
          />
        </div>
      </div>
    </div>
  );
}

export default FullScreenEditorModal;
