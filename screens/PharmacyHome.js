import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import LogoutButton from './LogoutButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PharmacyHome () {
  const [dailyCount, setDailyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentMonth = todayStr.slice(0, 7);

        const userDoc = await getDoc(doc(db, 'user', user.uid));
        setName(userDoc.data().name || 'Pharmacy');

        const usageRef = collection(db, 'user', user.uid, 'dailyUsage');
        const snapshot = await getDocs(usageRef);

        let todaySum = 0;
        let monthSum = 0;
        let totalSum = 0;

        snapshot.forEach(doc => {
          const date = doc.id;
          const count = doc.data().count || 0;

          if (date === todayStr) todaySum += count;
          if (date.startsWith(currentMonth)) monthSum += count;
          totalSum += count;
        });

        setDailyCount(todaySum);
        setMonthlyCount(monthSum);
        setTotalCount(totalSum);
      } catch (err) {
        console.error('Error loading usage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4f46e5" />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          {/* <Text style={styles.greeting}> Hello,</Text> */}
          <Text style={styles.username}>{name}</Text>
          <Text style={styles.subtitle}>Welcome to your Dashboard!</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="calendar-today" size={28} color="#4f46e5" />
            <Text style={styles.statLabel}>Today's Usage</Text>
            <Text style={styles.statValue}>{dailyCount}</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="calendar-month-outline" size={28} color="#0ea5e9" />
            <Text style={styles.statLabel}>Monthly Usage</Text>
            <Text style={styles.statValue}>{monthlyCount}</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="counter" size={28} color="#10b981" />
            <Text style={styles.statLabel}>Total Usage</Text>
            <Text style={styles.statValue}>{totalCount}</Text>
          </View>
        </View>

        <View style={styles.logoutArea}>
          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#c7d2fe',
    marginTop: 8,
  },
  statsContainer: {
    gap: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 6,
  },
  logoutArea: {
    marginTop: 40,
    alignItems: 'center',
  },
});


