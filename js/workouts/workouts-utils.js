// =============================================
// workouts-utils.js - Utilities, Breathing, Calories, Steps
// =============================================

// ─── Safe helpers ────────────────────────────────────────────
function _stepGoal() {
  try { return (window.userGoals && window.userGoals.stepGoal) ? window.userGoals.stepGoal : 10000; }
  catch(e) { return 10000; }
}
function _today() {
  try { return typeof localDateStr === 'function' ? localDateStr() : new Date().toISOString().split('T')[0]; }
  catch(e) { return new Date().toISOString().split('T')[0]; }
}

// ═══════════════════════════════════════════════════════════
// DEFAULT WALK SECTIONS
// ═══════════════════════════════════════════════════════════
const DEFAULT_WALK_SECTIONS = [
  { id:'morning', label:'MORNING WALK',        pct:0.20, star:false },
  { id:'lunch',   label:'LUNCH WALK',           pct:0.20, star:false },
  { id:'pre',     label:'PRE-WORKOUT WALK',     pct:0.10, star:false },
  { id:'post',    label:'POST-WORKOUT WALK',    pct:0.30, star:true  },
  { id:'evening', label:'EVENING WIND-DOWN',    pct:0.20, star:false },
];
window.DEFAULT_WALK_SECTIONS = DEFAULT_WALK_SECTIONS;

// Shared state for the workout-section Steps tab
if (typeof window.todayStepData === 'undefined') window.todayStepData = {};

// ═══════════════════════════════════════════════════════════
// STEP PROGRESS RING — workout-section Steps tab
// ═══════════════════════════════════════════════════════════
function updateStepProgress() {
  try {
    const goal  = _stepGoal();
    const data  = window.todayStepData || {};
    const total = DEFAULT_WALK_SECTIONS.reduce((s, w) => s + (data[w.id]?.steps || 0), 0);
    const pct   = Math.min(100, Math.round(total / goal * 100));
    const off   = 345.4 - (345.4 * pct / 100);

    const r = document.getElementById('stepRingFill');  if (r) r.style.strokeDashoffset = String(off);
    const p = document.getElementById('stepRingPct');   if (p) p.textContent = pct + '%';
    const t = document.getElementById('stepTodayTotal');if (t) t.textContent = total.toLocaleString();
    const g = document.getElementById('stepGoalDisplay');if(g) g.textContent = goal.toLocaleString();
  } catch(e) {}
}
window.updateStepProgress = updateStepProgress;

