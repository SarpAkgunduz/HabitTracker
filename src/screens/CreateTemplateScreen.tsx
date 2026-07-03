import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';

interface Habit {
  id: string;
  habit: string;
}

const CreateTemplateScreen = () => {
  const habits: Habit[] = [
    {id: '1', habit: 'Drink water'},
    {id: '2', habit: 'Exercise'},
  ]; // Example habits data
  const date = new Date().toDateString(); // Get today's date

  const renderItem = ({item}: {item: Habit}) => (
    <View style={styles.habitRow}>
      <Text>{item.habit}</Text>
    </View>
  );

  const handleSave = () => {
    // Add your save logic here
    console.log('Save button clicked');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon name="save" size={24} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.dateText}>{date}</Text>
      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add-circle-outline" size={30} color={colors.accent} />
        <Text style={styles.addButtonText}>Add new habit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.success,
    padding: 10,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
  },
  habitRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addButton: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.accent,
  },
});

export default CreateTemplateScreen;
