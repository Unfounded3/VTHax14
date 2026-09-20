import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalysis } from "../api/hooks";
import { normalizeApiError } from "../api/errors";
import { queryKeys } from "../api/queryKeys";
import { useSchedule } from "../context/ScheduleContext";
import { useSwapWorkbench } from "../context/SwapWorkbenchContext";
import { formatRiskScore, riskBand } from "../lib/risk";
import ErrorState from "./ErrorState";
import Skeleton from "./Skeleton";

export default function RiskOverview() {
  const { crns } = useSchedule();
  const analysis = useAnalysis(crns);
  const queryClient = useQueryClient();
  const { openSwapWorkbench } = useSwapWorkbench();
  const crnsKey = crns.join(",");
  useEffect(() => {
    queryClient.removeQueries({ queryKey: queryKeys.analyze, predicate: (query) => (query.queryKey[1] as string[] | undefined)?.join(",") !== crnsKey });
  }, [crnsKey, queryClient]);

  if (crns.length === 0) return null;
  if (crns.length === 1) return <section aria-label="Schedule risk" className="rounded-xl border border-line bg-panel p-4 shadow-card"><p className="text-sm text-ink-secondary">Add at least one more section to calculate schedule risk.</p></section>;
  if (analysis.isPending) return <section aria-label="Schedule risk" aria-busy="true" className="rounded-xl border border-line bg-panel p-4 shadow-card"><h2 className="text-sm font-semibold text-ink-primary">Analyzing schedule risk…</h2><Skeleton lines={3} /></section>;
  if (analysis.isError) return <section aria-label="Schedule risk" className="rounded-xl border border-line bg-panel p-4 shadow-card"><ErrorState title="Schedule analysis unavailable" error={normalizeApiError(analysis.error)} onRetry={() => void analysis.refetch()} /></section>;
  if (!analysis.data) return null;

  const data = analysis.data;
  const band = riskBand(data.risk_score);
  return (
    <section aria-label="Schedule risk" className="rounded-xl border border-line bg-panel p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Overall schedule risk</p><p className="mt-1 text-sm text-ink-secondary">{band.label} risk · backend analysis across {data.sections.length} selected sections.</p></div>
        <div className="flex items-baseline gap-1.5"><strong className="text-3xl tabular-nums text-ink-primary" data-testid="risk-score">{formatRiskScore(data.risk_score)}</strong><span className="text-xs text-ink-secondary">/ 100</span></div>
      </div>
      <button type="button" data-testid="improve-schedule" onClick={() => openSwapWorkbench()} className="mt-3 rounded-lg border border-maroon/40 bg-soft-maroon px-3 py-2 text-xs font-semibold text-maroon hover:bg-maroon/10">Compare a section swap</button>
    </section>
  );
}
