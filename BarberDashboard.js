import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { sendLocalNotification } from './utils/notifications';

const BarberDashboard = () => {
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [servingCustomers, setServingCustomers] = useState([]);
  const [activeChairs, setActiveChairs] = useState(3);
  const [shopOpen, setShopOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Listen to settings
    const settingsRef = collection(db, 'settings');
    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.empty) {
        const settings = snapshot.docs[0].data();
        setActiveChairs(settings.activeChairs || 3);
        setShopOpen(settings.shopOpen || false);
      }
    });

    // Listen to entire queue (sorted by timestamp)
    const queueQuery = query(
      collection(db, 'queue'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribeQueue = onSnapshot(queueQuery, (snapshot) => {
      const waiting = [];
      const serving = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const customer = { id: change.doc.id, ...change.doc.data() };
          if (customer.status === 'waiting') {
            // Send notification for new customer
            sendLocalNotification(
              'New Customer',
              `${customer.name} joined the queue (Token #${customer.tokenNumber})`
            );
          }
        }
      });

      snapshot.forEach((doc) => {
        const customer = { id: doc.id, ...doc.data() };
        if (customer.status === 'waiting') {
          waiting.push(customer);
        } else if (customer.status === 'serving') {
          serving.push(customer);
        }
      });
      
      setWaitingQueue(waiting);
      setServingCustomers(serving);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeQueue();
    };
  }, []);

  const callNext = async () => {
    if (waitingQueue.length === 0) {
      Alert.alert('No Customers', 'There are no customers waiting in the queue.');
      return;
    }

    if (servingCustomers.length >= activeChairs) {
      Alert.alert('All Chairs Occupied', 'Please complete a service before calling the next customer.');
      return;
    }

    const nextCustomer = waitingQueue[0];
    try {
      await updateDoc(doc(db, 'queue', nextCustomer.id), {
        status: 'serving'
      });
      Alert.alert('Customer Called', `${nextCustomer.name} (Token #${nextCustomer.tokenNumber}) is now being served.`);
    } catch (error) {
      console.error('Error calling next customer:', error);
      Alert.alert('Error', 'Failed to call next customer.');
    }
  };

  const completeService = async (customerId, customerName) => {
    try {
      await deleteDoc(doc(db, 'queue', customerId));
      Alert.alert('Service Complete', `${customerName}'s service has been marked as complete.`);
    } catch (error) {
      console.error('Error completing service:', error);
      Alert.alert('Error', 'Failed to complete service.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderWaitingCustomer = ({ item, index }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <Text style={styles.tokenNumber}>#{item.tokenNumber}</Text>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.positionText}>Position: {index + 1}</Text>
      </View>
    </View>
  );

  const renderServingCustomer = ({ item }) => (
    <View style={[styles.customerCard, styles.servingCard]}>
      <View style={styles.customerInfo}>
        <Text style={styles.tokenNumber}>#{item.tokenNumber}</Text>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.servingText}>Being Served</Text>
      </View>
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => completeService(item.id, item.name)}
      >
        <Text style={styles.completeButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{waitingQueue.length}</Text>
          <Text style={styles.statLabel}>Waiting</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{servingCustomers.length}/{activeChairs}</Text>
          <Text style={styles.statLabel}>Serving</Text>
        </View>
        <View style={[styles.statCard, shopOpen ? styles.openCard : styles.closedCard]}>
          <Text style={styles.statNumber}>{shopOpen ? '🟢' : '🔴'}</Text>
          <Text style={styles.statLabel}>{shopOpen ? 'Open' : 'Closed'}</Text>
        </View>
      </View>

      {/* Call Next Button */}
      <TouchableOpacity
        style={[styles.callNextButton, !shopOpen && styles.disabledButton]}
        onPress={callNext}
        disabled={!shopOpen}
      >
        <Text style={styles.callNextText}>Call Next Customer</Text>
      </TouchableOpacity>

      {/* Currently Serving */}
      {servingCustomers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Serving</Text>
          <FlatList
            data={servingCustomers}
            renderItem={renderServingCustomer}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Waiting Queue */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Waiting Queue</Text>
        {waitingQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No customers waiting</Text>
          </View>
        ) : (
          <FlatList
            data={waitingQueue}
            renderItem={renderWaitingCustomer}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openCard: {
    backgroundColor: '#d1fae5',
  },
  closedCard: {
    backgroundColor: '#fee2e2',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  callNextButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  callNextText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  servingCard: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  customerInfo: {
    flex: 1,
  },
  tokenNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  customerName: {
    fontSize: 18,
    color: '#1f2937',
    marginTop: 4,
  },
  positionText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  servingText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default BarberDashboard;
