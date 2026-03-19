// Firebase Configuration for Mobile App - UPDATED WITH YOUR PROJECT
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPIGYlyZEvbMCSPli3aYERYb3xeYDCgMY",
  authDomain: "quevix-4f006.firebaseapp.com",
  projectId: "quevix-4f006",
  storageBucket: "quevix-4f006.firebasestorage.app",
  messagingSenderId: "957825602044",
  appId: "1:957825602044:web:ab6163dbc150bd7bc2e279"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db, app };
