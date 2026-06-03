// =============================================
// workouts-tracking.js - Set Tracking & Logging
// =============================================
// IMPORTANT: toggleCheck, saveSetData, toggleSetDone, and
// findExerciseById are all fully defined in workouts-core.js
// with the correct DOM update logic and function signatures.
// This file must NOT redefine or overwrite them.
//
// workouts-core.js signature reference:
//   toggleCheck(itemId, dayId)
//   saveSetData(itemId, dayId, setIndex)        ← 3 args
//   toggleSetDone(itemId, dayId, setIndex)      ← 3 args
//   findExerciseById(itemId)
// =============================================

// saveWorkoutProgress — used internally by workouts-core.js
// if it ever calls out to this file. Safe to define here as
// a passthrough since workouts-core handles saving inline.
async function saveWorkoutProgress(dayId) {
    if (!SESSION?.username || !dayId) return;
    const dateEl = document.getElementById('workout-date');
    const today  = (dateEl && dateEl.value) ? dateEl.value
                 : (typeof localDateStr === 'function' ? localDateStr() : new Date().toISOString().split('T')[0]);
    try {
        await db.collection('userdata').doc(SESSION.username)
            .collection('wkchecks').doc(today).set({
                checks:  typeof workoutChecks   !== 'undefined' ? workoutChecks   : {},
                actuals: typeof exerciseActuals !== 'undefined' ? exerciseActuals : {},
                dayId,
                updated: new Date().toISOString()
            }, { merge: true });
    } catch(e) {
        console.error('saveWorkoutProgress failed:', e);
    }
}
window.saveWorkoutProgress = saveWorkoutProgress;
