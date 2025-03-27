document.addEventListener('DOMContentLoaded', function() {
    // Sample report data
    // const reports = [
    //   {
    //     id: 1,
    //     description: "Server outage in production environment",
    //     location: "AWS East Region",
    //     date: "2023-05-14"
    //   },
    //   {
    //     id: 2,
    //     description: "Database connection timeout",
    //     location: "Data Center 3",
    //     date: "2023-05-12"
    //   },
    //   {
    //     id: 3,
    //     description: "User authentication failed multiple times",
    //     location: "Auth Service",
    //     date: "2023-05-10"
    //   },
    //   {
    //     id: 4,
    //     description: "Network latency increased by 300%",
    //     location: "CDN Edge Servers",
    //     date: "2023-05-07"
    //   },
    //   {
    //     id: 5,
    //     description: "API rate limiting triggered",
    //     location: "Gateway Service",
    //     date: "2023-05-05"
    //   }
    // ];
 
    // Reference to table body
    const tableBody = document.getElementById('reports-body');
 
    // Simulate loading delay
    setTimeout(() => {
      // Clear loading message
      tableBody.innerHTML = '';
     
      // Populate table with report data
      reports.forEach((report, index) => {
        const row = document.createElement('tr');
        row.className = 'row-animate';
        row.style.animationDelay = `${index * 100}ms`; // Stagger animation
       
        // Format date for display
        const reportDate = new Date(report.date);
        const formattedDate = reportDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
       
        row.innerHTML = `
          <td>${report.id}</td>
          <td>${report.description}</td>
          <td><span class="location-badge">${report.location}</span></td>
          <td>${formattedDate}</td>
        `;
       
        tableBody.appendChild(row);
      });
    }, 1000); // 1 second delay to simulate loading
  });


