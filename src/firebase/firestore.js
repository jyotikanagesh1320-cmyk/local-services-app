import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

/* =====================================================
   SETTINGS – GLOBAL COMMISSION
===================================================== */

// Get commission percent from settings/global
export const getCommissionPercent = async () => {
  const settingsRef = doc(db, "settings", "global");
  const snapshot = await getDoc(settingsRef);

  if (snapshot.exists()) {
    return snapshot.data().commissionPercent || 10;
  }

  // Default 10% if not set
  return 10;
};

// Admin update commission percent
export const updateCommissionPercent = async (percent) => {
  const settingsRef = doc(db, "settings", "global");

  await setDoc(
    settingsRef,
    { commissionPercent: Number(percent) },
    { merge: true }
  );
};

/* =====================================================
   PROVIDER SERVICES
===================================================== */

export const addProviderService = async (serviceData) => {
  return await addDoc(collection(db, "services"), {
    serviceName: serviceData.serviceName,
    price: Number(serviceData.price),
    providerId: serviceData.providerId,
    providerName: serviceData.providerName,
    providerMobile: serviceData.providerMobile,
    latitude: serviceData.latitude || null,
    longitude: serviceData.longitude || null,
    approved: false,
    createdAt: serverTimestamp(),
  });
};

export const updateServicePrice = async (serviceId, newPrice) => {
  const serviceRef = doc(db, "services", serviceId);
  await updateDoc(serviceRef, {
    price: Number(newPrice),
  });
};

export const fetchApprovedServices = async () => {
  const q = query(
    collection(db, "services"),
    where("approved", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* =====================================================
   BOOKING CODE GENERATOR
===================================================== */

const generateBookingCode = () => {
  return "BK" + Math.floor(100000 + Math.random() * 900000);
};

/* =====================================================
   BOOKINGS (Dynamic Commission)
===================================================== */

export const createBooking = async (bookingData) => {
  const commissionPercent = await getCommissionPercent();

  const commission =
    (bookingData.amount * commissionPercent) / 100;

  const providerAmount = bookingData.amount - commission;

  return await addDoc(collection(db, "bookings"), {
    bookingCode: generateBookingCode(),

    service: bookingData.service,
    providerId: bookingData.providerId,
    providerName: bookingData.providerName,
    providerMobile: bookingData.providerMobile,

    customerId: bookingData.customerId,
    customerName: bookingData.customerName,
    customerMobile: bookingData.customerMobile,

    amount: bookingData.amount,
    commissionPercent,
    commission,
    providerAmount,

    status: "Pending",
    paymentStatus: "Hold",

    rating: 0,
    review: "",

    createdAt: serverTimestamp(),
  });
};

/* =====================================================
   PROVIDER BOOKINGS
===================================================== */

export const subscribeToProviderBookings = (providerId, callback) => {
  const q = query(
    collection(db, "bookings"),
    where("providerId", "==", providerId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      bookingCode: doc.data().bookingCode,
      service: doc.data().service,
      amount: doc.data().amount,
      commission: doc.data().commission,
      providerAmount: doc.data().providerAmount,
      status: doc.data().status,
      paymentStatus: doc.data().paymentStatus,
    }));
    callback(bookings);
  });
};

/* =====================================================
   CUSTOMER BOOKINGS
===================================================== */

export const subscribeToCustomerBookings = (uid, callback) => {
  const q = query(
    collection(db, "bookings"),
    where("customerId", "==", uid)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(bookings);
  });
};

/* =====================================================
   UPDATE BOOKING STATUS
===================================================== */

export const updateBookingStatus = async (
  bookingId,
  status,
  paymentStatus
) => {
  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    status,
    paymentStatus,
  });
};

/* =====================================================
   REVIEW SYSTEM
===================================================== */

export const addReview = async (bookingId, rating, reviewText) => {
  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    rating,
    review: reviewText,
  });
};

/* =====================================================
   ADMIN – SERVICE APPROVAL
===================================================== */

export const fetchPendingServices = async () => {
  const q = query(
    collection(db, "services"),
    where("approved", "==", false)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const approveService = async (serviceId) => {
  const serviceRef = doc(db, "services", serviceId);

  await updateDoc(serviceRef, {
    approved: true,
  });
};

/* =====================================================
   ADMIN – FULL ACCESS
===================================================== */

export const fetchAllBookings = async () => {
  const snapshot = await getDocs(collection(db, "bookings"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};