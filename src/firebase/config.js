import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdpDmdFF3ZRHBZq3kS0gEmRRQ6g46KyT0",
  authDomain: "localserviceapp-4545.firebaseapp.com",
  projectId: "localserviceapp-4545",
  storageBucket: "localserviceapp-4545.firebasestorage.app",
  messagingSenderId: "72597482250",
  appId: "1:72597482250:web:c5e16226294692d1c7e8f3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);