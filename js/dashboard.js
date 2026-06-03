// =============================================
// dashboard.js - Updated to match original structure
// =============================================

async function loadDashboard() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="section active" id="sec-dashboard">
			<div class="page-title">DASH<br><span>BOARD</span></div>
			<div class="page-sub" id="dashboardSub">// TODAY'S SUMMARY · PROGRESS & ACCOUNTABILITY //</div>
			<div id="summaryContent"></div>
		</div>
		
		<div class="page-title">DASH<br><span>BOARD</span></div>
        <div class="page-sub" id="dashSub">// OPERATORFIT · PHASE 1 ACTIVE //</div>

        <!-- Today's Focus -->
        <div class="card">
            <div class="card-label">TODAY'S FOCUS</div>
            <div class="card-title" id="todayTitle">MONDAY — UPPER PUSH</div>
            <div id="todayDesc" class="mono dim" style="margin-top:8px;line-height:1.5;"></div>
            <button class="btn btn-p" onclick="navigateTo('workout')" style="width:100%;margin-top:16px;">
                START TODAY'S WORKOUT →
            </button>
        </div>

        <div class="g2" id="weekGrid" style="margin-top:20px;"></div>
		
		<div class="g2" id="dayGrid" style="margin-top:20px;"></div>

        <!-- Charts -->
        <div class="chart-wrap" style="margin-top:24px;">
            <div class="chart-title">PROGRESS</div>
            <div class="chart-canvas-wrap">
                <canvas id="chartWeight" height="220"></canvas>
            </div>
        </div>

        <div class="g3" style="margin-top:20px;">
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
    `;

    // Run original dashboard functions
    setTodayCard();
    buildWeekGrid();
	buildDayTabs();
    
    // Render charts if available
    if (typeof renderCharts === 'function') {
        renderCharts();
    }

    console.log("✅ Dashboard loaded");
}



// Keep the rest of your original functions
const DAYS_DATA = [
  {id:'mon',name:'MON',full:'MONDAY',focus:'UPPER PUSH',sub:'Chest · Shoulders · Triceps'},
  {id:'tue',name:'TUE',full:'TUESDAY',focus:'LOWER BODY',sub:'Quads · Hamstrings · Glutes'},
  {id:'wed',name:'WED',full:'WEDNESDAY',focus:'UPPER PULL',sub:'Back · Biceps · Rear Delts'},
  {id:'thu',name:'THU',full:'THURSDAY',focus:'CORE + HIIT',sub:'Abs · Obliques · Conditioning'},
  {id:'fri',name:'FRI',full:'FRIDAY',focus:'FULL UPPER',sub:'Compound Upper Body'},
  {id:'sat',name:'SAT',full:'SATURDAY',focus:'LEGS + CORE',sub:'Full Legs · Active Recovery'},
  {id:'sun',name:'SUN',full:'SUNDAY',focus:'REST',sub:'Full Recovery',rest:true}
];

function setTodayCard() {
  const jsDay = new Date().getDay();
  const map = [6,0,1,2,3,4,5];
  const d = DAYS_DATA[map[jsDay]];
  const isF = SESSION ? SESSION.gender === 'female' : false;
  
  const todayTitleEl = document.getElementById('todayTitle');
  if (todayTitleEl) {
    todayTitleEl.textContent = d.rest ? 'REST DAY ✦ ACTIVE RECOVERY' : `${d.full} — ${d.focus}`;
  }
  
  const todayDescEl = document.getElementById('todayDesc');
  if (todayDescEl) {
    todayDescEl.innerHTML = d.rest
      ? (isF ? 'Today is your rest day, darling...' : 'Sunday — full rest...')
      : (isF ? `<strong style="color:var(--accent2);">${d.sub}</strong><br>Evening session · 110 minutes` 
             : `<strong style="color:var(--accent2);">${d.sub}</strong><br>Evening session · 110 minutes`);
  }
  
  const isPhaseF = isF ? '// BLOOMFIT · PHASE 1 ACTIVE //' : '// OPERATORFIT · PHASE 1 ACTIVE //';
  const dashSubEl = document.getElementById('dashSub');
  if (dashSubEl) {
    dashSubEl.textContent = isPhaseF;
  }
  
  const dashTitleAccentEl = document.getElementById('dashTitleAccent');
  if (dashTitleAccentEl) {
    dashTitleAccentEl.textContent = isF ? 'CENTER ✦' : 'CONTROL';
  }
}

function buildWeekGrid() {
  const weekGridEl = document.getElementById('weekGrid');
  if (!weekGridEl) return;
  
  const jsDay = new Date().getDay();
  const map = [6,0,1,2,3,4,5];
  const todayIdx = map[jsDay];

  weekGridEl.innerHTML = DAYS_DATA.map((d,i) => `
    <div class="day-card ${d.rest?'rest':''} ${i===todayIdx?'today':''}" 
         onclick="${d.rest?'':`navigateTo('workout');showWorkoutDay('${d.id}')`}">
      <div class="day-name">${d.name}</div>
      <div class="day-focus">${d.focus}</div>
    </div>
  `).join('');
}

function buildDayTabs() {
  const dayGridFl = document.getElementById('dayGrid');
  
  if (!dayGridFl) return; 
  
  const jsDay = new Date().getDay();
  const map = [6,0,1,2,3,4,5]; // Sun=0 → index 6 (sat)
  const todayIdx = map[jsDay];
  const dayIds = [...DAY_IDS,'sun'];
  
  dayGridFl.innerHTML = dayIds.map((id,i) => {
    const isToday = (i === todayIdx) || (id==='sun' && jsDay===0);
    return `<div class="stat-box" style="flex:1;min-width:60px;cursor:${id==='sun'?'default':'pointer'};${isToday?'border-bottom:3px solid var(--accent2);':''}" id="daytab-${id}"
      onclick="${id==='sun'?'':` showWorkoutDay('${id}')`}">
      <div style="font-family:var(--font-display);font-size:0.95rem;color:${isToday?'var(--accent2)':'var(--text)'};">${DAY_NAMES[id]}</div>
      <div class="stat-label">${id==='sun'?'REST':''}</div>
    </div>`;
  }).join('');
}

function setDefaultDates() {
  const t = localDateStr();
  ['l-date','s-date','b-date','n-date'].forEach(id => { const el=document.getElementById(id); if(el) el.value=t; });
}

async function loadGeneratedProgram() {
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('program').doc('current').get();
    if (doc.exists) {
      SESSION._program = JSON.parse(doc.data().data);
      return SESSION._program;
    }
  } catch(e) {}
  return null;
}

// ═══════════════════════════════════════════════════════════
// PHASE CONTENT
// ═══════════════════════════════════════════════════════════
const PHASES = {
  1:{label:'PHASE 1 — REACTIVATION',weeks:'WEEKS 1–4',intensity:'50–60% 1RM',
    points:['Start at 60% — muscle memory is intact but connective tissue needs 4 weeks','Add 10% volume per week — not weight yet','Burnout sets added WEEK 3–4 only','Sleep improvement in Phase 1 multiplies Phase 2 results','16,000 steps daily — this is where visceral fat loss happens between workouts']},
  2:{label:'PHASE 2 — BUILD',weeks:'WEEKS 5–12',intensity:'70–85% 1RM',
    points:['5×5 at 75–85% 1RM — true strength building begins','HIIT added Thursday only (max 2×/week)','Full burnout finishers every session from here','Expect plateau around Week 8 — deload 1 week then continue','Track every lift — add weight when all 5 sets are clean']},
  3:{label:'PHASE 3 — PEAK',weeks:'WEEKS 13+',intensity:'85–95% 1RM',
    points:['5×3 at 85–95% 1RM — peak functional strength territory','3 weeks hard / 1 week deload — periodization blocks','Advanced calisthenics progressions unlock here','Measure functional strength — push-up max, key lift numbers','You will be genuinely strong by this phase — not just fit']}
};

function showPhase(n) {
  document.querySelectorAll('#phaseBar .stat-box').forEach((el,i) => {
    el.style.borderBottom = i===n-1?'3px solid var(--accent2)':'none';
  });
  const p = PHASES[n];
  const phaseContentEl = document.getElementById('phaseContent');
  if (!phaseContentEl) return;
  phaseContentEl.innerHTML = `
    <div class="card">
      <div class="card-label">${p.weeks} · ${p.intensity}</div>
      <div class="card-title">${p.label}</div>
      <div>${p.points.map(pt=>'<div class="sci-row"><div class="sci-icon">▸</div><div class="sci-text">' + pt + '</div></div>').join('')}</div>
    </div>`;
}

function buildTimeBudget() {
  const timeBudgetEl = document.getElementById('timeBudget');
  if (!timeBudgetEl) return;
  timeBudgetEl.innerHTML = `
    <div class="step-row"><div class="step-time">10 MIN</div><div class="step-num" style="font-size:1rem;">WARM-UP</div><div class="step-bar"><div class="step-bar-f" style="width:9%"></div></div><div class="mono dim">Dynamic mobility, joint prep, activation</div></div>
    <div class="step-row"><div class="step-time">75 MIN</div><div class="step-num" style="font-size:1rem;">MAIN WORK</div><div class="step-bar"><div class="step-bar-f" style="width:68%"></div></div><div class="mono dim">5×5 compounds → secondary sets → burnout finisher</div></div>
    <div class="step-row"><div class="step-time">15 MIN</div><div class="step-num" style="font-size:1rem;">HIIT (P2+)</div><div class="step-bar"><div class="step-bar-f" style="width:14%"></div></div><div class="mono dim">Phase 2+ only — bodyweight circuits max 2×/week</div></div>
    <div class="step-row"><div class="step-time">10 MIN</div><div class="step-num" style="font-size:1rem;">DECOMPRESS</div><div class="step-bar"><div class="step-bar-f" style="width:9%"></div></div><div class="mono dim">Breathwork + body scan — mandatory cortisol reset</div></div>`;
}

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════
async function loadStats() {
  const workouts = await encryptedLoad('workout');
  const steps = await encryptedLoad('steps');
  const stWorkoutsEl = document.getElementById('st-workouts');
  if (stWorkoutsEl) stWorkoutsEl.textContent = workouts.length;
  const today = new Date(); today.setHours(0,0,0,0);
  const dates = [...new Set(workouts.map(w => { const d=new Date(w.date); d.setHours(0,0,0,0); return d.getTime(); }))].sort((a,b)=>b-a);
  let streak = 0;
  for (let i=0;i<dates.length;i++) { const exp=new Date(today); exp.setDate(exp.getDate()-i); if(dates[i]===exp.getTime()) streak++; else break; }
  const stStreakEl = document.getElementById('st-streak');
  if (stStreakEl) stStreakEl.textContent = streak;
  if (workouts.length > 0) {
    const first = new Date(workouts[workouts.length-1].date);
    const stWeeksEl = document.getElementById('st-weeks');
    if (stWeeksEl) stWeeksEl.textContent = Math.max(1, Math.ceil((new Date()-first)/(7*24*60*60*1000)));
  }
  const avgSteps = steps.length ? Math.round(steps.slice(0,7).reduce((a,s)=>a+(+s.total||0),0)/Math.min(steps.length,7)) : 0;
  const stStepsEl = document.getElementById('st-steps');
  if (stStepsEl) stStepsEl.textContent = avgSteps > 999 ? (avgSteps/1000).toFixed(1)+'k' : avgSteps;
}

// ═══════════════════════════════════════════════════════════
// LOG SUMMARY — Motivational Dashboard with Charts
// ═══════════════════════════════════════════════════════════
async function renderLogSummary() {
  const el = document.getElementById('summaryContent');
  if (!el) {
    console.error('summaryContent not found');
    return;
  }

  if (!SESSION) {
    el.innerHTML = '<div style="color:red;">No session - please log in</div>';
    return;
  }

  el.innerHTML = '<div style="color:green;">Loading dashboard for ' + SESSION.username + '...</div>';

  await _renderLogSummaryInner(el);
}

async function _renderLogSummaryInner(el) {
  // Load dashboard config first (needed for card visibility)
  if (typeof loadDashConfig === 'function') await loadDashConfig();

  // Test database connection first
  try {
    console.log('Testing database connection...');
    const testDoc = await db.collection('_ping').limit(1).get();
    console.log('Database connection OK');
  } catch(e) {
    console.error('Database connection failed:', e);
    el.innerHTML = '<div style="padding:32px;text-align:center;font-family:var(--font-mono);font-size:0.72rem;color:var(--danger);letter-spacing:.12em;">DATABASE CONNECTION ERROR</div>';
    return;
  }

  // Load all data — default to empty array on any failure
  let workouts = [], steps = [], body = [], nutrition = [];
  try { workouts  = await encryptedLoad('workout');   } catch(e) { console.error('workout load error:', e); }
  try { steps     = await encryptedLoad('steps');     } catch(e) { console.error('steps load error:', e); }
  try { body      = await encryptedLoad('body');      } catch(e) { console.error('body load error:', e); }
  try { nutrition = await encryptedLoad('nutrition'); } catch(e) { console.error('nutrition load error:', e); }

  const todayStr = localDateStr();
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const yestStr = localDateStr(yd);

  // ── Yesterday's data (within last 30 days only) ──
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = localDateStr(cutoff);

  const yestWorkout   = workouts.find(w => w.date === yestStr) || null;
  const yestSteps     = steps.find(s => s.date === yestStr) || null;
  const yestNutrition = nutrition.find(n => n.date === yestStr) || null;
  const yestBody      = body.find(b => b.date === yestStr) || body.find(b => b.date >= cutoffStr) || null;
  const hasYestData   = !!(yestWorkout || yestSteps || yestNutrition);

  // ── Today's data ──
  const todayWorkout   = workouts.find(w => w.date === todayStr) || null;
  const todaySteps     = steps.find(s => s.date === todayStr) || null;
  const todayNutrition = nutrition.find(n => n.date === todayStr) || null;

  // ── Overall metrics — safe with empty arrays ──
  const today = new Date(); today.setHours(0,0,0,0);
  const wDates = [...new Set(workouts.map(w => {
    const d = new Date(w.date||'2000-01-01'); d.setHours(0,0,0,0); return d.getTime();
  }))].filter(t => !isNaN(t)).sort((a,b) => b-a);

  let streak = 0;
  for (let i = 0; i < wDates.length; i++) {
    const exp = new Date(today); exp.setDate(exp.getDate() - i);
    if (wDates[i] === exp.getTime()) streak++; else break;
  }

  const totalSessions  = workouts.length;
  const weeksTraining  = workouts.length && workouts[workouts.length-1]?.date
    ? Math.max(1, Math.ceil((Date.now() - new Date(workouts[workouts.length-1].date)) / (7*86400000)))
    : 0;
  const consistencyPct = weeksTraining
    ? Math.min(100, Math.round(totalSessions / (weeksTraining * (userGoals.workoutFreq||6)) * 100))
    : 0;

  const avgSteps7d   = steps.length
    ? Math.round(steps.slice(0,7).reduce((a,s) => a + (+s.total||0), 0) / Math.min(steps.length,7))
    : 0;
  const stepGoalHits = steps.filter(s => (+s.total||0) >= (userGoals.stepGoal||10000)).length;
  const stepHitPct   = steps.length ? Math.round(stepGoalHits / steps.length * 100) : 0;

  const bodyWithWeight = body.filter(b => b.weight && !isNaN(+b.weight));
  const latestWeight = bodyWithWeight[0] || null;
  const firstWeight  = bodyWithWeight[bodyWithWeight.length-1] || null;
  const wtChange = (latestWeight && firstWeight && latestWeight !== firstWeight)
    ? +(+latestWeight.weight - +firstWeight.weight).toFixed(1) : null;

  const bodyWithWaist = body.filter(b => b.waist && !isNaN(+b.waist));
  const latestWaist = bodyWithWaist[0] || null;
  const firstWaist  = bodyWithWaist[bodyWithWaist.length-1] || null;
  const waistChange = (latestWaist && firstWaist && latestWaist !== firstWaist)
    ? +(+latestWaist.waist - +firstWaist.waist).toFixed(2) : null;

  const sleepData  = body.filter(b => b.sleep && !isNaN(+b.sleep)).slice(0,14);
  const stressData = body.filter(b => b.stress && !isNaN(+b.stress)).slice(0,14);
  const avgSleep  = sleepData.length  ? (sleepData.reduce((a,b) => a+(+b.sleep),0)  / sleepData.length).toFixed(1)  : null;
  const avgStress = stressData.length ? (stressData.reduce((a,b) => a+(+b.stress),0) / stressData.length).toFixed(1) : null;
  const bmi = getSessionBMI();

  // ── Calorie balance — workout + steps combined ──
  const yestCalsBurned  = getDayCalBurn(yestWorkout, yestSteps);
  const yestCalsEaten   = yestNutrition && +yestNutrition.calories > 0 ? +yestNutrition.calories : null;
  const yestCalDeficit  = (yestCalsBurned && yestCalsEaten) ? yestCalsBurned - yestCalsEaten : null;

  const todayCalsBurned = getDayCalBurn(todayWorkout, todaySteps);
  const todayCalsEaten  = todayNutrition && +todayNutrition.calories > 0 ? +todayNutrition.calories : null;
  const todayCalDeficit = (todayCalsBurned && todayCalsEaten) ? todayCalsBurned - todayCalsEaten : null;

  // ── Chart data ──
  const last30 = Array.from({length:30}, (_,i) => {
    const d = new Date(today); d.setDate(d.getDate()-29+i); return localDateStr(d);
  });
  const stepsByDate  = Object.fromEntries(steps.map(s => [s.date, +s.total||0]));
  const workoutDates = new Set(workouts.map(w => w.date));

  el.innerHTML = `

    <!-- ═══ MOTIVATOR ═══ -->
    ${buildMotivator(SESSION.displayName, streak, consistencyPct, totalSessions, weeksTraining,
      yestWorkout, yestSteps, yestCalsBurned, yestCalsEaten, yestCalDeficit,
      wtChange, waistChange, avgSteps7d, stepHitPct, avgSleep, avgStress)}


    <!-- ═══ TODAY'S SUMMARY ═══ -->
    <div class="card mb16" style="border-left:4px solid #4caf50;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px;">
        <div class="card-label" style="margin:0;">TODAY — ${todayStr}</div>
        <button onclick="openDashConfigurator()"
          style="font-family:var(--font-mono);font-size:0.58rem;padding:4px 12px;
          background:var(--bg3);border:1px solid var(--border2);color:var(--text-dim);
          cursor:pointer;letter-spacing:.08em;transition:all .15s;"
          onmouseover="this.style.borderColor='var(--accent2)';this.style.color='var(--accent2)';"
          onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text-dim)';">
          ⚙ CONFIGURE DASHBOARD
        </button>
      </div>
      <div class="card-title" style="margin-bottom:14px;">TODAY'S SNAPSHOT</div>

      <!-- Calorie balance row — always shown -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
        <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🔥 CALORIES BURNED</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--accent2);">${todayCalsBurned ? todayCalsBurned.toLocaleString() : '—'}</div>
          <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">${todayWorkout && todaySteps ? 'workout + steps' : todayWorkout ? 'workout est.' : todaySteps ? 'steps only' : 'log workout or steps'}</div>
        </div>
        <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🍽 CALORIES EATEN</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:#ff9800;">${todayCalsEaten ? todayCalsEaten.toLocaleString() : '—'}</div>
          <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">${todayNutrition ? 'nutrition logged' : 'log nutrition'}</div>
        </div>
        <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">⚖️ NET BALANCE</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:${todayCalDeficit===null?'var(--text-dim)':todayCalDeficit>0?'#4caf50':'#f44336'};">
            ${todayCalDeficit!==null ? (todayCalDeficit>0 ? '−'+todayCalDeficit.toLocaleString() : '+'+Math.abs(todayCalDeficit).toLocaleString()) : '—'}
          </div>
          <div style="font-family:var(--font-mono);font-size:0.48rem;color:${todayCalDeficit===null?'var(--text-dim)':todayCalDeficit>0?'#4caf50':'#f44336'};">
            ${todayCalDeficit!==null ? (todayCalDeficit>0?'✓ calorie deficit':'↑ calorie surplus') : 'log both to calculate'}
          </div>
        </div>
      </div>

      <!-- All today's metrics grid — config-aware via dashboard-config.js -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:8px;margin-bottom:14px;">
        ${buildConfiguredKpiCards({
            todayCalsBurned, todayCalsEaten, todayCalDeficit,
            todayWorkout, todaySteps, todayNutrition,
            bmi, streak, consistencyPct, totalSessions, weeksTraining,
            avgSteps7d, stepHitPct, wtChange, waistChange,
            latestWeight, latestWaist, avgSleep, avgStress, body,
          })}
      </div>

      <!-- Step goal progress bar if steps logged today -->
      ${todaySteps ? `
      <div style="margin-top:4px;">
        <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:4px;">
          <span>Step goal progress</span>
          <span>${Math.min(100,Math.round((+todaySteps.total||0)/(userGoals.stepGoal||10000)*100))}%</span>
        </div>
        <div style="height:4px;background:var(--bg3);border-radius:2px;">
          <div style="height:100%;width:${Math.min(100,Math.round((+todaySteps.total||0)/(userGoals.stepGoal||10000)*100))}%;
            background:${(+todaySteps.total||0)>=(userGoals.stepGoal||10000)?'#4caf50':'var(--accent2)'};border-radius:2px;transition:width 0.4s;"></div>
        </div>
      </div>` : ''}
    </div>

    <!-- ═══ YESTERDAY SUMMARY ═══ -->
    ${hasYestData ? `
    <div class="card mb16" style="border-left:4px solid var(--accent);">
      <div class="card-label">YESTERDAY — ${yestStr}</div>
      <div class="card-title" style="margin-bottom:14px;">PREVIOUS DAY REVIEW</div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
        <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🔥 BURNED</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--accent2);">${yestCalsBurned ? yestCalsBurned.toLocaleString() : '—'}</div>
          <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">${yestWorkout ? 'workout' : 'rest day'}</div>
        </div>
        <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🍽 EATEN</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:#ff9800;">${yestCalsEaten ? yestCalsEaten.toLocaleString() : '—'}</div>
          <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">${yestNutrition ? 'logged' : 'not logged'}</div>
        </div>
        <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">⚖️ BALANCE</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:${yestCalDeficit === null ? 'var(--text-dim)' : yestCalDeficit > 0 ? '#4caf50' : '#f44336'};">
            ${yestCalDeficit !== null ? (yestCalDeficit > 0 ? '−'+yestCalDeficit.toLocaleString() : '+'+Math.abs(yestCalDeficit).toLocaleString()) : '—'}
          </div>
          <div style="font-family:var(--font-mono);font-size:0.48rem;color:${yestCalDeficit === null ? 'var(--text-dim)' : yestCalDeficit > 0 ? '#4caf50' : '#f44336'};">
            ${yestCalDeficit !== null ? (yestCalDeficit > 0 ? '✓ deficit' : 'surplus') : '—'}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;">
        ${yestWorkout ? `<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">WORKOUT</div>
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);line-height:1.3;">${(yestWorkout.day||'Session').split('—')[0].trim()}</div>
          <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);">${yestWorkout.duration||'—'} min</div>
        </div>` : ''}
        ${yestSteps ? `<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">STEPS</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;color:${(+yestSteps.total||0)>=(userGoals.stepGoal||10000)?'#4caf50':'var(--accent2)'};">
            ${(+yestSteps.total||0).toLocaleString()}</div>
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">${(+yestSteps.total||0)>=(userGoals.stepGoal||10000)?'✓ goal hit':'goal: '+(userGoals.stepGoal||10000).toLocaleString()}</div>
        </div>` : ''}
        ${yestBody && yestBody.sleep ? `<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">SLEEP</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;color:${+yestBody.sleep>=7?'#4caf50':+yestBody.sleep>=6?'#ff9800':'#f44336'}">${yestBody.sleep}h</div>
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">stress: ${yestBody.stress||'—'}/10</div>
        </div>` : ''}
        ${yestNutrition ? `<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
          <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">PROTEIN</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;color:${+yestNutrition.protein>=150?'#4caf50':'#ff9800'}">${yestNutrition.protein||'—'}g</div>
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">water: ${yestNutrition.water||'—'} oz</div>
        </div>` : ''}
      </div>
    </div>` : `
    <div class="card mb16" style="border-left:4px solid var(--border2);opacity:0.7;">
      <div class="card-label">YESTERDAY — ${yestStr}</div>
      <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);padding:8px 0;">
        No data logged yesterday. Start logging workouts, steps, and nutrition to see your daily review here.
      </div>
    </div>`}

    <!-- ═══ KPI STRIP — config-aware ═══ -->
    <div class="card mb16">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px;">
        <div class="card-label" style="margin:0;">PROGRESS METRICS</div>
        <button onclick="openDashConfigurator()"
          style="font-family:var(--font-mono);font-size:0.58rem;padding:4px 12px;
          background:var(--bg3);border:1px solid var(--border2);color:var(--text-dim);
          cursor:pointer;letter-spacing:.08em;transition:all .15s;"
          onmouseover="this.style.borderColor='var(--accent2)';this.style.color='var(--accent2)';"
          onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text-dim)';">
          ⚙ CONFIGURE
        </button>
      </div>
      <div class="card-title" style="margin-bottom:12px;">ALL-TIME SNAPSHOT</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:8px;">
        ${buildConfiguredKpiCards({
            todayCalsBurned, todayCalsEaten, todayCalDeficit,
            todayWorkout, todaySteps, todayNutrition,
            bmi, streak, consistencyPct, totalSessions, weeksTraining,
            avgSteps7d, stepHitPct, wtChange, waistChange,
            latestWeight, latestWaist, avgSleep, avgStress, body,
          })}
      </div>
    </div>

    <!-- ═══ CHARTS & LISTS — rendered in user config order ═══ -->
    ${getChartOrder().filter(function(item){ return item.on; }).map(function(item) {
      var chartId = item.id;
      function noData(label, tip) {
        return '<div class="card mb16" style="border-style:dashed;opacity:0.7;">'
          +'<div class="card-label">'+label+'</div>'
          +'<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);padding:12px 0;">'+tip+'</div></div>';
      }
      function chartCard(label, sub, canvasId, height) {
        return '<div class="card mb16"><div class="card-label">'+label+'</div>'
          +(sub?'<div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);margin-bottom:8px;">'+sub+'</div>':'')
          +'<canvas id="'+canvasId+'" height="'+(height||100)+'"></canvas></div>';
      }
      switch(chartId) {
        case 'chart-heatmap':
          return '<div class="card mb16"><div class="card-label">WORKOUT CONSISTENCY</div><div class="card-title">LAST 30 DAYS</div>'
            +'<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:10px;">'
            +last30.map(function(d){ return '<div title="'+d+'" style="height:26px;border-radius:3px;background:'+(workoutDates.has(d)?'var(--accent2)':'var(--bg3)')+';border:1px solid '+(workoutDates.has(d)?'var(--accent)':'var(--border)')+';opacity:'+(workoutDates.has(d)?'1':'0.35')+'"></div>'; }).join('')
            +'</div><div style="display:flex;gap:16px;margin-top:8px;font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);">'
            +'<span style="color:var(--accent2);">&#9632; TRAINED</span><span style="opacity:0.4;">&#9632; REST</span>'
            +'<span style="margin-left:auto;">'+workoutDates.size+' of last 30 days</span></div></div>';

        case 'chart-steps':
          return chartCard('DAILY STEPS — LAST 30 DAYS', '', 'summaryStepsChart', 110);

        case 'chart-weight':
          return body.filter(function(b){return b.weight;}).length >= 1
            ? chartCard('WEIGHT TREND', '', 'summaryWeightChart')
            : noData('WEIGHT TREND', 'Log body weight in Log Data &rarr; Body to see this chart.');

        case 'chart-waist':
          return body.filter(function(b){return b.waist;}).length >= 1
            ? chartCard('WAIST TREND', 'Primary fat loss indicator', 'summaryWaistChart')
            : noData('WAIST TREND', 'Log waist measurement in Log Data &rarr; Body. Tape at narrowest point, usually 1 inch above navel.');

        case 'chart-arm':
          return body.filter(function(b){return b.arm||b.arm_r||b.arm_l;}).length >= 1
            ? chartCard('ARM SIZE — UPPER ARM CIRCUMFERENCE', 'Flexed at fullest point &nbsp;&#183;&nbsp; Bicep + tricep combined &nbsp;&#183;&nbsp; Right &amp; Left shown as separate lines when logged', 'summaryArmChart')
            : noData('ARM SIZE — UPPER ARM CIRCUMFERENCE', 'Log arm measurement in Log Data &rarr; Body.<br>How to measure: flex your bicep, wrap tape around the fullest point of your upper arm. This single number captures both bicep and tricep — it is what tailors call arm size and how shirt sleeves are sized.');

        case 'chart-forearm':
          return body.filter(function(b){return b.forearm||b.forearm_r||b.forearm_l;}).length >= 1
            ? chartCard('FOREARM CIRCUMFERENCE', 'Fist clenched &nbsp;&#183;&nbsp; Right &amp; Left shown as separate lines when logged', 'summaryForearmChart')
            : noData('FOREARM CIRCUMFERENCE', 'Log forearm in Log Data &rarr; Body. Measure at fullest point with fist clenched.');

        case 'chart-chest':
          return body.filter(function(b){return b.chest;}).length >= 1
            ? chartCard('CHEST CIRCUMFERENCE', 'Fullest part of chest, arms at sides', 'summaryChestChart')
            : noData('CHEST CIRCUMFERENCE', 'Log chest in Log Data &rarr; Body. Tape around fullest part of chest, arms relaxed at sides.');

        case 'chart-hips':
          return body.filter(function(b){return b.hips;}).length >= 1
            ? chartCard('HIPS CIRCUMFERENCE', 'Fullest part of hips and seat', 'summaryHipsChart')
            : noData('HIPS CIRCUMFERENCE', 'Log hips in Log Data &rarr; Body. Tape around fullest part of hips with feet together.');

        case 'chart-glutes':
          return body.filter(function(b){return b.glutes;}).length >= 1
            ? chartCard('GLUTES CIRCUMFERENCE', 'Fullest part of the buttocks', 'summaryGlutesChart')
            : noData('GLUTES CIRCUMFERENCE', 'Log glutes in Log Data &rarr; Body.');

        case 'chart-thighs':
          return body.filter(function(b){return b.thighs||b.thigh_r||b.thigh_l;}).length >= 1
            ? chartCard('THIGH CIRCUMFERENCE', 'Fullest point of upper thigh, standing relaxed &nbsp;&#183;&nbsp; Right &amp; Left shown as separate lines when logged', 'summaryThighsChart')
            : noData('THIGH CIRCUMFERENCE', 'Log thigh measurement in Log Data &rarr; Body. Tape around fullest part of upper thigh, standing relaxed. Log Right and Left separately to compare sides.');

        case 'chart-calves':
          return body.filter(function(b){return b.calves||b.calf_r||b.calf_l;}).length >= 1
            ? chartCard('CALF CIRCUMFERENCE', 'Fullest point of calf, standing &nbsp;&#183;&nbsp; Right &amp; Left shown as separate lines when logged', 'summaryCalvesChart')
            : noData('CALF CIRCUMFERENCE', (body.filter(function(b){return b.calves||b.calf_r||b.calf_l;}).length===1 ? '1 entry logged — log one more measurement on a different date to see your trend.' : 'Log calf measurement in Log Data → Body. Tape around fullest part of calf, standing. Log Right and Left separately to compare sides.'));

        case 'chart-neck':
          return body.filter(function(b){return b.neck;}).length >= 1
            ? chartCard('NECK CIRCUMFERENCE', 'Narrowest point, just below Adam\'s apple', 'summaryNeckChart')
            : noData('NECK CIRCUMFERENCE', 'Log neck in Log Data &rarr; Body. Tape around narrowest point of neck.');

        case 'chart-sleep':
          return body.filter(function(b){return b.sleep||b.stress;}).length >= 1
            ? '<div class="card mb16"><div class="card-label">SLEEP &amp; STRESS — LAST 14 DAYS</div>'
              +'<div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);margin-bottom:8px;">Blue = sleep hours (left axis) &nbsp;&#183;&nbsp; Red = stress score (right axis, 1&#8211;10)</div>'
              +'<canvas id="summarySleepChart" height="110"></canvas></div>'
            : noData('SLEEP &amp; STRESS', 'Log sleep and stress in Log Data &rarr; Body.');

        case 'chart-workouts':
          return '<div class="card mb16"><div class="card-label">RECENT ACTIVITY</div><div class="card-title">LAST 7 WORKOUTS</div>'
            + (workouts.slice(0,7).length
              ? workouts.slice(0,7).map(function(w){
                  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);">'
                    +'<div><div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text);">'+(w.day||'Session')+'</div>'
                    +'<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);">'+(w.date||'—')+' &nbsp;·&nbsp; '+(w.location||'—')+' &nbsp;·&nbsp; '+(w.duration||'—')+' min</div></div>'
                    +'<div style="text-align:right;"><div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent2);">Energy '+(w.energy||'—')+'/10</div>'
                    +'<div style="font-family:var(--font-mono);font-size:0.55rem;color:'+(w.decomp&&w.decomp.includes('YES')?'#4caf50':'var(--text-dim)')+';">'+(w.decomp&&w.decomp.includes('YES')?'&#x2713; Decomp done':'—')+'</div></div></div>';
                }).join('')
              : '<div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-dim);padding:16px 0;text-align:center;">No workouts logged yet.</div>')
            +'</div>';

        default: return '';
      }
    }).join('')}`;

  setTimeout(() => {
    renderSummaryCharts(last30, stepsByDate, body, userGoals.stepGoal||10000);
  }, 100);
}

// Estimate calorie burn from workout log entry (MET × weight × time)
function estimateDayCalBurn(workout) {
  const weightKg = getWeightKg();
  if (!weightKg || !workout) return null;
  const dur = parseInt(workout.duration) || 60;
  const day = (workout.day||'').toLowerCase();
  let met = 5.5;
  if (day.includes('hiit') || day.includes('core')) met = 7.0;
  else if (day.includes('push') || day.includes('pull') || day.includes('upper')) met = 5.5;
  else if (day.includes('lower') || day.includes('legs')) met = 6.0;
  else if (day.includes('full')) met = 6.0;
  return Math.round(met * weightKg * (dur / 60));
}

// Estimate calorie burn from steps (MET 3.5 walking)
function estimateStepCalBurn(totalSteps) {
  const weightKg = getWeightKg();
  if (!weightKg || !totalSteps) return null;
  const minutes = +totalSteps / 100; // ~100 steps/min avg walking pace
  return Math.round(3.5 * weightKg * (minutes / 60));
}

// Precise calorie burn: use saved caloriesBurned if available, else estimate
function getDayCalBurn(workout, stepsEntry) {
  let workoutCals = 0;
  if (workout) {
    // markWorkoutComplete saves caloriesBurned calculated from actual reps
    workoutCals = parseInt(workout.caloriesBurned) || estimateDayCalBurn(workout) || 0;
  }
  const stepCals = stepsEntry ? (estimateStepCalBurn(+stepsEntry.total||0) || 0) : 0;
  const total = workoutCals + stepCals;
  return total > 0 ? total : null;
}

// ═══════════════════════════════════════════════════════════
// MOTIVATOR ENGINE — Psychology-driven, data-personalized
// ═══════════════════════════════════════════════════════════
function buildMotivator(name, streak, consistency, totalSessions, weeks,
  yestWorkout, yestSteps, yestCalsBurned, yestCalsEaten, yestCalDeficit,
  wtChange, waistChange, avgSteps, stepHitPct, avgSleep, avgStress) {

  const first = (name||'').split(' ')[0];
  let headline = '', body = '', color = 'var(--accent2)', icon = '💪';

  // ── Identity-based framing (strongest long-term motivator per SDT research) ──
  // Priority order: streak milestone > yesterday's specific win > progress data > encouragement

  if (streak >= 21) {
    icon = '🏆'; color = '#ffd700';
    headline = `${first.toUpperCase()}, YOU ARE BUILT DIFFERENTLY.`;
    body = `${streak} days straight. This isn't motivation anymore — this is identity. Research from University of London shows habits become automatic at 66 days. You're ${Math.round((streak/66)*100)}% of the way to exercise being as automatic as breathing. The person who started this streak made a decision. The person reading this IS a person who shows up.`;
  } else if (streak >= 14) {
    icon = '🔥'; color = '#ff6b35';
    headline = `${streak} DAYS. THIS IS WHERE OTHERS QUIT.`;
    body = `Two weeks of unbroken consistency — the research is clear: people who reach 14-day streaks are 3× more likely to still be training at 6 months. Your brain has started rewiring. The habit loop is forming. What you're doing right now, this morning, is the most important thing you'll do for your health this year.`;
  } else if (streak >= 7) {
    icon = '⚡'; color = '#4caf50';
    headline = `ONE WEEK STRAIGHT. YOUR BRAIN IS CHANGING.`;
    body = `Seven consecutive days triggers measurable neurological adaptation. Dopamine pathways tied to exercise are strengthening. This is exactly the point where most people stumble — which means every single session from here is separating you from the version of yourself who used to make excuses.`;
  } else if (streak >= 3) {
    icon = '📈'; color = '#ff9800';
    headline = `${streak} DAYS BUILDING. DON'T STOP NOW.`;
    body = `The first 3 days are where streaks die. You made it. James Clear's Atomic Habits research shows that 3-day streaks are the first critical checkpoint where identity begins to shift. You're not someone who "is trying to work out" — you're someone who works out. Keep proving it to yourself.`;
  } else if (yestWorkout) {
    icon = '✓'; color = '#4caf50';
    headline = `YOU SHOWED UP YESTERDAY. THAT'S THE JOB.`;
    body = `${yestWorkout.day||'Your session'} is done. ${yestWorkout.energy ? `Energy level ${yestWorkout.energy}/10 — ` : ''}Every session you finish is a vote for the identity of someone who takes care of their body. Psychology Today: "We don't act based on who we are. We become who we are based on how we act." Yesterday you voted. Today, vote again.`;
  } else if (yestCalDeficit !== null && yestCalDeficit > 0 && !headline.includes('DEFICIT')) {
    icon = '🎯'; color = '#4caf50';
    headline = `YESTERDAY: ${yestCalDeficit.toLocaleString()} CALORIE DEFICIT.`;
    body = `You burned ${yestCalsBurned?.toLocaleString()} and ate ${yestCalsEaten?.toLocaleString()}. A deficit means your body burned stored energy. One pound of fat = 3,500 calories. You're chipping away at it every single day. The scale is a lagging indicator — the work you did yesterday is already happening inside.`;
  } else if (waistChange !== null && waistChange < -0.25) {
    icon = '📏'; color = '#4caf50';
    headline = `YOUR WAIST IS DOWN ${Math.abs(waistChange)}" SINCE YOU STARTED.`;
    body = `Waist circumference is the single best proxy for visceral fat — the dangerous fat around your organs. The fact that it's moving means the protocol is working. This isn't cosmetic. This is your health risk profile literally changing. Keep going.`;
  } else if (yestSteps && (+yestSteps.total||0) >= (userGoals.stepGoal||10000)) {
    icon = '👣'; color = '#4caf50';
    headline = `${(+yestSteps.total).toLocaleString()} STEPS YESTERDAY. GOAL HIT.`;
    body = `Daily step goal met. Those walks aren't filler — they're the primary driver of your visceral fat loss between sessions. Cortisol drops on each walk. Blood glucose stabilizes. Recovery accelerates. You're doing the invisible work that makes everything else work better.`;
  } else if (avgStress && +avgStress >= 7) {
    icon = '🧠'; color = '#ff9800';
    headline = `HIGH STRESS DETECTED. THIS IS WHEN IT MATTERS MOST.`;
    body = `Your average stress is ${avgStress}/10 over the last 14 days. High chronic stress elevates cortisol, which stores visceral fat. Here's the power move: the workout you don't feel like doing is the one that lowers cortisol the most. Show up even when it's hard. Especially when it's hard. That's the difference.`;
  } else if (avgSleep && +avgSleep < 6.5) {
    icon = '😴'; color = '#ff9800';
    headline = `SLEEP IS YOUR SECRET WEAPON. USE IT.`;
    body = `You're averaging ${avgSleep}h — below the 7h threshold where muscle repair and fat burning peak. Poor sleep increases ghrelin (hunger hormone) by 28% and drops leptin (fullness hormone) by 18%. Prioritizing sleep tonight is as important as tomorrow's workout. Do both.`;
  } else if (totalSessions === 0) {
    icon = '🚀'; color = 'var(--accent2)';
    headline = `TODAY IS DAY ONE. DAY ONE IS EVERYTHING.`;
    body = `Every elite athlete, every transformation story, every person who changed their life — it started with one session. Not a perfect plan. Not the right time. One session. You have the program. You have the structure. The only thing left is to start. Log your first workout today and that number goes from 0 to 1. That's the hardest step.`;
  } else if (totalSessions > 0) {
    icon = '💪'; color = 'var(--accent2)';
    headline = `${totalSessions} SESSIONS LOGGED. THE WORK IS ADDING UP.`;
    body = `Progress is rarely visible day-to-day but always visible week-to-week. Teresa Amabile's Progress Principle research shows that making forward progress — even small — is the single most powerful motivator that exists. You have ${totalSessions} sessions of proof that you do this. Add another one today.`;
  }

  // ── addendum: specific yesterday data win ──
  let addendum = '';
  if (yestCalDeficit !== null && yestCalDeficit > 0 && !headline.includes('DEFICIT')) {
    addendum = ` Yesterday: ${yestCalDeficit.toLocaleString()} kcal deficit — the work is adding up.`;
  }
  if (waistChange !== null && waistChange < -0.25 && !headline.includes('WAIST')) {
    addendum += ` Waist is down ${Math.abs(waistChange)}" from your starting point.`;
  }

  return `<div style="padding:24px 20px;background:linear-gradient(135deg,${color}18 0%,transparent 100%);
    border:1px solid ${color}44;border-left:5px solid ${color};margin-bottom:20px;position:relative;overflow:hidden;">
    <!-- Background number for texture -->
    <div style="position:absolute;right:-10px;top:-20px;font-size:8rem;opacity:0.04;font-family:var(--font-display);
      color:${color};pointer-events:none;user-select:none;">${icon}</div>

    <div style="display:flex;align-items:flex-start;gap:14px;">
      <div style="font-size:2rem;flex-shrink:0;margin-top:2px;">${icon}</div>
      <div style="flex:1;">
        <div style="font-family:var(--font-display);font-size:clamp(1.1rem,4vw,1.6rem);color:${color};
          letter-spacing:.05em;line-height:1.15;margin-bottom:10px;">${headline}</div>
        <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text);line-height:1.75;opacity:0.9;">
          ${body}${addendum ? `<span style="color:${color};">${addendum}</span>` : ''}
        </div>
        ${streak > 0 ? `<div style="margin-top:12px;display:flex;align-items:center;gap:8px;">
          <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.12em;">CURRENT STREAK</div>
          <div style="display:flex;gap:3px;">${Array.from({length:Math.min(streak,21)},(_,i) =>
            `<div style="width:${streak>14?6:8}px;height:${streak>14?6:8}px;border-radius:50%;background:${i<streak?color:'var(--bg3)'};"></div>`).join('')}
            ${streak > 21 ? `<span style="font-family:var(--font-mono);font-size:0.6rem;color:${color};margin-left:4px;">+${streak-21} more</span>` : ''}
          </div>
        </div>` : ''}
      </div>
    </div>
  </div>`;
}

