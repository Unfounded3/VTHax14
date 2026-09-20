import { useEffect, useRef, useState } from "react";

const PREDEFINED_PROMPTS = [
  "Why is my risk high?",
  "Which commute is hardest?",
  "What does GPA confidence mean?",
  "How can I compare sections?",
] as const;

/**
 * "Ask HokieLens" floating help surface. Non-generative by design (PRD §10.14):
 * this phase has no answers yet, so the prompts are disabled placeholders and
 * there is deliberately no free-text input.
 */
export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      {open ? (
        <div
          role="dialog"
          aria-label="Ask HokieLens"
          className="absolute bottom-full right-0 mb-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-panel p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-primary">Ask HokieLens</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close help panel"
              className="rounded-md p-1 text-ink-secondary hover:text-ink-primary"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Deterministic explanations assembled from your schedule analysis — not a chatbot, and
            no generative AI.
          </p>
          <ul className="mt-3 space-y-2">
            {PREDEFINED_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  disabled
                  title="Answers assemble from your analysis in the insights phase"
                  className="w-full cursor-not-allowed rounded-lg border border-line bg-warm px-3 py-2 text-left text-sm text-ink-primary disabled:opacity-60"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.625rem] text-ink-secondary">
            Answers arrive with the insights phase.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open Ask HokieLens help"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon text-white shadow-lg transition-colors hover:bg-maroon-dark"
      >
        <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor" aria-hidden="true">
          <path d="M16 3 6 7v2h20V7Z" />
          <rect x="8" y="11" width="3.2" height="8" />
          <rect x="14.4" y="11" width="3.2" height="8" />
          <rect x="20.8" y="11" width="3.2" height="8" />
          <rect x="5" y="21" width="22" height="3" />
          <rect x="4" y="26" width="24" height="3" />
        </svg>
      </button>
    </div>
  );
}
