const db = require("../config/db");

const createReport = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const newReport = {
      title,
      description,
      location,
      date: new Date().toISOString()
    };

    const reportRef = db.ref("reports").push();
    await reportRef.set(newReport);
    
    const io = req.app.get("io");
    io.emit("newReport", { id: docRef.id, ...newReport });

    res.status(201).json({ message: "Report submitted successfully!", report: { id: docRef.id, ...newReport } });
  } catch (error) {
    res.status(500).json({ message: "Error submitting report", error });
  }
};

const getReports = async (req, res) => {
  try {
    const reportsSnapshot = await db.collection("reports").get();
    const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

module.exports = { createReport, getReports };
