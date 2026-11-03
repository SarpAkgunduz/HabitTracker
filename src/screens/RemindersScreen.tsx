import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {Reminder} from '../models/types';
import {useReminderStore} from '../store/reminderStore';
import {useTemplateStore} from '../store/templateStore';
import {requestPermission} from '../services/notifications';
import {formatTime} from '../utils/date';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const describeDays = (weekdays: number[]) =>
  weekdays.length === 0 || weekdays.length === 7
    ? 'Every day'
    : [...weekdays].sort().map(d => DAY_LABELS[d - 1]).join(', ');

type Draft = Omit<Reminder, 'id'> & {id?: string};

const emptyDraft = (): Draft => ({
  title: '',
  hour: 20,
  minute: 0,
  weekdays: [],
  enabled: true,
});

const clamp = (text: string, max: number) => {
  const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(n) ? 0 : Math.min(n, max);
};

const RemindersScreen: React.FC = () => {
  const {reminders, load, saveReminder, toggleReminder, deleteReminder} =
    useReminderStore();
  const templates = useTemplateStore(s => s.templates);
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const ensurePermission = async () => {
    try {
      if (!(await requestPermission())) {
        Alert.alert(
          'Notifications are off',
          'Enable notifications for this app in system settings to get reminders.',
        );
        return false;
      }
    } catch {
      // permission API unavailable (e.g. tests); continue
    }
    return true;
  };

  const onSave = async () => {
    if (!draft) {
      return;
    }
    await ensurePermission();
    await saveReminder({
      ...draft,
      title: draft.title.trim() || 'Habit reminder',
    });
    setDraft(null);
  };

  const onToggle = async (r: Reminder) => {
    if (!r.enabled) {
      await ensurePermission();
    }
    await toggleReminder(r.id);
  };

  const toggleDay = (d: number) =>
    setDraft(prev =>
      prev
        ? {
            ...prev,
            weekdays: prev.weekdays.includes(d)
              ? prev.weekdays.filter(x => x !== d)
              : [...prev.weekdays, d],
          }
        : prev,
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={r => r.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No reminders yet.</Text>
        }
        renderItem={({item}) => (
          <TouchableOpacity style={styles.row} onPress={() => setDraft(item)}>
            <View style={styles.rowText}>
              <Text style={styles.time}>{formatTime(item.hour, item.minute)}</Text>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSub}>
                {describeDays(item.weekdays)}
                {item.templateId
                  ? ` · ${templates.find(t => t.id === item.templateId)?.name ?? ''}`
                  : ''}
              </Text>
            </View>
            <Switch value={item.enabled} onValueChange={() => onToggle(item)} />
            <TouchableOpacity
              onPress={() => deleteReminder(item.id)}
              hitSlop={10}
              style={styles.trash}>
              <Icon name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={() => setDraft(emptyDraft())}>
        <Icon name="add" size={30} color={colors.white} />
        <Text style={styles.buttonText}>New reminder</Text>
      </TouchableOpacity>

      <Modal visible={!!draft} animationType="slide" onRequestClose={() => setDraft(null)}>
        {draft && (
          <View style={styles.modal}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={draft.title}
              placeholder="Habit reminder"
              onChangeText={title => setDraft({...draft, title})}
            />
            <Text style={styles.label}>Time (24h)</Text>
            <View style={styles.timeRow}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                keyboardType="number-pad"
                maxLength={2}
                value={String(draft.hour)}
                onChangeText={t => setDraft({...draft, hour: clamp(t, 23)})}
              />
              <Text style={styles.colon}>:</Text>
              <TextInput
                style={[styles.input, styles.timeInput]}
                keyboardType="number-pad"
                maxLength={2}
                value={String(draft.minute).padStart(2, '0')}
                onChangeText={t => setDraft({...draft, minute: clamp(t, 59)})}
              />
            </View>
            <Text style={styles.label}>Days (none selected = every day)</Text>
            <View style={styles.chips}>
              {DAY_LABELS.map((label, i) => {
                const on = draft.weekdays.includes(i + 1);
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => toggleDay(i + 1)}>
                    <Text style={on ? styles.chipTextOn : undefined}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.label}>Template (optional)</Text>
            <View style={styles.chips}>
              {[{id: undefined, name: 'Any'}, ...templates].map(t => {
                const on = draft.templateId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id ?? 'any'}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setDraft({...draft, templateId: t.id})}>
                    <Text style={on ? styles.chipTextOn : undefined}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancel} onPress={() => setDraft(null)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.save} onPress={onSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  empty: {textAlign: 'center', marginTop: 40, color: colors.muted, fontSize: 16},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {flex: 1},
  time: {fontSize: 26, fontWeight: '300'},
  rowTitle: {fontSize: 16, fontWeight: '600'},
  rowSub: {color: colors.muted, marginTop: 2},
  trash: {marginLeft: 12},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 10,
    margin: 16,
    borderRadius: 5,
  },
  buttonText: {fontSize: 20, marginLeft: 10, color: colors.white},
  modal: {flex: 1, padding: 20, backgroundColor: colors.white},
  label: {marginTop: 16, marginBottom: 6, color: colors.muted},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  timeRow: {flexDirection: 'row', alignItems: 'center'},
  timeInput: {width: 64, textAlign: 'center', fontSize: 22},
  colon: {fontSize: 24, marginHorizontal: 8},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipTextOn: {color: colors.white},
  actions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 28},
  cancel: {padding: 12},
  save: {backgroundColor: colors.success, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 5},
  saveText: {color: colors.white, fontSize: 16},
});

export default RemindersScreen;
