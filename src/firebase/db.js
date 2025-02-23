// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3byVJHhUyr4vtEkFDXlu5lEbB6IL_NlQ",
  authDomain: "mlt-lab-managment-system.firebaseapp.com",
  projectId: "mlt-lab-managment-system",
  storageBucket: "mlt-lab-managment-system.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "335840432893",
  appId: "1:335840432893:web:e41e31e078ec9802bd2494",
  measurementId: "G-HLPGZ30CRX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app); // Authentication
const db = getFirestore(app); // Firestore Database
const storage = getStorage(app); // Firebase Storage
const analytics = getAnalytics(app); // Analytics (only for web apps)

export { app, auth, db, storage, analytics };
