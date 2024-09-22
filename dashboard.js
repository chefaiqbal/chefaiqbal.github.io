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

// Define the GraphQL query to fetch the last 4 projects

const lastProjectsQuery = `
{
    transaction(
      where: {
        type: { _eq: "xp" }
        _and: [
          { path: { _like: "/bahrain/bh-module%" } },
          { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
          { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
        ]
      }
      order_by: { createdAt: desc }
      limit: 4
    ) {
      object {
        type
        name
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
      //`Phone: ${userInfo.attrs}`
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

    // Fetch the last 4 projects
    const lastProjectsData = await fetchData(lastProjectsQuery);
    const lastProjects = lastProjectsData.data.transaction.map(project => project.object.type + ' — ' + project.object.name);
    const lastActivityList = document.getElementById('last-activity-list');
    lastActivityList.innerHTML = ''; // Clear any existing items
    lastProjects.forEach(project => {
      const listItem = document.createElement('li');
      listItem.textContent = project;
      lastActivityList.appendChild(listItem);
    });

// Function to create or update a progress bar using D3.js
function createProgressBar(selector, percentage, color) {
  const svg = d3.select(selector);
  const container = svg.node().parentNode;
  const width = container.clientWidth; // Get the width of the container
  const height = 20; // Fixed height

  svg.attr('width', width)
     .attr('height', height);

  svg.selectAll('*').remove(); // Clear any existing content

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#e0e0e0'); // Background bar

  svg.append('rect')
    .attr('width', (percentage / 100) * width) // Calculate width based on percentage
    .attr('height', height)
    .attr('fill', color); // Progress bar
}

// Fetch audit ratio, total audits done, and total audits received
async function updateProgressBars() {
  const auditData = await fetchData(auditQuery(userId));
  const auditInfo = auditData.data.user[0];

  // Format audit ratio to one decimal place
  const auditRatioFormatted = auditInfo.auditRatio.toFixed(1);

  // Function to format values to MB or kB with up to specified significant digits
  const formatValue = (value) => {
    const bytesInMB = 1000 * 1000;
    const bytesInKB = 1000;
    
    if (value >= bytesInMB) {
      const mbValue = value / bytesInMB;
      return `${(Math.ceil(mbValue * 1000) / 1000).toFixed(2)} MB`;
    } else if (value >= bytesInKB) {
      const kbValue = value / bytesInKB;
      return `${(Math.ceil(kbValue * 1000) / 1000).toFixed(0)} kB`;
    } else {
      return `${value.toFixed(0)} bytes`;
    }
  };

  // Format totalDown and totalUp
  const formattedTotalDown = formatValue(auditInfo.totalDown);
  const formattedTotalUp = formatValue(auditInfo.totalUp);

  // Calculate the maximum value between totalDown and totalUp
  const maxAuditValue = Math.max(auditInfo.totalDown, auditInfo.totalUp);
  //console.log('Max Audit Value:', maxAuditValue);

  // Calculate the percentages based on the maximum value
  const totalDownPercentage = (auditInfo.totalDown / maxAuditValue) * 100;
  const totalUpPercentage = (auditInfo.totalUp / maxAuditValue) * 100;
  //console.log('Total Down Percentage:', totalDownPercentage);
  //console.log('Total Up Percentage:', totalUpPercentage);

  // Determine colors based on comparison
  const doneColor = auditInfo.totalUp >= auditInfo.totalDown ? '#28a745' : '#dc3545';
  const receivedColor = auditInfo.totalDown >= auditInfo.totalUp ? '#17a2b8' : '#ffc107';

  // Create or update progress bars
  createProgressBar('#total-audits-done-progress', totalUpPercentage, doneColor);
  createProgressBar('#total-audits-received-progress', totalDownPercentage, receivedColor);

  // Update text content
  document.getElementById('total-audits-done-text').textContent = `${formattedTotalUp}`;
  document.getElementById('total-audits-received-text').textContent = `${formattedTotalDown}`;
  document.getElementById('audit-ratio-text').textContent = `${auditRatioFormatted}`;
}


// Call the function to update progress bars
updateProgressBars();

window.addEventListener('resize', updateProgressBars);

 

// Fetch user's XP
const xpData = await fetchData(xpQuery(userId));
//console.log('XP Query Result:', xpData);
console.log('XP Data:', xpData.data.transaction_aggregate.aggregate.sum.amount);
const xp = xpData.data.transaction_aggregate.aggregate.sum.amount || 0;

// Round the XP value
const roundedXp = Math.ceil(xp / 1000);

// Ensure values like 269,350 are not rounded up incorrectly
const displayXp = xp % 1000 >= 500 ? roundedXp : Math.floor(xp / 1000);

document.getElementById('xp-value').textContent = `${displayXp} kB`;

// Helper function to format skill names
const formatSkillName = (skill) => {
  return skill.replace('skill_', '').replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

// Function to create a radar chart using D3.js
function createRadarChart(data, labels, selector) {
  const svg = d3.select(selector);
  const container = svg.node().parentNode;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const padding = 60; // Add padding to ensure labels are not cut off
  const radius = Math.min(width, height) / 2.5 - padding;
  const levels = 5; // Number of concentric circles
  const angleSlice = (Math.PI * 2) / labels.length;

  svg.attr('width', '100%')
     .attr('height', '100%')
     .attr('viewBox', `0 0 ${width} ${height}`)
     .attr('preserveAspectRatio', 'xMidYMid meet');
  svg.selectAll('*').remove(); // Clear any existing content

  const rScale = d3.scaleLinear()
    .range([20, radius])
    .domain([0, d3.max(data)]);

  const radarLine = d3.lineRadial()
    .radius(d => rScale(d))
    .angle((d, i) => i * angleSlice);

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  // Draw the background circles
  for (let i = 0; i < levels; i++) {
    g.append('circle')
      .attr('r', radius / levels * (i + 1))
      .attr('fill', '#CDCDCD')
      .attr('stroke', '#CDCDCD')
      .attr('fill-opacity', 0.1);
  }

  // Draw the axes
  const axisGrid = g.append('g').attr('class', 'axisWrapper');
  axisGrid.selectAll('.axis')
    .data(labels)
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', (d, i) => rScale(d3.max(data)) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr('y2', (d, i) => rScale(d3.max(data)) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr('stroke', 'white')
    .attr('stroke-width', '2px');

  // Draw the labels
  axisGrid.selectAll('.axisLabel')
    .data(labels)
    .enter()
    .append('text')
    .attr('x', (d, i) => rScale(d3.max(data) * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr('y', (d, i) => rScale(d3.max(data) * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr('dy', '0.35em')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .attr('transform', (d, i) => {
      const angle = angleSlice * i;
      return angle > Math.PI / 2 && angle < (3 * Math.PI) / 2 ? `rotate(0 ${rScale(d3.max(data) * 1.1) * Math.cos(angle - Math.PI / 2)},${rScale(d3.max(data) * 1.1) * Math.sin(angle - Math.PI / 2)})` : null;
    })
    .text(d => d);

  // Draw the radar chart blobs
  g.append('path')
    .datum(data)
    .attr('d', radarLine)
    .attr('fill', 'rgba(38, 46, 44, 0.2)')
    .attr('stroke', 'rgba(54, 162, 235, 1)')
    .attr('stroke-width', 0);
}

// Function to create or update a progress bar using D3.js
function createProgressBar(selector, percentage, color) {
  const svg = d3.select(selector);
  const container = svg.node().parentNode;
  const width = container.clientWidth; // Get the width of the container
  const height = 20; // Fixed height

  svg.attr('width', width)
     .attr('height', height);

  svg.selectAll('*').remove(); // Clear any existing content

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#e0e0e0'); // Background bar

  svg.append('rect')
    .attr('width', (percentage / 100) * width) // Calculate width based on percentage
    .attr('height', height)
    .attr('fill', color); // Progress bar
}

// Fetch user's skills and create radar charts
fetchData(skillsQuery)
  .then(data => {
    const skills = data.data.user[0]?.transactions || [];

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

    const technicalSkillsLabels = Object.keys(technicalSkills).map(formatSkillName);
    const technicalSkillsData = Object.values(technicalSkills);
    const technologiesLabels = Object.keys(technologies).map(formatSkillName);
    const technologiesData = Object.values(technologies);

    console.log('Technical Skills:', technicalSkills);
    console.log('Technologies:', technologies);

    // Store the data globally for use in resize event
    window.technicalSkillsData = technicalSkillsData;
    window.technicalSkillsLabels = technicalSkillsLabels;
    window.technologiesData = technologiesData;
    window.technologiesLabels = technologiesLabels;

    createRadarChart(technicalSkillsData, technicalSkillsLabels, '#technical-skills-chart');
    createRadarChart(technologiesData, technologiesLabels, '#technologies-chart');
  });

document.addEventListener('DOMContentLoaded', () => {
  createProgressBar('#progress-bar-selector', 75, '#4caf50'); // Update with your selector and values
  createRadarChart(window.technicalSkillsData, window.technicalSkillsLabels, '#technical-skills-chart'); // Update with your data, labels, and selector
  createRadarChart(window.technologiesData, window.technologiesLabels, '#technologies-chart'); // Update with your data, labels, and selector
});

// Add event listener for window resize to update charts
window.addEventListener('resize', () => {
  createProgressBar('#progress-bar-selector', 75, '#4caf50'); // Update with your selector and values
  createRadarChart(window.technicalSkillsData, window.technicalSkillsLabels, '#technical-skills-chart'); // Update with your data, labels, and selector
  createRadarChart(window.technologiesData, window.technologiesLabels, '#technologies-chart'); // Update with your data, labels, and selector
});
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
    listItem.textContent = `${formatSkillName(skill)}: ${amount}`;
    skillsList.appendChild(listItem);
  }

  // Add Technologies to the list
  const technologiesHeader = document.createElement('h4');
  technologiesHeader.textContent = 'Technologies';
  skillsList.appendChild(technologiesHeader);

  for (const [skill, amount] of Object.entries(technologies)) {
    const listItem = document.createElement('li');
    listItem.textContent = `${formatSkillName(skill)}: ${amount}`;
    skillsList.appendChild(listItem);
  }
  */

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