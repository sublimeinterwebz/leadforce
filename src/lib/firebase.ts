import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAiEkm6qJpHvddtN23C6CzBPgLKSIy8vzs",
  authDomain: "leadforce-ae5d2.firebaseapp.com",
  projectId: "leadforce-ae5d2",
  storageBucket: "leadforce-ae5d2.firebasestorage.app",
  messagingSenderId: "633395720935",
  appId: "1:633395720935:web:1a8a2a034fd9a1702fe842",
  measurementId: "G-DCQMPDDXMM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firebase Auth context on the client
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence);
}

export { app, auth };
