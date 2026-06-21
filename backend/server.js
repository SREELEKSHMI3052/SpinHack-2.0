// ==========================================
// 1. IMPORT ALL TOOLS & SECRETS
// ==========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { GoogleGenAI } = require('@google/genai');

// Import Firebase tools
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// ==========================================
// 2. TURN ON FIREBASE & THE AI
// ==========================================
// Unlock the Firebase Warehouse
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Turn on the Express Factory
const app = express();
app.use(cors()); 
app.use(express.json()); 

// Connect to the AI using the hidden key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// 3. THE INTAKE DESK (POST ROUTE)
// ==========================================
app.post('/api/generate', async (req, res) => {
  try {
    const userMood = req.body.mood; 
    
    // A. Ask the AI for a quote
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `The user is feeling: "${userMood}". Write a one-sentence hype-up quote.`
    });
    const aiQuote = response.text;

    // B. Save directly to Firebase
    const docRef = db.collection('vibes').doc();
    await docRef.set({
      input: userMood,
      quote: aiQuote,
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Stamps the exact time
    });

    // C. Ship the result back to Sreya
    res.json({ success: true, quote: aiQuote });

  } catch (error) {
    console.error("Error in /api/generate:", error);
    res.status(500).json({ success: false, error: "Factory machinery jammed." });
  }
});

// ==========================================
// 4. THE DISPLAY WINDOW (GET ROUTE)
// ==========================================
app.get('/api/feed', async (req, res) => {
  try {
    // A. Ask Firebase for the history, sorted by newest first
    const snapshot = await db.collection('vibes').orderBy('timestamp', 'desc').get();
    
    // B. Format the data into a clean list
    const history = snapshot.docs.map(doc => doc.data());
    
    // C. Ship the list back to Sreya
    res.json(history);
    
  } catch (error) {
    console.error("Error in /api/feed:", error);
    res.status(500).json({ error: "Could not fetch history." });
  }
});

// ==========================================
// 5. OPEN FOR BUSINESS
// ==========================================
app.listen(5000, () => {
  console.log('Master Machinery running on port 5000!');
});