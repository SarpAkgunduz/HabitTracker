import {describe, it, expect} from '@jest/globals';
import {computeStreak} from '../src/utils/progress';
import {DailyLog, Template} from '../src/models/types';

const template: Template = {
  id: 't1',
  name: 'Morning',
  createdAt: '2026-10-01T09:00:00',
  habits: [
    {id: 'a', title: 'A', order: 0},
    {id: 'b', title: 'B', order: 1},
  ],
};
const full = (date: string): DailyLog => ({
  date,
  templateId: 't1',
  completedHabitIds: ['a', 'b'],
});

describe('computeStreak', () => {
  it('returns zeros without templates', () => {
    expect(computeStreak([], [], '2026-11-03')).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      vitalityScore: 0,
    });
  });

  it('counts consecutive full days; unfinished today does not break it', () => {
    const logs = [full('2026-11-01'), full('2026-11-02')];
    const r = computeStreak(logs, [template], '2026-11-03');
    expect(r.currentStreak).toBe(2);
    expect(r.bestStreak).toBe(2);
  });

  it('breaks the streak on a missed day and keeps the best', () => {
    const logs = [
      full('2026-10-20'),
      full('2026-10-21'),
      full('2026-10-22'),
      full('2026-11-02'),
      full('2026-11-03'),
    ];
    const r = computeStreak(logs, [template], '2026-11-03');
    expect(r.currentStreak).toBe(2);
    expect(r.bestStreak).toBe(3);
  });

  it('partial days are not full and vitality stays within 0-100', () => {
    const logs: DailyLog[] = [
      {date: '2026-11-02', templateId: 't1', completedHabitIds: ['a']},
    ];
    const r = computeStreak(logs, [template], '2026-11-03');
    expect(r.currentStreak).toBe(0);
    expect(r.vitalityScore).toBeGreaterThanOrEqual(0);
    expect(r.vitalityScore).toBeLessThanOrEqual(100);
  });
});
