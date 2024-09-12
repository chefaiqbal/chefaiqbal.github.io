// Define the URL for the GraphQL endpoint
const url = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

// Get the JWT from the cookies
const jwt = Cookies.get('jwt');

// Define the GraphQL query to fetch user login
const userQuery = `
  {
    user {
      login
      campus
      email
      firstName
      lastName
      attrs(path: "Phone")
    }
  }
`;

// Define the GraphQL query to fetch the current project
const currentProjectQuery = `
  {
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

// Define the GraphQL query to fetch the audit ratio, total audits done, and total audits received
const auditQuery = `
  {
    user {
      auditRatio
      totalUp
      totalDown
    }
  }
`;

// Define the correct GraphQL query to fetch the user's XP
const xpQuery = `
  query Transaction_aggregate {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

// Define the GraphQL query to fetch the user's skills
const skillsQuery = `
  {
    user {
      transactions(where: {
          type: {_ilike: "%skill%"}
        }
      ) {
        type
        amount
      }
    }
  }
`;

// Function to fetch data from the GraphQL endpoint
const fetchData = (query) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + jwt,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  }).then(response => response.json());
};

// Helper function to capitalize the first character of a string
const capitalizeFirstChar = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Fetch user login and campus
fetchData(userQuery)
  .then(data => {
    //console.log('User Query Result:', data); // Log the user query result
    // Extract the user information from the response
    const userInfo = data.data.user[0];

    // Capitalize the first character of the campus
    userInfo.campus = capitalizeFirstChar(userInfo.campus);

    // Create an array of user information items
    const userInfoItems = [
      `Campus: ${userInfo.campus}`,
      `Campus ID: ${userInfo.login}`,
      `Email: ${userInfo.email}`,
      `First Name: ${userInfo.firstName}`,
      `Last Name: ${userInfo.lastName}`,
      `Phone: ${userInfo.attrs}`
    ];

    // Update the user info section with the user information items
    const userInfoList = document.getElementById('user-info-list');
    userInfoItems.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      userInfoList.appendChild(listItem);
    });

    // Transform the first two characters of the login to uppercase
    let userLogin = userInfo.login;
    userLogin = userLogin.charAt(0).toUpperCase() + userLogin.charAt(1).toUpperCase() + userLogin.slice(2);

    // Update the welcome message with the user login
    document.getElementById('welcome-message').textContent = 'Welcome ' + userLogin;
  })
  .catch(error => console.error(error)); // Log any errors that occur during the fetch

// Fetch current project
fetchData(currentProjectQuery)
  .then(data => {
    //console.log('Current Project Query Result:', data); // Log the current project query result
    // Extract the current project name from the response
    const currentProject = data.data.progress[0]?.object.name || 'No current project';

    // Update the current project section with the project name
    document.getElementById('project-name').textContent = currentProject;
  })
  .catch(error => console.error(error)); // Log any errors that occur during the fetch

// Fetch audit ratio, total audits done, and total audits received
fetchData(auditQuery)
  .then(data => {
    //console.log('Audit Query Result:', data); // Log the audit query result
    // Extract the audit information from the response
    const auditInfo = data.data.user[0];

    // Create an array of audit information items
    const auditInfoItems = [
      `Audit Ratio: ${auditInfo.auditRatio}`,
      `Total Audits Done: ${auditInfo.totalUp}`,
      `Total Audits Received: ${auditInfo.totalDown}`
    ];

    // Update the audit info section with the audit information items
    const auditInfoList = document.getElementById('audit-info-list');
    auditInfoItems.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      auditInfoList.appendChild(listItem);
    });
  })
  .catch(error => console.error(error)); // Log any errors that occur during the fetch  

  // Fetch user's XP
  fetchData(xpQuery)
    .then(data => {
      console.log('XP Query Result:', data); // Log the XP query result
      // Extract the user's XP from the response
      const xp = data.data.transaction_aggregate.aggregate.sum.amount || 0;
  
      // Update the XP section with the user's XP
      document.getElementById('xp-value').textContent = xp;
    })
    .catch(error => console.error(error)); // Log any errors that occur during the fetch
  

// Fetch user's skills
fetchData(skillsQuery)
  .then(data => {
   // console.log('Skills Query Result:', data); // Log the skills query result
    // Extract the user's skills from the response
    const skills = data.data.user[0]?.transactions || [];

    // Separate skills into Technical Skills and Technologies
    const technicalSkills = {};
    const technologies = {};

    skills.forEach(skill => {
      const skillType = skill.type;
      const skillAmount = skill.amount;

      if (['skill_go', 'skill_js', 'skill_html', 'skill_css', 'skill_unix', 'skill_docker'].includes(skillType)) {
        if (!technologies[skillType]) {
          technologies[skillType] = 0;
        }
        technologies[skillType] += skillAmount;
      } else if (['skill_prog', 'skill_algo', 'skill_front-end', 'skill_back-end'].includes(skillType)) {
        if (!technicalSkills[skillType]) {
          technicalSkills[skillType] = 0;
        }
        technicalSkills[skillType] += skillAmount;
      }
    });

    // Update the skills section with the user's skills
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = ''; // Clear any existing skills

    // Add Technical Skills to the list
    const technicalSkillsHeader = document.createElement('h4');
    technicalSkillsHeader.textContent = 'Technical Skills';
    skillsList.appendChild(technicalSkillsHeader);

    for (const [skill, amount] of Object.entries(technicalSkills)) {
      const listItem = document.createElement('li');
      listItem.textContent = `${skill}: ${amount}`;
      skillsList.appendChild(listItem);
    }

    // Add Technologies to the list
    const technologiesHeader = document.createElement('h4');
    technologiesHeader.textContent = 'Technologies';
    skillsList.appendChild(technologiesHeader);

    for (const [skill, amount] of Object.entries(technologies)) {
      const listItem = document.createElement('li');
      listItem.textContent = `${skill}: ${amount}`;
      skillsList.appendChild(listItem);
    }
  })
  .catch(error => console.error(error)); // Log any errors that occur during the fetch

// Add event listener to the logout button
document.getElementById('logout-button').addEventListener('click', () => {
  // Clear the JWT cookie
  Cookies.remove('jwt');

  // Redirect to the login page
  window.location.href = 'index.html';
});