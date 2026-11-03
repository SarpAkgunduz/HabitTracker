// types.ts
export type RootStackParamList = {
  Home: undefined;
  CreateTemplate: {templateId?: string} | undefined;
  DailyChecklist: {templateId: string; date?: string};
  Calendar: undefined;
  Reminders: undefined;
};
