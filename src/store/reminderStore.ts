import {create} from 'zustand';
import {Reminder} from '../models/types';
import {ReminderRepository} from '../data/reminderRepository';
import {
  cancelReminder,
  scheduleReminder,
  syncReminders,
} from '../services/notifications';
import {makeId} from './templateStore';

interface ReminderState {
  reminders: Reminder[];
  loaded: boolean;
  load: () => Promise<void>;
  saveReminder: (r: Omit<Reminder, 'id'> & {id?: string}) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

// Notification scheduling must never break local persistence.
const safely = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (e) {
    console.warn('[reminders] scheduling failed', e);
  }
};

export const useReminderStore = create<ReminderState>((set, get) => {
  const persist = async (reminders: Reminder[]) => {
    set({reminders});
    await ReminderRepository.saveAll(reminders);
  };

  return {
    reminders: [],
    loaded: false,

    load: async () => {
      const reminders = await ReminderRepository.getAll();
      set({reminders, loaded: true});
      await safely(() => syncReminders(reminders));
    },

    saveReminder: async input => {
      const reminder: Reminder = {...input, id: input.id ?? makeId()};
      const existing = get().reminders;
      const next = input.id
        ? existing.map(r => (r.id === input.id ? reminder : r))
        : [...existing, reminder];
      await persist(next);
      await safely(() => scheduleReminder(reminder));
    },

    toggleReminder: async id => {
      const next = get().reminders.map(r =>
        r.id === id ? {...r, enabled: !r.enabled} : r,
      );
      await persist(next);
      const updated = next.find(r => r.id === id);
      if (updated) {
        await safely(() => scheduleReminder(updated));
      }
    },

    deleteReminder: async id => {
      await persist(get().reminders.filter(r => r.id !== id));
      await safely(() => cancelReminder(id));
    },
  };
});
