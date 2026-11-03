const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Local-time 'YYYY-MM-DD' key. */
export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key: string, delta: number): string => {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
};

export const todayKey = (): string => toDateKey(new Date());

export const formatTime = (hour: number, minute: number): string =>
  `${pad(hour)}:${pad(minute)}`;

/** 1 (Mon) .. 7 (Sun) */
export const isoWeekday = (d: Date): number => ((d.getDay() + 6) % 7) + 1;
