// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// firebase storage is different than firestore database, it is for files and media etc


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for server side rendering
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// simple ternery, if all of the "apps" we create does not exist then we initialize the app, if not we return our app, simple

const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// because we next.js and uses server side rendering we need to avoid initializing an app both 
// on the app and client side and we will get an error if we try to call the initialize app function on the server

export { app, firestore, auth, storage };