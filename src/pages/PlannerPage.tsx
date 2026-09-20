import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import HelpButton from "../components/HelpButton";
import HeroPanel from "../components/HeroPanel";
import SearchSidebar from "../components/SearchSidebar";
import EmptyState from "../components/EmptyState";
import { CampusMapPanel, WeeklySchedulePanel } from "../components/PlaceholderPanels";
import { ScheduleProvider } from "../context/ScheduleContext";

type MobileView = "search" | "schedule" | "insights";

const MOBILE_TABS: { id: MobileView; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "schedule", label: "Schedule" },
  { id: "insights", label: "Insights" },
];

function Disclaimers() {
  return (
    <footer className="border-t border-line bg-panel px-4 py-3 text-center text-xs text-ink-secondary">
      HokieLens is a student-built planning tool and is not an official Virginia Tech registration
      service.
    </footer>
  );
}

/** Insights placeholder shown on mobile until the analyze phase lands. */
function InsightsPlaceholder() {
  return (
    <section
      aria-label="Schedule insights"
      className="rounded-2xl border border-line bg-panel p-5"
    >
      <h2 className="text-base font-semibold text-ink-primary">Insights</h2>
      <p className="mt-1 text-sm text-ink-secondary">
        Risk score, factor breakdown, commute warnings, and expected GPA appear here once you build
        a schedule — the backend analysis connection arrives with the analyze phase.
      </p>
    </section>
  );
}

/**
 * Single-page planning workspace shell.
 * - Desktop (≥1200px): three columns — search sidebar, hero/selection, workspace.
 * - Tablet (768–1199px): search becomes an off-canvas drawer; workspace stays.
 * - Mobile (<768px): single column with bottom Search / Schedule / Insights nav.
 * All regions are static this phase: no API calls, selection, or analysis.
 */
export default function PlannerPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("schedule");

  // Close the drawer on Escape (keyboard users; PRD §12.1).
  useEffect(() => {
    if (!searchOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  return (
    <ScheduleProvider>
      <div className="flex min-h-dvh flex-col bg-warm text-ink-primary">
        <AppHeader onOpenSearch={() => setSearchOpen(true)} />

      <main className="flex-1">
        {/* Desktop three-column shell */}
        <div className="mx-auto hidden max-w-[1800px] lg:grid lg:h-[calc(100dvh-4rem-2.75rem)] lg:grid-cols-[290px_minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-5 lg:px-6 lg:py-5 xl:px-8">
          <aside className="min-h-0 overflow-hidden">
            <SearchSidebar />
          </aside>
          <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
            <HeroPanel />
            <EmptyState />
          </div>
          <div className="min-h-0 space-y-5 overflow-y-auto">
            <CampusMapPanel />
            <WeeklySchedulePanel />
          </div>
        </div>

        {/* Tablet: compact hero banner + workspace; search lives in the drawer */}
        <div className="mx-auto hidden max-w-6xl space-y-5 px-5 py-5 md:block lg:hidden">
          <HeroPanel compact />
          <div className="grid gap-5 md:grid-cols-2">
            <CampusMapPanel />
            <WeeklySchedulePanel />
          </div>
          <EmptyState />
        </div>

        {/* Mobile: single column driven by the bottom nav */}
        <div className="space-y-4 px-4 py-4 pb-28 md:hidden">
          {mobileView === "search" ? <SearchSidebar /> : null}
          {mobileView === "schedule" ? (
            <>
              <HeroPanel compact />
              <WeeklySchedulePanel />
            </>
          ) : null}
          {mobileView === "insights" ? (
            <>
              <InsightsPlaceholder />
              <EmptyState />
            </>
          ) : null}
        </div>
      </main>

      <Disclaimers />

      {/* Tablet search drawer (off-canvas; hidden at desktop where the sidebar is visible) */}
      {searchOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Course search">
          <button
            type="button"
            aria-label="Close course search"
            className="absolute inset-0 h-full w-full bg-ink-primary/40"
            onClick={() => setSearchOpen(false)}
          />
          <aside className="relative h-full w-80 max-w-[85vw] overflow-y-auto bg-warm p-3 shadow-2xl">
            <SearchSidebar />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-5 top-5 rounded-md bg-panel p-2 text-ink-secondary shadow hover:text-ink-primary"
              aria-label="Close search drawer"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </aside>
        </div>
      ) : null}

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-panel md:hidden"
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={mobileView === tab.id}
            onClick={() => setMobileView(tab.id)}
            className={`px-3 py-3 text-xs font-semibold ${
              mobileView === tab.id
                ? "bg-soft-maroon text-maroon"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <HelpButton />
      </div>
    </ScheduleProvider>
  );
}
