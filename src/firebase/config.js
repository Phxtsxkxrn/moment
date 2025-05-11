import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB60VyvbiDtnhBHVFI5aegJUlXttiebLJU",
  authDomain: "moment-c56cb.firebaseapp.com",
  projectId: "moment-c56cb",
  storageBucket: "moment-c56cb.firebasestorage.app",
  messagingSenderId: "598478491444",
  appId: "1:598478491444:web:1ab762f57001554ee2df61",
  measurementId: "G-TDH80C6MJ5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
