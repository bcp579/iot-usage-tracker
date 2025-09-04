import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CompanyHome() {
  const [marketingList, setMarketingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [totalUsage, setTotalUsage] = useState(0);

  useEffect(() => {
    const fetchMarketingPeople = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'user'));
          const results = [];
          let total = 0;
      
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            if (data.role === 'marketing') {
              results.push({ id: docSnap.id, name: data.name });
      
              const linked = data.linkedMachines || [];
      
              for (const pharmacyId of linked) {
                const usageSnap = await getDocs(collection(db, 'user', pharmacyId, 'dailyUsage'));
                usageSnap.forEach(doc => {
                  const count = doc.data().count || 0;
                  total += count;
                });
              }
            }
          }
      
          setMarketingList(results);
          setTotalUsage(total);
        } catch (err) {
          console.error('Error fetching marketing list or usage:', err);
        } finally {
          setLoading(false);
        }
      };
      

    fetchMarketingPeople();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Company Dashboard</Text>
          <Text style={styles.subText}>Marketing Team Overview</Text>
          <Text style={styles.totalUsage}>Total Usage: {totalUsage}</Text>
        </View>

        {marketingList.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('MarketingDetail', { marketingId: item.id })}
          >
            <View style={styles.cardContent}>
              <Icon name="account-tie" size={28} color="#4f46e5" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>Marketing Executive</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  totalUsage: {
  fontSize: 20,
  color: '#c7d2fe',
  marginTop: 8,
  fontWeight: '500',
  backgroundColor: '#fff',
  color: '#1f2937',
  padding: 10,
  borderRadius: 8,
},

  subText: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 6,
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
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
