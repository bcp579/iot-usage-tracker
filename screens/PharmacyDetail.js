import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LogoutButton from './LogoutButton';

export default function PharmacyDetail({ route }) {
  const { pharmacyId } = route.params;
  const [dailyCount, setDailyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7);

        const userDoc = await getDoc(doc(db, 'user', pharmacyId));
        setName(userDoc.data().name || 'Pharmacy');

        const usageRef = collection(db, 'user', pharmacyId, 'dailyUsage');
        const usageSnap = await getDocs(usageRef);

        let daily = 0,
          monthly = 0,
          total = 0;

        usageSnap.forEach(doc => {
          const date = doc.id;
          const count = doc.data().count || 0;

          if (date === today) daily += count;
          if (date.startsWith(currentMonth)) monthly += count;

          total += count;
        });

        setDailyCount(daily);
        setMonthlyCount(monthly);
        setTotalCount(total);
      } catch (err) {
        console.error('Error fetching pharmacy details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
       
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
            <Text style={styles.headerText}>{name}</Text>
            <Text style={styles.subText}>Usage Summary</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="calendar-today" size={28} color="#4f46e5" />
          <Text style={styles.statLabel}>Today's Usage</Text>
          <Text style={styles.statValue}>{dailyCount}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="calendar-month" size={28} color="#0ea5e9" />
          <Text style={styles.statLabel}>Monthly Usage</Text>
          <Text style={styles.statValue}>{monthlyCount}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="chart-bar" size={28} color="#10b981" />
          <Text style={styles.statLabel}>Total Usage</Text>
          <Text style={styles.statValue}>{totalCount}</Text>
        </View>

        <View style={{ marginTop: 40 }}>
          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
 backIcon: {
  position: 'absolute',
  left: 16,
  top: 16,
  padding: 8,
},
  
  header: {
    backgroundColor: '#4f46e5',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subText: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 6,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
});
