import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MarketingDetail({ route }) {
  const { marketingId } = route.params;
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketingName, setMarketingName] = useState('');
  const [totalDaily, setTotalDaily] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7);

        const marketingDoc = await getDoc(doc(db, 'user', marketingId));
        const linkedPharmacies = marketingDoc.data().linkedMachines || [];

        setMarketingName(marketingDoc.data().name || 'Marketing Person');

        let allDaily = 0, allMonthly = 0, allTotal = 0;

        const results = await Promise.all(
          linkedPharmacies.map(async (pharmacyId) => {
            const pharmacyDoc = await getDoc(doc(db, 'user', pharmacyId));
            const pharmacyName = pharmacyDoc.data().name || 'Pharmacy';

            const usageSnap = await getDocs(collection(db, 'user', pharmacyId, 'dailyUsage'));

            let daily = 0, monthly = 0, total = 0;
            usageSnap.forEach(doc => {
              const date = doc.id;
              const count = doc.data().count || 0;

              if (date === today) daily += count;
              if (date.startsWith(currentMonth)) monthly += count;
              total += count;
            });

            allDaily += daily;
            allMonthly += monthly;
            allTotal += total;

            return {
              id: pharmacyId,
              name: pharmacyName,
              daily,
              monthly,
              total
            };
          })
        );

        setTotalDaily(allDaily);
        setTotalMonthly(allMonthly);
        setTotalUsage(allTotal);
        setPharmacies(results);
      } catch (err) {
        console.error('Error loading marketing details:', err);
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
             <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>{marketingName}</Text>
          <Text style={styles.subText}>Linked Pharmacies Overview</Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Usage</Text>
            <Text style={styles.totalLine}>Today: {totalDaily}</Text>
            <Text style={styles.totalLine}>Month: {totalMonthly}</Text>
            <Text style={styles.totalLine}>All Time: {totalUsage}</Text>
          </View>
        </View>

        {pharmacies.length === 0 ? (
          <Text style={styles.emptyText}>No pharmacies linked.</Text>
        ) : (
          pharmacies.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: item.id })}
            >
              <View style={styles.cardContent}>
                <Icon name="local-pharmacy" size={28} color="#4f46e5" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.usage}>Today: {item.daily}</Text>
                  <Text style={styles.usage}>Month: {item.monthly}</Text>
                  <Text style={styles.usage}>Total: {item.total}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subText: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 6,
  },
  totalBox: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems:'center'
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    marginBottom: 4,
  },
  totalLine: {
    color: 'black',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  usage: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
});
