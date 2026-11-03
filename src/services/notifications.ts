import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import {Reminder} from '../models/types';
import {isoWeekday} from '../utils/date';

export const CHANNEL_ID = 'habit-reminders';

/**
 * Next time hour:minute occurs, optionally on a given ISO weekday
 * (1 = Mon .. 7 = Sun). Always strictly in the future.
 */
export const nextOccurrence = (
  now: Date,
  weekday: number | null,
  hour: number,
  minute: number,
): Date => {
  const candidate = new Date(now);
  candidate.setHours(hour, minute, 0, 0);
  if (weekday !== null) {
    const diff = (weekday - isoWeekday(candidate) + 7) % 7;
    candidate.setDate(candidate.getDate() + diff);
  }
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + (weekday === null ? 1 : 7));
  }
  return candidate;
};

/** Which weekdays need their own weekly trigger; null = one daily trigger. */
export const triggerDays = (weekdays: number[]): Array<number | null> => {
  const unique = Array.from(new Set(weekdays)).sort();
  return unique.length === 0 || unique.length === 7 ? [null] : unique;
};

export async function requestPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Habit reminders',
    importance: AndroidImportance.HIGH,
  });
}

export async function cancelReminder(reminderId: string): Promise<void> {
  const ids = await notifee.getTriggerNotificationIds();
  const mine = ids.filter(id => id.startsWith(`${reminderId}:`));
  if (mine.length) {
    await notifee.cancelTriggerNotifications(mine);
  }
}

export async function scheduleReminder(
  reminder: Reminder,
  now: Date = new Date(),
): Promise<void> {
  await cancelReminder(reminder.id);
  if (!reminder.enabled) {
    return;
  }
  const channelId = await ensureChannel();
  for (const day of triggerDays(reminder.weekdays)) {
    const when = nextOccurrence(now, day, reminder.hour, reminder.minute);
    await notifee.createTriggerNotification(
      {
        id: `${reminder.id}:${day ?? 'daily'}`,
        title: reminder.title || 'Habit reminder',
        body: "Don't forget to check off today's habits.",
        data: reminder.templateId ? {templateId: reminder.templateId} : {},
        android: {channelId, pressAction: {id: 'default'}},
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: when.getTime(),
        repeatFrequency:
          day === null ? RepeatFrequency.DAILY : RepeatFrequency.WEEKLY,
      },
    );
  }
}

/** Re-create every trigger from stored reminders (run on app start). */
export async function syncReminders(reminders: Reminder[]): Promise<void> {
  for (const r of reminders) {
    await scheduleReminder(r);
  }
}
