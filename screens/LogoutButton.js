// components/LogoutButton.js
import { Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return <Button title="Logout" onPress={handleLogout} />;
};

export default LogoutButton;