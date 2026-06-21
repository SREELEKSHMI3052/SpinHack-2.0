const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function saveVibe(userInput, aiResponse) {
  const docRef = db.collection('vibes').doc();
  await docRef.set({
    input: userInput,
    quote: aiResponse,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function getVibes() {
  const snapshot = await db.collection('vibes').orderBy('timestamp', 'desc').get();
  return snapshot.docs.map(doc => doc.data());
}

module.exports = { saveVibe, getVibes };