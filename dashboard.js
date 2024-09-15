// Define the URL for the GraphQL endpoint
const url = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

// Get the JWT from the cookies
const jwt = Cookies.get('jwt');

// Define the GraphQL query to fetch user ID
const userIdQuery = `
  {
    user {
      id
    }
  }
`;

// Define the GraphQL query to fetch user login and other details
const userQuery = (userId) => `
  {
    user(where: { id: { _eq: "${userId}" } }) {
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
const auditQuery = (userId) => `
  {
    user(where: { id: { _eq: "${userId}" } }) {
      auditRatio
      totalUp
      totalDown
    }
  }
`;

// Define the correct GraphQL query to fetch the user's XP
const xpQuery = (userId) => `
  query Transaction_aggregate {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
        userId: { _eq: "${userId}" }
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

// Main function to fetch user ID and then other data
const main = async () => {
  try {
    // Fetch user ID
    const userIdData = await fetchData(userIdQuery);
    const userId = userIdData.data.user[0].id;

    // Fetch user login and other details
    const userData = await fetchData(userQuery(userId));
    const userInfo = userData.data.user[0];

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

    // Fetch current project
    const projectData = await fetchData(currentProjectQuery);
    const currentProject = projectData.data.progress[0]?.object.name || 'No current project';
    document.getElementById('project-name').textContent = currentProject;

// Fetch audit ratio, total audits done, and total audits received
const auditData = await fetchData(auditQuery(userId));
const auditInfo = auditData.data.user[0];

// Format audit ratio to one decimal place
const auditRatioFormatted = auditInfo.auditRatio.toFixed(1); // Round to 1 decimal place

// Function to format values to MB or kB with up to specifiied significant digits
const formatValue = (value) => {
  const bytesInMB = 1000 * 1000;
  const bytesInKB = 1000;
  
  if (value >= bytesInMB) {
    // Convert to MB and round up to 2 significant digits
    const mbValue = value / bytesInMB;
    return `${(Math.ceil(mbValue * 1000) / 1000).toFixed(2)} MB`;
  } else if (value >= bytesInKB) {
    // Convert to kB and round up to 0 significant digits
    const kbValue = value / bytesInKB;
    return `${(Math.ceil(kbValue * 1000) / 1000).toFixed(0)} kB`;
  } else {
    // Keep in bytes and round to the nearest integer
    return `${value.toFixed(0)} bytes`;
  }
};

// Format totalDown and totalUp
const formattedTotalDown = formatValue(auditInfo.totalDown);
const formattedTotalUp = formatValue(auditInfo.totalUp);

// Prepare audit info items
const auditInfoItems = [
  `Total Audits Done: ${formattedTotalUp}`,
  `Total Audits Received: ${formattedTotalDown}`
];

//Uncomment the following code to update the audit info section with the user's audit info on dashboard
/*
// Append items to the list
const auditInfoList = document.getElementById('audit-info-list');
auditInfoItems.forEach(item => {
  const listItem = document.createElement('li');
  listItem.textContent = item;
  auditInfoList.appendChild(listItem);
});
*/

// Update progress bars
const totalAuditsDoneProgress = document.getElementById('total-audits-done-progress');
const totalAuditsReceivedProgress = document.getElementById('total-audits-received-progress');
const totalAuditsDoneText = document.getElementById('total-audits-done-text');
const totalAuditsReceivedText = document.getElementById('total-audits-received-text');
const auditRatioText = document.getElementById('audit-ratio-text');

// Calculate the maximum value between totalDown and totalUp
const maxAuditValue = Math.max(auditInfo.totalDown, auditInfo.totalUp);

// Calculate the percentages based on the maximum value
const totalDownPercentage = (auditInfo.totalDown / maxAuditValue) * 100;
const totalUpPercentage = (auditInfo.totalUp / maxAuditValue) * 100;

totalAuditsDoneProgress.style.width = `${totalUpPercentage}%`;
totalAuditsReceivedProgress.style.width = `${totalDownPercentage}%`;

totalAuditsDoneText.textContent = `${formattedTotalUp}`;
totalAuditsReceivedText.textContent = `${formattedTotalDown}`;
auditRatioText.textContent = `${auditRatioFormatted}`;

// Fetch user's XP
const xpData = await fetchData(xpQuery(userId));
//console.log('XP Query Result:', xpData);
const xp = xpData.data.transaction_aggregate.aggregate.sum.amount || 0;

// Round the XP value
const roundedXp = Math.ceil(xp / 1000);

// Ensure values like 269,350 are not rounded up incorrectly
const displayXp = xp % 1000 >= 500 ? roundedXp : Math.floor(xp / 1000);

document.getElementById('xp-value').textContent = `${displayXp} kB`;

// Fetch user's skills
fetchData(skillsQuery)
.then(data => {
  //console.log('Skills Query Result:', data);
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
  //console.log('Technical Skills:', technicalSkills); // Log technical skills
  //console.log('Technologies:', technologies); // Log technologies

  //Uncomment the following code to update the skills section with the user's skills on dashboard
  /*
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
    */

  // Prepare data for the radar charts
  const technicalSkillsLabels = Object.keys(technicalSkills);
  const technicalSkillsData = Object.values(technicalSkills);
  const technologiesLabels = Object.keys(technologies);
  const technologiesData = Object.values(technologies);

  // Create radar chart for technical skills
  const technicalSkillsCtx = document.getElementById('technical-skills-chart').getContext('2d');
  new Chart(technicalSkillsCtx, {
    type: 'radar',
    data: {
      labels: technicalSkillsLabels,
      datasets: [{
        label: 'Technical Skills',
        data: technicalSkillsData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scale: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  });

  // Create radar chart for technologies
  const technologiesCtx = document.getElementById('technologies-chart').getContext('2d');
  new Chart(technologiesCtx, {
    type: 'radar',
    data: {
      labels: technologiesLabels,
      datasets: [{
        label: 'Technologies',
        data: technologiesData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scale: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  });
})
  }
  catch (error) {
    console.error(error);
  }
}

// Run the main function
main();

// Add event listener to the logout button
document.getElementById('logout-button').addEventListener('click', () => {
  // Clear the JWT cookie
  Cookies.remove('jwt');

  // Redirect to the login page
  window.location.href = 'index.html';
});