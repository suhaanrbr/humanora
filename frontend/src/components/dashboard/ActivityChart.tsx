import type { DailyActivity } from "@/lib/db/stats";

/**
 * A real, inline-SVG bar chart over genuinely stored per-day activity
 * (lib/db/stats.ts#getDailyActivity) — no chart library added (matches
 * the rest of this codebase's no-heavy-dependency pattern), no
 * fabricated data. Two stacked series (Humanize/Study) so the "content-
 * type distribution" is visible in the same chart as the trend, not a
 * second wall of stat cards.
 */
export function ActivityChart({ data }: { data: DailyActivity[] }) {
  const max = Math.max(1, ...data.map((d) => d.humanizations + d.studySessions));
  const width = 100 / data.length;

  return (
    <div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-32 w-full overflow-visible">
        {data.map((d, i) => {
          const total = d.humanizations + d.studySessions;
          const hHeight = (d.humanizations / max) * 36;
          const sHeight = (d.studySessions / max) * 36;
          const x = i * width + width * 0.18;
          const barWidth = width * 0.64;
          return (
            <g key={d.date}>
              {total === 0 ? (
                <rect x={x} y={39} width={barWidth} height={0.6} rx={0.3} className="fill-white/10" />
              ) : (
                <>
                  <rect
                    x={x}
                    y={40 - hHeight - sHeight}
                    width={barWidth}
                    height={hHeight}
                    rx={0.6}
                    className="fill-brand-purple"
                  />
                  <rect
                    x={x}
                    y={40 - sHeight}
                    width={barWidth}
                    height={sHeight}
                    rx={0.6}
                    className="fill-brand-cyan"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-foreground-subtle">
        <span>{formatShortDate(data[0]?.date)}</span>
        <span>{formatShortDate(data[data.length - 1]?.date)}</span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-foreground-subtle">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-purple" aria-hidden="true" /> Humanize
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-cyan" aria-hidden="true" /> Study
        </span>
      </div>
    </div>
  );
}

function formatShortDate(iso: string | undefined) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}
