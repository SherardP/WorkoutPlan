// =============================================
// logdata.js - Log Data Page (Workouts, Body, Steps, etc.)
// =============================================

async function loadLogData() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">LOG<br><span>DATA</span></div>
        <div class="page-sub">// RECORD YOUR PROGRESS — BODY STATS, WORKOUTS & MORE //</div>

        <div class="g2">
            <!-- Quick Workout Log -->
            <div class="card">
                <div class="card-label">QUICK LOG</div>
                <div class="card-title">TODAY'S WORKOUT</div>
                <button class="btn btn-p" onclick="quickLogWorkout()" style="width:100%;margin:12px 0;">
                    LOG COMPLETED SESSION
                </button>
            </div>

            <!-- Body Measurements -->
            <div class="card">
                <div class="card-label">BODY MEASUREMENTS</div>
                <div class="card-title">UPDATE STATS</div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div class="lf">
                        <label>WEIGHT (lbs)</label>
                        <input type="number" id="log-weight" placeholder="185">
                    </div>
                    <div class="lf">
                        <label>WAIST (inches)</label>
                        <input type="number" id="log-waist" placeholder="34">
                    </div>
                </div>
                <button class="btn btn-p" onclick="saveBodyLog()" style="width:100%;margin-top:16px;">SAVE MEASUREMENTS</button>
            </div>
        </div>

        <!-- History -->
        <div class="card">
            <div class="card-label">RECENT LOGS</div>
            <div id="logHistory" class="mono" style="max-height:400px;overflow-y:auto;font-size:0.8rem;"></div>
        </div>
    `;

    await loadLogHistory();
}

async function saveBodyLog() {
    const weight = parseFloat(document.getElementById('log-weight').value);
    const waist = parseFloat(document.getElementById('log-waist').value);

    if (!weight) {
        toast("Please enter weight", 1500);
        return;
    }

    const entry = {
        date: getToday(),
        weight: weight,
        waist: waist || null,
        saved: new Date().toISOString()
    };

    let bodyLogs = await encryptedLoad('body');
    bodyLogs.unshift(entry);
    await encryptedSave('body', bodyLogs);

    toast("✅ Body stats saved", 2000);
    loadLogHistory();
}

async function quickLogWorkout() {
    toast("Quick workout log saved! (Full details coming soon)", 1800);
    
    // Example: Save a basic workout entry
    const entry = {
        date: getToday(),
        day: "QUICK LOG",
        duration: "45",
        caloriesBurned: "420",
        notes: "Quick session logged from dashboard",
        saved: new Date().toISOString()
    };

    let logs = await encryptedLoad('workout');
    logs.unshift(entry);
    await encryptedSave('workout', logs);
}

async function loadLogHistory() {
    const container = document.getElementById('logHistory');
    if (!container) return;

    const workouts = await encryptedLoad('workout');
    const body = await encryptedLoad('body');

    let html = '<div style="padding:8px 0;">';

    workouts.slice(0, 8).forEach(w => {
        html += `
            <div style="padding:8px;border-bottom:1px solid var(--border);">
                <strong>${w.date}</strong> — ${w.day || 'Workout'} 
                <span style="color:var(--accent2)">(${w.caloriesBurned || '?'} kcal)</span>
            </div>`;
    });

    html += '</div>';
    container.innerHTML = html || '<p class="dim">No logs yet. Start logging!</p>';
}

// Make functions global
window.loadLogData = loadLogData;
window.saveBodyLog = saveBodyLog;
window.quickLogWorkout = quickLogWorkout;