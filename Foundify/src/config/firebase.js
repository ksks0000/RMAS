import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// import * as firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyBwLZYPlkSGZCADo379ABdca5BziBHOX8Y",
    authDomain: "fuondify.firebaseapp.com",
    projectId: "fuondify",
    storageBucket: "fuondify.appspot.com",
    messagingSenderId: "372221904436",
    appId: "1:372221904436:web:155346b8254917040a6c61"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
// export const FIREBASE_DB = getFirestore(FIREBASE_APP);

// let app;
// if (firebase.apps.length === 0) {
//     app = firebase.initializeApp(firebaseConfig);
// } else {
//     app = firebase.app();
// }

// export const auth = firebase.auth();