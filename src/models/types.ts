export interface HabitDefinition {
  id: string;
  title: string;
  icon?: string;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  habits: HabitDefinition[];
  createdAt: string;
  archived?: boolean;
}

export interface DailyLog {
  date: string; // 'YYYY-MM-DD'
  templateId: string;
  completedHabitIds: string[];
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  vitalityScore: number; // 0-100, rolling consistency score
}

export interface Reminder {
  id: string;
  title: string;
  hour: number; // 0-23
  minute: number; // 0-59
  weekdays: number[]; // 1 (Mon) .. 7 (Sun); empty or all 7 = every day
  templateId?: string; // optional: remind about a specific template
  enabled: boolean;
}

export type DayStatus = 'full' | 'partial' | 'none';
