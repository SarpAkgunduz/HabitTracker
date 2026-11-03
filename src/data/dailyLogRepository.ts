import {DailyLog} from '../models/types';
import {getItem, setItem} from './storage';

const LOGS_KEY = 'dailyLogs';

export const DailyLogRepository = {
  async getAll(): Promise<DailyLog[]> {
    return (await getItem<DailyLog[]>(LOGS_KEY)) ?? [];
  },
  async saveAll(logs: DailyLog[]): Promise<void> {
    await setItem(LOGS_KEY, logs);
  },
};
