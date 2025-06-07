// lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getDatabase, connectDatabaseEmulator, type Database } from "firebase/database"

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars)
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`)
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let realtimeDb: Database

// Track emulator connection status
let emulatorsConnected = false

function initializeFirebase() {
  try {
    // Initialize Firebase app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase app initialized successfully")
    } else {
      app = getApp()
      console.log("Firebase app already initialized")
    }

    // Initialize services
    auth = getAuth(app)
    db = getFirestore(app)
    realtimeDb = getDatabase(app)
    
    console.log("All Firebase services initialized successfully")

    // Use emulators in development (only on client side)
    if (typeof window !== 'undefined' && 
        process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
        !emulatorsConnected) {
      
      try {
        connectAuthEmulator(auth, "http://localhost:9099")
        connectFirestoreEmulator(db, "localhost", 8080)
        connectDatabaseEmulator(realtimeDb, "localhost", 9000)
        emulatorsConnected = true
        console.log("Firebase emulators connected")
      } catch (emulatorError: unknown) {
        const errorMessage = emulatorError instanceof Error ? emulatorError.message : 'Unknown emulator error'
        console.log("Emulators already connected or not available:", errorMessage)
      }
    }

    return true
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firebase initialization error'
    console.error("Firebase initialization error:", errorMessage)
    throw error
  }
}

// Initialize Firebase immediately
const isInitialized = initializeFirebase()

// Safe getter functions with proper error handling
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

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!(app && auth && db && realtimeDb)
}

// Debug function to check configuration
export const debugFirebaseConfig = () => {
  console.log('Firebase Configuration Status:', {
    apiKey: firebaseConfig.apiKey ? 'SET ✅' : 'MISSING ❌',
    authDomain: firebaseConfig.authDomain ? 'SET ✅' : 'MISSING ❌',
    databaseURL: firebaseConfig.databaseURL ? 'SET ✅' : 'MISSING ❌',
    projectId: firebaseConfig.projectId ? 'SET ✅' : 'MISSING ❌',
    storageBucket: firebaseConfig.storageBucket ? 'SET ✅' : 'MISSING ❌',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'SET ✅' : 'MISSING ❌',
    appId: firebaseConfig.appId ? 'SET ✅' : 'MISSING ❌',
    measurementId: firebaseConfig.measurementId ? 'SET ✅' : 'MISSING ❌'
  })
}

// Export Firebase instances
export { app, auth, db, realtimeDb }
export type { FirebaseApp, Auth, Firestore, Database }