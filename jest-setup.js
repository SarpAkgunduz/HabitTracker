import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
    createChannel: jest.fn(async () => 'habit-reminders'),
    createTriggerNotification: jest.fn(async () => 'id'),
    getTriggerNotificationIds: jest.fn(async () => []),
    cancelTriggerNotifications: jest.fn(async () => {}),
    onForegroundEvent: jest.fn(() => () => {}),
    onBackgroundEvent: jest.fn(),
    getInitialNotification: jest.fn(async () => null),
  },
  AndroidImportance: {HIGH: 4},
  AuthorizationStatus: {AUTHORIZED: 1},
  EventType: {PRESS: 1},
  RepeatFrequency: {DAILY: 1, WEEKLY: 2},
  TriggerType: {TIMESTAMP: 0},
}));

jest.mock('react-native-calendars', () => ({
  Calendar: () => null,
}));
