import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MarketingHome() {
  const [totalUsage, setTotalUsage] = useState(0);
  const [pharmacyData, setPharmacyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, 'user', user.uid));
        const linkedPharmacies = userDoc.data().linkedMachines || [];

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7);

        let total = 0;
        let pharmacyList = [];

        for (let pharmacyId of linkedPharmacies) {
          const pharmacyDoc = await getDoc(doc(db, 'user', pharmacyId));
          const pharmacyName = pharmacyDoc.data().name || 'Unknown Pharmacy';

          const usageRef = collection(db, 'user', pharmacyId, 'dailyUsage');
          const usageSnap = await getDocs(usageRef);

          let daily = 0;
          let monthly = 0;
          let totalPharmacy = 0;

          usageSnap.forEach(doc => {
            const date = doc.id;
            const count = doc.data().count || 0;

            if (date === today) daily += count;
            if (date.startsWith(currentMonth)) monthly += count;

            totalPharmacy += count;
          });

          total += totalPharmacy;

          pharmacyList.push({
            id: pharmacyId,
            name: pharmacyName,
            daily,
            monthly,
            total: totalPharmacy
          });
        }

        setPharmacyData(pharmacyList);
        setTotalUsage(total);
      } catch (error) {
        console.error('Error fetching marketing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingData();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>📈 Marketing Dashboard</Text>
        </View>

        <View style={styles.totalCard}>
          <Icon name="chart-bar" size={28} color="#fff" />
          <Text style={styles.totalLabel}>Total Usage Across Pharmacies</Text>
          <Text style={styles.totalCount}>{totalUsage}</Text>
        </View>

        <Text style={styles.listHeading}>Pharmacy Stats</Text>
        <FlatList
          data={pharmacyData}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: item.id })}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.cardStatRow}>
                <Icon name="calendar-today" size={20} color="#4f46e5" />
                <Text style={styles.cardText}>Today: {item.daily}</Text>
              </View>
              <View style={styles.cardStatRow}>
                <Icon name="calendar-month" size={20} color="#0ea5e9" />
                <Text style={styles.cardText}>This Month: {item.monthly}</Text>
              </View>
              <View style={styles.cardStatRow}>
                <Icon name="counter" size={20} color="#10b981" />
                <Text style={styles.cardText}>Total: {item.total}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
  header: {
    backgroundColor: '#4f46e5',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 6,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subText: {
    color: '#e0e7ff',
    marginTop: 6,
    fontSize: 14,
  },
  totalCard: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  totalLabel: {
    color: '#c7d2fe',
    fontSize: 14,
    marginTop: 10,
  },
  totalCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  listHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1f2937',
  },
  cardStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
});
