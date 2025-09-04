import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import PharmacyHome from '../screens/PharmacyHome';
import MarketingHome from '../screens/MarketingHome';
import CompanyHome from '../screens/CompanyHome';
import PharmacyDetail from '../screens/PharmacyDetail';
import MarketingDetail from '../screens/MarketingDetail';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        console.log('User logged in:', firebaseUser.uid);
        const docSnap = await getDoc(doc(db, 'user', firebaseUser.uid));
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          console.warn('No user document found!');
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : userRole === 'pharmacy' ? (
          <>
            <Stack.Screen name="PharmacyHome" component={PharmacyHome} />
          </>
        ) : userRole === 'marketing' ? (
          <>
            <Stack.Screen name="MarketingHome" component={MarketingHome} />
            {/* <Stack.Screen name="MarketingDetail" component={MarketingDetail} /> */}
            <Stack.Screen name="PharmacyDetail" component={PharmacyDetail} />
          </>
        ) : userRole === 'company' ? (
          <>
            <Stack.Screen name="CompanyHome" component={CompanyHome} />
            <Stack.Screen name="MarketingDetail" component={MarketingDetail} />
            <Stack.Screen name="PharmacyDetail" component={PharmacyDetail} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
