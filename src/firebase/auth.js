import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, googleProvider, db } from "./config";

/* =========================
   🔐 PERMANENT ADMIN EMAIL
========================= */

const ADMIN_EMAIL = "jyotikanagesh1320@gmail.com";

/* =========================
   GOOGLE LOGIN ONLY
========================= */

export const loginWithGoogle = async (selectedRole) => {
  const result = await signInWithPopup(auth, googleProvider);

  const docRef = doc(db, "users", result.user.uid);

  // 🔥 Force Admin if email matches
  const lowerRole =
    result.user.email === ADMIN_EMAIL
      ? "admin"
      : (selectedRole || "customer").toLowerCase();

  // Save / Update user document
  await setDoc(
    docRef,
    {
      email: result.user.email,
      role: lowerRole,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return result;
};

/* =========================
   ROLE FETCH
========================= */

export const getUserRole = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
};

/* =========================
   LOGOUT & AUTH LISTENER
========================= */

export const logoutUser = () => signOut(auth);

export const listenToAuthChanges = (callback) =>
  onAuthStateChanged(auth, callback);