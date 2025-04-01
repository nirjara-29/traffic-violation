document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submitButton');
    const spinner = document.getElementById('spinner');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const successDialog = document.getElementById('successDialog');
    const overlay = document.getElementById('overlay');
    const continueButton = document.getElementById('continueButton');
   
    // Form submission
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
     
      // Get form values
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
     
      // Validate inputs
      if (!username || !password) {
        showError('Please enter both username and password');
        return;
      }
     
      // Show loading state
      setLoading(true);
     
      // Simulate API call with timeout
      setTimeout(function() {
        setLoading(false);
       
        // Success case
        showSuccess();
       
        // Reset form
        loginForm.reset();
      }, 1000);
    });
   
    // Continue button click
    continueButton.addEventListener('click', function() {
      hideSuccess();
    });
   
    // Helper functions
    function showError(message) {
      errorMessage.textContent = message;
      errorAlert.style.display = 'block';
    }
   
    function hideError() {
      errorAlert.style.display = 'none';
    }
   
    function setLoading(isLoading) {
      if (isLoading) {
        submitButton.querySelector('span').style.opacity = '0.5';
        spinner.style.display = 'block';
        submitButton.disabled = true;
      } else {
        submitButton.querySelector('span').style.opacity = '1';
        spinner.style.display = 'none';
        submitButton.disabled = false;
      }
    }
   
    function showSuccess() {
      successDialog.style.display = 'block';
      overlay.style.display = 'block';
    }
   
    function hideSuccess() {
      successDialog.style.display = 'none';
      overlay.style.display = 'none';
    }
   
    // Clear error on input
    usernameInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);
  });





