"use client";

import { DAY_NAMES, WEEKLY_HOURS, toTimeLabel, type DayIndex } from "@/lib/hours";
import { useMinuteClock } from "@/lib/hooks/use-minute-clock";
import { getZonedNow } from "@/lib/time";
import { cn } from "@/lib/utils";

const ORDER: DayIndex[] = [1, 2, 3, 4, 5, 6, 0];

/** Weekly hours with today (in Calgary time) highlighted once the client clock is known. */
export function HoursTable() {
  const now = useMinuteClock();
  const today = now ? getZonedNow(now).day : null;

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Opening hours, Calgary time</caption>
      <tbody className="tabular">
        {ORDER.map((day) => {
          const hours = WEEKLY_HOURS[day];
          const isToday = day === today;
          return (
            <tr
              key={day}
              aria-current={isToday ? "date" : undefined}
              className={cn("transition-colors duration-150", isToday && "bg-gold-300/10")}
            >
              <th scope="row" className={cn("rounded-l-lg px-3 py-2.5 text-left font-medium", isToday ? "text-gold-200" : "text-cream-muted")}>
                {DAY_NAMES[day]}
                {isToday ? <span className="ml-2 text-[11px] uppercase tracking-wider text-gold-300">Today</span> : null}
              </th>
              <td className="rounded-r-lg px-3 py-2.5 text-right text-cream">
                {hours ? `${toTimeLabel(hours.open)} – ${toTimeLabel(hours.close)}` : "Closed"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
