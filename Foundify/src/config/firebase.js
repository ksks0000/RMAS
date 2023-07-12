// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

import * as firebase from "firebase/app";


const firebaseConfig = {
    apiKey: "AIzaSyBwLZYPlkSGZCADo379ABdca5BziBHOX8Y",
    authDomain: "fuondify.firebaseapp.com",
    projectId: "fuondify",
    storageBucket: "fuondify.appspot.com",
    messagingSenderId: "372221904436",
    appId: "1:372221904436:web:155346b8254917040a6c61"
};

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

let app;
if (firebase.apps.lenght === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

export const auth = firebase.auth();