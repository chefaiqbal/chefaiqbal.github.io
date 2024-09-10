// Define the URL for the GraphQL endpoint
const url = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

// Get the JWT from the cookies
const jwt = Cookies.get('jwt');

// Define the GraphQL query to fetch user login and current project
const query = `
  {
    user {
      login
    }
    progress(
      where: { isDone: { _eq: false }, object: { type: { _eq: "project" } } }
      limit: 1
    ) {
      object {
        name
      }
    }
  }
`;

// Send a POST request to the GraphQL endpoint to fetch user data and current project
fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + jwt,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
})
.then(response => response.json())
.then(data => {
  // Log the entire data object for debugging
  //console.log('Query Results:', data); Uncomment this line to see the data object
  
  // Extract the user login from the response
  let userLogin = data.data.user[0].login;

  // Transform the first two characters to uppercase
  userLogin = userLogin.charAt(0).toUpperCase() + userLogin.charAt(1).toUpperCase() + userLogin.slice(2);

  // Update the welcome message with the user login
  document.getElementById('welcome-message').textContent = 'Welcome ' + userLogin;

  // Extract the current project name from the response
  const currentProject = data.data.progress[0]?.object.name || 'No current project';

  // Update the current project section with the project name
  document.getElementById('project-name').textContent = currentProject;
})
.catch(error => console.error(error)); // Log any errors that occur during the fetch

// Add event listener to the logout button
document.getElementById('logout-button').addEventListener('click', () => {
  // Clear the JWT cookie
  Cookies.remove('jwt');

  // Redirect to the login page
  window.location.href = 'index.html';
});