import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChCiPKJIxnONEH-_pY8j77u31CnoEMSc0",
  authDomain: "vendixo.firebaseapp.com",
  projectId: "vendixo",
  storageBucket: "vendixo.firebasestorage.app",
  messagingSenderId: "61407157294",
  appId: "1:61407157294:web:ad863b858a6bcba3e693bf",
  measurementId: "G-R819ZPZN2T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;//