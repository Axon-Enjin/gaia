/**
 * Consecutive calendar-day streak from merit_ledger timestamps (UTC date keys).
 */
export function computeStreakDayKeys(eventDatesIso: string[]): number {
  if (eventDatesIso.length === 0) return 0;

  const days = new Set(
    eventDatesIso.map((iso) => iso.slice(0, 10)), // YYYY-MM-DD
  );
  const sorted = [...days].sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let cursor = today;

  for (const day of sorted) {
    if (day === cursor) {
      streak++;
      cursor = previousDay(cursor);
    } else if (day < cursor) {
      break;
    }
  }
  return streak;
}

function previousDay(yyyyMmDd: string): string {
  const d = new Date(`${yyyyMmDd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
