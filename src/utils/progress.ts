import {DailyLog, DayStatus, StreakInfo, Template} from '../models/types';
import {addDays, toDateKey} from './date';

export interface DayProgress {
  done: number;
  total: number;
}

const logKey = (date: string, templateId: string) => `${date}|${templateId}`;

export const indexLogs = (logs: DailyLog[]): Map<string, DailyLog> => {
  const map = new Map<string, DailyLog>();
  logs.forEach(l => map.set(logKey(l.date, l.templateId), l));
  return map;
};

/** Templates that count towards a given day (not archived, already created). */
export const templatesForDay = (
  templates: Template[],
  date: string,
): Template[] =>
  templates.filter(
    t => !t.archived && toDateKey(new Date(t.createdAt)) <= date,
  );

export const dayProgress = (
  date: string,
  logs: Map<string, DailyLog>,
  templates: Template[],
): DayProgress => {
  let done = 0;
  let total = 0;
  templatesForDay(templates, date).forEach(t => {
    const ids = new Set(t.habits.map(h => h.id));
    total += ids.size;
    const log = logs.get(logKey(date, t.id));
    if (log) {
      done += log.completedHabitIds.filter(id => ids.has(id)).length;
    }
  });
  return {done, total};
};

export const statusOf = ({done, total}: DayProgress): DayStatus => {
  if (total === 0 || done === 0) {
    return 'none';
  }
  return done >= total ? 'full' : 'partial';
};

export const earliestDate = (templates: Template[]): string | null => {
  const dates = templates
    .filter(t => !t.archived)
    .map(t => toDateKey(new Date(t.createdAt)))
    .sort();
  return dates[0] ?? null;
};

const VITALITY_WINDOW = 30;

export const computeStreak = (
  logList: DailyLog[],
  templates: Template[],
  today: string,
): StreakInfo => {
  const logs = indexLogs(logList);
  const start = earliestDate(templates);
  if (!start) {
    return {currentStreak: 0, bestStreak: 0, vitalityScore: 0};
  }
  const isFull = (d: string) => statusOf(dayProgress(d, logs, templates)) === 'full';

  // Current streak: today pending does not break the chain (grace for today).
  let current = 0;
  let cursor = isFull(today) ? today : addDays(today, -1);
  while (cursor >= start && isFull(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Best streak over the whole history.
  let best = 0;
  let run = 0;
  for (let d = start; d <= today; d = addDays(d, 1)) {
    if (isFull(d)) {
      run++;
      best = Math.max(best, run);
    } else if (d !== today) {
      run = 0;
    }
  }

  // Vitality: recency-weighted completion over the last 30 days + streak bonus.
  let weighted = 0;
  let weights = 0;
  for (let i = 0; i < VITALITY_WINDOW; i++) {
    const d = addDays(today, -i);
    if (d < start) {
      break;
    }
    const p = dayProgress(d, logs, templates);
    if (p.total === 0) {
      continue;
    }
    // Grace period: an unfinished today is not counted against the user.
    if (i === 0 && p.done < p.total) {
      continue;
    }
    const w = VITALITY_WINDOW - i;
    weighted += w * (p.done / p.total);
    weights += w;
  }
  const base = weights ? (weighted / weights) * 90 : 0;
  const bonus = (Math.min(current, 30) / 30) * 10;
  const vitalityScore = Math.max(0, Math.min(100, Math.round(base + bonus)));

  return {currentStreak: current, bestStreak: best, vitalityScore};
};
