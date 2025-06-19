import { Tabs } from 'expo-router';
import { Home, MapPin, Clock, User } from 'lucide-react-native';
import { RideProvider } from '@/contexts/RideContext';

export default function TabLayout() {
  return (
    <RideProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingTop: 8,
            paddingBottom: 24,
            height: 88,
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#6B7280',
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 12,
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: 'Track',
            tabBarIcon: ({ size, color }) => (
              <MapPin size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ size, color }) => (
              <Clock size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </RideProvider>
  );
}