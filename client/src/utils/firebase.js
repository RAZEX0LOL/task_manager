import {initializeApp} from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "taskmanager-de90e.firebaseapp.com",
  projectId: "taskmanager-de90e",
  storageBucket: "taskmanager-de90e.firebasestorage.app",
  messagingSenderId: "1039503616676",
  appId: "1:1039503616676:web:70cd88ee903ba86eb99431"
};

export const app = initializeApp(firebaseConfig);