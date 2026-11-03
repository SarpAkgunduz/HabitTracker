import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {RootStackParamList} from '../navigation/types';
import {HabitDefinition} from '../models/types';
import {makeId, useTemplateStore} from '../store/templateStore';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateTemplate'>;
  route: RouteProp<RootStackParamList, 'CreateTemplate'>;
};

const CreateTemplateScreen: React.FC<Props> = ({navigation, route}) => {
  const templateId = route.params?.templateId;
  const {templates, saveTemplate} = useTemplateStore();
  const existing = templates.find(t => t.id === templateId);

  const [name, setName] = useState(existing?.name ?? '');
  const [habits, setHabits] = useState<HabitDefinition[]>(
    existing ? [...existing.habits].sort((a, b) => a.order - b.order) : [],
  );

  const addHabit = () =>
    setHabits(prev => [...prev, {id: makeId(), title: '', order: prev.length}]);

  const updateTitle = (id: string, title: string) =>
    setHabits(prev => prev.map(h => (h.id === id ? {...h, title} : h)));

  const removeHabit = (id: string) =>
    setHabits(prev => prev.filter(h => h.id !== id));

  const move = (index: number, delta: number) =>
    setHabits(prev => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleSave = async () => {
    const cleaned = habits
      .map(h => ({...h, title: h.title.trim()}))
      .filter(h => h.title.length > 0);
    if (!name.trim()) {
      Alert.alert('Template name required');
      return;
    }
    if (cleaned.length === 0) {
      Alert.alert('Add at least one habit');
      return;
    }
    await saveTemplate(templateId, name.trim(), cleaned);
    navigation.goBack();
  };

  const renderItem = ({item, index}: {item: HabitDefinition; index: number}) => (
    <View style={styles.habitRow}>
      <TextInput
        style={styles.habitInput}
        value={item.title}
        placeholder="Habit name"
        onChangeText={text => updateTitle(item.id, text)}
      />
      <TouchableOpacity onPress={() => move(index, -1)} hitSlop={8}>
        <Icon name="arrow-up" size={22} color={colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => move(index, 1)} hitSlop={8}>
        <Icon name="arrow-down" size={22} color={colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeHabit(item.id)} hitSlop={8}>
        <Icon name="trash-outline" size={22} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.nameInput}
        value={name}
        placeholder="Template name"
        onChangeText={setName}
      />
      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
      />
      <TouchableOpacity style={styles.addButton} onPress={addHabit}>
        <Icon name="add-circle-outline" size={30} color={colors.accent} />
        <Text style={styles.addButtonText}>Add new habit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon name="save" size={24} color={colors.white} />
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  addButton: {
    alignItems: 'center',
    padding: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.accent,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: 12,
    margin: 16,
    borderRadius: 5,
    gap: 8,
  },
  saveText: {
    color: colors.white,
    fontSize: 18,
  },
});

export default CreateTemplateScreen;
