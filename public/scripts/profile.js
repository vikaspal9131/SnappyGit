const userPic = localStorage.getItem("userPic");
const userName = localStorage.getItem("userName");

  if (userPic) {
    document.getElementById("profileSection").classList.remove("hidden");
    document.getElementById("userPic").src = userPic;
    document.getElementById("loginBtn").classList.add("hidden");
  }

  else {
    console.log("No user picture found in localStorage.");
  }


    const profilePic = document.getElementById("userPic");
  const logoutPopup = document.getElementById("logoutPopup");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ Show popup on profile click
  profilePic.addEventListener("click", () => {
    logoutPopup.classList.toggle("hidden");
  });

  // ✅ Logout user
  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  });

  // ✅ Close popup if clicked outside
  document.addEventListener("click", (e) => {
    if (!profilePic.contains(e.target) && !logoutPopup.contains(e.target)) {
      logoutPopup.classList.add("hidden");
    }
  });