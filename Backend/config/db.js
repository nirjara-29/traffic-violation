require('dotenv').config();  // Load environment variables

const admin = require("firebase-admin");

// Load Firebase credentials securely from .env
const serviceAccount = require(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trafficwatchdog-default-rtdb.firebaseio.com/"
});

const db = admin.firestore();

module.exports = db;
