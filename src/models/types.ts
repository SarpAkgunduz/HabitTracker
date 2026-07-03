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
