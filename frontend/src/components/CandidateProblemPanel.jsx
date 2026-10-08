import { HelpCircleIcon, LightbulbIcon, SparklesIcon } from "lucide-react";

function CandidateProblemPanel({ problemData, session }) {
  const revealedHints = session?.revealedHints || [];

  return (
    <div className="h-full overflow-y-auto bg-base-200 p-5 space-y-5">
      {/* REVEALED HINTS BANNER */}
      {revealedHints.length > 0 && problemData?.hints && (
        <div className="bg-warning/10 border-2 border-warning/40 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-warning font-bold text-sm">
            <LightbulbIcon className="size-5" />
            <span>Hint Shared by Interviewer ({revealedHints.length})</span>
          </div>
          <div className="space-y-2 pt-1">
            {revealedHints.map((idx) => (
              <div key={idx} className="bg-base-100/90 rounded-lg p-3 text-xs border border-warning/20">
                <span className="font-bold text-warning mr-1.5">Hint {idx + 1}:</span>
                <span className="text-base-content/90">{problemData.hints[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESCRIPTION */}
      {problemData?.description && (
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-lg font-bold mb-3 text-base-content flex items-center gap-2">
            <span>Problem Description</span>
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-base-content/90">
            <p>{problemData.description.text}</p>
            {problemData.description.notes?.map((note, idx) => (
              <p key={idx} className="text-base-content/80 text-xs italic">
                Note: {note}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* EXAMPLES */}
      {problemData?.examples && problemData.examples.length > 0 && (
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-lg font-bold mb-3 text-base-content">Examples</h2>
          <div className="space-y-3">
            {problemData.examples.map((example, idx) => (
              <div key={idx} className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-xs badge-neutral">Example {idx + 1}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold min-w-[60px]">Input:</span>
                  <span className="text-base-content/90">{example.input}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-secondary font-bold min-w-[60px]">Output:</span>
                  <span className="text-base-content/90">{example.output}</span>
                </div>
                {example.explanation && (
                  <div className="pt-2 border-t border-base-300 mt-2 font-sans text-xs text-base-content/70">
                    <span className="font-semibold">Explanation:</span> {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONSTRAINTS */}
      {problemData?.constraints && problemData.constraints.length > 0 && (
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-lg font-bold mb-3 text-base-content">Constraints</h2>
          <ul className="space-y-1.5 text-xs text-base-content/90">
            {problemData.constraints.map((constraint, idx) => (
              <li key={idx} className="flex gap-2 items-center">
                <span className="text-primary font-bold">•</span>
                <code className="bg-base-200 px-2 py-0.5 rounded font-mono text-xs">
                  {constraint}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CandidateProblemPanel;
