// =============================================
// utils.js - Helper Functions & Constants
// =============================================

const DEFAULT_SEC_PER_REP = 3;
const BODYWEIGHT_PCT = {
    "PUSH-UP": 0.64,
    "PULL-UP": 0.97,
    "SQUAT": 0.0,
    "DEADLIFT": 0.0,
    // Add more as needed
};

const EXERCISE_MET = {
    "BENCH PRESS": 6.0,
    "SQUAT": 7.0,
    "DEADLIFT": 7.5,
    "OVERHEAD PRESS": 5.5,
    // Add more...
};

// Calorie calculation
function getWeightKg() {
    return SESSION?.weight ? SESSION.weight * 0.453592 : 70;
}

function metModifier(liftedLbs, bodyLbs) {
    if (!bodyLbs) return 1;
    return 1 + (liftedLbs / bodyLbs) * 0.4;
}

function calcSetCalories(item, reps, weightLbs) {
    const weightKg = getWeightKg();
    if (!weightKg || !reps) return 0;
    
    const name = (item.name || '').toUpperCase();
    const met = EXERCISE_MET[name] || 5.0;
    const secPerRep = 3;
    const setMinutes = (reps * secPerRep) / 60;
    
    const raw = met * metModifier(weightLbs || 0, SESSION.weight || 0) * weightKg * setMinutes;
    return Math.min(Math.round(raw), 25);
}

function calcActualCalories(item, actual) {
    if (!actual || !actual.sets) return 0;
    return actual.sets.reduce((sum, set) => {
        if (!set || !set.reps) return sum;
        const wt = parseFloat(set.weight) || 0;
        return sum + calcSetCalories(item, parseInt(set.reps), wt);
    }, 0);
}

// Date helpers
function localDateStr(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getToday() {
    return localDateStr(new Date());
}

// Toast notification
function toast(message, duration = 3000) {
    let toastEl = document.getElementById('toast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, duration);
}

// Theme handling
function applyTheme(gender) {
    if (gender === 'female') {
        document.body.classList.add('theme-female');
    } else {
        document.body.classList.remove('theme-female');
    }
}

// Find exercise by ID
function findExerciseById(itemId) {
    const W = window.getActiveWorkouts ? window.getActiveWorkouts() : {};
    for (const day of Object.values(W)) {
        for (const list of [day.prevDayStretch, day.preStretch, day.warmup, day.exercises, day.cooldown]) {
            const found = list?.find(i => i.id === itemId);
            if (found) return found;
        }
    }
    return null;
}

// Export for other modules
window.utils = {
    calcSetCalories,
    calcActualCalories,
    toast,
    applyTheme,
    getToday,
    localDateStr,
    findExerciseById
};