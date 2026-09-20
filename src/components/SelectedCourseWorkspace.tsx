import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalysis } from "../api/hooks";
import { normalizeApiError } from "../api/errors";
import { queryKeys } from "../api/queryKeys";
import { useSchedule } from "../context/ScheduleContext";
import { formatRiskScore, riskBand } from "../lib/risk";
import { formatWeekdayShort } from "../lib/time";
import ErrorState from "./ErrorState";
import ExpectedGpa from "./ExpectedGpa";
import ProfessorSnapshot from "./ProfessorSnapshot";
import Skeleton from "./Skeleton";

export default function SelectedCourseWorkspace() {
  const { crns, selectedSections } = useSchedule();
  const analysis = useAnalysis(crns);
  const queryClient = useQueryClient();
  const crnsKey = crns.join(",");
  useEffect(() => {
    queryClient.removeQueries({
      queryKey: queryKeys.analyze,
      predicate: (query) => (query.queryKey[1] as string[] | undefined)?.join(",") !== crnsKey,
    });
  }, [crnsKey, queryClient]);

  if (crns.length === 0) return null;

  if (analysis.isPending) {
    return <section aria-label="Selected courses" className="space-y-3 rounded-2xl border border-line bg-panel p-5 shadow-card"><h2 className="text-lg font-semibold text-ink-primary">Selected courses</h2><Skeleton lines={6} /></section>;
  }

  if (analysis.isError) {
    return <section aria-label="Selected courses" className="space-y-4 rounded-2xl border border-line bg-panel p-5 shadow-card"><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">Selected courses</p><h2 className="mt-1 text-xl font-bold text-ink-primary">Your schedule</h2></header><ErrorState title="Schedule analysis unavailable" error={normalizeApiError(analysis.error)} onRetry={() => void analysis.refetch()} /><CourseCards sections={selectedSections} warnings={[]} /></section>;
  }

  if (!analysis.data) return null;
  const data = analysis.data;
  const band = riskBand(data.risk_score);

  return (
    <section aria-label="Selected courses" className="space-y-4 rounded-2xl border border-line bg-panel p-5 shadow-card">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">Selected courses</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-primary">{crns.length} section{crns.length === 1 ? "" : "s"}</h2></div>
        <div className="rounded-xl border border-line bg-warm px-3 py-2" data-testid="risk-summary">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-secondary">Schedule risk</span>
          <div className="mt-0.5 flex items-baseline gap-1.5"><strong className="text-2xl tabular-nums text-ink-primary" data-testid="risk-score">{formatRiskScore(data.risk_score)}</strong><span className="text-xs text-ink-secondary">/ 100 · {band.label}</span></div>
        </div>
      </header>
      <p className="text-sm text-ink-secondary">Overall schedule risk from the backend analysis. Course labels below only identify sections the backend marked as contributing; no per-course score is inferred.</p>
      <CourseCards sections={selectedSections} warnings={data.commute_warnings} factors={data.factors} />
      <CommuteSummary warnings={data.commute_warnings} />
      <ExpectedGpa expectedGpa={data.expected_gpa} />
    </section>
  );
}

function CourseCards({ sections, warnings, factors = [] }: { sections: import("../api/types").Section[]; warnings: import("../api/types").CommuteWarning[]; factors?: import("../api/types").RiskFactor[] }) {
  return <div className="space-y-3">
    {sections.map((section) => {
      const details = factors.filter((factor) => factor.affected_crns.includes(section.crn)).map((factor) => factor.detail);
      const relevantWarnings = warnings.filter((warning) => warning.from.crn === section.crn || warning.to.crn === section.crn);
      return <article key={section.crn} className="rounded-xl border border-line bg-warm/30 p-3" data-testid={`selected-course-${section.crn}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><p className="font-mono text-xs text-ink-secondary">CRN {section.crn}</p><h3 className="mt-0.5 text-base font-semibold text-ink-primary">{section.course_id} · {section.title}</h3><p className="mt-1 text-xs text-ink-secondary">{section.credits} credits · {section.meetings.length > 0 ? section.meetings.map((m) => `${formatWeekdayShort(m.days[0] ?? "M")} ${m.start_min}–${m.end_min}`).join(" · ") : "No scheduled meetings"}</p></div>
        </div>
        <div className="mt-3"><ProfessorSnapshot names={section.instructor_names} /></div>
        {details.length > 0 ? <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-2.5 text-xs text-ink-primary" role="note"><p className="font-semibold">⚠ Contributes to schedule risk</p>{details.map((detail, index) => <p key={`${section.crn}-risk-${index}`} className="mt-1 text-ink-secondary">{detail}</p>)}</div> : null}
        {relevantWarnings.length > 0 ? <div className="mt-3 space-y-2">{relevantWarnings.map((warning, index) => <div key={`${warning.day}-${warning.from.crn}-${warning.to.crn}-${index}`} className="rounded-lg border border-danger/40 bg-danger/5 p-2.5 text-xs" role="alert"><p className="font-semibold text-ink-primary">⚠ {formatWeekdayShort(warning.day)} · {warning.from.crn} ({warning.from.building}) → {warning.to.crn} ({warning.to.building})</p><p className="mt-1 text-ink-secondary">From {warning.from.building} at {warning.from.ends} → {warning.to.building} at {warning.to.starts}</p><dl className="mt-2 grid grid-cols-3 gap-2"><div><dt className="text-ink-secondary">Walk</dt><dd className="font-semibold text-ink-primary">{warning.walk_min} min</dd></div><div><dt className="text-ink-secondary">Gap</dt><dd className="font-semibold text-ink-primary">{warning.gap_min} min</dd></div><div><dt className="text-ink-secondary">Verdict</dt><dd className="font-semibold text-ink-primary">{warning.verdict}</dd></div></dl><p className="mt-1 text-ink-secondary">{warning.detail}</p></div>)}</div> : null}
      </article>;
    })}
  </div>;
}

function CommuteSummary({ warnings }: { warnings: import("../api/types").CommuteWarning[] }) {
  if (warnings.length === 0) return null;
  return <section aria-label="Commute warnings" className="rounded-xl border border-line bg-warm p-3"><h3 className="text-sm font-semibold text-ink-primary">Walking transitions</h3><ul className="mt-2 space-y-2">{warnings.map((warning, index) => <li key={`${warning.day}-${warning.from.crn}-${warning.to.crn}-summary-${index}`} className="text-xs text-ink-secondary"><strong className="text-ink-primary">{formatWeekdayShort(warning.day)} · {warning.from.crn} ({warning.from.building}) → {warning.to.crn} ({warning.to.building})</strong> · {warning.walk_min} min walk · {warning.gap_min} min gap · {warning.verdict}. {warning.detail}</li>)}</ul></section>;
}
