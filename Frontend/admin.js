/*import { db } from "./firebase.js";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const submitButton = document.getElementById("submitButton");
    const spinner = document.getElementById("spinner");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");
    const successDialog = document.getElementById("successDialog");
    const overlay = document.getElementById("overlay");

    const auth = getAuth();

    // Admin Login using Firebase Authentication
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Please enter both username and password.");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            console.log("Login Successful:", userCredential.user);
            sessionStorage.setItem("isAdmin", "true");
            showSuccess();
        } catch (error) {
            console.error("Login failed:", error.message);
            showError("Invalid admin credentials.");
        } finally {
            setLoading(false);
        }
    });

    // Real-time updates for reports using Firestore listener
    const fetchReportsRealTime = () => {
        db.collection("reports").onSnapshot((snapshot) => {
            const reports = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            populateReportsTable(reports); // Pass reports to populate UI
        });
    };

    // Populate reports in the table
    const populateReportsTable = (reports) => {
        const reportsTable = document.getElementById("reports-table-body");
        reportsTable.innerHTML = ""; // Clear existing rows

        reports.forEach((report) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${report.plateNumber}</td>
                <td>${report.violationType}</td>
                <td>${report.description}</td>
                <td>${report.location}</td>
                <td><a href="${report.evidencePhoto}" target="_blank">View Photo</a></td>
                <td>${new Date(report.timestamp).toLocaleString()}</td>
            `;

            reportsTable.appendChild(row);
        });
    };

    // Show error alert
    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = "block";
    }

    function hideError() {
        errorAlert.style.display = "none";
    }

    // Show loading spinner
    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        spinner.style.display = isLoading ? "block" : "none";
        submitButton.querySelector("span").style.opacity = isLoading ? "0.5" : "1";
    }

    // Show success dialog
    function showSuccess() {
        successDialog.style.display = "block";
        overlay.style.display = "block";
    }

    // Logout functionality
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            sessionStorage.removeItem("isAdmin");
            window.location.href = "admin.html"; // Redirect to login
        });
    }

    // Fetch reports in real-time
    fetchReportsRealTime();
});
*/


// Initialize Firebase (Place this at the top of the file)
const firebaseConfig = {
    apiKey: "AIzaSyB-Iwgo2u8P0D6pzp2RUZOTHVL6OQfUuYw",
    authDomain: "trafficviolationreportin-b0746.firebaseapp.com",
    projectId: "trafficviolationreportin-b0746",
    storageBucket: "trafficviolationreportin-b0746.firebasestorage.app",
    messagingSenderId: "600159096224",
    appId: "1:600159096224:web:dcfc04300220cbf74f28c5",
    measurementId: "G-K4Y70C59JY"
  };


// Initialize Firebase app
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Rest of your admin.js code follows below:
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const submitButton = document.getElementById("submitButton");
    const spinner = document.getElementById("spinner");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");
    const successDialog = document.getElementById("successDialog");
    const overlay = document.getElementById("overlay");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission
    
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
    
        if (!username || !password) {
            showError("Please enter both username and password.");
            return;
        }
    
        setLoading(true);
        submitButton.disabled = true; // Disable the button to avoid duplicate submissions
        
    
        try {
            const userCredential = await auth.signInWithEmailAndPassword(username, password);
            console.log("Login Successful:", userCredential.user);
            sessionStorage.setItem("isAdmin", "true");
            showSuccess(); // Show success dialog and redirect
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
            showError("Invalid admin credentials.");
        } finally {
            setLoading(false);
            submitButton.disabled = false; // Re-enable the button after processing
        }
    });


    document.addEventListener("DOMContentLoaded", function () {
        if (window.location.href.indexOf("allreports.html") !== -1) {
            fetchReportsRealTime();
        }
    });
   
    
   

    const fetchReportsRealTime = () => {
        db.collection("reports").onSnapshot((snapshot) => {
            const reports = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            populateReportsTable(reports);
        });
    };

    const populateReportsTable = (reports) => {

        console.log("Reports body element:", document.getElementById("reports-body"));
        // Find the table body element
        const reportsTable = document.getElementById("reports-body");
        if (!reportsTable) {
            console.error("Reports table body element not found!");
            return; // Exit if the table body doesn't exist
        }
        // Clear existing rows
        reportsTable.innerHTML = "";
    
        // Populate table rows dynamically
        reports.forEach((report) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${report.plateNumber}</td>
                <td>${report.violationType}</td>
                <td>${report.description}</td>
                <td>${report.location}</td>
                <td><a href="${report.evidencePhoto}" target="_blank">View Photo</a></td>
                <td>${new Date(report.timestamp).toLocaleString()}</td>
            `;
            reportsTable.appendChild(row);
        });
    };
    

   

    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = "block";
    }

    function hideError() {
        errorAlert.style.display = "none";
    }

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        spinner.style.display = isLoading ? "block" : "none";
        submitButton.querySelector("span").style.opacity = isLoading ? "0.5" : "1";
    }

    function showSuccess() {
        successDialog.style.display = "block";
        overlay.style.display = "block";
        setTimeout(() => {
            window.location.href = "allreports.html";
        }, 1500);
    }

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            sessionStorage.removeItem("isAdmin");
            window.location.href = "admin.html";
        });
    }

    fetchReportsRealTime();
});



