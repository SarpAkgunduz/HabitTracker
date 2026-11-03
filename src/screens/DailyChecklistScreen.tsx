import React, {useEffect, useMemo} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {RootStackParamList} from '../navigation/types';
import {useTemplateStore} from '../store/templateStore';
import {useDailyLogStore} from '../store/dailyLogStore';
import {useStreak} from '../hooks/useStreak';
import StatsBar from '../components/StatsBar';
import {todayKey} from '../utils/date';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'DailyChecklist'>;
  route: RouteProp<RootStackParamList, 'DailyChecklist'>;
};

const DailyChecklistScreen: React.FC<Props> = ({navigation, route}) => {
  const {templateId} = route.params;
  const today = todayKey();
  const date = route.params.date ?? today;
  const readOnly = date > today;

  const template = useTemplateStore(s => s.templates.find(t => t.id === templateId));
  const logs = useDailyLogStore(s => s.logs);
  const toggleHabit = useDailyLogStore(s => s.toggleHabit);
  const streak = useStreak();

  useEffect(() => {
    navigation.setOptions({
      title: template ? `${template.name} · ${date === today ? 'Today' : date}` : 'Checklist',
    });
  }, [navigation, template, date, today]);

  const completed = useMemo(
    () =>
      new Set(
        logs.find(l => l.date === date && l.templateId === templateId)
          ?.completedHabitIds ?? [],
      ),
    [logs, date, templateId],
  );

  if (!template) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Template not found.</Text>
      </View>
    );
  }

  const habits = [...template.habits].sort((a, b) => a.order - b.order);
  const doneCount = habits.filter(h => completed.has(h.id)).length;
  const ratio = habits.length ? doneCount / habits.length : 0;

  return (
    <View style={styles.container}>
      <StatsBar info={streak} />
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {flex: ratio}]} />
          <View style={{flex: 1 - ratio}} />
        </View>
        <Text style={styles.progressText}>
          {doneCount}/{habits.length}
          {ratio === 1 ? '  Perfect day!' : ''}
        </Text>
      </View>
      <FlatList
        data={habits}
        keyExtractor={h => h.id}
        renderItem={({item}) => {
          const checked = completed.has(item.id);
          return (
            <TouchableOpacity
              style={styles.row}
              disabled={readOnly}
              onPress={() => toggleHabit(date, templateId, item.id)}>
              <Icon
                name={checked ? 'checkbox' : 'square-outline'}
                size={28}
                color={checked ? colors.success : colors.muted}
              />
              <Text style={[styles.title, checked && styles.titleDone]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  muted: {color: colors.muted, fontSize: 16},
  progressWrap: {padding: 16},
  progressTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: {backgroundColor: colors.success},
  progressText: {marginTop: 6, color: colors.muted},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {fontSize: 18, flex: 1},
  titleDone: {textDecorationLine: 'line-through', color: colors.muted},
});

export default DailyChecklistScreen;
