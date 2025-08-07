import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getAuth, GoogleAuthProvider, GithubAuthProvider, 
  signInWithRedirect, getRedirectResult, 
  fetchSignInMethodsForEmail, linkWithCredential 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const firebaseConfig = window.FIREBASE_CONFIG;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  let pendingGithubCredential = null;

  // Handle redirect result
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      saveUserData(result.user);
    }
  } catch (error) {
    console.error(error);
  }

  document.getElementById("loginBtnGoogle").addEventListener("click", () => {
    signInWithRedirect(auth, new GoogleAuthProvider());
  });

  document.getElementById("loginBtnGithub").addEventListener("click", () => {
    signInWithRedirect(auth, new GithubAuthProvider());
  });

  document.getElementById("confirmLink").addEventListener("click", async () => {
    document.getElementById("linkModal").classList.add("hidden");
    try {
      const googleResult = await signInWithRedirect(auth, new GoogleAuthProvider());
      if (pendingGithubCredential) {
        const linkedResult = await linkWithCredential(googleResult.user, pendingGithubCredential);
        saveUserData(linkedResult.user);
      }
    } catch (error) {
      alert("Account linking failed");
    }
  });

  document.getElementById("cancelLink").addEventListener("click", () => {
    document.getElementById("linkModal").classList.add("hidden");
  });

  function saveUserData(user) {
    localStorage.setItem("userName", user.displayName || "GitHub User");
    localStorage.setItem("userEmail", user.email || "No email provided");
    localStorage.setItem("userPic", user.photoURL || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png");
    window.location.href = "/";
  }
});
