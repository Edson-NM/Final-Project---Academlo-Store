const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

dotenv.config({ path: './config.env' });

const firebaseConfig = {
	apiKey: process.env.FIREBASE_APP_KEY,
	// authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	// messagingSenderId: process.env.FIREBASE_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports = { storage };
