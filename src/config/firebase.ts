import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace these values with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCa3CSI4B0tmUvWARj1bPtahnBJ5LwX2Mc",
  authDomain: "chronosi.firebaseapp.com",
  projectId: "chronosi",
  storageBucket: "chronosi.firebasestorage.app",
  messagingSenderId: "266408259350",
  appId: "1:266408259350:web:086b5fba6778216a976a37",
  measurementId: "G-BL5BY68P1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Export the app instance if needed elsewhere
export default app;
