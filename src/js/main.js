// Main JavaScript file for the application

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Hide loading screen after 2 seconds
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
    }
  }, 2000);

  // Initialize any other components or functionality here
  console.log('Application initialized');
}); 