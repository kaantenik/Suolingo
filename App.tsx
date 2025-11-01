import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Video Avatar') {
              iconName = focused ? 'videocam' : 'videocam-outline';
            } else if (route.name === 'lesson Avatar') {
              iconName = focused ? 'book' : 'book-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#6366F1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Video Avatar" 
          component={HomeScreen}
          options={{
            title: 'Metin → Avatar Video',
          }}
        />
        <Tab.Screen 
          name="lesson Avatar" 
          component={LessonScreen}
          options={{
            title: 'İngilizce Dersleri',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
