import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAt9YD0S3sSC41L6z7-xWEYIv4qUS0JP18",
  authDomain: "snappygit-aba92.firebaseapp.com",
  projectId: "snappygit-aba92",
  storageBucket: "snappygit-aba92.firebasestorage.app",
  messagingSenderId: "308994279113",
  appId: "1:308994279113:web:ce3c0a183bb6b44b24af18",
  measurementId: "G-YPM702YTMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
  const profileSection = document.getElementById("profileSection");
  const profilePic = document.getElementById("userPic");
  const logoutPopup = document.getElementById("logoutPopup");
  const logoutBtn = document.getElementById("logoutBtn");
  const serviceBtn = document.getElementById("generateBtn"); //  Button used to access service

  onAuthStateChanged(auth, (user) => {
    if (user) {
      //  Show profile and hide login button
      if (user.photoURL) profilePic.src = user.photoURL;
      profileSection?.classList.remove("hidden");
      document.getElementById("loginBtn")?.classList.add("hidden");

      //  Popup toggle
      profilePic?.addEventListener("click", () => {
        logoutPopup?.classList.toggle("hidden");
      });

      //  Logout
      logoutBtn?.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
          signOut(auth).then(() => {
            localStorage.clear();
            window.location.reload();
          });
        }
      });

      //  Close popup if click outside
      document.addEventListener("click", (e) => {
        if (!profilePic.contains(e.target) && !logoutPopup.contains(e.target)) {
          logoutPopup.classList.add("hidden");
        }
      });

    } else {
      //  User not logged in → block service on button click
      if (serviceBtn) {
        serviceBtn.addEventListener("click", (e) => {
          e.preventDefault();
          alert("Please login first to use this service.");
          window.location.href = "/login";
        });
      }
    }
  });
});
