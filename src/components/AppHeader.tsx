import { useEffect, useRef, useState } from "react";

interface AppHeaderProps {
  /** Opens the search drawer on tablet; on desktop the sidebar is always visible. */
  onOpenSearch: () => void;
}

function Monogram() {
  return (
    <svg viewBox="0 0 46 34" className="h-9 w-11 shrink-0" aria-hidden="true">
      <path
        d="M2 7 15.5 32 21 23.5"
        fill="none"
        stroke="var(--color-maroon)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 7h21M33 7v25"
        fill="none"
        stroke="var(--color-vt-orange)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/**
 * Static API-health placeholder. It replaces the prototype's notification bell:
 * there are no notifications, so the bell is intentionally absent. The real
 * green/amber/red status arrives with the `/api/health` hook in a later phase.
 */
function ApiHealthPlaceholder() {
  return (
    <span
      role="status"
      className="hidden items-center gap-2 rounded-full border border-line bg-warm px-3 py-1.5 text-xs font-medium text-ink-secondary sm:inline-flex"
    >
      <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
      API status pending
    </span>
  );
}

function AboutPopover() {
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="About HokieLens"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-sm font-bold text-white transition-colors hover:bg-maroon-dark"
      >
        H
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="About HokieLens"
          className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-line bg-panel p-4 text-sm shadow-lg"
        >
          <p className="font-semibold text-ink-primary">About HokieLens</p>
          <p className="mt-1 text-ink-secondary">
            HokieLens is a student-built planning aid for Virginia Tech course schedules. There are
            no accounts and no registration access — just clearer trade-offs before you register.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function AppHeader({ onOpenSearch }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-panel px-4 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Monogram />
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold uppercase leading-tight tracking-wide text-ink-primary">
            Hokie<span className="text-maroon">Lens</span>
          </p>
          <p className="hidden truncate text-xs text-ink-secondary xs:block sm:block">
            Plan Smarter. Study Happier.
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <label className="relative block w-48 max-w-[44vw] sm:w-72" onClick={onOpenSearch}>
          <span className="sr-only">Search courses</span>
          <SearchIcon />
          <input
            type="search"
            readOnly
            placeholder="Search CS 2104, MATH 2534…"
            title="Course search arrives with the catalog connection"
            className="w-full cursor-pointer rounded-lg border border-line bg-warm py-2 pl-9 pr-3 text-sm placeholder:text-ink-secondary"
          />
        </label>
        <ApiHealthPlaceholder />
        <AboutPopover />
      </div>
    </header>
  );
}
