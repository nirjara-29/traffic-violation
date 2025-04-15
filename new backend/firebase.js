import fs from "fs";
import path from "path";
import admin from "firebase-admin";

// Dynamically load the JSON file
const serviceAccountPath = path.resolve("serviceAccountKey.json"); // Resolve the JSON file path
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")); // Read the JSON file

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount), // Use parsed credentials
        storageBucket: "trafficviolationreportin-b0746.firebasestorage.app",
    });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

export { admin, db, bucket };
