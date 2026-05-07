// =============================================
// workouts-core.js - Core Loading & Navigation
// =============================================

let activeProgram = {};
let currentWorkoutDate = getToday();

async function loadWorkouts() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">WORK<br><span>OUTS</span></div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            <div class="page-sub" id="workoutSub">// LOADING PROGRAM... //</div>
            <div style="display:flex;align-items:center;gap:8px;">
                <input type="date" id="workout-date" value="${currentWorkoutDate}" onchange="onWorkoutDateChange()">
                <button class="btn btn-s" onclick="setWorkoutDate('today')">TODAY</button>
                <button class="btn btn-s" onclick="setWorkoutDate('yesterday')">YESTERDAY</button>
            </div>
        </div>

        <div style="margin-bottom:16px;">
            <button class="btn btn-s" onclick="confirmGenerateProgram()" style="margin-right:8px;">⚡ GENERATE NEW PROGRAM</button>
            <button class="btn btn-s" onclick="restoreBackupProgram()">↶ RESTORE BACKUP</button>
        </div>

        <div id="dayTabs" class="flex gap8 mb16 fw"></div>
        <div id="workoutContent"></div>

        <!-- Decompression Section -->
        <div style="margin-top:40px; padding-top:24px; border-top:1px solid var(--border);">
            <div class="page-sub">// 10-MINUTE MANDATORY CORTISOL RESET //</div>
            <div id="decompSection"></div>
        </div>
    `;

    await loadActiveProgram();
    renderDayTabs();
    renderDecompressionSection();
}

async function loadActiveProgram() {
    activeProgram = await encryptedLoad('program') || {};
    if (Object.keys(activeProgram).length === 0) {
        generateDefaultProgram();
    }
}

function renderDayTabs() {
    const container = document.getElementById('dayTabs');
    container.innerHTML = '';

    Object.keys(activeProgram).forEach(dayId => {
        const day = activeProgram[dayId];
        const btn = document.createElement('button');
        btn.className = 'day-card';
        btn.innerHTML = `
            <div class="day-name">${dayId.toUpperCase()}</div>
            <div class="day-focus">${day.title || 'Training Day'}</div>
        `;
        btn.onclick = () => showWorkoutDay(dayId);
        container.appendChild(btn);
    });
}

function showWorkoutDay(dayId) {
    window.currentDayId = dayId;
    renderWorkoutDay(dayId);   // This will be in workouts-renderer.js
}

// Date handlers
function onWorkoutDateChange() {
    const el = document.getElementById('workout-date');
    if (el) currentWorkoutDate = el.value;
}

function setWorkoutDate(mode) {
    const input = document.getElementById('workout-date');
    if (!input) return;
    const d = new Date();
    if (mode === 'yesterday') d.setDate(d.getDate() - 1);
    input.value = d.toISOString().split('T')[0];
    currentWorkoutDate = input.value;
}

// Make core functions global
window.loadWorkouts = loadWorkouts;
window.showWorkoutDay = showWorkoutDay;
window.onWorkoutDateChange = onWorkoutDateChange;
window.setWorkoutDate = setWorkoutDate;