// ═══════════════════════════════════════════════════════════
// SAVE CUSTOM WALK — workout-section Steps tab
// ═══════════════════════════════════════════════════════════
async function saveCustomWalk() {
  try {
    const name  = document.getElementById('customWalkName')?.value?.trim() || 'Custom Walk';
    const steps = parseInt(document.getElementById('customWalkSteps')?.value || '0');
    if (!steps) { if (typeof toast === 'function') toast('ENTER A STEP COUNT'); return; }

    const today = _today();
    window.todayStepData = window.todayStepData || {};
    window.todayStepData['custom_' + Date.now()] = { steps, label:name };

    const total = DEFAULT_WALK_SECTIONS.reduce((s,w) => s + (window.todayStepData[w.id]?.steps||0), 0) + steps;

    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(today)
      .set({ sections: window.todayStepData, total, date: today, updated: new Date().toISOString() });

    const existing = await encryptedLoad('steps');
    const idx = existing.findIndex(e => e.date === today);
    const entry = _buildStepEntry(today, total, window.todayStepData);
    idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
    await encryptedSave('steps', existing);

    const n = document.getElementById('customWalkName');  if (n) n.value = '';
    const s = document.getElementById('customWalkSteps'); if (s) s.value = '';

    if (typeof renderStepSections === 'function') renderStepSections();
    updateStepProgress();
    if (typeof loadStats === 'function') loadStats();
    if (typeof toast === 'function') toast('✓ ' + name + ' — ' + steps.toLocaleString() + ' STEPS LOGGED');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
window.saveCustomWalk = saveCustomWalk;

// ═══════════════════════════════════════════════════════════
// LOG STEP SECTIONS — Log Data → Steps tab
// Renders the five walk-section cards into #logStepSections.
// Firebase load happens AFTER the cards are rendered so that
// the UI is never blank even if Firebase is slow or fails.
// ═══════════════════════════════════════════════════════════
let _logDate = '';
let _logData = {};

async function renderLogStepSections() {
  // 1. Set the date
  const dateEl = document.getElementById('steps-log-date');
  _logDate = (dateEl && dateEl.value) ? dateEl.value : _today();
  if (dateEl && !dateEl.value) dateEl.value = _logDate;

  // 2. Render cards immediately with whatever data we have (may be empty)
  _paintLogStepCards();

  // 3. Load saved data from Firebase in the background, then repaint
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(_logDate).get();
    _logData = {};
    if (doc.exists) {
      const raw = doc.data().sections || {};
      for (const [k, v] of Object.entries(raw)) {
        _logData[k] = (typeof v === 'object' && v !== null) ? v : { steps: Number(v)||0, startSteps:null, endSteps:null };
      }
    }
  } catch(e) {
    _logData = {};
  }

  // 4. Repaint with real data
  _paintLogStepCards();
  updateLogStepRing();
}
window.renderLogStepSections = renderLogStepSections;

// ── Renders the five walk cards into #logStepSections ────────
function _paintLogStepCards() {
  const el = document.getElementById('logStepSections');
  if (!el) return;

  const goal = _stepGoal();

  el.innerHTML = DEFAULT_WALK_SECTIONS.map((s, idx) => {
    const saved      = _logData[s.id] || {};
    const done       = saved.steps || 0;
    const savedStart = saved.startSteps || '';
    const savedEnd   = saved.endSteps   || '';
    const target     = Math.round(goal * s.pct);
    const pct        = target > 0 ? Math.min(100, Math.round(done / target * 100)) : 0;
    const complete   = done >= target && target > 0;
    const prevSection = idx > 0 ? DEFAULT_WALK_SECTIONS[idx - 1] : null;
    const autoStart  = savedStart || (prevSection ? (_logData[prevSection.id]?.endSteps || '') : '');

    const borderColor = complete ? '#4caf50' : s.star ? 'var(--accent2)' : 'var(--border)';
    const labelColor  = s.star ? 'var(--accent2)' : 'var(--text)';

    return `
<div class="card mb16" id="logstepcard-${s.id}" style="border-left:4px solid ${borderColor};">
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
    <div style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;
      color:${labelColor};letter-spacing:.1em;">${s.star ? '⭐ ' : ''}${s.label}</div>
    <div style="font-family:var(--font-mono);font-size:0.65rem;color:${complete ? '#4caf50' : 'var(--text-dim)'};">
      ${done.toLocaleString()} / ${target.toLocaleString()} steps
    </div>
  </div>
  <div style="height:4px;background:var(--bg3);border-radius:2px;margin-bottom:14px;">
    <div style="height:100%;width:${pct}%;background:${complete ? '#4caf50' : 'var(--accent2)'};
      border-radius:2px;transition:width 0.5s;"></div>
  </div>
  <!-- Mode tabs -->
  <div style="display:flex;margin-bottom:12px;border:1px solid var(--border);overflow:hidden;">
    <button id="logmodetab-total-${s.id}" onclick="switchLogStepMode('${s.id}','total')"
      style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:.1em;
      cursor:pointer;border:none;border-right:1px solid var(--border);
      background:var(--accent-dim);color:var(--accent2);">
      TOTAL STEPS
    </button>
    <button id="logmodetab-range-${s.id}" onclick="switchLogStepMode('${s.id}','range')"
      style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:.1em;
      cursor:pointer;border:none;background:var(--bg3);color:var(--text-dim);">
      START → END
    </button>
  </div>
  <!-- Total mode -->
  <div id="logstepmode-total-${s.id}" style="display:flex;gap:8px;align-items:center;">
    <input type="number" id="logstepinput-${s.id}" value="${done || ''}"
      placeholder="Steps for this walk" min="0" max="50000"
      style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);
      font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;">
    <button class="btn btn-p" onclick="saveLogStepSection('${s.id}','total')"
      style="white-space:nowrap;font-size:0.65rem;padding:9px 14px;">
      ${complete ? '✓ UPDATE' : 'SAVE'}
    </button>
  </div>
  <!-- Range mode -->
  <div id="logstepmode-range-${s.id}" style="display:none;">
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:8px;">
      <div>
        <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);
          letter-spacing:.1em;margin-bottom:4px;">START STEPS</div>
        <input type="number" id="logstepstart-${s.id}" value="${autoStart}"
          placeholder="Watch reading at start" min="0"
          oninput="calcLogStepDiff('${s.id}')"
          style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);
          font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;box-sizing:border-box;">
      </div>
      <div style="font-family:var(--font-display);font-size:1.2rem;color:var(--border2);padding-top:20px;">→</div>
      <div>
        <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);
          letter-spacing:.1em;margin-bottom:4px;">END STEPS</div>
        <input type="number" id="logstepend-${s.id}" value="${savedEnd || ''}"
          placeholder="Watch reading at end" min="0"
          oninput="calcLogStepDiff('${s.id}')"
          style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);
          font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;box-sizing:border-box;">
      </div>
    </div>
    <div id="logstepdiff-${s.id}" style="font-family:var(--font-mono);font-size:0.7rem;
      color:var(--accent2);text-align:center;margin-bottom:8px;min-height:18px;">
      ${(savedStart && savedEnd) ? '= ' + (savedEnd - savedStart).toLocaleString() + ' steps this walk' : ''}
    </div>
    <button class="btn btn-p" onclick="saveLogStepSection('${s.id}','range')"
      style="width:100%;font-size:0.65rem;padding:9px;">
      ${complete ? '✓ UPDATE' : 'SAVE WALK'}
    </button>
  </div>
  ${complete ? '<div style="font-family:var(--font-mono);font-size:0.62rem;color:#4caf50;margin-top:8px;text-align:center;">✓ SECTION TARGET MET</div>' : ''}
</div>`;
  }).join('');

  // Restore range mode for sections that have range data
  DEFAULT_WALK_SECTIONS.forEach(s => {
    const saved = _logData[s.id] || {};
    if (saved.startSteps || saved.endSteps) {
      switchLogStepMode(s.id, 'range', false);
    }
  });
}

// ─── Update ring for Log tab ─────────────────────────────────
function updateLogStepRing() {
  try {
    const goal  = _stepGoal();
    const total = DEFAULT_WALK_SECTIONS.reduce((s, w) => s + (_logData[w.id]?.steps || 0), 0);
    const pct   = Math.min(100, Math.round(total / goal * 100));
    const off   = 345.4 - (345.4 * pct / 100);
    const today = _today();
    const isToday = !_logDate || _logDate === today;

    const r = document.getElementById('logStepRingFill');    if (r) r.style.strokeDashoffset = String(off);
    const p = document.getElementById('logStepRingPct');     if (p) p.textContent = pct + '%';
    const t = document.getElementById('logStepTodayTotal');  if (t) t.textContent = total.toLocaleString();
    const g = document.getElementById('logStepGoalDisplay'); if (g) g.textContent = goal.toLocaleString();
    const l = document.getElementById('logStepsTodayLabel'); if (l) l.textContent = isToday ? "TODAY'S STEPS" : (_logDate || 'STEPS');

    const banner = document.getElementById('steps-log-date-banner');
    if (banner) {
      if (!isToday && _logDate) {
        const d = new Date(_logDate + 'T12:00:00');
        banner.style.display = 'block';
        banner.textContent   = '📅 LOGGING FOR ' + d.toLocaleDateString('en-US',
          { weekday:'long', month:'long', day:'numeric' }).toUpperCase();
      } else {
        banner.style.display = 'none';
      }
    }
  } catch(e) {}
}
window.updateLogStepRing = updateLogStepRing;

// ─── Save a section ──────────────────────────────────────────
async function saveLogStepSection(sectionId, mode) {
  try {
    let steps = 0, startSteps = null, endSteps = null;

    if (mode === 'range') {
      startSteps = parseInt(document.getElementById('logstepstart-' + sectionId)?.value) || 0;
      endSteps   = parseInt(document.getElementById('logstepend-'   + sectionId)?.value) || 0;
      if (endSteps <= startSteps) {
        if (typeof toast === 'function') toast('END STEPS MUST BE GREATER THAN START STEPS');
        return;
      }
      steps = endSteps - startSteps;
    } else {
      steps = parseInt(document.getElementById('logstepinput-' + sectionId)?.value) || 0;
    }

    _logData[sectionId] = { steps, startSteps, endSteps };

    // Auto-fill next section start
    if (mode === 'range' && endSteps) {
      const idx  = DEFAULT_WALK_SECTIONS.findIndex(s => s.id === sectionId);
      const next = DEFAULT_WALK_SECTIONS[idx + 1];
      if (next && !_logData[next.id]?.startSteps) {
        const nextEl = document.getElementById('logstepstart-' + next.id);
        if (nextEl) nextEl.value = endSteps;
      }
    }

    const date  = _logDate || _today();
    const total = DEFAULT_WALK_SECTIONS.reduce((s, w) => s + (_logData[w.id]?.steps || 0), 0);

    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({ sections: _logData, total, date, updated: new Date().toISOString() });

    const existing = await encryptedLoad('steps');
    const idx = existing.findIndex(e => e.date === date);
    const entry = _buildStepEntry(date, total, _logData);
    idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
    await encryptedSave('steps', existing);

    _paintLogStepCards();
    updateLogStepRing();
    if (typeof loadStats === 'function') loadStats();
    const label = DEFAULT_WALK_SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
    if (typeof toast === 'function') toast('✓ ' + label + ' SAVED — ' + steps.toLocaleString() + ' STEPS');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
window.saveLogStepSection = saveLogStepSection;

// ─── Save custom walk (Log tab) ──────────────────────────────
async function saveLogCustomWalk() {
  try {
    const name  = document.getElementById('logCustomWalkName')?.value?.trim()  || 'Custom Walk';
    const steps = parseInt(document.getElementById('logCustomWalkSteps')?.value || '0');
    if (!steps) { if (typeof toast === 'function') toast('ENTER A STEP COUNT'); return; }

    const date  = _logDate || _today();
    _logData['custom_' + Date.now()] = { steps, label: name };
    const total = DEFAULT_WALK_SECTIONS.reduce((s,w) => s + (_logData[w.id]?.steps||0), 0) + steps;

    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({ sections: _logData, total, date, updated: new Date().toISOString() });

    const existing = await encryptedLoad('steps');
    const idx = existing.findIndex(e => e.date === date);
    const entry = _buildStepEntry(date, total, _logData);
    idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
    await encryptedSave('steps', existing);

    const n = document.getElementById('logCustomWalkName');  if (n) n.value = '';
    const s = document.getElementById('logCustomWalkSteps'); if (s) s.value = '';

    _paintLogStepCards();
    updateLogStepRing();
    if (typeof loadStats === 'function') loadStats();
    if (typeof toast === 'function') toast('✓ ' + name + ' — ' + steps.toLocaleString() + ' STEPS LOGGED');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
window.saveLogCustomWalk = saveLogCustomWalk;

// ─── Date navigation ─────────────────────────────────────────
async function changeStepsLogDate() {
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl) _logDate = dateEl.value;
  await renderLogStepSections();
}
window.changeStepsLogDate = changeStepsLogDate;

function stepsLogDateOffset(days) {
  const base = _logDate || _today();
  const d    = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  _logDate = d.toISOString().split('T')[0];
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl) dateEl.value = _logDate;
  renderLogStepSections();
}
window.stepsLogDateOffset = stepsLogDateOffset;

function stepsLogSetToday() {
  _logDate = _today();
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl) dateEl.value = _logDate;
  renderLogStepSections();
}
window.stepsLogSetToday = stepsLogSetToday;

// ─── Mode tab helpers ────────────────────────────────────────
function switchLogStepMode(sectionId, mode, highlight) {
  if (highlight === undefined) highlight = true;
  const t = document.getElementById('logstepmode-total-' + sectionId);
  const r = document.getElementById('logstepmode-range-' + sectionId);
  if (t) t.style.display = mode === 'total' ? 'flex'  : 'none';
  if (r) r.style.display = mode === 'range' ? 'block' : 'none';
  if (!highlight) return;
  ['total','range'].forEach(m => {
    const btn = document.getElementById('logmodetab-' + m + '-' + sectionId);
    if (!btn) return;
    btn.style.background = m === mode ? 'var(--accent-dim)' : 'var(--bg3)';
    btn.style.color      = m === mode ? 'var(--accent2)'    : 'var(--text-dim)';
  });
}
window.switchLogStepMode = switchLogStepMode;

function calcLogStepDiff(sectionId) {
  const start = parseInt(document.getElementById('logstepstart-' + sectionId)?.value) || 0;
  const end   = parseInt(document.getElementById('logstepend-'   + sectionId)?.value) || 0;
  const diffEl = document.getElementById('logstepdiff-' + sectionId);
  if (!diffEl) return;
  if (start > 0 && end > start) {
    diffEl.textContent = '= ' + (end - start).toLocaleString() + ' steps this walk';
    diffEl.style.color = 'var(--accent2)';
  } else if (end > 0 && end <= start) {
    diffEl.textContent = 'End must be greater than start';
    diffEl.style.color = 'var(--danger)';
  } else {
    diffEl.textContent = '';
  }
}
window.calcLogStepDiff = calcLogStepDiff;

// ─── Shared entry builder ────────────────────────────────────
function _buildStepEntry(date, total, data) {
  return {
    saved:   new Date().toISOString(),
    date,
    total:   String(total),
    morning: String(data.morning?.steps || 0),
    lunch:   String(data.lunch?.steps   || 0),
    pre:     String(data.pre?.steps     || 0),
    post:    String(data.post?.steps    || 0),
    evening: String(data.evening?.steps || 0),
  };
}

// ═══════════════════════════════════════════════════════════
// BREATHING / DECOMPRESSION
// ═══════════════════════════════════════════════════════════
function renderDecompressionSection() { /* already in index.html */ }
window.renderDecompressionSection = renderDecompressionSection;

let _breathInterval = null;

function startBreath(mode) {
  if (_breathInterval) { clearInterval(_breathInterval); _breathInterval = null; }

  const ui     = document.getElementById('breathUI');
  const circle = document.getElementById('breathCircle');
  const timer  = document.getElementById('breathTimer');
  const instr  = document.getElementById('breathInstr');
  if (!ui || !circle || !timer || !instr) return;
  ui.style.display = 'block';

  const patterns = {
    sigh: { phases:[{label:'INHALE (nose)',dur:2,cls:'inhale'},{label:'INHALE TOP-UP',dur:1,cls:'inhale'},{label:'EXHALE (slow)',dur:6,cls:'exhale'}], rounds:5 },
    '478':{ phases:[{label:'INHALE',dur:4,cls:'inhale'},{label:'HOLD',dur:7,cls:'hold'},{label:'EXHALE',dur:8,cls:'exhale'}], rounds:4 },
    scan: { phases:[{label:'BREATHE IN',dur:4,cls:'inhale'},{label:'BREATHE OUT',dur:6,cls:'exhale'}], rounds:10 },
  };

  const pattern = patterns[mode]; if (!pattern) return;
  let round = 0, pi = 0, pt = 0;

  circle.className = 'breath-circle'; circle.textContent = 'READY';
  timer.textContent = ''; instr.textContent = 'Round 1 of ' + pattern.rounds;

  _breathInterval = setInterval(() => {
    if (round >= pattern.rounds) {
      clearInterval(_breathInterval); _breathInterval = null;
      circle.textContent = 'DONE ✓'; circle.className = 'breath-circle';
      timer.textContent = ''; instr.textContent = 'Great work.'; return;
    }
    const phase = pattern.phases[pi];
    circle.textContent = phase.label; circle.className = 'breath-circle ' + phase.cls;
    timer.textContent  = phase.dur - pt;
    if (++pt >= phase.dur) {
      pt = 0; pi++;
      if (pi >= pattern.phases.length) {
        pi = 0; round++;
        if (round < pattern.rounds) instr.textContent = 'Round ' + (round+1) + ' of ' + pattern.rounds;
      }
    }
  }, 1000);
}
window.startBreath = startBreath;

// ═══════════════════════════════════════════════════════════
// CALORIE UTILITIES
// ═══════════════════════════════════════════════════════════
const EXERCISE_MET = {
  'BENCH PRESS':6.0,'OVERHEAD PRESS':5.5,'BENT-OVER ROW':6.5,'SQUAT':7.0,
  'DEADLIFT':7.5,'PULL-UP':8.0,'PUSH-UP':5.0,'HIP THRUST':5.5,
  'ROMANIAN DEADLIFT':6.0,'GOBLET SQUAT':6.5,'LUNGE':5.5,'PLANK':3.5,
  'DEAD BUG':3.0,'MOUNTAIN CLIMBERS':8.0,'BURPEE':8.5,'KETTLEBELL SWING':8.0,
};
window.EXERCISE_MET = EXERCISE_MET;

const SEC_PER_REP = {
  'BENCH PRESS':4,'OVERHEAD PRESS':4,'SQUAT':4,'DEADLIFT':5,
  'PULL-UP':4,'PUSH-UP':3,'HIP THRUST':3,'ROMANIAN DEADLIFT':4,'LUNGE':3,
};
window.SEC_PER_REP = SEC_PER_REP;

const DEFAULT_SEC_PER_REP = 3.5;
window.DEFAULT_SEC_PER_REP = DEFAULT_SEC_PER_REP;

const BODYWEIGHT_PCT = {
  'PUSH-UP':0.64,'PULL-UP':1.0,'TRICEP DIP':0.75,'CHIN-UP':1.0,
  'INVERTED ROW':0.7,'PIKE PUSH-UP':0.6,'DIAMOND PUSH-UP':0.64,
};
window.BODYWEIGHT_PCT = BODYWEIGHT_PCT;

// ── WEIGHTED_EXERCISES ────────────────────────────────────────
// Controls whether a weight (lbs/kg) input column appears in the set tracker.
// Rule: include any exercise where external load is COMMON or USEFUL to log,
// even if the exercise can also be done bodyweight.
// All exercise names must match item.name.toUpperCase() exactly.
const WEIGHTED_EXERCISES = new Set([

  // ── CHEST ──────────────────────────────────────────────────
  'BENCH PRESS','BARBELL BENCH PRESS','DUMBBELL BENCH PRESS',
  'INCLINE DB PRESS','INCLINE BARBELL PRESS',
  'DUMBBELL FLY','CABLE CHEST FLY','PEC DECK FLY',
  'MACHINE CHEST PRESS','FLOOR PRESS',
  'PUSH-UP',                     // can be weighted (vest / plate on back)
  'DECLINE PUSH-UP',             // ditto
  'DIAMOND PUSH-UP',
  'ARCHER PUSH-UP',
  'PSEUDO PLANCHE PUSH-UP',

  // ── BACK / LATS ────────────────────────────────────────────
  'SINGLE-ARM DB ROW','DB ROW (SINGLE ARM)',
  'BENT-OVER DB ROW','BENT-OVER ROW','BARBELL ROW',
  'LAT PULLDOWN','SEATED CABLE ROW','CABLE ROW',
  'PULL-UP / CHIN-UP','PULL-UP','CHIN-UP','WEIGHTED PULL-UP',
  'DOORFRAME PULL-UP BAR',       // can add belt weight
  'INVERTED ROW (TRX)',
  'BACK EXTENSION (MACHINE)','BACK EXTENSION (BENCH)',
  'REVERSE HYPEREXTENSION (MACHINE)','REVERSE HYPEREXTENSION (BENCH)','REVERSE HYPEREXTENSION (ADJ. BENCH)',
  'GOOD MORNING (DB)','GOOD MORNING (BARBELL)',
  'MEADOWS ROW','CHEST SUPPORTED DB ROW',
  'FACE PULL (CABLE)',

  // ── SHOULDERS ──────────────────────────────────────────────
  'DUMBBELL OVERHEAD PRESS','OVERHEAD PRESS','BARBELL OVERHEAD PRESS',
  'MACHINE SHOULDER PRESS',
  'LATERAL RAISE','CABLE LATERAL RAISE',
  'FRONT RAISE (DB)',
  'REAR DELT RAISE',

  // ── BICEPS ─────────────────────────────────────────────────
  'DUMBBELL BICEP CURL','BICEP CURL','EZ BAR CURL','PREACHER CURL',
  'CABLE BICEP CURL','MACHINE BICEP CURL',
  'CONCENTRATION CURL','INCLINE DB CURL',
  'HAMMER CURL','REVERSE CURL (DB)','WRIST CURL (DB)',

  // ── TRICEPS ────────────────────────────────────────────────
  'TRICEP DIP',                  // can be weighted
  'TRICEP DIP (PORTABLE BARS)',
  'BENCH DIP',
  'TRICEP OVERHEAD EXT. (DB)','TRICEP OVERHEAD EXT.',
  'SKULL CRUSHER (EZ)','CABLE TRICEP PRESSDOWN',
  'MACHINE TRICEP EXTENSION','TRICEP KICKBACK (DB)',

  // ── CORE / ABS ─────────────────────────────────────────────
  'CABLE CRUNCH','PALLOF PRESS (CABLE)',
  'RUSSIAN TWIST',               // can hold plate/DB
  'AB WHEEL ROLLOUT',

  // ── GLUTES — all common with added weight ─────────────────
  'GLUTE BRIDGE',                // DB/plate on hips
  'SINGLE-LEG GLUTE BRIDGE',
  'WEIGHTED GLUTE BRIDGE (DB)',
  'HIP THRUST','HIP THRUST (DB)','BARBELL HIP THRUST','MACHINE HIP THRUST',
  'SINGLE-LEG HIP THRUST',
  'DONKEY KICK',                 // ankle weights / cable
  'CABLE GLUTE KICKBACK',
  'HIP ABDUCTION MACHINE',
  'LATERAL BAND WALK',           // resistance band = external load

  // ── HAMSTRINGS ─────────────────────────────────────────────
  'ROMANIAN DEADLIFT (DB)','ROMANIAN DEADLIFT (BAR)','ROMANIAN DEADLIFT',
  'LYING LEG CURL','SEATED LEG CURL','SINGLE-LEG CURL (MACHINE)',
  'KETTLEBELL SWING',
  'DEADLIFT (DB)','CONVENTIONAL DEADLIFT','TRAP BAR DEADLIFT','SUMO DEADLIFT','SUMO DEADLIFT (DB)',

  // ── QUADS ──────────────────────────────────────────────────
  'GOBLET SQUAT','BARBELL SQUAT','BARBELL FRONT SQUAT','SUMO SQUAT (DB)','SUMO SQUAT (BB)',
  'LEG PRESS','LEG EXTENSION','HACK SQUAT (MACHINE)',
  'BULGARIAN SPLIT SQUAT',       // DB or BB
  'STEP-UP (DB OR BW)',          // can be weighted
  'REVERSE LUNGE (DB)','REVERSE LUNGE',
  'WALKING LUNGE (DB)',
  'LUNGE (BARBELL)',
  'CURTSY LUNGE (DB)','CURTSY LUNGE',
  'LATERAL LUNGE (DB)',
  'SPLIT SQUAT (BB)',
  'BOX SQUAT (BB)','PAUSE SQUAT (BB)','OVERHEAD SQUAT','SAFETY BAR SQUAT',
  'SINGLE-LEG GLUTE BRIDGE',

  // ── CALVES ─────────────────────────────────────────────────
  'STANDING CALF RAISE',         // can hold DBs
  'SEATED CALF RAISE','CALF PRESS ON LEG PRESS',
  'CALF RAISE ON STEP (BW)',     // can hold DBs
  'SINGLE-LEG CALF RAISE',

  // ── FULL BODY / COMPOUNDS ──────────────────────────────────
  'POWER CLEAN',
  "FARMER'S CARRY (DB)",'KETTLEBELL FARMER CARRY',
  'RENEGADE ROW',                // DB required

  // ── CALISTHENICS (weighted progressions) ──────────────────
  'PULL-UP (STANDARD)',          // weighted belt
  'DIP (BODYWEIGHT)',            // weighted belt
  'PISTOL SQUAT',                // can hold DB as counterweight / for load
  'SHRIMP SQUAT',
  'WALKING LUNGE',
  'NORDIC HAMSTRING CURL',
]);
window.WEIGHTED_EXERCISES = WEIGHTED_EXERCISES;

function getWeightKg() {
  try { const lbs = SESSION?.weight || 0; return lbs > 0 ? lbs * 0.453592 : 0; } catch(e) { return 0; }
}
window.getWeightKg = getWeightKg;

function metModifier(wLbs, bLbs) { return (!wLbs||!bLbs) ? 1 : 1+(wLbs/bLbs)*0.33; }
window.metModifier = metModifier;

function calcItemCalories(item, weightLbs) {
  try {
    const kg = getWeightKg(); if (!kg) return null;
    const name = (item.name||'').toUpperCase();
    const met  = EXERCISE_MET[name] || 4.0;
    const spr  = SEC_PER_REP[name]  || DEFAULT_SEC_PER_REP;
    const rm   = (item.sets||'').match(/[×x](\d+)/); const reps = rm ? parseInt(rm[1]) : 10;
    const sm   = (item.sets||'').match(/^(\d+)/);    const sets = sm ? parseInt(sm[1]) : 3;
    const mins = (reps * sets * spr) / 60;
    const bLbs = SESSION?.weight || 0;
    const eLbs = weightLbs || (BODYWEIGHT_PCT[name] ? bLbs * BODYWEIGHT_PCT[name] : 0);
    return Math.round(met * metModifier(eLbs, bLbs) * kg * mins);
  } catch(e) { return null; }
}
window.calcItemCalories = calcItemCalories;

function calcActualCalories(item, actual) {
  try {
    const kg   = getWeightKg(); if (!kg) return 0;
    const sets = (actual?.sets||[]).filter(s=>s?.reps);
    if (!sets.length) return 0;
    const name = (item.name||'').toUpperCase();
    const met  = EXERCISE_MET[name] || 4.0;
    const spr  = SEC_PER_REP[name]  || DEFAULT_SEC_PER_REP;
    const bLbs = SESSION?.weight || 0;
    return sets.reduce((tot, s) => {
      const reps = parseInt(s.reps)||0;
      const eLbs = parseFloat(s.weight)||(BODYWEIGHT_PCT[name]?bLbs*BODYWEIGHT_PCT[name]:0);
      return tot + Math.min(Math.round(met * metModifier(eLbs,bLbs) * kg * (reps*spr/60)), 25);
    }, 0);
  } catch(e) { return 0; }
}
window.calcActualCalories = calcActualCalories;

function renderCalorieBurnCard() { return ''; }
window.renderCalorieBurnCard = renderCalorieBurnCard;

function updateCalorieBurnDisplay() {}
window.updateCalorieBurnDisplay = updateCalorieBurnDisplay;
