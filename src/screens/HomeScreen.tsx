import React, {useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {useTemplateStore} from '../store/templateStore';
import {Template} from '../models/types';
import {useDailyLogStore} from '../store/dailyLogStore';
import {useStreak} from '../hooks/useStreak';
import StatsBar from '../components/StatsBar';
import {todayKey} from '../utils/date';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {templates, load, deleteTemplate} = useTemplateStore();
  const logs = useDailyLogStore(s => s.logs);
  const loadLogs = useDailyLogStore(s => s.load);
  const streak = useStreak();

  useEffect(() => {
    load();
    loadLogs();
  }, [load, loadLogs]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')} hitSlop={8}>
            <Icon name="calendar-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Reminders')} hitSlop={8}>
            <Icon name="notifications-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const todayDone = (t: Template) => {
    const ids = new Set(t.habits.map(h => h.id));
    const log = logs.find(l => l.date === todayKey() && l.templateId === t.id);
    return log ? log.completedHabitIds.filter(id => ids.has(id)).length : 0;
  };

  const confirmDelete = (template: Template) => {
    Alert.alert('Delete template', `Delete "${template.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTemplate(template.id),
      },
    ]);
  };

  const renderItem = ({item}: {item: Template}) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() =>
        navigation.navigate('DailyChecklist', {templateId: item.id})
      }>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSub}>
          Today {todayDone(item)}/{item.habits.length}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('CreateTemplate', {templateId: item.id})
        }
        hitSlop={10}
        style={styles.editBtn}>
        <Icon name="create-outline" size={22} color={colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={10}>
        <Icon name="trash-outline" size={22} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatsBar info={streak} />
      <FlatList
        data={templates}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={templates.length ? undefined : styles.empty}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No templates yet.</Text>
        }
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateTemplate')}>
        <Icon name="add" size={30} color={colors.white} />
        <Text style={styles.buttonText}>Create New Template</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRight: {flexDirection: 'row', gap: 16, marginRight: 16},
  editBtn: {marginRight: 16},
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rowSub: {
    color: colors.muted,
    marginTop: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 10,
    margin: 16,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    marginLeft: 10,
    color: colors.white,
  },
});

export default HomeScreen;
