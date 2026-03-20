import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import BarberDashboard from './BarberDashboard';
import AdminPanel from './AdminPanel';
import { setupNotifications } from './src/utils/notifications';
import { db } from './src/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const Tab = createBottomTabNavigator();

export default function App() {
  const [notificationToken, setNotificationToken] = useState(null);

  useEffect(() => {
    // Setup push notifications
    setupNotifications().then(token => {
      if (token) {
        setNotificationToken(token);
        console.log('FCM Token:', token);
      }
    });

    // Listen for new customers joining queue
    const queueRef = collection(db, 'queue');
    const unsubscribe = onSnapshot(queueRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const customer = change.doc.data();
          // Notification will be handled by FCM
          console.log('New customer joined:', customer.name);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Barber') {
              iconName = focused ? 'cut' : 'cut-outline';
            } else if (route.name === 'Admin') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Barber" 
          component={BarberDashboard}
          options={{ title: 'Barber Dashboard' }}
        />
        <Tab.Screen 
          name="Admin" 
          component={AdminPanel}
          options={{ title: 'Admin Panel' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
