import { getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBZ-XKibb7tY8WHdr6qoxOjL1xfjhDf3Ko',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tracker-gr1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tracker-gr1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tracker-gr1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '337716077469',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:337716077469:web:6b1d17bd0a492d881b4574',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
