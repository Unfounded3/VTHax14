interface HeroPanelProps {
  /** Compact banner rendering for the tablet breakpoint (PRD §6.2). */
  compact?: boolean;
}

/** CSS-only Burruss-inspired skyline. No image assets are shipped in this phase. */
function Skyline() {
  const silhouette = "#2b1420";
  const silhouetteDark = "#1d0f18";
  return (
    <svg
      viewBox="0 0 640 480"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* side wings */}
      <path d="M0 346 292 302v112H0Z" fill={silhouette} opacity=".92" />
      <path d="M388 302l252 44v68H388Z" fill={silhouette} opacity=".92" />
      {/* turrets */}
      <path
        d="M262 208v-18h8v18h8v-18h8v18h12v206h-36Z"
        fill={silhouetteDark}
      />
      <path
        d="M376 208v-18h8v18h8v-18h8v18h14v206h-38Z"
        fill={silhouetteDark}
      />
      {/* central tower */}
      <path d="M296 158h88v256h-88Z" fill={silhouette} />
      <path
        d="M296 158v-24h12v24h13v-24h12v24h13v-24h12v24h13v-24h13v24Z"
        fill={silhouette}
      />
      {/* lit windows */}
      <g fill="var(--color-orange)" opacity=".8">
        <rect x="310" y="196" width="10" height="16" rx="1" />
        <rect x="332" y="196" width="10" height="16" rx="1" />
        <rect x="354" y="196" width="10" height="16" rx="1" />
        <rect x="310" y="234" width="10" height="16" rx="1" />
        <rect x="332" y="234" width="10" height="16" rx="1" />
        <rect x="354" y="234" width="10" height="16" rx="1" />
        <rect x="321" y="272" width="10" height="16" rx="1" />
        <rect x="343" y="272" width="10" height="16" rx="1" />
      </g>
      {/* arched door */}
      <path d="M330 414v-52a10 16 0 0 1 20 0v52Z" fill="#0d060b" />
      {/* ground and garden shapes */}
      <path d="M0 406c90-14 196-10 320 2 124 12 230 8 320-6v78H0Z" fill={silhouetteDark} />
      <circle cx="96" cy="368" r="34" fill={silhouetteDark} opacity=".85" />
      <circle cx="548" cy="374" r="40" fill={silhouetteDark} opacity=".85" />
      <circle cx="150" cy="386" r="20" fill={silhouetteDark} opacity=".85" />
    </svg>
  );
}

/**
 * Empty-state hero: Burruss visual + mission copy (PRD §7.5, §11.2). When
 * sections are selected a later phase swaps this to a compact summary header.
 */
export default function HeroPanel({ compact = false }: HeroPanelProps) {
  return (
    <section
      aria-label="HokieLens overview"
      className={`hero-sky relative overflow-hidden rounded-2xl border border-line ${
        compact ? "min-h-44" : "min-h-[26rem] lg:min-h-[32rem]"
      }`}
    >
      <Skyline />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />
      <div
        className={`relative z-10 flex h-full flex-col justify-end text-white ${
          compact ? "p-5" : "p-6 sm:p-8"
        }`}
      >
        <p
          className={`font-extrabold leading-tight drop-shadow ${
            compact ? "text-2xl" : "text-3xl sm:text-4xl"
          }`}
        >
          Burruss Hall
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/85">
          Virginia Tech
        </p>
        {!compact ? (
          <>
            <div className="my-3 h-px w-44 bg-white/50" aria-hidden="true" />
            <p className="text-lg text-white/95">
              Ideas today.
              <br />A brighter tomorrow.
            </p>
            <p className="mt-4 max-w-md text-sm text-white/85">
              Plan smarter. Understand the cost of a schedule before registration — risk, walking
              gaps, and grade history in one place.
            </p>
          </>
        ) : null}
      </div>
    </section>
  );
}
