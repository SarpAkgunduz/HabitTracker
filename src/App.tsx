import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CreateTemplateScreen from './screens/CreateTemplateScreen';
import {RootStackParamList} from './navigation/types';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateTemplate" component={CreateTemplateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
