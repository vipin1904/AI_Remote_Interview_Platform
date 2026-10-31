import Editor from "@monaco-editor/react";
import {
  Code2Icon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
  Maximize2Icon,
  Minimize2Icon,
  CheckCircle2Icon,
  CloudUploadIcon,
  TerminalSquareIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { LANGUAGE_CONFIG } from "../data/problems";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  isSubmitting = false,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onResetCode,
  onSubmitCode,
  isFullScreen = false,
  onToggleFullScreen = null,
}) {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const editorRef = useRef(null);

  // Shortcut: Ctrl+Enter to run, Ctrl+Shift+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          if (!isRunning && !isSubmitting && onSubmitCode) onSubmitCode();
        } else {
          if (!isRunning && !isSubmitting && onRunCode) onRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isSubmitting, onRunCode, onSubmitCode]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });
  };

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col font-sans select-text border-b border-[#333333]">
      {/* RICH LEETCODE HEADER BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262626] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          {/* LeetCode </> Code indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00b8a3] px-2.5 py-1 rounded-lg bg-[#1a1a1a] shadow-sm border border-[#383838]">
            <span className="font-mono text-[#00b8a3] font-black">{`</>`}</span>
            <span>Code</span>
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-1.5">
            {LANGUAGE_CONFIG[selectedLanguage]?.icon && (
              <img
                src={LANGUAGE_CONFIG[selectedLanguage].icon}
                alt={LANGUAGE_CONFIG[selectedLanguage].name}
                className="size-4 hidden sm:inline"
              />
            )}
            <select
              className="select select-xs font-medium bg-[#1a1a1a] text-[#eff1f6] text-xs rounded-lg border border-[#383838] focus:border-[#ffa116]"
              value={selectedLanguage}
              onChange={onLanguageChange}
            >
              {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                <option key={key} value={key} className="bg-[#262626] text-[#eff1f6]">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset starter code */}
          {onResetCode && (
            <button
              onClick={onResetCode}
              className="btn btn-ghost btn-xs gap-1 text-[#9ca3af] hover:text-[#eff1f6] text-xs rounded-lg"
              title="Reset to starter template"
            >
              <RotateCcwIcon className="size-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Right side: HackerRank Run Code & Submit Code buttons */}
        <div className="flex items-center gap-2">
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="btn btn-ghost btn-xs btn-square text-[#9ca3af] hover:text-[#eff1f6] rounded-lg"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Code Editor"}
            >
              {isFullScreen ? (
                <Minimize2Icon className="size-3.5" />
              ) : (
                <Maximize2Icon className="size-3.5" />
              )}
            </button>
          )}

          {/* HackerRank Run Code Button */}
          <button
            className="btn btn-xs gap-1.5 font-bold rounded-lg bg-[#333333] hover:bg-[#3d3d3d] text-[#eff1f6] border border-[#444444] shadow-sm"
            disabled={isRunning || isSubmitting}
            onClick={onRunCode}
            title="Run Code against sample test cases (Ctrl + Enter)"
          >
            {isRunning ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <PlayIcon className="size-3 text-[#00b8a3] fill-[#00b8a3]" />
                <span>Run Code</span>
              </>
            )}
          </button>

          {/* HackerRank Submit Code Button */}
          {onSubmitCode && (
            <button
              className="btn btn-xs gap-1.5 font-black text-white rounded-lg shadow-sm bg-[#00ea64] hover:bg-[#00c853] border-none transition-all"
              disabled={isRunning || isSubmitting}
              onClick={onSubmitCode}
              title="Submit Code for score evaluation (Ctrl + Shift + Enter)"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CloudUploadIcon className="size-3.5" />
                  <span>Submit Code</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MONACO CODE EDITOR */}
      <div className="flex-1 relative">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang || "javascript"}
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* FOOTER STATUS BAR */}
      <div className="px-3 py-1 bg-[#262626] border-t border-[#333333] text-[10px] text-[#9ca3af] flex items-center justify-between select-none font-mono">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 bg-[#00b8a3] rounded-full"></span>
          Autosaved • HackerRank / LeetCode Env
        </span>
        <span>
          Ln {cursorPos.line}, Col {cursorPos.col} • Spaces: 2
        </span>
      </div>
    </div>
  );
}

export default CodeEditorPanel;
