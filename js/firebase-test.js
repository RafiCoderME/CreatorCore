// Quick Firebase Validation Script
// This script uses the global firebaseConfig from firebase-config.js
console.log('=== Firebase Configuration Check ===');

// Check if firebaseConfig is already defined (from firebase-config.js)
if (typeof firebaseConfig === 'undefined') {
    console.error('❌ firebaseConfig not found! Make sure firebase-config.js is loaded first.');
} else {
    console.log('✅ Firebase config loaded');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);
    console.log('API Key present:', !!firebaseConfig.apiKey);
    console.log('App ID:', firebaseConfig.appId);

    // Check if Firebase is already initialized
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        console.log('✅ Firebase already initialized');
        testFirestoreConnection();
    } else {
        console.log('🔄 Loading Firebase SDKs...');
        loadAndTestFirebase();
    }
}

function loadAndTestFirebase() {
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js';
    script1.onload = function () {
        console.log('✅ Firebase App SDK loaded');

        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore-compat.js';
        script2.onload = function () {
            console.log('✅ Firebase Firestore SDK loaded');

            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                console.log('✅ Firebase initialized successfully');
                console.log('Firestore instance created');

                testFirestoreConnection();

            } catch (error) {
                console.error('❌ Firebase initialization failed:', error);
            }
        };
        document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
}

function testFirestoreConnection() {
    try {
        const db = firebase.firestore();
        console.log('Testing database access...');
        db.collection('PPT').limit(1).get()
            .then(() => console.log('✅ Database connection working'))
            .catch(error => console.error('❌ Database connection failed:', error.message));
    } catch (error) {
        console.error('❌ Firestore test failed:', error);
    }
}