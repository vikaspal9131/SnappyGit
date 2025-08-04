document.querySelector("form").addEventListener("submit", function () {
      const btnText = document.getElementById("btnText");
      const loader = document.getElementById("loader");
      const button = document.getElementById("generateBtn");

      btnText.textContent = "Processing";
      loader.classList.remove("hidden");
      button.disabled = true; // prevent multiple clicks
});
