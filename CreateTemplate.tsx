import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Habit {
  id: string;
  habit: string;
}

const CreateTemplate = () => {
  const habits: Habit[] = [{ id: '1', habit: 'Drink water' }, { id: '2', habit: 'Exercise' }]; // Example habits data
  const date = new Date().toDateString(); // Get today's date

  const renderItem = ({ item }: { item: Habit }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#CCCCCC' }}>
      <Text>{item.habit}</Text>
    </View>
  );

  const handleSave = () => {
    // Add your save logic here
    console.log('Save button clicked');
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        {/* Corrected icon name for save */}
        <Icon name="save" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: 'bold', alignSelf: 'center', marginBottom: 10 }}>{date}</Text>
      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity style={{ alignItems: 'center', paddingBottom: 20 }}>
        {/* Corrected icon name for add */}
        <Icon name="add-circle-outline" size={30} color="#007AFF" />
        <Text style={{ fontSize: 14, color: '#007AFF' }}>Add new habit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
  },
});

export default CreateTemplate;
