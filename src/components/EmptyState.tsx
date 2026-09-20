const STEPS = [
  {
    title: "Search",
    body: "Find sections in the catalog for the courses you are weighing.",
  },
  {
    title: "Add",
    body: "Add candidate sections and watch conflicts surface immediately.",
  },
  {
    title: "Analyze",
    body: "Read the risk score, walking gaps, and grade history before you commit.",
  },
] as const;

const DEMO_PLACEHOLDERS = [
  "Balanced schedule",
  "The wall of pain",
  "Swap demo",
] as const;

/**
 * Empty-schedule guidance (PRD §11.2). Demo buttons are intentionally disabled:
 * real demo CRNs must come from `GET /api/demo/schedules` — never hardcoded here.
 */
export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-line bg-warm px-4 py-3"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon text-xs font-bold text-white">
                {index + 1}
              </span>
              {step.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
          Or start from a demo schedule
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_PLACEHOLDERS.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              title="Demo schedules load from the API in a later phase"
              className="cursor-not-allowed rounded-lg border border-maroon/40 bg-soft-maroon px-3.5 py-2 text-sm font-medium text-maroon disabled:opacity-60"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-secondary">
          Demo schedules load from the API in a later phase.
        </p>
      </div>
    </div>
  );
}
