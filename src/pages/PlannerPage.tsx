import { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import HelpButton from "../components/HelpButton";
import CenterPanel from "../components/CenterPanel";
import SearchSidebar from "../components/SearchSidebar";
import EmptyState from "../components/EmptyState";
import CampusMap from "../components/CampusMap";
import PrintSchedule from "../components/PrintSchedule";
import WeeklyCalendar from "../components/WeeklyCalendar";
import { CourseSearchProvider } from "../context/CourseSearchContext";
import { MapSelectionProvider } from "../context/MapSelectionContext";
import { ProfessorDrawerProvider } from "../context/ProfessorDrawerContext";
import { ScheduleProvider } from "../context/ScheduleContext";
import { SwapWorkbenchProvider } from "../context/SwapWorkbenchContext";
import { ToastProvider } from "../context/ToastContext";

type MobileView = "search" | "schedule";
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function Disclaimers() {
  return <footer className="border-t border-line bg-panel px-4 py-3 text-center text-xs text-ink-secondary">HokieLens is a student-built planning tool and is not an official Virginia Tech registration service.</footer>;
}

export default function PlannerPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("schedule");
  const searchDrawerRef = useRef<HTMLDivElement>(null);
  const searchCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    searchCloseRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setSearchOpen(false); return; }
      if (event.key !== "Tab") return;
      const drawer = searchDrawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0]!, last = focusable[focusable.length - 1]!;
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previous?.focus?.(); };
  }, [searchOpen]);

  return (
    <ScheduleProvider>
      <CourseSearchProvider>
        <MapSelectionProvider>
          <SwapWorkbenchProvider>
            <ProfessorDrawerProvider>
              <ToastProvider>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-panel focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-maroon focus:shadow-lg">Skip to main content</a>
                <div className="print:hidden flex min-h-dvh flex-col bg-warm text-ink-primary">
                  <AppHeader />
                  <main id="main-content" className="flex-1">
                    <div className="mx-auto hidden max-w-[1800px] lg:grid lg:h-[calc(100dvh-4rem-2.75rem)] lg:grid-cols-[290px_minmax(0,1.2fr)_minmax(0,.8fr)] lg:gap-5 lg:px-6 lg:py-5 xl:px-8">
                      <aside className="min-h-0 overflow-hidden"><SearchSidebar showResults={false} /></aside>
                      <div className="min-h-0 space-y-5 overflow-y-auto pr-1 hl-scroll"><CenterPanel /></div>
                      <div className="min-h-0 space-y-5 overflow-y-auto hl-scroll"><WeeklyCalendar showDemoPicker /><CampusMap /></div>
                    </div>
                    <div className="mx-auto hidden max-w-6xl space-y-5 px-5 py-5 md:block lg:hidden">
                      <CenterPanel />
                      <div className="grid gap-5 md:grid-cols-2"><WeeklyCalendar showDemoPicker /><CampusMap /></div>
                    </div>
                    <div className="space-y-4 px-4 py-4 pb-28 md:hidden">
                      {mobileView === "search" ? <SearchSidebar /> : <><CenterPanel /><WeeklyCalendar showDemoPicker /><CampusMap /></>}
                    </div>
                  </main>
                  <Disclaimers />
                  {searchOpen ? (
                    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Course search">
                      <button type="button" aria-label="Close course search" className="absolute inset-0 h-full w-full bg-ink-primary/40" onClick={() => setSearchOpen(false)} />
                      <aside ref={searchDrawerRef} className="relative h-full w-80 max-w-[85vw] overflow-y-auto border-r border-line bg-warm p-3 shadow-2xl hl-scroll">
                        <SearchSidebar />
                        <button ref={searchCloseRef} type="button" onClick={() => setSearchOpen(false)} className="absolute right-5 top-5 rounded-md bg-panel p-2 text-ink-secondary shadow hover:text-ink-primary" aria-label="Close search drawer">×</button>
                      </aside>
                    </div>
                  ) : null}
                  <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-line bg-panel md:hidden">
                    <button type="button" aria-pressed={mobileView === "search"} onClick={() => setMobileView("search")} className={mobileView === "search" ? "bg-soft-maroon px-3 py-3 text-xs font-semibold text-maroon" : "px-3 py-3 text-xs font-semibold text-ink-secondary"}>Search</button>
                    <button type="button" aria-pressed={mobileView === "schedule"} onClick={() => setMobileView("schedule")} className={mobileView === "schedule" ? "bg-soft-maroon px-3 py-3 text-xs font-semibold text-maroon" : "px-3 py-3 text-xs font-semibold text-ink-secondary"}>Schedule</button>
                  </nav>
                  <HelpButton />
                </div>
                <PrintSchedule />
              </ToastProvider>
            </ProfessorDrawerProvider>
          </SwapWorkbenchProvider>
        </MapSelectionProvider>
      </CourseSearchProvider>
    </ScheduleProvider>
  );
}
