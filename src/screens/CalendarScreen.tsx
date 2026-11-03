import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {StackNavigationProp} from '@react-navigation/stack';
import {colors, statusColors} from '../theme/colors';
import {RootStackParamList} from '../navigation/types';
import {useTemplateStore} from '../store/templateStore';
import {useDailyLogStore} from '../store/dailyLogStore';
import {useStreak} from '../hooks/useStreak';
import StatsBar from '../components/StatsBar';
import {todayKey} from '../utils/date';
import {
  dayProgress,
  indexLogs,
  statusOf,
  templatesForDay,
} from '../utils/progress';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Calendar'>;
};

const CalendarScreen: React.FC<Props> = ({navigation}) => {
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const templates = useTemplateStore(s => s.templates);
  const logList = useDailyLogStore(s => s.logs);
  const logs = useMemo(() => indexLogs(logList), [logList]);
  const streak = useStreak();

  const renderDay = ({date, state}: {date?: DateData; state?: string}) => {
    if (!date) {
      return <View />;
    }
    const key = date.dateString;
    const status = statusOf(dayProgress(key, logs, templates));
    const isToday = key === today;
    const isSelected = key === selected;
    const filled = status === 'full';
    return (
      <TouchableOpacity
        onPress={() => setSelected(key)}
        style={[
          styles.day,
          {backgroundColor: statusColors[status]},
          isToday && styles.today,
          isSelected && styles.selected,
        ]}>
        <Text
          style={[
            styles.dayText,
            filled && {color: colors.white},
            state === 'disabled' && {color: colors.border},
          ]}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  };

  const dayTemplates = templatesForDay(templates, selected);
  const total = dayProgress(selected, logs, templates);

  return (
    <View style={styles.container}>
      <StatsBar info={streak} />
      <Calendar
        firstDay={1}
        dayComponent={renderDay}
        enableSwipeMonths
      />
      <View style={styles.legend}>
        <Text style={[styles.legendItem, {color: statusColors.full}]}>■ Full</Text>
        <Text style={[styles.legendItem, {color: '#66BB6A'}]}>■ Partial</Text>
        <Text style={[styles.legendItem, {color: statusColors.today}]}>□ Today</Text>
      </View>
      <ScrollView style={styles.detail}>
        <Text style={styles.detailTitle}>
          {selected}  ·  {total.done}/{total.total}
        </Text>
        {dayTemplates.length === 0 && (
          <Text style={styles.muted}>No templates on this day.</Text>
        )}
        {dayTemplates.map(t => {
          const p = dayProgress(selected, logs, [t]);
          return (
            <TouchableOpacity
              key={t.id}
              style={styles.row}
              disabled={selected > today}
              onPress={() =>
                navigation.navigate('DailyChecklist', {
                  templateId: t.id,
                  date: selected,
                })
              }>
              <Text style={styles.rowTitle}>{t.name}</Text>
              <Text style={styles.muted}>
                {p.done}/{p.total}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  day: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {borderWidth: 2, borderColor: statusColors.today},
  selected: {borderWidth: 2, borderColor: colors.accent},
  dayText: {fontSize: 15, color: '#222'},
  legend: {flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 6},
  legendItem: {fontSize: 12},
  detail: {flex: 1, padding: 16},
  detailTitle: {fontSize: 18, fontWeight: '600', marginBottom: 8},
  muted: {color: colors.muted},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: {fontSize: 16},
});

export default CalendarScreen;
