// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTk9aeYc1fEiirGJ0zi10s90TYhCI-I5Q",
  authDomain: "next-js-todos-644ca.firebaseapp.com",
  projectId: "next-js-todos-644ca",
  storageBucket: "next-js-todos-644ca.firebasestorage.app",
  messagingSenderId: "406240068429",
  appId: "1:406240068429:web:53ba2c90d6d7a1afed6d04",
  measurementId: "G-JXTKKGEBYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

export default db;