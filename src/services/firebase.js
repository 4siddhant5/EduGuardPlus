// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC56QhLc0TUFNwunf2_SmrxVUMfG8G81UA",
  authDomain: "eduguard-fc5a0.firebaseapp.com",
  databaseURL: "https://eduguard-fc5a0-default-rtdb.firebaseio.com",
  projectId: "eduguard-fc5a0",
  storageBucket: "eduguard-fc5a0.firebasestorage.app",
  messagingSenderId: "395421598406",
  appId: "1:395421598406:web:cb8a0be9af88e9b5610dc7",
  measurementId: "G-QFJH9FXM2H",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
