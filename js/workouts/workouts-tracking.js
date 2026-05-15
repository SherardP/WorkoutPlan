// ═══════════════════════════════════════════════════════════
// workouts-tracking.js - Set Tracking & Logging
// ═══════════════════════════════════════════════════════════

{

// Toggle exercise complete
window.toggleCheck = async function(itemId, dayId) {
    workoutChecks[itemId] = !workoutChecks[itemId];
    const checked = workoutChecks[itemId];

    // Update UI
    const block = document.getElementById(`exblock-${itemId}`);
    if (block) {
        block.style.opacity = checked ? '0.75' : '1';
        const checkIcon = block.querySelector('div[onclick*="toggleCheck"]');
        if (checkIcon) checkIcon.innerHTML = checked ? '✓' : '';
    }

    await saveWorkoutProgress(dayId);
    toast(checked ? "Exercise marked complete" : "Exercise unmarked", 1200);
}
};

// Render set tracker inside exercise body
function renderSetTracker(itemId, dayId) {
    const container = document.getElementById(`set-tracker-${itemId}`);
    if (!container) return;

    const item = findExerciseById(itemId) || { name: "Exercise", sets: "3×8" };
    const actual = exerciseActuals[itemId] || { sets: [] };
    const numSets = 3; // Can be dynamic

    let html = `<div style="background:var(--bg3);padding:12px;border:1px solid var(--border);margin:8px 0;border-radius:6px;">`;

    for (let i = 0; i < numSets; i++) {
        const setData = actual.sets[i] || {};
        html += `
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                <span style="width:30px;font-family:var(--font-mono);color:var(--text-dim);">SET ${i+1}</span>
                <input type="number" placeholder="Reps" value="${setData.reps || ''}" 
                    onchange="saveSetData('${itemId}', ${i}, this.value)" 
                    style="width:80px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:6px;">
                
                <input type="number" placeholder="Weight (lbs)" value="${setData.weight || ''}" 
                    onchange="saveSetData('${itemId}', ${i}, null, this.value)" 
                    style="width:100px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:6px;">
                
                <button onclick="toggleSetDone('${itemId}', ${i}, '${dayId}')" 
                    style="padding:4px 12px;background:${setData.done ? '#4caf50' : 'transparent'};color:${setData.done ? '#fff' : 'var(--text-dim)'};border:1px solid var(--border);">
                    ${setData.done ? '✓ DONE' : 'Mark Done'}
                </button>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function saveSetData(itemId, setIndex, reps = null, weight = null) {
    if (!exerciseActuals[itemId]) exerciseActuals[itemId] = { sets: [] };
    if (!exerciseActuals[itemId].sets[setIndex]) exerciseActuals[itemId].sets[setIndex] = {};

    if (reps !== null) exerciseActuals[itemId].sets[setIndex].reps = reps;
    if (weight !== null) exerciseActuals[itemId].sets[setIndex].weight = weight;

    // Auto-save after delay
    debounceSaveWorkout();
}

function toggleSetDone(itemId, setIndex, dayId) {
    if (!exerciseActuals[itemId]) exerciseActuals[itemId] = { sets: [] };
    const set = exerciseActuals[itemId].sets[setIndex] || {};
    set.done = !set.done;

    renderSetTracker(itemId, dayId);
    saveWorkoutProgress(dayId);
}

// Debounced save
let saveTimeout;
function debounceSaveWorkout() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveWorkoutProgress(window.currentDayId);
    }, 800);
}

async function saveWorkoutProgress(dayId) {
    if (!SESSION?.username || !dayId) return;
    const today = currentWorkoutDate || getToday();

    try {
        await db.collection('userdata').doc(SESSION.username)
            .collection('wkchecks').doc(today).set({
                checks: workoutChecks,
                actuals: exerciseActuals,
                dayId: dayId,
                updated: new Date().toISOString()
            }, { merge: true });
    } catch(e) {
        console.error("Save failed", e);
    }
}

// Make tracking functions global
window.toggleCheck = toggleCheck;
window.renderSetTracker = renderSetTracker;
window.saveSetData = saveSetData;
window.toggleSetDone = toggleSetDone;