// =============================================
// ui.js - Reusable UI Components, Charts, Toasts
// =============================================

let charts = {};

// Destroy chart to prevent memory leaks
function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

// Render all charts on dashboard
async function renderCharts() {
    const body = await encryptedLoad('body');
    const steps = await encryptedLoad('steps');
    const workouts = await encryptedLoad('workout');
    
    // Weight Chart
    destroyChart('weight');
    const weightCtx = document.getElementById('chartWeight');
    if (weightCtx) {
        charts['weight'] = new Chart(weightCtx, {
            type: 'line',
            data: {
                labels: body.slice(0, 20).map(b => b.date || ''),
                datasets: [{
                    label: 'Weight (lbs)',
                    data: body.slice(0, 20).map(b => b.weight || 0),
                    borderColor: '#ff7a1a',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    toast("Charts updated", 1500);
}

// Build streak calendar
function buildStreakCalendar(workouts) {
    const workedDays = new Set(workouts.map(w => w.date));
    const grid = document.getElementById('streakGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 69);

    for (let i = 0; i < 70; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = localDateStr(d);
        
        const cell = document.createElement('div');
        cell.className = `streak-cell ${workedDays.has(dateStr) ? 'done' : ''}`;
        grid.appendChild(cell);
    }
}

// Show toast notification
function showToast(message, duration = 3000) {
    toast(message, duration); // uses function from utils.js
}

// Render workout day (will be expanded in workouts.js)
function renderWorkoutDay(dayId) {
    // Placeholder - full logic will live in workouts.js
    console.log(`Rendering workout for: ${dayId}`);
}

// Make UI functions globally available
window.destroyChart = destroyChart;
window.renderCharts = renderCharts;
window.buildStreakCalendar = buildStreakCalendar;
window.showToast = showToast;
window.renderWorkoutDay = renderWorkoutDay;