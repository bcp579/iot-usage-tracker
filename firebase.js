// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1o0XS0gzwKPl0y9JRIkN9RvMMBSQZOxE",
  authDomain: "pharmaiotapp.firebaseapp.com",
  projectId: "pharmaiotapp",
  storageBucket: "pharmaiotapp.firebasestorage.app",
  messagingSenderId: "577243241269",
  appId: "1:577243241269:web:2e60008101abde73e60a7c",
  measurementId: "G-M4B4V0H46Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// For IOT Device:
// docRef = users/{pharmacyUID}/dailyUsage/2025-05-06
// → { count: (existing count + new count) }


// Security-Firebase Database:
//rules_version = '2';
// service cloud.firestore {
//     match /databases/{database}/documents {
//       match /users/{userId} {
//         allow read: if request.auth.uid == userId;
//       }
//     }
//   }
  