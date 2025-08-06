window.addEventListener('load', () => {
      const loader = document.getElementById('loader');
      document.body.style.overflow = 'hidden';
      loader.style.display = 'flex';

      setTimeout(() => {
            loader.classList.add('hide');
            setTimeout(() => {
                  loader.style.display = 'none';
                  document.body.style.overflow = 'auto';
                  typeEffect();
            }, 1000);
      }, 3000);
});


document.querySelector("form").addEventListener("submit", function () {
      const btnText = document.getElementById("btnText");
      const loader = document.getElementById("loader");
      const button = document.getElementById("generateBtn");

      btnText.textContent = "Processing";
      loader.classList.remove("hidden");
      button.disabled = true;
});
