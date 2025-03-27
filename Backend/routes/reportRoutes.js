const express = require("express");
const { createReport, getReports } = require("../controllers/reportController");
const router = express.Router();

router.post("/", createReport); // Submit a new report
router.get("/", getReports); // Fetch all reports

module.exports = router;

