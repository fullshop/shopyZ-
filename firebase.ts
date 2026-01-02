import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkA6n4q-7suEICnRZcrgAnBtZ2bwrQyL8",
  authDomain: "shopyz-f79d0.firebaseapp.com",
  projectId: "shopyz-f79d0",
  storageBucket: "shopyz-f79d0.firebasestorage.app",
  messagingSenderId: "285467474064",
  appId: "1:285467474064:web:edd188f5ef255d49988015",
  measurementId: "G-GQMVD6ELFE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);