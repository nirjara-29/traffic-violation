
let auth0Client = null;

const initializeAuth0 = async () => {
    auth0Client = await auth0.createAuth0Client({
        domain: "dev-x2ibogb5kkv3ozdx.us.auth0.com",
        clientId: "NN7jZBL5DSk1akFLJKENqIBLTSH0n8E4",
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });

    try {
        const query = window.location.search;
        if (query.includes("code=") && query.includes("state=")) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, "/");
            sessionStorage.setItem("justLoggedIn", "true"); // Store flag for login
        }
    } catch (err) {
        console.error("Error handling redirect:", err);
    }

    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
        const user = await auth0Client.getUser();
        console.log("User Info:", user);
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
        sessionStorage.setItem("isAuthenticated", "true");

        // Show pop-up only if the user just logged in
        if (sessionStorage.getItem("justLoggedIn") === "true") {
            showPopup(user.name);
            sessionStorage.removeItem("justLoggedIn"); // Remove flag after showing popup
        }
    } else {
        sessionStorage.removeItem("isAuthenticated");
    }
};


const showPopup = (userName) => {
    if (document.getElementById("popup-overlay")) return;

    const popupOverlay = document.createElement("div");
    popupOverlay.id = "popup-overlay";
    popupOverlay.className = "popup-overlay";

    popupOverlay.innerHTML = `
        <div class="popup-content">
            <h2>Welcome Back, ${userName}!</h2>
            <p>We are so happy to see you again!</p>
            <button class="close-btn" id="close-popup-btn">Close</button>
        </div>
    `;

    document.body.appendChild(popupOverlay);

    document.getElementById("close-popup-btn").addEventListener("click", () => {
        popupOverlay.remove();
    });

    popupOverlay.addEventListener("click", (event) => {
        if (event.target === popupOverlay) {
            popupOverlay.remove();
        }
    });
};

initializeAuth0();

document.getElementById("login-btn").addEventListener("click", async () => {
    await auth0Client.loginWithRedirect();
});

document.getElementById("logout-btn").addEventListener("click", async () => {
    await auth0Client.logout({ 
      logoutParams: { returnTo: window.location.origin } 
    });
    document.getElementById("login-btn").style.display = "block";
    document.getElementById("logout-btn").style.display = "none";
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("userRole"); // Clear admin role if set
  });

const reportButton = document.querySelector('a[href="report.html"]');
reportButton.addEventListener('click', (e) => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
        e.preventDefault();
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Please sign in first to report a violation.'
        });
    }
});


/*const socket = io("http://localhost:5000"); // Connect to backend

async function loadReports() {
  const response = await fetch("http://localhost:5000/api/reports");
  const reports = await response.json();

  const reportContainer = document.getElementById("reportContainer");
  reportContainer.innerHTML = reports.map(report =>
    `<div class="report">
      <h3>${report.title}</h3>
      <p>${report.description}</p>
      <small>${report.location}</small>
    </div>`
  ).join("");
}

// Load reports on page load
loadReports();

// Listen for new reports in real-time
socket.on("newReport", (report) => {
  const reportContainer = document.getElementById("reportContainer");
  const newReportHTML = `
    <div class="report">
      <h3>${report.title}</h3>
      <p>${report.description}</p>
      <small>${report.location}</small>
    </div>
  `;

  reportContainer.innerHTML = newReportHTML + reportContainer.innerHTML;
});*/