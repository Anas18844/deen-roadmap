import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCgUdziobBxHEapLp0jDvT6Wn26Ncs75vA',
  authDomain: 'deenpath-cd236.firebaseapp.com',
  projectId: 'deenpath-cd236',
  storageBucket: 'deenpath-cd236.firebasestorage.app',
  messagingSenderId: '594115269',
  appId: '1:594115269:web:fadbb365dd8df358a5ceac',
  measurementId: 'G-9ZLWW7YVLZ',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
