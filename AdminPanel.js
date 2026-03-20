import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { collection, query, getDocs, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

const AdminPanel = () => {
  const [shopOpen, setShopOpen] = useState(true);
  const [activeChairs, setActiveChairs] = useState(3);
  const [totalServedToday, setTotalServedToday] = useState(0);
  const [settingsDocId, setSettingsDocId] = useState(null);

  useEffect(() => {
    // Listen to settings
    const settingsRef = collection(db, 'settings');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setSettingsDocId(doc.id);
        const settings = doc.data();
        setShopOpen(settings.shopOpen || false);
        setActiveChairs(settings.activeChairs || 3);
        setTotalServedToday(settings.totalServedToday || 0);
      } else {
        // Create initial settings if not exists
        initializeSettings();
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeSettings = async () => {
    try {
      const docRef = doc(collection(db, 'settings'));
      await setDoc(docRef, {
        shopOpen: true,
        activeChairs: 3,
        totalServedToday: 0,
        lastReset: new Date().toISOString(),
      });
      setSettingsDocId(docRef.id);
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  const updateSettings = async (updates) => {
    if (!settingsDocId) return;
    
    try {
      await setDoc(doc(db, 'settings', settingsDocId), updates, { merge: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings.');
    }
  };

  const toggleShop = () => {
    const newState = !shopOpen;
    updateSettings({ shopOpen: newState });
    Alert.alert(
      'Shop Status',
      `Shop is now ${newState ? 'OPEN' : 'CLOSED'}`,
      [{ text: 'OK' }]
    );
  };

  const updateChairs = (value) => {
    const chairs = parseInt(value) || 1;
    if (chairs < 1 || chairs > 10) {
      Alert.alert('Invalid Value', 'Number of chairs must be between 1 and 10.');
      return;
    }
    setActiveChairs(chairs);
    updateSettings({ activeChairs: chairs });
  };

  const resetDay = async () => {
    Alert.alert(
      'Reset Day',
      'This will clear all queue data and reset counters. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all queue items
              const queueQuery = query(collection(db, 'queue'));
              const snapshot = await getDocs(queueQuery);
              
              const deletePromises = [];
              snapshot.forEach((document) => {
                deletePromises.push(deleteDoc(doc(db, 'queue', document.id)));
              });
              
              await Promise.all(deletePromises);
              
              // Reset settings
              await updateSettings({
                totalServedToday: 0,
                lastReset: new Date().toISOString(),
              });
              
              setTotalServedToday(0);
              Alert.alert('Success', 'Day has been reset successfully.');
            } catch (error) {
              console.error('Error resetting day:', error);
              Alert.alert('Error', 'Failed to reset day.');
            }
          },
        },
      ]
    );
  };

  const clearQueue = async () => {
    Alert.alert(
      'Clear Queue',
      'This will remove all waiting customers from the queue. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const queueQuery = query(
                collection(db, 'queue')
              );
              const snapshot = await getDocs(queueQuery);
              
              const deletePromises = [];
              snapshot.forEach((document) => {
                const data = document.data();
                if (data.status === 'waiting') {
                  deletePromises.push(deleteDoc(doc(db, 'queue', document.id)));
                }
              });
              
              await Promise.all(deletePromises);
              Alert.alert('Success', 'Queue has been cleared.');
            } catch (error) {
              console.error('Error clearing queue:', error);
              Alert.alert('Error', 'Failed to clear queue.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Shop Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shop Status</Text>
        <TouchableOpacity
          style={[styles.toggleButton, shopOpen ? styles.openButton : styles.closedButton]}
          onPress={toggleShop}
        >
          <Text style={styles.toggleButtonText}>
            {shopOpen ? '🟢 SHOP OPEN' : '🔴 SHOP CLOSED'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          {shopOpen ? 'Customers can join the queue' : 'Queue is closed for new customers'}
        </Text>
      </View>

      {/* Active Chairs Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Chairs</Text>
        <View style={styles.chairControl}>
          <TouchableOpacity
            style={styles.chairButton}
            onPress={() => updateChairs((activeChairs - 1).toString())}
          >
            <Text style={styles.chairButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.chairInput}
            value={activeChairs.toString()}
            onChangeText={updateChairs}
            keyboardType="number-pad"
            maxLength={2}
          />
          <TouchableOpacity
            style={styles.chairButton}
            onPress={() => updateChairs((activeChairs + 1).toString())}
          >
            <Text style={styles.chairButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>Number of available service chairs</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Served:</Text>
          <Text style={styles.statValue}>{totalServedToday}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active Chairs:</Text>
          <Text style={styles.statValue}>{activeChairs}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Queue Management</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={clearQueue}>
          <Text style={styles.actionButtonText}>Clear Waiting Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={resetDay}
        >
          <Text style={styles.actionButtonText}>Reset Day</Text>
        </TouchableOpacity>

        <Text style={styles.warningText}>
          ⚠️ Reset Day will clear all data and reset counters
        </Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Quevix</Text>
        <Text style={styles.infoText}>Version 1.0.0</Text>
        <Text style={styles.infoText}>Firebase-powered Queue Management</Text>
        <Text style={styles.infoText}>Real-time Sync • Cost Optimized</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  toggleButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  openButton: {
    backgroundColor: '#10b981',
  },
  closedButton: {
    backgroundColor: '#ef4444',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  chairControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chairButton: {
    backgroundColor: '#6366f1',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chairButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chairInput: {
    width: 80,
    height: 60,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#f3f4f6',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 4,
  },
});

export default AdminPanel;