function kpiCard(label, value, color, sub) {
  return `<div style="background:var(--bg2);border:1px solid var(--border);padding:12px 8px;text-align:center;">
    <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">${label}</div>
    <div style="font-family:var(--font-display);font-size:1.4rem;color:${color};line-height:1;">${value}</div>
    <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);margin-top:2px;">${sub}</div>
  </div>`;
}

function renderSummaryCharts(last30, stepsByDate, body, stepGoal) {
  if (!window._summaryCharts) window._summaryCharts = {};
  var cd = window._chartDefaults || { c1:'#ff7a1a', c2:'#d4af37' };

  var baseOpts = {
    responsive:true,
    plugins:{ legend:{display:false} },
    scales:{ x:{ticks:{font:{size:9},maxTicksLimit:8}}, y:{ticks:{font:{size:9}}} }
  };

  function kill(key) {
    if (window._summaryCharts[key]) { window._summaryCharts[key].destroy(); delete window._summaryCharts[key]; }
  }

  // Single-key line chart
  function line(canvasId, key, color) {
    var el = document.getElementById(canvasId);
    if (!el) return;
    kill(key);
    var data = body.filter(function(b){ return b[key]!==undefined && !isNaN(+b[key]); })
      .sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(-30);
    if (data.length < 1) return;
    window._summaryCharts[key] = new Chart(el, {
      type:'line',
      data:{ labels: data.map(function(b){ return (b.date||'').slice(5); }),
        datasets:[{ data:data.map(function(b){ return +b[key]; }),
          borderColor:color, backgroundColor:color+'22', tension:0.3,
          pointRadius:data.length===1?8:3, pointHoverRadius:10, fill:data.length>1 }]},
      options: Object.assign({}, baseOpts)
    });
  }

  // Bilateral chart: plots combined key + _r + _l as separate lines
  function bilateral(canvasId, chartKey, baseKey, colorMain, colorR, colorL) {
    var el = document.getElementById(canvasId);
    if (!el) return;
    kill(chartKey);
    var combined = body.filter(function(b){ return b[baseKey]!==undefined && !isNaN(+b[baseKey]); })
      .sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(-30);
    var rData = body.filter(function(b){ return b[baseKey+'_r']!==undefined && !isNaN(+b[baseKey+'_r']); })
      .sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(-30);
    var lData = body.filter(function(b){ return b[baseKey+'_l']!==undefined && !isNaN(+b[baseKey+'_l']); })
      .sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(-30);
    var datasets = [];
    var labels = null;
    // Show chart with 1+ entries — single point shows as a dot, 2+ shows trend line
    if (combined.length >= 1) {
      labels = combined.map(function(b){ return (b.date||'').slice(5); });
      datasets.push({ label:'Both', data:combined.map(function(b){ return +b[baseKey]; }),
        borderColor:colorMain, backgroundColor:colorMain+'22', tension:0.3,
        pointRadius:combined.length===1?8:3, pointHoverRadius:10, fill:combined.length>1 });
    }
    if (rData.length >= 1) {
      if (!labels) labels = rData.map(function(b){ return (b.date||'').slice(5); });
      datasets.push({ label:'Right', data:rData.map(function(b){ return +b[baseKey+'_r']; }),
        borderColor:colorR, backgroundColor:'transparent', tension:0.3,
        pointRadius:rData.length===1?8:3, fill:false, borderDash:rData.length>1?[4,2]:[] });
    }
    if (lData.length >= 1) {
      if (!labels) labels = lData.map(function(b){ return (b.date||'').slice(5); });
      datasets.push({ label:'Left', data:lData.map(function(b){ return +b[baseKey+'_l']; }),
        borderColor:colorL, backgroundColor:'transparent', tension:0.3,
        pointRadius:lData.length===1?8:3, fill:false, borderDash:lData.length>1?[2,4]:[] });
    }
    if (!datasets.length || !labels) return;
    window._summaryCharts[chartKey] = new Chart(el, {
      type:'line',
      data:{ labels:labels, datasets:datasets },
      options: Object.assign({}, baseOpts, { plugins:{ legend:{ display:datasets.length>1, labels:{font:{size:9},color:'#aaa'} } } })
    });
  }

  // Steps bar chart
  var stepsEl = document.getElementById('summaryStepsChart');
  if (stepsEl) {
    kill('steps');
    window._summaryCharts.steps = new Chart(stepsEl, {
      type:'bar',
      data:{ labels:last30.map(function(d){ return d.slice(5); }),
        datasets:[
          { data:last30.map(function(d){ return stepsByDate[d]||0; }),
            backgroundColor:last30.map(function(d){ return (stepsByDate[d]||0)>=stepGoal?'#4caf5088':'var(--accent)88'; }),
            borderColor:last30.map(function(d){ return (stepsByDate[d]||0)>=stepGoal?'#4caf50':'var(--accent)'; }),
            borderWidth:1 },
          { type:'line', data:last30.map(function(){ return stepGoal; }),
            borderColor:'rgba(255,255,255,0.2)', borderDash:[4,4], pointRadius:0, fill:false }
        ]},
      options: Object.assign({}, baseOpts)
    });
  }

  // Single measurement charts
  line('summaryWeightChart', 'weight',  cd.c1);
  line('summaryWaistChart',  'waist',   cd.c2);
  line('summaryChestChart',  'chest',   '#9c27b0');
  line('summaryHipsChart',   'hips',    '#e91e63');
  line('summaryGlutesChart', 'glutes',  '#ff5722');
  line('summaryNeckChart',   'neck',    '#607d8b');

  // Bilateral charts — each shows both/right/left as separate lines
  bilateral('summaryArmChart',     'arm',     'arm',     '#4caf50', '#2196f3', '#ff9800');
  bilateral('summaryForearmChart', 'forearm', 'forearm', '#00bcd4', '#0097a7', '#006064');
  bilateral('summaryThighsChart',  'thighs',  'thighs',  '#8bc34a', '#558b2f', '#aed581');
  bilateral('summaryCalvesChart',  'calves',  'calves',  '#795548', '#4e342e', '#a1887f');

  // Sleep/Stress dual-axis
  var sleepEl = document.getElementById('summarySleepChart');
  var sleepData = body.filter(function(b){ return b.sleep||b.stress; })
    .sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(-14);
  if (sleepEl && sleepData.length >= 1) {
    kill('sleep');
    window._summaryCharts.sleep = new Chart(sleepEl, {
      type:'line',
      data:{ labels:sleepData.map(function(b){ return (b.date||'').slice(5); }),
        datasets:[
          { label:'Sleep (hrs)', data:sleepData.map(function(b){ return +b.sleep||0; }),
            borderColor:'#64b5f6', backgroundColor:'#64b5f622', tension:0.3, pointRadius:3, yAxisID:'y' },
          { label:'Stress (/10)', data:sleepData.map(function(b){ return +b.stress||0; }),
            borderColor:'#f44336', backgroundColor:'#f4433622', tension:0.3, pointRadius:3, yAxisID:'y2' }
        ]},
      options:{ responsive:true,
        plugins:{ legend:{display:true, labels:{font:{size:9},color:'#aaa'}} },
        scales:{
          x:{ticks:{font:{size:9},maxTicksLimit:8}},
          y:{ticks:{font:{size:9}}, position:'left', title:{display:true,text:'Sleep hrs',font:{size:8}}},
          y2:{ticks:{font:{size:9}}, position:'right', min:0, max:10,
            title:{display:true,text:'Stress',font:{size:8}}, grid:{drawOnChartArea:false}}
        }}
    });
  }
}

// ── Date helpers for log tabs ──
function setLogDate(fieldId, which) {
  const d = new Date();
  if (which === 'yesterday') d.setDate(d.getDate() - 1);
  const val = localDateStr(d);
  const el = document.getElementById(fieldId);
  if (el) { el.value = val; el.dispatchEvent(new Event('change')); }
}

async function reloadLogForDate(type) {
  if (type === 'steps')     await autoPopulateStepsLog();
  if (type === 'body')      await autoPopulateBodyLog();
  if (type === 'nutrition') await autoPopulateNutritionLog();
  if (type === 'workout')   await autoPopulateWorkoutLog();
}

// ── Steps live calorie calculation ──
function updateStepsTotal() {
  const sections = ['s-morn','s-lunch','s-pre','s-post','s-eve'];
  const sum = sections.reduce((a,id) => a + (+v(id)||0), 0);
  if (sum > 0) {
    const totalEl = document.getElementById('s-total');
    if (totalEl && !totalEl.dataset.manualOverride) totalEl.value = sum;
  }
}

function updateStepsCalBurn() {
  const total = parseInt(v('s-total')) || 0;
  const weightKg = getWeightKg();
  const bar = document.getElementById('steps-cal-bar');
  if (!bar) return;
  if (!total || !weightKg) { bar.style.display = 'none'; return; }
  // MET for walking = 3.5, avg step = ~0.762m, avg pace ~100 steps/min
  const minutes = total / 100; // ~100 steps per minute
  const cals = Math.round(3.5 * weightKg * (minutes / 60));
  bar.style.display = 'block';
  bar.innerHTML = `🔥 Estimated burn from ${total.toLocaleString()} steps: <strong style="color:var(--accent2);">${cals.toLocaleString()} kcal</strong>
    <span style="color:var(--text-dim);font-size:0.58rem;"> · based on your weight (${SESSION.weight} lbs) at avg walking pace</span>`;
}

// ── Workout date selection ──
function getWorkoutDate() {
  const el = document.getElementById('workout-date');
  return el?.value || localDateStr();
}

function setWorkoutDate(which) {
  const el = document.getElementById('workout-date');
  if (!el) return;
  const d = new Date();
  if (which === 'yesterday') d.setDate(d.getDate() - 1);
  el.value = localDateStr(d);
  // Re-render current day with new date
  onWorkoutDateChange();
}

function onWorkoutDateChange() {
  // Figure out what day of the week the selected date is and switch to it
  const dateStr = getWorkoutDate();
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid DST edge
  const map = {1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat',0:'sun'};
  const dayId = map[d.getDay()];
  showWorkoutDay(dayId === 'sun' ? 'mon' : dayId);
}

function todayDayId() {
  const map = {1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat',0:'sun'};
  return map[new Date().getDay()];
}

function startTodaysWorkout() {
  nav('workout'); // nav() will auto-select today via the setTimeout below
}

async function autoPopulateWorkoutLog() {
  const today   = localDateStr();
  const dateEl  = document.getElementById('l-date');

  // l-date is already synced from workout-date by logTab — just default to today if empty
  if (dateEl && !dateEl.value) {
    dateEl.value = document.getElementById('workout-date')?.value || today;
  }
  const targetDate = dateEl?.value || today;

  // ── Auto-select the day-of-week dropdown from the date ──
  const dayMap = {1:'MONDAY',2:'TUESDAY',3:'WEDNESDAY',4:'THURSDAY',5:'FRIDAY',6:'SATURDAY',0:'SUNDAY'};
  const dateObj = new Date(targetDate + 'T12:00:00');
  const dayName = dayMap[dateObj.getDay()];
  const sel = document.getElementById('l-day');
  if (sel && dayName) {
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text.toUpperCase().startsWith(dayName)) {
        sel.selectedIndex = i; break;
      }
    }
  }

  // ── Clear fields ──
  ['l-dur','l-energy','l-exs','l-notes'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });

  try {
    // 1. Check for a saved workout log entry for this date first
    const workouts = await encryptedLoad('workout');
    const existing = workouts.find(w => w.date === targetDate);
    if (existing) {
      if (document.getElementById('l-dur'))    document.getElementById('l-dur').value    = existing.duration  || '';
      if (document.getElementById('l-energy')) document.getElementById('l-energy').value = existing.energy    || '';
      if (document.getElementById('l-exs'))    document.getElementById('l-exs').value    = existing.exercises || '';
      if (document.getElementById('l-notes'))  document.getElementById('l-notes').value  = existing.notes     || '';
      if (sel && existing.day) {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text.toUpperCase().includes(existing.day.split('—')[0].trim().toUpperCase())) {
            sel.selectedIndex = i; break;
          }
        }
      }
      return; // saved entry loaded — done
    }

    // 2. No saved entry — build from wkchecks actuals
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('wkchecks').doc(targetDate).get();

    if (!doc.exists) return; // nothing logged for this date

    const data    = doc.data();
    const dayId   = data.dayId;
    const checks  = data.checks  || {};
    const actuals = data.actuals || {};
    const W = getActiveWorkouts();
    const w = W[dayId];
    if (!w || !dayId) return;
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.toUpperCase().includes(dayId.toUpperCase())) {
          sel.selectedIndex = i; break;
        }
      }
    }

    // Build exercise summary from actuals
    const allItems = [...(w.prevDayStretch||[]), ...(w.preStretch||[]), ...(w.warmup||[]), ...(w.exercises||[]), ...(w.cooldown||[])];
    const bodyLbs  = SESSION.weight || 0;
    let totalCals  = 0;

    const lines = allItems.map(item => {
      const actual  = actuals[item.id] || {};
      const sets    = (actual.sets || []).filter(s => s?.reps);
      const bwPct   = BODYWEIGHT_PCT[item.name?.toUpperCase()];
      const effBwLbs = bwPct ? Math.round(bodyLbs * bwPct) : 0;
      const cals    = Math.round(calcActualCalories(item, actual) || 0);
      totalCals    += cals;

      const bwNote = (sets.length === 0 || !sets.some(s => s.weight)) && effBwLbs
        ? ` [BW ${Math.round((bwPct || 0) * 100)}%≈${effBwLbs}lbs]` : '';

      let detail = '';
      if (sets.length) {
        detail = ' — ' + sets.map((s, i) =>
          `Set ${i+1}: ${s.reps} reps${s.weight ? ' @ '+s.weight+'lbs' : ''}`
        ).join(' | ');
      }

      const calNote = cals > 0 ? ` (~${cals} kcal)` : '';
      const checked = checks[item.id] ? '✓' : '○';
      return `${checked} ${item.name}${bwNote}${detail}${calNote}`;
    });

    const doneCount = Object.values(checks).filter(Boolean).length;
    const sections = [
      '── WARM-UP ──',
      ...lines.slice(0, w.warmup.length),
      '── CORE WORKOUT ──',
      ...lines.slice(w.warmup.length, w.warmup.length + w.exercises.length),
      '── COOL-DOWN ──',
      ...lines.slice(w.warmup.length + w.exercises.length),
      '',
      `TOTAL CALORIES BURNED: ~${totalCals} kcal`,
      bodyLbs ? `Body weight: ${bodyLbs} lbs` : ''
    ].filter(Boolean);

    const exsEl = document.getElementById('l-exs');
    if (exsEl) exsEl.value = sections.join('\n');

    const durEl = document.getElementById('l-dur');
    if (durEl) durEl.value = String(Math.round(doneCount * 2.5 + 10));

    const notesEl = document.getElementById('l-notes');
    if (notesEl) notesEl.value =
      `${doneCount}/${allItems.length} items completed via checklist. ~${totalCals} kcal burned.`;

  } catch(e) { console.warn('autoPopulateWorkoutLog:', e.message); }
}

async function autoPopulateBodyLog() {
  const today = localDateStr();
  const dateEl = document.getElementById('b-date');
  if (dateEl && !dateEl.value) dateEl.value = today;
  const targetDate = dateEl?.value || today;

  const body = await encryptedLoad('body');
  const fields = ['weight','waist','chest','hips','neck','glutes','thighs'];
  const noteEl = document.getElementById('body-prefill-note');

  // Clear all measurement fields
  fields.forEach(f => {
    const el = document.getElementById('b-'+f);
    if (el) { el.value = ''; el.style.color = 'var(--text)'; }
    const prevEl = document.getElementById('b-'+f+'-prev');
    if (prevEl) prevEl.textContent = '';
  });
  ['b-sleep','b-stress'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  if (!body.length) {
    if (noteEl) noteEl.textContent = 'No previous entries found';
    return;
  }

  const exactEntry = body.find(e => e.date === targetDate);

  if (exactEntry) {
    // Exact date found — fill all fields directly
    if (noteEl) noteEl.textContent = `✓ Entry for ${targetDate} loaded`;
    fields.forEach(f => {
      const el = document.getElementById('b-'+f);
      if (el && exactEntry[f]) el.value = exactEntry[f];
    });
    if (document.getElementById('b-sleep')  && exactEntry.sleep)  document.getElementById('b-sleep').value  = exactEntry.sleep;
    if (document.getElementById('b-stress') && exactEntry.stress) document.getElementById('b-stress').value = exactEntry.stress;
  } else {
    // No entry for this date — pre-fill from most recent previous entry as starting point
    const prev = body.find(e => e.date < targetDate) || body[0];
    if (!prev) { if (noteEl) noteEl.textContent = 'No previous entries to pre-fill from'; return; }
    if (noteEl) noteEl.textContent = `Pre-filled from ${prev.date} — update any values that changed`;
    fields.forEach(f => {
      const el = document.getElementById('b-'+f);
      const prevEl = document.getElementById('b-'+f+'-prev');
      if (el && prev[f]) {
        el.value = prev[f];
        el.style.color = 'var(--text-dim)';
        if (prevEl) prevEl.textContent = `Last: ${prev[f]}`;
        el.oninput = () => { el.style.color = 'var(--text)'; if (prevEl) prevEl.textContent = ''; };
      }
    });
  }
}


// ═══════════════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════════════
let charts = {};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function chartDefaults() {
  const styles = getComputedStyle(document.documentElement);
  return {
    bg: styles.getPropertyValue('--bg2').trim(),
    border: styles.getPropertyValue('--border').trim(),
    text: styles.getPropertyValue('--text-dim').trim(),
    accent: styles.getPropertyValue('--accent2').trim(),
    c1: styles.getPropertyValue('--chart-1').trim(),
    c2: styles.getPropertyValue('--chart-2').trim(),
  };
}

async function renderCharts() {
  const body = await encryptedLoad('body');
  const steps = await encryptedLoad('steps');
  const workouts = await encryptedLoad('workout');
  const cd = chartDefaults();

  const gridColor = 'rgba(255,255,255,0.05)';
  const baseOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{legend:{display:false}},
    scales:{
      x:{grid:{color:gridColor},ticks:{color:cd.text,font:{size:10}}},
      y:{grid:{color:gridColor},ticks:{color:cd.text,font:{size:10}}}
    }
  };

  // Weight chart
  const weightData = body.filter(b=>b.weight).slice(0,20).reverse();
  destroyChart('weight');
  if(document.getElementById('chartWeight')) {
    charts['weight'] = new Chart(document.getElementById('chartWeight'), {
      type:'line',
      data:{
        labels: weightData.map(b=>b.date||''),
        datasets:[{data:weightData.map(b=>+b.weight),borderColor:cd.c1,backgroundColor:cd.c1+'22',tension:0.3,pointRadius:4,fill:true}]
      },
      options:{...baseOpts}
    });
  }

  // Waist chart
  const waistData = body.filter(b=>b.waist).slice(0,20).reverse();
  destroyChart('waist');
  if(document.getElementById('chartWaist')) {
    charts['waist'] = new Chart(document.getElementById('chartWaist'), {
      type:'line',
      data:{
        labels:waistData.map(b=>b.date||''),
        datasets:[{data:waistData.map(b=>+b.waist),borderColor:cd.c2,backgroundColor:cd.c2+'22',tension:0.3,pointRadius:4,fill:true}]
      },
      options:{...baseOpts}
    });
  }

  // Weekly steps bar chart
  const stepsByWeek = {};
  steps.forEach(s=>{
    if(!s.date) return;
    const d=new Date(s.date);
    const wk=`W${getWeekNum(d)}`;
    stepsByWeek[wk]=(stepsByWeek[wk]||0)+(+s.total||0);
  });
  const stepWks=Object.keys(stepsByWeek).slice(-8);
  destroyChart('steps');
  if(document.getElementById('chartSteps')) {
    charts['steps'] = new Chart(document.getElementById('chartSteps'), {
      type:'bar',
      data:{
        labels:stepWks,
        datasets:[{data:stepWks.map(w=>stepsByWeek[w]),backgroundColor:cd.c1+'88',borderColor:cd.c1,borderWidth:1}]
      },
      options:{...baseOpts}
    });
  }

  // Sleep & stress
  const sleepData = body.filter(b=>b.sleep||b.stress).slice(0,14).reverse();
  destroyChart('sleep');
  if(document.getElementById('chartSleep')) {
    charts['sleep'] = new Chart(document.getElementById('chartSleep'), {
      type:'line',
      data:{
        labels:sleepData.map(b=>b.date||''),
        datasets:[
          {label:'Sleep',data:sleepData.map(b=>+b.sleep||null),borderColor:cd.c1,tension:0.3,pointRadius:3,yAxisID:'y'},
          {label:'Stress',data:sleepData.map(b=>+b.stress||null),borderColor:'#cc5566',tension:0.3,pointRadius:3,yAxisID:'y2'}
        ]
      },
      options:{...baseOpts,plugins:{legend:{display:true,labels:{color:cd.text,font:{size:10}}}},
        scales:{...baseOpts.scales,y2:{position:'right',grid:{display:false},ticks:{color:'#cc5566',font:{size:10}}}}}
    });
  }

  // Streak calendar
  buildStreakCalendar(workouts);
  // Strength
  renderStrengthChart(workouts);
  // Snapshot
  buildProgressSnapshot(body,steps,workouts);
}

function getWeekNum(d) {
  const jan1=new Date(d.getFullYear(),0,1);
  return Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
}

async function renderStrengthChart() {
  const workouts = await encryptedLoad('workout');
  const ex = document.getElementById('strengthExSelect').value;
  const cd = chartDefaults();
  const gridColor = 'rgba(255,255,255,0.05)';

  // Parse exercises from notes - look for exercise name + weight pattern
  const points = [];
  workouts.forEach(w => {
    if (!w.exercises || !w.date) return;
    const lines = w.exercises.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes(ex.toLowerCase())) {
        const weightMatch = line.match(/(\d+\.?\d*)\s*(lbs?|kg)?/i);
        if (weightMatch) {
          points.push({ date: w.date, weight: +weightMatch[1] });
        }
      }
    });
  });
  points.sort((a,b) => new Date(a.date)-new Date(b.date));

  destroyChart('strength');
  if(document.getElementById('chartStrength')) {
    charts['strength'] = new Chart(document.getElementById('chartStrength'), {
      type:'line',
      data:{
        labels:points.map(p=>p.date),
        datasets:[{data:points.map(p=>p.weight),borderColor:cd.c1,backgroundColor:cd.c1+'22',tension:0.3,pointRadius:5,fill:true,label:'Weight (lbs)'}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:true,labels:{color:cd.text,font:{size:10}}}},
        scales:{x:{grid:{color:gridColor},ticks:{color:cd.text,font:{size:10}}},y:{grid:{color:gridColor},ticks:{color:cd.text,font:{size:10}}}}}
    });
  }
}

function buildStreakCalendar(workouts) {
  const workedDays = new Set(workouts.map(w=>w.date));
  const today = new Date(); today.setHours(0,0,0,0);
  const days = ['S','M','T','W','T','F','S'];
  document.getElementById('streakLabels').innerHTML = days.map(d=>`<div class="streak-day-lbl">${d}</div>`).join('');
  const cells = [];
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 69); // 10 weeks back
  startDay.setDate(startDay.getDate() - startDay.getDay()); // align to Sunday
  for (let i=0;i<70;i++) {
    const d = new Date(startDay); d.setDate(startDay.getDate()+i);
    const dateStr = localDateStr(d);
    const isToday = d.getTime()===today.getTime();
    const done = workedDays.has(dateStr);
    cells.push(`<div class="streak-cell ${done?'done':''} ${isToday?'today-cell':''}" title="${dateStr}"></div>`);
  }
  document.getElementById('streakGrid').innerHTML = cells.join('');
}

async function buildProgressSnapshot(body, steps, workouts) {
  if (!body.length && !steps.length && !workouts.length) {
    document.getElementById('progressSnapshot').innerHTML = '<div class="mono dim" style="padding:10px;">Log some data to see your progress snapshot here.</div>';
    return;
  }
  const latestBody = body.find(b=>b.weight);
  const firstBody = body.filter(b=>b.weight).slice(-1)[0];
  const latestWaist = body.find(b=>b.waist);
  const firstWaist = body.filter(b=>b.waist).slice(-1)[0];
  const avgSleep = body.length ? (body.slice(0,14).reduce((a,b)=>a+(+b.sleep||0),0)/Math.min(body.length,14)).toFixed(1) : '—';

  const rows = [
    {label:'CURRENT WEIGHT', val: latestBody ? `${latestBody.weight} lbs` : '—', change: latestBody && firstBody && latestBody!==firstBody ? `${(+latestBody.weight - +firstBody.weight).toFixed(1)} lbs since start` : ''},
    {label:'WAIST MEASUREMENT', val: latestWaist ? `${latestWaist.waist}"` : '—', change: latestWaist && firstWaist && latestWaist!==firstWaist ? `${(+latestWaist.waist - +firstWaist.waist).toFixed(2)}" since start` : ''},
    {label:'AVG SLEEP (14 days)', val: `${avgSleep} hrs`, change: +avgSleep >= 7 ? '✓ OPTIMAL' : +avgSleep < 6 ? '⚠ PRIORITY: IMPROVE SLEEP' : 'FAIR — TARGET 7+'},
    {label:'TOTAL WORKOUTS', val: workouts.length, change: `${Math.round(workouts.length/Math.max(1,+(document.getElementById('st-weeks').textContent)))} avg/week`},
  ];

  document.getElementById('progressSnapshot').innerHTML = `<table class="tbl">
    <tr><th>METRIC</th><th>CURRENT</th><th>NOTE</th></tr>
    ${rows.map(r=>`<tr><td style="color:var(--accent2)">${r.label}</td><td>${r.val}</td><td style="color:var(--border2)">${r.change}</td></tr>`).join('')}
  </table>`;
}

// Load decompression page
async function loadDecompPage() {
  // Placeholder for decompression tools page
  // Will populate breathing guides, body scan, and recovery tools
  console.log('Decompression page loaded');
}

// Load profile page
async function loadProfilePage() {
  if (!SESSION) return;
  try {
    const user = await getUser(SESSION.username);
    if (user) {
      const profileName = document.getElementById('profile-name');
      const profileEmail = document.getElementById('profile-email');
      const profileHeight = document.getElementById('profile-height');
      const profileWeight = document.getElementById('profile-weight');
      const profileAge = document.getElementById('profile-age');
      const profileGender = document.getElementById('profile-gender');
      const profileUsername = document.getElementById('profile-username');
      const profileCreated = document.getElementById('profile-created');
      
      if (profileName) profileName.value = user.displayName || '';
      if (profileEmail) profileEmail.value = user.email || '';
      if (profileHeight) profileHeight.value = user.heightFt ? (user.heightFt * 12) + (user.heightIn || 0) : '';
      if (profileWeight) profileWeight.value = user.weight || '';
      if (profileAge) profileAge.value = user.age || '';
      if (profileGender) profileGender.value = user.gender || 'male';
      if (profileUsername) profileUsername.textContent = user.username || SESSION.username;
      if (profileCreated) profileCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      
      // Update BMI preview
      const ft = user.heightFt || 0;
      const ins = user.heightIn || 0;
      const lbs = user.weight || 0;
      if (ft && lbs) {
        const totalInches = (ft * 12) + ins;
        const bmi = (lbs / (totalInches * totalInches)) * 703;
        let cat = '', color = '';
        if (bmi < 18.5) { cat = 'UNDERWEIGHT'; color = '#64b5f6'; }
        else if (bmi < 25) { cat = 'NORMAL WEIGHT'; color = '#4caf50'; }
        else if (bmi < 30) { cat = 'OVERWEIGHT'; color = '#ff9800'; }
        else if (bmi < 35) { cat = 'OBESE CLASS I'; color = '#f44336'; }
        else if (bmi < 40) { cat = 'OBESE CLASS II'; color = '#e53935'; }
        else { cat = 'OBESE CLASS III'; color = '#d32f2f'; }
        const bmiEl = document.getElementById('profile-bmi');
        const catEl = document.getElementById('profile-bmi-category');
        if (bmiEl) bmiEl.textContent = bmi.toFixed(1);
        if (catEl) catEl.textContent = cat;
        if (bmiEl && bmiEl.parentElement) bmiEl.parentElement.style.borderLeftColor = color;
      }
    }
  } catch(e) {
    console.error('Error loading profile page:', e);
  }
}

function saveProfileChanges() {
  const msg = document.getElementById('profileErr');
  if (!msg) return;
  
  const currentPass = document.getElementById('profile-current-pass')?.value;
  const newPass = document.getElementById('profile-new-pass')?.value;
  const confirmPass = document.getElementById('profile-confirm-pass')?.value;
  
  if (newPass && newPass !== confirmPass) {
    msg.textContent = 'New passwords do not match';
    msg.style.color = 'var(--danger)';
    return;
  }
  
  msg.textContent = 'Profile updated successfully';
  msg.style.color = 'var(--success)';
  setTimeout(() => { msg.textContent = ''; }, 2500);
}

// Profile subtab switching
function profileSubTab(tab) {
    ['info', 'goals', 'equipment'].forEach(t => {
        const content = document.getElementById('pprofile-'+t);
        const btn = document.getElementById('ptab-'+t);
        if (content) content.style.display = t === tab ? 'block' : 'none';
        if (btn) btn.className = t === tab ? 'btn btn-p' : 'btn btn-s';
    });

    if (tab === 'info') {
        loadProfilePageInfo();
    } else if (tab === 'goals') {
        loadGoalsContent();
        setTimeout(refreshAllGoalUI, 100);   // ← Add this line
        setTimeout(refreshAllGoalUI, 300);   // Extra safety
    } else if (tab === 'equipment') {
        loadEquipmentContent();
    }
}

// Load profile info (fetch from database)
async function loadProfilePageInfo() {
  if (!SESSION) return;
  try {
    const user = await getUser(SESSION.username);
    if (user) {
      const profileName = document.getElementById('profile-name');
      const profileEmail = document.getElementById('profile-email');
      const profileHeight = document.getElementById('profile-height');
      const profileWeight = document.getElementById('profile-weight');
      const profileAge = document.getElementById('profile-age');
      const profileGender = document.getElementById('profile-gender');
      const profileUsername = document.getElementById('profile-username');
      const profileCreated = document.getElementById('profile-created');
      
      if (profileName) profileName.value = user.displayName || '';
      if (profileEmail) profileEmail.value = user.email || '';
      if (profileHeight) profileHeight.value = user.heightFt ? (user.heightFt * 12) + (user.heightIn || 0) : '';
      if (profileWeight) profileWeight.value = user.weight || '';
      if (profileAge) profileAge.value = user.age || '';
      if (profileGender) profileGender.value = user.gender || 'male';
      if (profileUsername) profileUsername.textContent = user.username || SESSION.username;
      if (profileCreated) profileCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      
      // Update BMI preview
      const ft = user.heightFt || 0;
      const ins = user.heightIn || 0;
      const lbs = user.weight || 0;
      if (ft && lbs) {
        const totalInches = (ft * 12) + ins;
        const bmi = (lbs / (totalInches * totalInches)) * 703;
        let cat = '', color = '';
        if (bmi < 18.5) { cat = 'UNDERWEIGHT'; color = '#64b5f6'; }
        else if (bmi < 25) { cat = 'NORMAL WEIGHT'; color = '#4caf50'; }
        else if (bmi < 30) { cat = 'OVERWEIGHT'; color = '#ff9800'; }
        else if (bmi < 35) { cat = 'OBESE CLASS I'; color = '#f44336'; }
        else if (bmi < 40) { cat = 'OBESE CLASS II'; color = '#e53935'; }
        else { cat = 'OBESE CLASS III'; color = '#d32f2f'; }
        const bmiEl = document.getElementById('profile-bmi');
        const catEl = document.getElementById('profile-bmi-category');
        if (bmiEl) bmiEl.textContent = bmi.toFixed(1);
        if (catEl) catEl.textContent = cat;
        if (bmiEl && bmiEl.parentElement) bmiEl.parentElement.style.borderLeftColor = color;
      }
    }
  } catch(e) {
    console.error('Error loading profile info:', e);
  }
}

// Load goals content into profile tab
async function loadGoalsContent() {
  const content = document.getElementById('goalsContent');
  if (!content) return;
  
  // Load goals data from database first
  await loadGoals();
  
  // Copy the entire sec-goals HTML into the profile tab
  const goalsSection = document.getElementById('sec-goals');
  if (goalsSection) {
    content.innerHTML = goalsSection.innerHTML;
    
    // Now run ALL the rendering functions that loadGoalsPage() runs
    // This ensures all the database-driven content is populated
    setTimeout(() => {
      // Update step goal UI
      [8000,10000,12000,16000,20000].forEach(n => {
        const el = document.getElementById('gstep-'+n);
        if (el) el.classList.toggle('active', userGoals.stepGoal === n);
      });
      const ci = document.getElementById('goalStepCustom');
      if (ci) ci.value = userGoals.stepGoal;
      renderStepGoalBreakdown(userGoals.stepGoal);
      
      // Update frequency UI
      [2,3,4,5,6,7].forEach(n => { 
        const el=document.getElementById('gfreq-'+n); 
        if(el) el.classList.toggle('active', currentFreqGoal===n); 
      });
      renderFreqResult(currentFreqGoal);
      
      // Show/hide day picker
      const picker = document.getElementById('dayPickerCard');
      if (picker) picker.style.display = currentFreqGoal < 7 ? 'block' : 'none';
      
      // Update day UI
      ['mon','tue','wed','thu','fri','sat','sun'].forEach(d => { 
        const el=document.getElementById('gday-'+d); 
        if(el) el.classList.toggle('active', selectedDays.has(d)); 
      });
      renderDayPickerResult();
      
      // Update duration UI
      [30,45,60,75,90,120].forEach(n => { 
        const el=document.getElementById('gdur-'+n); 
        if(el) el.classList.toggle('active', currentDurationGoal===n); 
      });
      renderDurationResult(currentDurationGoal);
      
      // Render all the major sections
      renderRecommendedSplit();
      renderTrainingFocus();
      renderSpecialFlags();
      renderMuscleGoals();
      renderSetsGoalCards();
      renderGoalCoachCard();
      renderStepRecommendation();
      renderRepRecommendation();
      renderProgramSummaryCard();
    }, 100);
  }
}

// Load equipment content into profile tab
async function loadEquipmentContent() {
  const content = document.getElementById('equipmentContent');
  if (!content) return;
  
  if (!SESSION) return;
  
  // Build the full equipment UI with all categories
  content.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--border2);letter-spacing:.15em;margin:12px 0 12px;padding:8px;background:var(--bg3);">
      MY EQUIPMENT <span style="color:var(--text-dim);font-size:0.6rem;display:block;margin-top:4px;">(used to personalize workout suggestions)</span>
    </div>

    <!-- FREE WEIGHTS -->
    <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);letter-spacing:.12em;margin:16px 0 8px;padding:8px;background:var(--bg3);">▸ FREE WEIGHTS</div>

    <!-- Dumbbells -->
    <div style="margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <label style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text);letter-spacing:.08em;">DUMBBELLS</label>
        <button type="button" onclick="addDumbbellRow()" style="font-family:var(--font-mono);font-size:0.6rem;background:var(--bg3);border:1px solid var(--border2);color:var(--accent2);padding:4px 12px;cursor:pointer;letter-spacing:.1em;">+ ADD PAIR</button>
      </div>
      <div id="dumbbell-rows" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>

    <!-- Kettlebells -->
    <div style="margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <label style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text);letter-spacing:.08em;">KETTLEBELLS</label>
        <button type="button" onclick="addKettlebellRow()" style="font-family:var(--font-mono);font-size:0.6rem;background:var(--bg3);border:1px solid var(--border2);color:var(--accent2);padding:4px 12px;cursor:pointer;letter-spacing:.1em;">+ ADD</button>
      </div>
      <div id="kettlebell-rows" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>

    <!-- Barbell types -->
    <div style="margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);">
      <label style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text);letter-spacing:.08em;display:block;margin-bottom:8px;">BARBELLS / BARS</label>
      <div id="barbell-checks" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
    </div>

    <!-- Weight plates -->
    <div style="margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <input type="checkbox" id="eq-plates" style="accent-color:var(--accent);">
        <label for="eq-plates" style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text);letter-spacing:.08em;cursor:pointer;">WEIGHT PLATES (for barbell)</label>
      </div>
      <div id="eq-plates-range" style="display:none;margin-top:8px;padding:8px;background:var(--bg3);border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);margin-bottom:8px;">AVAILABLE PLATE SIZES (lbs):</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;" id="plate-checks"></div>
      </div>
    </div>

    <!-- BENCHES & RACKS -->
    <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);letter-spacing:.12em;margin:16px 0 8px;padding:8px;background:var(--bg3);">▸ BENCHES &amp; RACKS</div>
    <div id="bench-rack-checks" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);"></div>

    <!-- MACHINES -->
    <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);letter-spacing:.12em;margin:16px 0 8px;padding:8px;background:var(--bg3);">▸ MACHINES</div>
    <div id="machine-checks" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);"></div>

    <!-- CARDIO -->
    <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);letter-spacing:.12em;margin:16px 0 8px;padding:8px;background:var(--bg3);">▸ CARDIO</div>
    <div id="cardio-checks" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);"></div>

    <!-- ACCESSORIES -->
    <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);letter-spacing:.12em;margin:16px 0 8px;padding:8px;background:var(--bg3);">▸ ACCESSORIES</div>
    <div id="accessory-checks" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;padding:8px;background:var(--bg);border:1px solid var(--border);"></div>

    <button class="btn btn-p" onclick="saveEquipment()" style="width:100%;margin-top:16px;">SAVE EQUIPMENT</button>
    <div class="auth-error" id="equipmentErr" style="margin-top:12px;padding:8px;"></div>
  `;
  
  // Now render the equipment UI using existing function
  buildEquipmentUI(SESSION.equipment || {});
}

// ═══════════════════════════════════════════════════════════
// BREATHING TIMER
// ═══════════════════════════════════════════════════════════
let breathInt = null;
function startBreath(mode) {
  if (breathInt) clearInterval(breathInt);
  document.getElementById('breathUI').style.display = 'block';
  const circle = document.getElementById('breathCircle');
  const timer = document.getElementById('breathTimer');
  const instr = document.getElementById('breathInstr');
  const patterns = {
    sigh:[{lbl:'DOUBLE\nINHALE',cls:'inhale',sec:2},{lbl:'EXHALE',cls:'exhale',sec:4}],
    '478':[{lbl:'INHALE',cls:'inhale',sec:4},{lbl:'HOLD',cls:'hold',sec:7},{lbl:'EXHALE',cls:'exhale',sec:8}],
    scan:[{lbl:'BREATHE',cls:'inhale',sec:5},{lbl:'SCAN',cls:'exhale',sec:5}]
  };
  const instrs = {
    sigh:['Double inhale through nose','Long slow exhale through mouth'],
    '478':['Inhale through nose','Hold steadily','Exhale fully through mouth'],
    scan:['Breathe slowly and deeply','Scan from head to toe, releasing tension']
  };
  const maxSec = {sigh:120,'478':300,scan:180};
  const patt = patterns[mode]; let pStep=0,pCount=0,total=0;
  const run=()=>{
    total++;
    if(total>maxSec[mode]){clearInterval(breathInt);circle.textContent='DONE ✓';circle.className='breath-circle';timer.textContent='';return;}
    pCount++;
    const cur=patt[pStep];
    if(pCount===1){circle.textContent=cur.lbl;circle.className='breath-circle '+cur.cls;instr.textContent=instrs[mode][pStep];}
    timer.textContent=pCount;
    if(pCount>=cur.sec){pCount=0;pStep=(pStep+1)%patt.length;}
  };
  run(); breathInt=setInterval(run,1000);
}

// Make functions global
window.loadDashboard = loadDashboard;
window.setTodayCard = setTodayCard;
window.buildWeekGrid = buildWeekGrid;