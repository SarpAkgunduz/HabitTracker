import {create} from 'zustand';
import {DailyLog} from '../models/types';
import {DailyLogRepository} from '../data/dailyLogRepository';

interface DailyLogState {
  logs: DailyLog[];
  loaded: boolean;
  load: () => Promise<void>;
  toggleHabit: (
    date: string,
    templateId: string,
    habitId: string,
  ) => Promise<void>;
}

export const useDailyLogStore = create<DailyLogState>((set, get) => ({
  logs: [],
  loaded: false,

  load: async () => {
    const logs = await DailyLogRepository.getAll();
    set({logs, loaded: true});
  },

  toggleHabit: async (date, templateId, habitId) => {
    const logs = get().logs;
    const existing = logs.find(
      l => l.date === date && l.templateId === templateId,
    );
    let next: DailyLog[];
    if (!existing) {
      next = [...logs, {date, templateId, completedHabitIds: [habitId]}];
    } else {
      const has = existing.completedHabitIds.includes(habitId);
      const completedHabitIds = has
        ? existing.completedHabitIds.filter(id => id !== habitId)
        : [...existing.completedHabitIds, habitId];
      next = logs.map(l => (l === existing ? {...l, completedHabitIds} : l));
    }
    set({logs: next});
    await DailyLogRepository.saveAll(next);
  },
}));
