import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard,KeyboardAvoidingView, Platform,TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged in user:', user.uid);
      setError('');
      
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
      }
      setError(errorMessage);
    }
  };

  

return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        
        <View style={styles.card}>
          <Text style={styles.logo}>G-BROS</Text>
          <Text style={styles.title}>Login to your account</Text>
          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f6fc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: '85%',
      padding: 24,
      backgroundColor: '#fff',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
      alignItems: 'center',
    },
    logo: {
      fontSize: 36,
      fontWeight: '700',
      color: '#2e3a59',
      marginBottom: 12,
    },
    title: {
      fontSize: 15,
      color: '#6b7280',
      marginBottom: 20,
    },
    input: {
      width: '100%',
      padding: 12,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      backgroundColor: '#fafafa',
    },
    button: {
      width: '100%',
      backgroundColor: '#1e3a8a',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    error: {
      color: '#dc2626',
      marginBottom: 10,
      fontSize: 14,
      textAlign: 'center',
    },
    forgotText: {
      color: '#007BFF',
      textAlign: 'center',
      marginTop: 20,
    }
    
  });