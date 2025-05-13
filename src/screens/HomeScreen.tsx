import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TasksTab from './TasksTab';
import ProfileTab from './ProfileTab';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  TaskDetail: { task: { id: string; title: string; description: string; startDate: string; endDate: string; userId: string } };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC<HomeScreenProps> = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'Tasks') {
            iconName = 'list';
          } else {
            iconName = 'person';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
      })}
    >
      <Tab.Screen name="Tasks" component={TasksTab} options={{ title: 'Công việc' }} />
      <Tab.Screen name="Profile" component={ProfileTab} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};

export default HomeScreen;