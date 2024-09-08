// Code for the login page

// Select the form element from the DOM
const form = document.querySelector('form');

// Add an event listener to handle form submission
form.addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the values of the username/email and password fields
  const usernameOrEmail = form.elements['username-or-email'].value;
  const password = form.elements['password'].value;

  // Define the URL for the signin endpoint
  const url = 'https://learn.reboot01.com/api/auth/signin';

  // Combine the username/email and password into a single string
  const info = usernameOrEmail + ':' + password;

  // Encode the combined string in base64 format
  const credentials = btoa(info);

  // Send a POST request to the signin endpoint to obtain a JWT
  fetch(url, {
    method: 'POST', // HTTP method
    headers: {
      'Authorization': 'Basic ' + credentials, // Basic authentication header
      'Content-Type': 'application/json' // Content type of the request
    },
    body: JSON.stringify({}), // Empty body as the credentials are in the header
  })
  .then(response => response.json()) // Parse the response as JSON
  .then(data => {
    // Extract the JWT from the response
    const jwt = data;

    // Check if the JWT is valid
    if (jwt && jwt.length > 0) {
      // Store the JWT in cookies with a 1-day expiration
      Cookies.set('jwt', jwt, { expires: 1 });

      // Redirect the user to the "dashboard.html" page
      window.location.href = 'dashboard.html';
    } else {
      // Display an error message if the JWT is not valid
      const errorMessage = 'Invalid Username or password';
      document.getElementById('error-message').textContent = errorMessage;
      console.error(errorMessage);
    }
  })
  .catch(error => console.error(error)); // Log any errors that occur during the fetch
});