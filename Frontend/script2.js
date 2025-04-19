


document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('reports-body');
  const modal = document.getElementById('report-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModalButton = document.getElementById('close-modal');

  try {
    // Fetch reports from backend
    const response = await fetch('http://localhost:5000/api/get-reports');
    const result = await response.json();

    if (!result.success || !result.reports) {
      throw new Error('Failed to fetch reports');
    }

    if (result.reports.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No reports available</td></tr>`;
      return;
    }

    tableBody.innerHTML = ''; // Clear loading message

    result.reports.forEach((report, index) => {
      const date = report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Unknown Date';

      // Generate table row (excluding Status and Image columns)
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${report.plateNumber || 'N/A'}</td>
        <td>${report.violationType || 'Unknown'}</td>
        <td>${report.location || 'Not specified'}</td>
        <td>${date}</td>
      `;

      // Add click event to display modal
      row.addEventListener('click', () => {
        showModal(report);
      });

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    tableBody.innerHTML = `<tr><td colspan="5">Error loading reports: ${error.message}</td></tr>`;
  }

  // Function to populate and show the modal
  function showModal(report) {
    const modalContent = `
      <p><strong>Plate Number:</strong> ${report.plateNumber || 'N/A'}</p>
      <p><strong>Violation Type:</strong> ${report.violationType || 'Unknown'}</p>
      <p><strong>Location:</strong> ${report.location || 'Not specified'}</p>
      <p><strong>Date:</strong> ${report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Unknown Date'}</p>
      <p><strong>Description:</strong> ${report.description || 'No description'}</p>
      <p><strong>Evidence:</strong></p>
      ${
        report.evidencePhoto
          ? `<img src="${report.evidencePhoto}" alt="Evidence Image" style="max-width: 100%; border-radius: 8px;">`
          : '<p>No image available</p>'
          

      }
    `;
    console.log("Image URL being used:", report.evidencePhoto);
  
    console.log("Modal content:", modalContent); // Check the HTML being inserted
    modalBody.innerHTML = modalContent;
    modal.style.display = 'block'; // Show the modal
  }
  

  

 

  // Close modal functionality
  closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none'; // Hide the modal
  });

  // Close modal when clicking outside the content
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none'; // Hide the modal
    }
  });
});
