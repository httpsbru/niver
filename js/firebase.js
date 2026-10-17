
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_M-jisVGXVAR3-3m2bSRY3KAO0K89ugA",
  authDomain: "anviersario.firebaseapp.com",
  projectId: "anviersario",
  storageBucket: "anviersario.firebasestorage.app",
  messagingSenderId: "586611846758",
  appId: "1:586611846758:web:bce3a1ddb5d76b642987a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
