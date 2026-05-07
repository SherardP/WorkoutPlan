// =============================================
// workouts-renderer.js - Exercise Rendering & UI
// =============================================

async function renderWorkoutDay(dayId) {
    const content = document.getElementById('workoutContent');
    const day = activeProgram[dayId];
    
    if (!day) {
        content.innerHTML = `<div class="card"><p>No data for this day.</p></div>`;
        return;
    }

    let html = `
        <div class="card">
            <div class="card-title">${day.title || dayId.toUpperCase()}</div>
            <div id="exercise-list"></div>
        </div>
    `;

    content.innerHTML = html;

    const listContainer = document.getElementById('exercise-list');
    
    // Example exercises (in real version these come from the program)
    const exercises = day.exercises && day.exercises.length > 0 ? day.exercises : getSampleExercises();

    let exHTML = '';
    exercises.forEach(item => {
        exHTML += createExerciseBlock(item, dayId);
    });

    listContainer.innerHTML = exHTML;
}

function getSampleExercises() {
    return [
        { id: "bench1", name: "BENCH PRESS", sets: "5×5", detail: "Heavy compound" },
        { id: "ohp1", name: "OVERHEAD PRESS", sets: "4×8", detail: "Shoulders" },
        { id: "row1", name: "BENT-OVER ROW", sets: "4×8", detail: "Back" }
    ];
}

function createExerciseBlock(item, dayId) {
    const checked = workoutChecks[item.id] || false;
    
    return `
        <div class="ex-block" id="exblock-${item.id}">
            <div class="ex-header" onclick="toggleExerciseBody('${item.id}')">
                <div style="flex:1">
                    <div class="ex-name">${item.name}</div>
                    <div class="ex-meta">${item.sets || ''} — ${item.detail || ''}</div>
                </div>
                <div onclick="event.stopImmediatePropagation(); toggleCheck('${item.id}','${dayId}');" 
                     style="width:28px;height:28px;border:2px solid ${checked?'#4caf50':'var(--border2)'};border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                    ${checked ? '✓' : ''}
                </div>
            </div>
            <div class="ex-body" id="body-${item.id}" style="display:none;">
                <!-- Set tracker will be injected by tracking.js -->
                <div id="set-tracker-${item.id}"></div>
            </div>
        </div>
    `;
}

function toggleExerciseBody(itemId) {
    const body = document.getElementById(`body-${itemId}`);
    if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

// Make renderer functions global
window.renderWorkoutDay = renderWorkoutDay;
window.createExerciseBlock = createExerciseBlock;
window.toggleExerciseBody = toggleExerciseBody;