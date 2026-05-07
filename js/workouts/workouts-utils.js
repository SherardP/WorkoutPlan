// =============================================
// workouts-utils.js - Utilities, Breathing, Calories, etc.
// =============================================

const EXERCISE_MET = {
    "BENCH PRESS": 6.0,
    "OVERHEAD PRESS": 5.5,
    "BENT-OVER ROW": 6.5,
    "SQUAT": 7.0,
    "DEADLIFT": 7.5,
    "PULL-UP": 8.0,
    // Add more as needed
};

function calcSetCalories(item, reps, weightLbs = 0) {
    const bodyWeight = SESSION?.weight || 180;
    const weightKg = bodyWeight * 0.453592;
    const name = (item.name || '').toUpperCase();
    const met = EXERCISE_MET[name] || 5.5;
    const minutes = (reps * 3) / 60; // ~3 seconds per rep

    const calories = met * minutes * weightKg * 0.0175;
    return Math.round(Math.min(calories, 30));
}

// Breathing / Decompression
function renderDecompressionSection() {
    const container = document.getElementById('decompSection');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-label">POST-WORKOUT RESET</div>
            <div class="card-title">10-MINUTE CORTISOL DECOMPRESSION</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;">
                <button class="btn btn-p" onclick="startBreathSession('sigh')">Physiological Sigh</button>
                <button class="btn btn-s" onclick="startBreathSession('478')">4-7-8 Breathing</button>
                <button class="btn btn-s" onclick="startBreathSession('scan')">Body Scan</button>
            </div>
            <div id="breathUI" style="display:none; text-align:center; padding:20px; background:var(--bg3); border-radius:8px;">
                <div class="breath-circle" id="breathCircle">READY</div>
                <div id="breathTimer" style="font-size:2.5rem; color:var(--accent2); margin:12px 0;">--</div>
                <div id="breathInstr" class="mono dim"></div>
            </div>
        </div>
    `;
}

let breathInterval = null;

function startBreathSession(mode) {
    if (breathInterval) clearInterval(breathInterval);
    
    const ui = document.getElementById('breathUI');
    const circle = document.getElementById('breathCircle');
    const timerEl = document.getElementById('breathTimer');
    const instrEl = document.getElementById('breathInstr');

    ui.style.display = 'block';

    // Simple breathing patterns
    const patterns = {
        sigh: { label: "DOUBLE INHALE → LONG EXHALE", time: 6 },
        '478': { label: "INHALE 4 • HOLD 7 • EXHALE 8", time: 19 },
        scan: { label: "SLOW BREATH + SCAN", time: 8 }
    };

    let seconds = 0;
    const pattern = patterns[mode];

    instrEl.textContent = pattern.label;

    breathInterval = setInterval(() => {
        seconds++;
        timerEl.textContent = seconds;

        if (seconds > 180) { // 3 minutes max per session
            clearInterval(breathInterval);
            circle.textContent = "DONE ✓";
        }
    }, 1000);
}

// Make utilities global
window.calcSetCalories = calcSetCalories;
window.renderDecompressionSection = renderDecompressionSection;
window.startBreathSession = startBreathSession;