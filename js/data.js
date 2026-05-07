// =============================================
// data.js - Data Layer & Firebase
// =============================================

let db;
let SESSION = null;
let userGoals = {};
let currentFreqGoal = 4;
let selectedDays = new Set(['mon','tue','thu','fri']);
let currentDurationGoal = 60;

// Initialize Firebase
function initFirebase() {
    if (!firebase.apps.length) {
        // Replace with your own Firebase config if needed
        const firebaseConfig = {
            apiKey: "AIzaSyDUMMY-KEY-CHANGE-ME",
            authDomain: "adaptfit-ai.firebaseapp.com",
            projectId: "adaptfit-ai",
            storageBucket: "adaptfit-ai.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef123456"
        };
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("✅ Firebase initialized");
}

// Simple encryption for client-side storage (not secure, but deters casual viewing)
function encrypt(data) {
    return btoa(JSON.stringify(data));
}
function decrypt(str) {
    try {
        return JSON.parse(atob(str));
    } catch(e) {
        return [];
    }
}

// Load data from Firebase + local fallback
async function encryptedLoad(collection) {
    if (!SESSION?.username) return [];
    try {
        const doc = await db.collection('userdata').doc(SESSION.username).collection(collection).doc('data').get();
        if (doc.exists) {
            return decrypt(doc.data().payload) || [];
        }
    } catch(e) {
        console.warn("Firebase load failed, using localStorage fallback");
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(`adaptfit_${SESSION.username}_${collection}`);
    return saved ? decrypt(saved) : [];
}

// Save data
async function encryptedSave(collection, data) {
    if (!SESSION?.username) return;
    const payload = encrypt(data);
    
    try {
        await db.collection('userdata').doc(SESSION.username).collection(collection).doc('data').set({
            payload: payload,
            updated: new Date().toISOString()
        });
    } catch(e) {
        console.warn("Firebase save failed, saving to localStorage");
    }
    
    localStorage.setItem(`adaptfit_${SESSION.username}_${collection}`, payload);
}

// Get current user
async function getUser(username) {
    try {
        const doc = await db.collection('users').doc(username).get();
        return doc.exists ? doc.data() : null;
    } catch(e) {
        console.error("Error fetching user:", e);
        return null;
    }
}

// Global workout checks and actuals
let workoutChecks = {};
let exerciseActuals = {};
let exerciseWeights = {};

// Save workout progress
async function saveWorkoutProgress(dayId) {
    if (!SESSION) return;
    const today = getWorkoutDate();
    try {
        await db.collection('userdata').doc(SESSION.username)
            .collection('wkchecks').doc(today).set({
                checks: workoutChecks,
                actuals: exerciseActuals,
                dayId: dayId,
                updated: new Date().toISOString()
            });
    } catch(e) {
        console.error("Failed to save workout progress", e);
    }
}

function getWorkoutDate() {
    const dateInput = document.getElementById('workout-date');
    return dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
}

// Initialize
initFirebase();