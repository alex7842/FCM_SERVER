const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});
// Notification endpoint
app.post('/api/notifications', async (req, res) => {
  try {
    const { token, title, message } = req.body;
    console.log("recived token",token);
    const messagePayload = {
      token: token,
      notification: {
        title: title,
        body: message
      },
      webpush: {
        fcmOptions: {
          link: process.env.FRONTEND_URL
        }
      }
    };

    const response = await admin.messaging().send(messagePayload);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
