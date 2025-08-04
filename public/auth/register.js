import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
  fetchSignInMethodsForEmail, linkWithCredential 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const firebaseConfig = window.FIREBASE_CONFIG;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  let pendingGithubCredential = null;

  document.getElementById("loginBtnGoogle").addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      saveUserData(result.user);
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed");
    }
  });


  document.getElementById("loginBtnGithub").addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      saveUserData(result.user);
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData.email;
        pendingGithubCredential = error.credential;

        const providers = await fetchSignInMethodsForEmail(auth, email);
        if (providers.includes("google.com")) {
          document.getElementById("linkModal").classList.remove("hidden");
        } else {
          alert("Account exists with another provider. Please use that to login.");
        }
      } else {
        console.error("GitHub login error:", error);
        alert("GitHub login failed");
      }
    }
  });


  document.getElementById("confirmLink").addEventListener("click", async () => {
    document.getElementById("linkModal").classList.add("hidden");
    try {
      const googleResult = await signInWithPopup(auth, new GoogleAuthProvider());
      if (pendingGithubCredential) {
        const linkedResult = await linkWithCredential(googleResult.user, pendingGithubCredential);
        saveUserData(linkedResult.user);
      }
    } catch (error) {
      console.error("Linking error:", error);
      alert("Account linking failed");
    }
  });


  document.getElementById("cancelLink").addEventListener("click", () => {
    document.getElementById("linkModal").classList.add("hidden");
  });

  function saveUserData(user) {
    localStorage.setItem("userName", user.displayName || "GitHub User");
    localStorage.setItem("userEmail", user.email || "No email provided");
    localStorage.setItem("userPic", user.photoURL || "https://www.svgrepo.com/show/475647/github-color.svg");
    window.location.href = "/";
  }
});
