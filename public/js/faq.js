// FAQ functionality
function initializeFAQ() {
  document.querySelectorAll(".faq-button").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      const icon = button.querySelector(".faq-icon");

      // Close all other answers
      document.querySelectorAll(".faq-answer").forEach((otherAnswer) => {
        if (
          otherAnswer !== answer &&
          otherAnswer.classList.contains("active")
        ) {
          otherAnswer.classList.remove("active");
          const otherIcon =
            otherAnswer.previousElementSibling.querySelector(".faq-icon");
          otherIcon.style.transform = "";
        }
      });

      // Toggle current answer
      answer.classList.toggle("active");
      icon.style.transform = answer.classList.contains("active")
        ? "rotate(180deg)"
        : "";
    });
  });
}

// Initialize FAQ when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeFAQ);
