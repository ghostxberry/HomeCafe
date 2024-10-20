// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7pOMD0wtSCdJeAddryuphMxL-obfDJlM",
  authDomain: "mycafe-fe4e4.firebaseapp.com",
  projectId: "mycafe-fe4e4",
  storageBucket: "mycafe-fe4e4.appspot.com",
  messagingSenderId: "642033783239",
  appId: "1:642033783239:web:adf49b969a446a0d0809e2",
  measurementId: "G-BFRNM88SKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };