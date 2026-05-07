// =============================================
// nutrition.js - Nutrition Tracking
// =============================================

async function loadNutrition() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">NUTRI<br><span>TION</span></div>
        <div class="page-sub">// CALORIES • MACROS • MEAL LOGGING //</div>

        <div class="g2">
            <!-- Daily Summary -->
            <div class="card">
                <div class="card-label">TODAY'S TARGETS</div>
                <div style="display:flex;justify-content:space-around;margin:20px 0;">
                    <div style="text-align:center;">
                        <div class="stat-num" style="font-size:2.2rem;" id="cal-target">2400</div>
                        <div class="stat-label">KCAL</div>
                    </div>
                    <div style="text-align:center;">
                        <div class="stat-num" style="font-size:2.2rem;color:#4caf50;" id="prot-target">180</div>
                        <div class="stat-label">PROTEIN g</div>
                    </div>
                </div>
                <button class="btn btn-p" onclick="logMeal()" style="width:100%;">+ LOG MEAL</button>
            </div>

            <!-- Macro Breakdown -->
            <div class="card">
                <div class="card-label">MACRO SPLIT</div>
                <div class="card-title">CURRENT INTAKE</div>
                <div style="height:220px;margin:16px 0;">
                    <canvas id="macroChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Recent Meals -->
        <div class="card">
            <div class="card-label">RECENT MEALS</div>
            <div id="mealLog" style="max-height:420px;overflow-y:auto;"></div>
        </div>
    `;

    renderMacroChart();
    loadRecentMeals();
}

function renderMacroChart() {
    const ctx = document.getElementById('macroChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [180, 220, 80],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function logMeal() {
    const mealName = prompt("Meal name (e.g. Chicken Rice Bowl):");
    if (!mealName) return;

    const calories = prompt("Calories:", "650");
    if (calories === null) return;

    toast(`✅ Logged: ${mealName} — ${calories} kcal`, 2200);
    loadRecentMeals();
}

async function loadRecentMeals() {
    const container = document.getElementById('mealLog');
    if (!container) return;

    // Placeholder data
    container.innerHTML = `
        <div style="padding:12px;border-bottom:1px solid var(--border);">
            <strong>08:45</strong> — Protein Oatmeal <span style="color:#4caf50;float:right;">620 kcal</span>
        </div>
        <div style="padding:12px;border-bottom:1px solid var(--border);">
            <strong>13:20</strong> — Grilled Chicken + Rice <span style="color:#4caf50;float:right;">780 kcal</span>
        </div>
        <div style="padding:12px;">
            <strong>18:10</strong> — Salmon + Sweet Potato <span style="color:#4caf50;float:right;">710 kcal</span>
        </div>
    `;
}

// Make functions global
window.loadNutrition = loadNutrition;
window.logMeal = logMeal;