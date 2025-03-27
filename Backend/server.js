const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Firebase Firestore setup
require("./config/db"); // Import Firebase setup

const reportRoutes = require("./routes/reportRoutes");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/reports", reportRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
