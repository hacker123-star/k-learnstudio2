// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD803Eb2yvhPPkLAyOOCuDOiaCLVT3FeSg",
  authDomain: "k-learnstudio2.firebaseapp.com",
  projectId: "k-learnstudio2",
  storageBucket: "k-learnstudio2.firebasestorage.app",
  messagingSenderId: "40762221634",
  appId: "1:40762221634:web:e89140ce92446c413039db",
  measurementId: "G-ZCXSFH919L"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };
