import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "@firebase/storage";
import { FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCEmdg4K4yEvVnFZv2guQCIZKqRJuZvssk",
  authDomain: "tripami-b644a.firebaseapp.com",
  projectId: "tripami-b644a",
  storageBucket: "tripami-b644a.appspot.com",
  messagingSenderId: "912684164438",
  appId: "1:912684164438:web:c0bc649c0d98d4f9b762f7",
  measurementId: "G-29NCDGSMVT"
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('user_birthday');

export const googleProvider = new GoogleAuthProvider();
