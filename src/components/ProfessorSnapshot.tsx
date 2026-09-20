import { useState } from "react";
import { useProfessorVibes } from "../api/hooks";
import { ApiError, normalizeApiError } from "../api/errors";
import { confidenceLabel, formatOneDecimal } from "../lib/risk";
import { instructorSurname } from "../lib/instructors";
import { useProfessorDrawer } from "../context/ProfessorDrawerContext";

interface Props { names: string[]; }

function Snapshot({ name }: { name: string }) {
  const surname = instructorSurname(name);
  const [expanded, setExpanded] = useState(false);
  const query = useProfessorVibes(expanded && surname ? surname : "");

  if (!surname) return <p className="text-xs text-ink-secondary">No instructor data found.</p>;

  return (
    <div className="mt-2 rounded-lg border border-line bg-warm/60 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-primary">{name}</p>
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="rounded-md border border-line bg-panel px-2 py-1 text-[0.6875rem] font-semibold text-ink-primary hover:bg-soft-maroon">
          {expanded ? "Hide snapshot" : "View professor snapshot"}
        </button>
      </div>
      {expanded ? (
        query.isPending ? <p className="mt-2 text-xs text-ink-secondary" aria-busy="true">Loading professor summary…</p> :
        query.isError ? (
          <p className="mt-2 text-xs text-ink-secondary">{query.error instanceof ApiError && query.error.status === 404 ? "No instructor data found." : normalizeApiError(query.error).message}</p>
        ) : query.data ? (
          <div className="mt-2">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[0.6875rem]">
              {query.data.rmp ? <>
                <div><dt className="text-ink-secondary">RMP</dt><dd className="font-semibold text-ink-primary">{formatOneDecimal(query.data.rmp.score)}</dd></div>
                <div><dt className="text-ink-secondary">Difficulty</dt><dd className="font-semibold text-ink-primary">{formatOneDecimal(query.data.rmp.difficulty)}</dd></div>
                <div><dt className="text-ink-secondary">Reviews</dt><dd className="font-semibold text-ink-primary">{query.data.rmp.n_reviews}</dd></div>
                <div><dt className="text-ink-secondary">Would take again</dt><dd className="font-semibold text-ink-primary">{query.data.rmp.would_take_again === null ? "Not available" : `${formatOneDecimal(query.data.rmp.would_take_again)}%`}</dd></div>
              </> : <div className="col-span-2 text-ink-secondary">No review summary available</div>}
            </dl>
            {query.data.tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{query.data.tags.map((tag) => <span key={tag} className="rounded-full border border-line bg-panel px-1.5 py-0.5 text-[0.625rem] text-ink-primary">{tag}</span>)}</div> : null}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[0.625rem] text-ink-secondary">Confidence: {confidenceLabel(query.data.confidence)}</span>
              <ProfessorDetailsButton surname={surname} displayName={name} />
            </div>
          </div>
        ) : null
      ) : null}
    </div>
  );
}

function ProfessorDetailsButton({ surname, displayName }: { surname: string; displayName: string }) {
  const { openProfessor } = useProfessorDrawer();
  return <button type="button" onClick={(event) => openProfessor({ surname, displayName }, event.currentTarget)} className="rounded-md px-2 py-1 text-[0.6875rem] font-semibold text-maroon underline underline-offset-2 hover:text-maroon-dark">View professor details</button>;
}

export default function ProfessorSnapshot({ names }: Props) {
  const valid = names.filter((name) => Boolean(instructorSurname(name)));
  if (valid.length === 0) return <p className="mt-1 text-xs text-ink-secondary">No instructor data found.</p>;
  return (
    <div data-testid="professor-snapshot">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-secondary">Professor snapshot</p>
      <div className="space-y-1.5">{valid.map((name) => <Snapshot key={name} name={name} />)}</div>
    </div>
  );
}
