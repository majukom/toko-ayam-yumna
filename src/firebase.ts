import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyADP5nPo305iolsGgCxjeewBOnXM90eBJ8",
  authDomain: "toko-ayam-yumna.firebaseapp.com",
  projectId: "toko-ayam-yumna",
  storageBucket: "toko-ayam-yumna.firebasestorage.app",
  messagingSenderId: "199519709824",
  appId: "1:199519709824:web:b30ceba20d90ad9c805465",
  measurementId: "G-QPSNZLCRMX"
};

// Initialize Firebase safely (avoid duplicate initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
