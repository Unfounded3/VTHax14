import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ApiError } from "../api/errors";
import { useCoursesSearch, useHealth } from "../api/hooks";
import { useSchedule } from "../context/ScheduleContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  COURSE_LEVELS,
  collectSubjects,
  filterCourses,
  type CourseLevel,
} from "../lib/courses";
import { MAX_CRNS } from "../lib/schedule";
import CourseResults from "./CourseResults";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-primary">
      {children}
    </label>
  );
}

interface ToggleProps {
  id: string;
  label: string;
  helper?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}

function Toggle({ id, label, helper, checked = false, disabled = false, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink-primary">
          {label}
        </label>
        {helper ? <p className="text-xs text-ink-secondary">{helper}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
          checked ? "border-maroon bg-maroon" : "border-line bg-line/70"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          aria-hidden="true"
          className={`h-5 w-5 rounded-full bg-panel shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Course search sidebar.
 *
 * Uses only the documented `q`, `subject`, and `limit` parameters. Course-level
 * and open-seat filters are client-side. Selection is URL-backed via
 * `useSchedule`. Analysis is intentionally not requested here: a later phase
 * owns `POST /api/analyze` for schedules with at least two sections.
 */
export default function SearchSidebar() {
  const { crns, addSection, removeCrn, clear, isFull, registerSections } = useSchedule();
  const health = useHealth();

  const [text, setText] = useState("");
  const debouncedText = useDebouncedValue(text, 250);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  // Auto-search at two characters; an explicit submit (including an empty one,
  // which requests the first 20 groups) takes precedence.
  const activeQuery =
    submittedQuery !== null
      ? submittedQuery
      : debouncedText.trim().length >= 2
        ? debouncedText.trim()
        : null;

  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState<CourseLevel | "all">("all");
  const [openOnly, setOpenOnly] = useState(false);

  const params = useMemo(
    () => ({
      q: activeQuery ?? undefined,
      subject: subject === "all" ? undefined : subject,
      limit: 20,
    }),
    [activeQuery, subject],
  );

  const search = useCoursesSearch(params);

  // Accumulate subjects seen so far so options stay stable as filters narrow results.
  const [subjects, setSubjects] = useState<string[]>([]);
  useEffect(() => {
    if (!search.data) return;
    setSubjects((previous) => {
      const next = new Set(previous);
      for (const value of collectSubjects(search.data.courses)) next.add(value);
      return Array.from(next).sort();
    });
  }, [search.data]);

  // Hydrate the section cache for selected CRNs whenever search results happen
  // to include full documented Section objects. This is the only place selected
  // details become available; no section-by-CRN endpoint exists.
  useEffect(() => {
    if (!search.data) return;
    const selected = new Set(crns);
    const available = search.data.courses
      .flatMap((group) => group.sections)
      .filter((section) => selected.has(section.crn));
    if (available.length > 0) registerSections(available);
  }, [search.data, crns, registerSections]);

  const filteredCourses = useMemo(
    () =>
      filterCourses(search.data?.courses ?? [], {
        level: level === "all" ? null : level,
        openOnly,
      }),
    [search.data, level, openOnly],
  );

  const hasFilters = subject !== "all" || level !== "all" || openOnly;
  const errorMessage = search.isError
    ? search.error instanceof ApiError
      ? search.error.message
      : "The course catalog did not respond."
    : undefined;
  const termLabel = health.data?.term_id ?? (health.isError ? "Term unavailable" : "Loading term…");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(text.trim());
  }

  function handleClearFilters() {
    setText("");
    setSubmittedQuery(null);
    setSubject("all");
    setLevel("all");
    setOpenOnly(false);
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-panel">
      <div className="border-b border-line p-4">
        <p className="flex items-center gap-2 rounded-lg bg-maroon px-3 py-2 text-sm font-semibold text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Search &amp; Plan
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <form onSubmit={handleSubmit}>
          <FieldLabel htmlFor="sb-search">Search for a course</FieldLabel>
          <input
            id="sb-search"
            type="search"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSubmittedQuery(null);
            }}
            placeholder="e.g., CS 2104, MATH 2534"
            className="mt-1.5 w-full rounded-lg border border-line bg-warm px-3 py-2 text-sm placeholder:text-ink-secondary"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-maroon px-4 py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark"
          >
            Search Classes
          </button>
        </form>

        <div>
          <FieldLabel htmlFor="sb-term">Term</FieldLabel>
          <select
            id="sb-term"
            disabled
            title="Term comes from /api/health and is display-only."
            className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink-secondary disabled:opacity-70"
          >
            <option>{termLabel}</option>
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="sb-subject">Subject</FieldLabel>
          <select
            id="sb-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink-primary"
          >
            <option value="all">All subjects</option>
            {subjects.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="sb-level">Course level</FieldLabel>
          <select
            id="sb-level"
            value={level}
            onChange={(event) =>
              setLevel(event.target.value === "all" ? "all" : (Number(event.target.value) as CourseLevel))
            }
            className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink-primary"
          >
            <option value="all">All levels</option>
            {COURSE_LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-line">
          <Toggle
            id="sb-open"
            label="Only open classes"
            helper="Client-side filter"
            checked={openOnly}
            onChange={setOpenOnly}
          />
          <Toggle
            id="sb-major"
            label="Only major requirements"
            helper="Requires degree audit data"
            disabled
          />
        </div>

        <details className="group rounded-lg border border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium text-ink-primary">
            More filters
            <span aria-hidden="true" className="text-ink-secondary transition-transform group-open:rotate-90">
              ▶
            </span>
          </summary>
          <p className="px-3 pb-3 text-xs text-ink-secondary">
            Course level and open-seat filters are applied client-side. The catalog API accepts only
            q, subject, and limit.
          </p>
        </details>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-warm px-3 py-2 text-xs">
          <span className="font-medium text-ink-primary">
            Selected {crns.length} of {MAX_CRNS}
          </span>
          <button
            type="button"
            onClick={clear}
            disabled={crns.length === 0}
            className="rounded-md border border-line bg-panel px-2.5 py-1 font-semibold text-ink-primary hover:bg-soft-maroon disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        <CourseResults
          courses={filteredCourses}
          isPending={search.isPending}
          isError={search.isError}
          errorMessage={errorMessage}
          hasFilters={hasFilters}
          queryLabel={activeQuery ?? ""}
          isSelected={(crn) => crns.includes(crn)}
          isFull={isFull}
          onToggleSection={(section) =>
            crns.includes(section.crn) ? removeCrn(section.crn) : addSection(section)
          }
          onRetry={() => void search.refetch()}
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
}
