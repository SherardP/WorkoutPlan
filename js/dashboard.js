// =============================================
// dashboard.js - Dashboard Page
// =============================================

async function loadDashboard() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">DASH<br><span>BOARD</span></div>
        <div class="page-sub" id="dashboardSub">// TODAY'S SUMMARY · PROGRESS & ACCOUNTABILITY //</div>
        
        <div id="summaryContent">
            <div class="g2">
                <!-- Streak Card -->
                <div class="card">
                    <div class="card-label">CURRENT STREAK</div>
                    <div class="stat-num" id="streakNum">7</div>
                    <div class="stat-label">DAYS</div>
                    <div id="streakGrid" class="streak-grid"></div>
                </div>

                <!-- Today's Workout -->
                <div class="card">
                    <div class="card-label">TODAY'S FOCUS</div>
                    <div class="card-title" id="todayWorkoutTitle">UPPER BODY A</div>
                    <button class="btn btn-p" onclick="navigateTo('workout')" style="width:100%;margin-top:16px;">
                        START WORKOUT →
                    </button>
                </div>
            </div>

            <!-- Progress Charts -->
            <div class="chart-wrap">
                <div class="chart-title">WEIGHT TREND</div>
                <div class="chart-canvas-wrap">
                    <canvas id="chartWeight" height="220"></canvas>
                </div>
            </div>

            <div class="g3">
                <div class="stat-box">
                    <div class="stat-num" id="totalWorkouts">12</div>
                    <div class="stat-label">WORKOUTS</div>
                </div>
                <div class="stat-box">
                    <div class="stat-num" id="stepCount">12480</div>
                    <div class="stat-label">STEPS TODAY</div>
                </div>
                <div class="stat-box">
                    <div class="stat-num" id="caloriesBurned">1840</div>
                    <div class="stat-label">KCAL BURNED</div>
                </div>
            </div>
        </div>
    `;

    // Load dynamic data
    await renderDashboardData();
}

async function renderDashboardData() {
    const workouts = await encryptedLoad('workout');
    
    // Update streak
    document.getElementById('streakNum').textContent = workouts.length || 0;
    
    // Render streak calendar
    if (typeof buildStreakCalendar === 'function') {
        buildStreakCalendar(workouts);
    }

    // Render charts
    if (typeof renderCharts === 'function') {
        renderCharts();
    }

    // Update stats (you can expand this)
    console.log("✅ Dashboard data loaded");
}

// Make function available globally
window.loadDashboard = loadDashboard;