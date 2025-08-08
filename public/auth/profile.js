import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = window.FIREBASE_CONFIG;


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const profileSection = document.getElementById("profileSection");
  const profilePic = document.getElementById("userPic");
  const logoutPopup = document.getElementById("logoutPopup");
  const logoutBtn = document.getElementById("logoutBtn");
  const serviceBtn = document.getElementById("generateBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.photoURL) profilePic.src = user.photoURL;
      profileSection?.classList.remove("hidden");
      document.getElementById("loginBtn")?.classList.add("hidden");

      profilePic?.addEventListener("click", () => {
        logoutPopup?.classList.toggle("hidden");
      });

      logoutBtn?.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
          signOut(auth).then(() => {
            localStorage.clear();
            window.location.reload();
          });
        }
      });

      document.addEventListener("click", (e) => {
        if (!profilePic.contains(e.target) && !logoutPopup.contains(e.target)) {
          logoutPopup.classList.add("hidden");
        }
      });
    } else {
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
