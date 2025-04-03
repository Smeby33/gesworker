// Import de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBq6zx95EABMlMWAqJzcKjCal-J8WUG1OU",
    authDomain: "gesworker.firebaseapp.com",
    projectId: "gesworker",
    storageBucket: "gesworker.firebasestorage.app",
    messagingSenderId: "732670479163",
    appId: "1:732670479163:web:c24ee601cb792e22a2c51e",
    measurementId: "G-H5LNMM5Z40"
  };
  

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
