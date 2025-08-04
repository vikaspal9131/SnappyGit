 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    GoogleAuthProvider, 
    GithubAuthProvider, 
    signInWithPopup 
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

 
  const firebaseConfig = {
    apiKey: "<%= FIREBASE_API_KEY %>",
    authDomain: "<%= FIREBASE_AUTH_DOMAIN %>",
    projectId: "<%= FIREBASE_PROJECT_ID %>",
    storageBucket: "<%= FIREBASE_STORAGE_BUCKET %>",
    messagingSenderId: "<%= FIREBASE_MESSAGING_SENDER_ID %>",
    appId: "<%= FIREBASE_APP_ID %>",
    measurementId: "<%= FIREBASE_MEASUREMENT_ID %>"
  };

  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("profileSection").classList.remove("hidden");
      document.getElementById("loginBtnHeader").classList.add("hidden");
      document.getElementById("userPic").src = user.photoURL;
    } else {
      document.getElementById("profileSection").classList.add("hidden");
      document.getElementById("loginBtnHeader").classList.remove("hidden");
    }
  });


console.log("Firebase Auth script loaded successfully");