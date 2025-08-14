import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
 apiKey: "AIzaSyB1bYI8b3T-XofG3JRneLBN59isAzG1hgM",
  authDomain: "fx-journal-846be.firebaseapp.com",
  projectId: "fx-journal-846be",
  storageBucket: "fx-journal-846be.firebasestorage.app",
  messagingSenderId: "318171146380",
  appId: "1:318171146380:web:ffda8672a84e20f40fb3a9",
  measurementId: "G-X895R8DYLM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized:", app); // Debug log

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase Services Initialized:", { auth, db, storage }); // Debug log