import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

import { bucket } from './firebase.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer
const upload = multer({ storage: multer.memoryStorage() });
import { db } from './firebase.js';
// Routes
app.get("/", (req, res) => {
    res.send("Basic test: server is running");
});

app.post("/api/detect-plate", upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image uploaded." });
        }

        const mockPlates = ["MH12AR2345", "XY23ZY6789", "DE52FG4567"];
        const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
        const confidence = Math.random().toFixed(2);

        res.status(200).json({
            success: true,
            plateNumber: randomPlate,
            confidence
        });
    } catch (error) {
        console.error("Plate detection error:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

app.post("/api/upload-photo", upload.single("photo"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: "No file uploaded." });
        }

        const blob = bucket.file(file.originalname); // Create a reference to the file in Firebase Storage
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on("error", (error) => {
            console.error("Error uploading photo:", error);
            res.status(500).json({ success: false, error: "An error occurred while uploading the photo." });
        });

        blobStream.on("finish", async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            console.log("Uploaded photo URL:", publicUrl);
            res.status(200).json({ success: true, photoURL: publicUrl });
        });

        blobStream.end(file.buffer); // Upload the file buffer
    } catch (error) {
        console.error("Error uploading photo:", error);
        res.status(500).json({ success: false, error: "An unexpected error occurred while uploading the photo." });
    }
});

app.post("/api/report-violation", async (req, res) => {
    try {
        const { violationType, plateNumber, description, location, evidencePhoto } = req.body;

        // Validate inputs
        if (!violationType || !plateNumber || !description || !location || !evidencePhoto) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // Save data to Firebase
        const newReport = {
            violationType,
            plateNumber,
            description,
            location,
            evidencePhoto,
            timestamp: new Date().toISOString(),
        };

        await db.collection("reports").add(newReport);

        res.status(201).json({ success: true, message: "Violation report submitted successfully." });
    } catch (error) {
        console.error("Error submitting report:", error);
        res.status(500).json({ success: false, error: "An error occurred while submitting the report." });
    }
});

app.get("/api/get-reports", async (req, res) => {
    try {
        const snapshot = await db.collection("reports").get();
        const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error("Error retrieving reports:", error);
        res.status(500).json({ success: false, error: "An error occurred while retrieving reports." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
