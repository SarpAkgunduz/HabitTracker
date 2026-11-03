import {Reminder} from '../models/types';
import {getItem, setItem} from './storage';

const REMINDERS_KEY = 'reminders';

export const ReminderRepository = {
  async getAll(): Promise<Reminder[]> {
    return (await getItem<Reminder[]>(REMINDERS_KEY)) ?? [];
  },
  async saveAll(reminders: Reminder[]): Promise<void> {
    await setItem(REMINDERS_KEY, reminders);
  },
};
