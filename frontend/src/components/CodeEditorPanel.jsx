import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { useEffect } from "react";
import { LANGUAGE_CONFIG } from "../data/problems";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onResetCode,
}) {
  // Shortcut: Ctrl+Enter / Cmd+Enter to run code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) onRunCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, onRunCode]);

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage].icon}
            alt={LANGUAGE_CONFIG[selectedLanguage].name}
            className="size-5"
          />
          <select className="select select-bordered select-xs sm:select-sm font-medium" value={selectedLanguage} onChange={onLanguageChange}>
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>

          {onResetCode && (
            <button
              onClick={onResetCode}
              className="btn btn-ghost btn-xs gap-1 opacity-70 hover:opacity-100"
              title="Reset to starter template"
            >
              <RotateCcwIcon className="size-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-base-content/50 hidden md:inline font-mono">
            Ctrl + Enter to run
          </span>
          <button
            className="btn btn-primary btn-sm gap-2 shadow-sm"
            disabled={isRunning}
            onClick={onRunCode}
          >
            {isRunning ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <PlayIcon className="size-4" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}
export default CodeEditorPanel;
