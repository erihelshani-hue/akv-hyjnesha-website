import type { Rehearsal, RehearsalOccurrence } from "@/types/database";

const DAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

function toDateStr(date: Date): string {
  return date.toISOString().substring(0, 10);
}

function nextOccurrenceDate(fromDate: Date, targetDay: number): Date {
  const result = new Date(fromDate);
  const diff = (targetDay - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + (diff === 0 ? 0 : diff));
  return result;
}

export function getUpcomingOccurrences(
  rehearsals: Rehearsal[],
  count = 8,
  fromDate: Date = new Date()
): RehearsalOccurrence[] {
  const today = new Date(fromDate);
  today.setHours(0, 0, 0, 0);

  const occurrences: RehearsalOccurrence[] = [];

  for (const rehearsal of rehearsals) {
    if (rehearsal.is_recurring && rehearsal.recurrence_day) {
      const targetDay = DAY_MAP[rehearsal.recurrence_day];
      if (targetDay === undefined) continue;

      for (let i = 0; i < count; i++) {
        const base = new Date(today);
        base.setDate(base.getDate() + i * 7);
        const occDate = nextOccurrenceDate(base, targetDay);
        if (occDate >= today) {
          occurrences.push({
            rehearsal,
            date: toDateStr(occDate),
            isRecurring: true,
          });
        }
      }
    } else {
      const rehearsalDate = new Date(rehearsal.date + "T00:00:00");
      if (rehearsalDate >= today) {
        occurrences.push({
          rehearsal,
          date: rehearsal.date,
          isRecurring: false,
        });
      }
    }
  }

  occurrences.sort((a, b) => a.date.localeCompare(b.date));

  const seen = new Set<string>();
  const deduped: RehearsalOccurrence[] = [];
  for (const occ of occurrences) {
    const key = `${occ.rehearsal.id}-${occ.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(occ);
    }
  }

  return deduped.slice(0, count * rehearsals.length || count);
}

export function getNextOccurrence(
  rehearsals: Rehearsal[],
  fromDate: Date = new Date()
): RehearsalOccurrence | null {
  const all = getUpcomingOccurrences(rehearsals, 1, fromDate);
  return all[0] ?? null;
}

export function getOccurrencesForRehearsal(
  rehearsal: Rehearsal,
  count = 8,
  fromDate: Date = new Date()
): RehearsalOccurrence[] {
  return getUpcomingOccurrences([rehearsal], count, fromDate);
}
