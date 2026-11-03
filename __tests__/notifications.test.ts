import {describe, it, expect} from '@jest/globals';
import {nextOccurrence, triggerDays} from '../src/services/notifications';

// 2026-11-03 is a Tuesday (ISO weekday 2).
const now = new Date(2026, 10, 3, 12, 0, 0);

describe('nextOccurrence', () => {
  it('daily: later today if time not passed', () => {
    const d = nextOccurrence(now, null, 20, 0);
    expect([d.getDate(), d.getHours()]).toEqual([3, 20]);
  });
  it('daily: tomorrow if time passed', () => {
    const d = nextOccurrence(now, null, 8, 30);
    expect([d.getDate(), d.getHours(), d.getMinutes()]).toEqual([4, 8, 30]);
  });
  it('weekly: same weekday later today', () => {
    expect(nextOccurrence(now, 2, 21, 0).getDate()).toBe(3);
  });
  it('weekly: same weekday but passed -> next week', () => {
    expect(nextOccurrence(now, 2, 9, 0).getDate()).toBe(10);
  });
  it('weekly: upcoming Friday', () => {
    expect(nextOccurrence(now, 5, 9, 0).getDate()).toBe(6);
  });
  it('weekly: Monday wraps to next week', () => {
    expect(nextOccurrence(now, 1, 9, 0).getDate()).toBe(9);
  });
});

describe('triggerDays', () => {
  it('uses a single daily trigger for none/all days', () => {
    expect(triggerDays([])).toEqual([null]);
    expect(triggerDays([1, 2, 3, 4, 5, 6, 7])).toEqual([null]);
  });
  it('one weekly trigger per selected day', () => {
    expect(triggerDays([5, 1, 1])).toEqual([1, 5]);
  });
});
