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
      const loader = document.getElementById("btnLoader");
      const button = document.getElementById("generateBtn");

      btnText.textContent = "Processing...";
      loader.classList.remove("hidden");
      button.disabled = true;
      
    });


     function validateMaxSkipDays(input) {
            const value = parseInt(input.value, 10);
            if (value > 7) {
              alert("Max skip days cannot exceed 7.");
              input.value = 7;
            }
            if (value < 0 || isNaN(value)) {
              input.value = 0;
            }

            document.getElementById("skipNote").textContent =
              input.value === "0"
                ? "No skip days"
                : `Up to ${input.value} day(s) will be randomly skipped`;
          }
