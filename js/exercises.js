// =============================================
// exercises.js - Exercise Library
// =============================================

async function loadExercises() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">EXERCISE<br><span>LIBRARY</span></div>
        <div class="page-sub">// TECHNIQUE • VARIATIONS • PROGRESSIONS //</div>

        <div style="margin-bottom:20px;">
            <input type="text" id="exercise-search" placeholder="Search exercises..." 
                   onkeyup="filterExercises()" 
                   style="width:100%;padding:12px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);">
        </div>

        <div id="exerciseLibrary" class="g2"></div>
    `;

    renderExerciseLibrary();
}

const exerciseDatabase = [
    { name: "BENCH PRESS", category: "Chest", difficulty: "Intermediate", video: "vcBig73ojpE" },
    { name: "OVERHEAD PRESS", category: "Shoulders", difficulty: "Intermediate" },
    { name: "BENT-OVER ROW", category: "Back", difficulty: "Beginner" },
    { name: "SQUAT", category: "Legs", difficulty: "Intermediate" },
    { name: "ROMANIAN DEADLIFT", category: "Posterior Chain", difficulty: "Intermediate" },
    { name: "PULL-UP", category: "Back", difficulty: "Advanced" },
    { name: "DUMBBELL LATERAL RAISE", category: "Shoulders", difficulty: "Beginner" },
    { name: "HIP THRUST", category: "Glutes", difficulty: "Intermediate" },
    { name: "PLANK", category: "Core", difficulty: "Beginner" },
    { name: "BULGARIAN SPLIT SQUAT", category: "Legs", difficulty: "Intermediate" }
];

function renderExerciseLibrary(filtered = exerciseDatabase) {
    const container = document.getElementById('exerciseLibrary');
    let html = '';

    filtered.forEach(ex => {
        html += `
            <div class="card">
                <div class="card-label">${ex.category}</div>
                <div class="card-title">${ex.name}</div>
                <div style="font-size:0.75rem;color:var(--text-dim);margin:8px 0;">
                    Difficulty: <strong>${ex.difficulty}</strong>
                </div>
                <button class="btn btn-s" onclick="showExerciseDetail('${ex.name}')" style="width:100%;">
                    VIEW TECHNIQUE →
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function filterExercises() {
    const searchTerm = document.getElementById('exercise-search').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderExerciseLibrary();
        return;
    }

    const filtered = exerciseDatabase.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm) || 
        ex.category.toLowerCase().includes(searchTerm)
    );
    
    renderExerciseLibrary(filtered);
}

function showExerciseDetail(name) {
    toast(`Loading technique guide for ${name}...`, 1800);
    // You can expand this into a modal with video, cues, common mistakes, etc.
}

// Make functions global
window.loadExercises = loadExercises;
window.filterExercises = filterExercises;
window.showExerciseDetail = showExerciseDetail;