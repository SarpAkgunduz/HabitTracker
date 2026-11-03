import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import notifee, {EventType} from '@notifee/react-native';
import HomeScreen from './screens/HomeScreen';
import CreateTemplateScreen from './screens/CreateTemplateScreen';
import DailyChecklistScreen from './screens/DailyChecklistScreen';
import CalendarScreen from './screens/CalendarScreen';
import RemindersScreen from './screens/RemindersScreen';
import {RootStackParamList} from './navigation/types';
import {useTemplateStore} from './store/templateStore';
import {useDailyLogStore} from './store/dailyLogStore';
import {useReminderStore} from './store/reminderStore';

const Stack = createStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const openFromNotification = (data?: {[key: string]: any}) => {
  const templateId = data?.templateId;
  if (
    typeof templateId === 'string' &&
    useTemplateStore.getState().templates.some(t => t.id === templateId)
  ) {
    navigationRef.navigate('DailyChecklist', {templateId});
  }
};

const App = () => {
  useEffect(() => {
    // Load persisted state and re-arm all scheduled reminders.
    useTemplateStore.getState().load();
    useDailyLogStore.getState().load();
    useReminderStore.getState().load();

    return notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        openFromNotification(detail.notification?.data);
      }
    });
  }, []);

  const onReady = async () => {
    // App launched by tapping a notification while it was closed.
    const initial = await notifee.getInitialNotification();
    if (initial) {
      await useTemplateStore.getState().load();
      openFromNotification(initial.notification.data);
    }
  };

  return (
    <NavigationContainer ref={navigationRef} onReady={onReady}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateTemplate" component={CreateTemplateScreen} />
        <Stack.Screen
          name="DailyChecklist"
          component={DailyChecklistScreen}
          options={{title: 'Checklist'}}
        />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
