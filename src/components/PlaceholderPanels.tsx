/** Static workspace stand-ins for the right column (Campus Map + Weekly Schedule). */

interface MapPinProps {
  style: { left: string; top: string };
  label: string;
}

function MapPin({ style, label }: MapPinProps) {
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center" style={style}>
      <svg viewBox="0 0 24 32" className="h-7 w-5 drop-shadow" aria-hidden="true">
        <path
          d="M12 1C6.5 1 2 5.6 2 11.2 2 19 12 31 12 31S22 19 22 11.2C22 5.6 17.5 1 12 1Z"
          fill="var(--color-maroon)"
        />
        <circle cx="12" cy="11" r="4" fill="var(--color-panel)" />
      </svg>
      <span className="mt-1 max-w-28 break-words rounded-md border border-line bg-panel px-1.5 py-0.5 text-center text-[0.625rem] font-medium text-ink-primary">
        {label}
      </span>
    </div>
  );
}

export function CampusMapPanel() {
  return (
    <section aria-label="Campus map" className="rounded-2xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold text-ink-primary">Campus Map</h2>
        <select
          disabled
          aria-label="Schedule to display on the map"
          className="cursor-not-allowed rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink-secondary disabled:opacity-70"
        >
          <option>Current Schedule</option>
        </select>
      </div>

      <div className="map-grid relative m-4 aspect-[4/3] overflow-hidden rounded-xl border border-line">
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points="128,88 210,170 268,232"
            fill="none"
            stroke="var(--color-vt-orange)"
            strokeWidth="3"
            strokeDasharray="8 7"
            strokeLinecap="round"
          />
        </svg>
        <MapPin style={{ left: "32%", top: "31%" }} label="Goodwin Hall" />
        <MapPin style={{ left: "67%", top: "79%" }} label="Torgersen Hall" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[0.625rem] font-medium text-ink-secondary">
          <span className="h-2 w-2 rounded-full bg-maroon" aria-hidden="true" />
          Selected buildings
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[0.625rem] font-medium text-ink-secondary">
          <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden="true">
            <line
              x1="1"
              y1="6"
              x2="23"
              y2="6"
              stroke="var(--color-vt-orange)"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
          </svg>
          Walking route
        </span>
      </div>

      <p className="px-4 pb-4 text-xs text-ink-secondary">
        Local schematic only — building markers and walking transitions arrive with the map
        projection phase. No external map tiles or routing calls.
      </p>
    </section>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const HOURS = [
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
] as const;

export function WeeklySchedulePanel() {
  return (
    <section aria-label="Weekly schedule" className="rounded-2xl border border-line bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">Your Schedule</h2>
          <p className="text-xs text-ink-secondary">Plan, adjust, and visualize your week.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            title="Print and download arrive after schedule selection"
            className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-primary disabled:opacity-60"
          >
            Download
          </button>
          <button
            type="button"
            disabled
            title="Share links arrive after schedule selection"
            className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-primary disabled:opacity-60"
          >
            Share
          </button>
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-3 pt-3">
        <div className="min-w-[30rem]">
          <div className="flex text-center text-xs font-semibold text-ink-primary">
            <div className="w-11 shrink-0" aria-hidden="true" />
            {DAYS.map((day) => (
              <div key={day} className="flex-1 border-l border-line py-1.5">
                {day}
              </div>
            ))}
          </div>
          <div className="rounded-b-xl rounded-br-xl">
            {HOURS.map((hour) => (
              <div key={hour} className="flex">
                <div className="w-11 shrink-0 pt-1 text-[0.625rem] text-ink-secondary">{hour}</div>
                <div className="grid flex-1 grid-cols-5">
                  {DAYS.map((day) => (
                    <div key={day} className="h-9 border-l border-t border-line" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="px-4 pb-4 text-xs text-ink-secondary">
        Weekly calendar events arrive after section selection. Meetings will render at minutes
        from midnight in a later phase.
      </p>
    </section>
  );
}
