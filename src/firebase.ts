import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db: ReturnType<typeof getFirestore> | null = null;
try {
  // initialize only when projectId exists (env provided)
  if (firebaseConfig.projectId) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);
    db = getFirestore(app);
  }
} catch (e) {
  // noop - db remains null if config invalid
  console.warn('Firebase init failed', e);
}

export { db };
