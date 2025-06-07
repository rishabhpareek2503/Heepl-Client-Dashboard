// lib/firebase.ts - WITHOUT Storage
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getDatabase, connectDatabaseEmulator, type Database } from "firebase/database"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAAYIEWR-ewTCj-i0U0BquqcCSLJYDDVdY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "live-monitoring-system.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://live-monitoring-system-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "live-monitoring-system",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "live-monitoring-system.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "396044271748",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:396044271748:web:732d8bbfc8e06b7c8582d1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3R13EZNEJZ"
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let realtimeDb: Database

function initializeFirebase() {
  try {
    // Initialize Firebase app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase app initialized successfully")
    } else {
      app = getApp()
    }

    // Initialize essential services
    auth = getAuth(app)
    db = getFirestore(app)
    realtimeDb = getDatabase(app)
    
    console.log("Firebase services initialized")

    // Use emulators in development
    if (typeof window !== 'undefined' && 
        process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      
      try {
        connectAuthEmulator(auth, "http://localhost:9099")
        connectFirestoreEmulator(db, "localhost", 8080)
        connectDatabaseEmulator(realtimeDb, "localhost", 9000)
        console.log("Firebase emulators connected")
      } catch (emulatorError) {
        console.log("Emulators already connected or not available")
      }
    }

    return true
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return false
  }
}

// Initialize Firebase
const isInitialized = initializeFirebase()

// Safe getter functions
export const getFirebaseAuth = () => {
  if (!isInitialized || !auth) {
    throw new Error("Firebase Auth not initialized")
  }
  return auth
}

export const getFirebaseDb = () => {
  if (!isInitialized || !db) {
    throw new Error("Firebase Firestore not initialized")
  }
  return db
}

export const getFirebaseRealtimeDb = () => {
  if (!isInitialized || !realtimeDb) {
    throw new Error("Firebase Realtime Database not initialized")
  }
  return realtimeDb
}

// Export Firebase instances
export { app, auth, db, realtimeDb }
export type { FirebaseApp, Auth, Firestore, Database }