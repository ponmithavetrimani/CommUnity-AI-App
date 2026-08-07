import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJSZoOzXk0YBA4KUju1BeIrhu5dN1zodQ",
  authDomain: "community-ai-cffa6.firebaseapp.com",
  databaseURL:
    "https://community-ai-cffa6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "community-ai-cffa6",
  storageBucket: "community-ai-cffa6.firebasestorage.app",
  messagingSenderId: "895804894184",
  appId: "1:895804894184:web:cb815c0309db35537b925d7",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);