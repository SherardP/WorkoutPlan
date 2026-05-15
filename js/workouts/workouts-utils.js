// =============================================
// workouts-utils.js - Utilities, Breathing, Calories, Steps
// =============================================

// ═══════════════════════════════════════════════════════════
// DEFAULT WALK SECTIONS
// Five cortisol-smart walks spread across the day.
// pct  = fraction of daily step goal each walk targets.
// star = most important walk (post-workout).
// IDs match the keys used in saveStepSection / saveLogStepSection.
// ═══════════════════════════════════════════════════════════
const DEFAULT_WALK_SECTIONS = [
  { id: 'morning', label: 'MORNING WALK',        pct: 0.20, star: false,
    desc: 'Before breakfast. Low-intensity. Wakes the system without spiking cortisol.' },
  { id: 'lunch',   label: 'LUNCH WALK',           pct: 0.20, star: false,
    desc: 'Post-lunch stroll. Blunts the blood-sugar spike from your meal.' },
  { id: 'pre',     label: 'PRE-WORKOUT WALK',     pct: 0.10, star: false,
    desc: 'Light movement to raise body temperature before training. Keep it easy.' },
  { id: 'post',    label: 'POST-WORKOUT WALK',    pct: 0.30, star: true,
    desc: 'Most important walk of the day. Drives cortisol down after training. Do not skip.' },
  { id: 'evening', label: 'EVENING WIND-DOWN',    pct: 0.20, star: false,
    desc: 'Gentle walk after dinner. Aids digestion and prepares you for sleep.' },
];
window.DEFAULT_WALK_SECTIONS = DEFAULT_WALK_SECTIONS;

// Shared step state (used by Steps tab in workout section)
let todayStepData = {};
window.todayStepData = todayStepData;

// ═══════════════════════════════════════════════════════════
// STEP PROGRESS — updates the ring + totals on the Steps tab
// ═══════════════════════════════════════════════════════════
function updateStepProgress() {
  const goal  = (typeof userGoals !== 'undefined' && userGoals && userGoals.stepGoal) || 10000;
  const total = DEFAULT_WALK_SECTIONS.reduce(
    (sum, s) => sum + (todayStepData[s.id]?.steps || 0), 0
  );
  const pct = Math.min(100, Math.round(total / goal * 100));

  // SVG ring — circumference of r=55 ≈ 345.4
  const ringEl = document.getElementById('stepRingFill');
  if (ringEl) ringEl.style.strokeDashoffset = String(345.4 - (345.4 * pct / 100));

  const pctEl  = document.getElementById('stepRingPct');
  if (pctEl)  pctEl.textContent = pct + '%';

  const totEl  = document.getElementById('stepTodayTotal');
  if (totEl)  totEl.textContent = total.toLocaleString();

  const goalEl = document.getElementById('stepGoalDisplay');
  if (goalEl) goalEl.textContent = goal.toLocaleString();
}
window.updateStepProgress = updateStepProgress;

// ═══════════════════════════════════════════════════════════
// SAVE CUSTOM WALK — Steps tab in workout section
// Uses #customWalkName and #customWalkSteps
// ═══════════════════════════════════════════════════════════
async function saveCustomWalk() {
  const name  = document.getElementById('customWalkName')?.value?.trim()  || 'Custom Walk';
  const steps = parseInt(document.getElementById('customWalkSteps')?.value || 0);
  if (!steps) { if (typeof toast === 'function') toast('ENTER A STEP COUNT'); return; }

  const today = typeof localDateStr === 'function' ? localDateStr() : new Date().toISOString().split('T')[0];
  const cid   = 'custom_' + Date.now();
  todayStepData[cid] = { steps, label: name, startSteps: null, endSteps: null };

  const total = DEFAULT_WALK_SECTIONS.reduce((sum, s) => sum + (todayStepData[s.id]?.steps || 0), 0) + steps;

  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(today)
      .set({ sections: todayStepData, total, date: today, updated: new Date().toISOString() });

    const existing = await encryptedLoad('steps');
    const idx = existing.findIndex(e => e.date === today);
    const entry = {
      saved: new Date().toISOString(), date: today, total: String(total),
      morning: String(todayStepData.morning?.steps || 0),
      lunch:   String(todayStepData.lunch?.steps   || 0),
      pre:     String(todayStepData.pre?.steps      || 0),
      post:    String(todayStepData.post?.steps     || 0),
      evening: String(todayStepData.evening?.steps  || 0),
    };
    idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
    await encryptedSave('steps', existing);

    const nameEl  = document.getElementById('customWalkName');
    const stepsEl = document.getElementById('customWalkSteps');
    if (nameEl)  nameEl.value  = '';
    if (stepsEl) stepsEl.value = '';

    if (typeof renderStepSections  === 'function') renderStepSections();
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
// Uses #logStepSections, #logStepRingFill etc.
// ═══════════════════════════════════════════════════════════
let _logStepDate = '';
let _logStepData = {};

async function renderLogStepSections() {
  const dateEl = document.getElementById('steps-log-date');
  _logStepDate = dateEl?.value || (typeof localDateStr === 'function' ? localDateStr() : '');

  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(_logStepDate).get();
    if (doc.exists) {
      const raw = doc.data().sections || {};
      _logStepData = {};
      for (const [k, v] of Object.entries(raw)) {
        _logStepData[k] = (typeof v === 'object') ? v : { steps: v, startSteps: null, endSteps: null };
      }
    } else {
      _logStepData = {};
    }
  } catch(e) {
    _logStepData = {};
  }

  updateLogStepRing();

  const el = document.getElementById('logStepSections');
  if (!el) return;

  const goal = (typeof userGoals !== 'undefined' && userGoals && userGoals.stepGoal) || 10000;

  el.innerHTML = DEFAULT_WALK_SECTIONS.map((s, idx) => {
    const saved      = _logStepData[s.id] || {};
    const done       = saved.steps || 0;
    const savedStart = saved.startSteps || '';
    const savedEnd   = saved.endSteps   || '';
    const target     = Math.round(goal * s.pct);
    const pct        = Math.min(100, Math.round(done / target * 100));
    const complete   = done >= target;
    const prevSection = idx > 0 ? DEFAULT_WALK_SECTIONS[idx - 1] : null;
    const prevEnd    = prevSection ? (_logStepData[prevSection.id]?.endSteps || '') : '';
    const autoStart  = savedStart || prevEnd;

    return `<div class="card mb16" id="logstepcard-${s.id}"
      style="border-left:4px solid ${complete ? '#4caf50' : s.star ? 'var(--accent2)' : 'var(--border)'};">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
        <div style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;
          color:${s.star ? 'var(--accent2)' : 'var(--text)'};letter-spacing:.1em;">
          ${s.star ? '⭐ ' : ''}${s.label}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.65rem;color:${complete ? '#4caf50' : 'var(--text-dim)'};">
          ${done.toLocaleString()} / ${target.toLocaleString()} steps
        </div>
      </div>
      <div style="height:4px;background:var(--bg3);border-radius:2px;margin-bottom:14px;">
        <div style="height:100%;width:${pct}%;background:${complete ? '#4caf50' : 'var(--accent2)'};border-radius:2px;transition:width 0.5s;"></div>
      </div>
      <div style="display:flex;gap:0;margin-bottom:12px;border:1px solid var(--border);overflow:hidden;">
        <button id="logmodetab-total-${s.id}" onclick="switchLogStepMode('${s.id}','total')"
          style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:.1em;
          cursor:pointer;border:none;background:var(--bg3);color:var(--text-dim);border-right:1px solid var(--border);">
          TOTAL STEPS
        </button>
        <button id="logmodetab-range-${s.id}" onclick="switchLogStepMode('${s.id}','range')"
          style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:.1em;
          cursor:pointer;border:none;background:var(--bg3);color:var(--text-dim);">
          START → END
        </button>
      </div>
      <div id="logstepmode-total-${s.id}" style="display:flex;gap:8px;align-items:center;">
        <input type="number" id="logstepinput-${s.id}" value="${done || ''}"
          placeholder="Enter step count for this walk" min="0" max="50000"
          style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);
          font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;">
        <button class="btn btn-p" onclick="saveLogStepSection('${s.id}','total')"
          style="white-space:nowrap;font-size:0.65rem;padding:9px 14px;">
          ${complete ? '✓ UPDATE' : 'SAVE'}
        </button>
      </div>
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
          ${savedStart && savedEnd ? '= ' + (savedEnd - savedStart).toLocaleString() + ' steps this walk' : ''}
        </div>
        <button class="btn btn-p" onclick="saveLogStepSection('${s.id}','range')"
          style="width:100%;font-size:0.65rem;padding:9px;">
          ${complete ? '✓ UPDATE' : 'SAVE WALK'}
        </button>
      </div>
      ${complete ? '<div style="font-family:var(--font-mono);font-size:0.62rem;color:#4caf50;margin-top:8px;text-align:center;">✓ SECTION TARGET MET</div>' : ''}
    </div>`;
  }).join('');

  // Restore mode tabs to correct state
  DEFAULT_WALK_SECTIONS.forEach(s => {
    const saved = _logStepData[s.id] || {};
    if (saved.startSteps || saved.endSteps) switchLogStepMode(s.id, 'range', false);
    else highlightLogModeTab(s.id, 'total');
  });
}
window.renderLogStepSections = renderLogStepSections;

function updateLogStepRing() {
  const goal  = (typeof userGoals !== 'undefined' && userGoals && userGoals.stepGoal) || 10000;
  const total = DEFAULT_WALK_SECTIONS.reduce((sum, s) => sum + (_logStepData[s.id]?.steps || 0), 0);
  const pct   = Math.min(100, Math.round(total / goal * 100));
  const today = typeof localDateStr === 'function' ? localDateStr() : '';
  const isToday = !_logStepDate || _logStepDate === today;

  const ringEl = document.getElementById('logStepRingFill');
  if (ringEl) ringEl.style.strokeDashoffset = String(345.4 - (345.4 * pct / 100));

  const pctEl  = document.getElementById('logStepRingPct');
  if (pctEl)  pctEl.textContent = pct + '%';

  const totEl  = document.getElementById('logStepTodayTotal');
  if (totEl)  totEl.textContent = total.toLocaleString();

  const goalEl = document.getElementById('logStepGoalDisplay');
  if (goalEl) goalEl.textContent = goal.toLocaleString();

  const labelEl = document.getElementById('logStepsTodayLabel');
  if (labelEl) labelEl.textContent = isToday ? "TODAY'S STEPS" : (_logStepDate || 'STEPS');

  // Show/hide past-date banner
  const banner = document.getElementById('steps-log-date-banner');
  if (banner) {
    if (!isToday && _logStepDate) {
      const d = new Date(_logStepDate + 'T12:00:00');
      banner.style.display = 'block';
      banner.textContent   = '📅 LOGGING FOR ' + d.toLocaleDateString('en-US',
        { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
    } else {
      banner.style.display = 'none';
    }
  }
}
window.updateLogStepRing = updateLogStepRing;

async function saveLogStepSection(sectionId, mode) {
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

  _logStepData[sectionId] = { steps, startSteps, endSteps };

  // Auto-fill next section's start from this end reading
  if (mode === 'range' && endSteps) {
    const idx  = DEFAULT_WALK_SECTIONS.findIndex(s => s.id === sectionId);
    const next = DEFAULT_WALK_SECTIONS[idx + 1];
    if (next && !_logStepData[next.id]?.startSteps) {
      const nextStartEl = document.getElementById('logstepstart-' + next.id);
      if (nextStartEl) nextStartEl.value = endSteps;
    }
  }

  const date  = _logStepDate || (typeof localDateStr === 'function' ? localDateStr() : '');
  const total = DEFAULT_WALK_SECTIONS.reduce((sum, s) => sum + (_logStepData[s.id]?.steps || 0), 0);

  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({ sections: _logStepData, total, date, updated: new Date().toISOString() });

    const existing = await encryptedLoad('steps');
    const idx = existing.findIndex(e => e.date === date);
    const entry = {
      saved: new Date().toISOString(), date, total: String(total),
      morning: String(_logStepData.morning?.steps || 0),
      lunch:   String(_logStepData.lunch?.steps   || 0),
      pre:     String(_logStepData.pre?.steps      || 0),
      post:    String(_logStepData.post?.steps     || 0),
      evening: String(_logStepData.evening?.steps  || 0),
    };
    idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
    await encryptedSave('steps', existing);

    await renderLogStepSections();
    if (typeof loadStats === 'function') loadStats();
    const label = DEFAULT_WALK_SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
    if (typeof toast === 'function') toast('✓ ' + label + ' SAVED — ' + steps.toLocaleString() + ' STEPS');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
window.saveLogStepSection = saveLogStepSection;

async function saveLogCustomWalk() {
  const name  = document.getElementById('logCustomWalkName')?.value?.trim()  || 'Custom Walk';
  const steps = parseInt(document.getElementById('logCustomWalkSteps')?.value || 0);
  if (!steps) { if (typeof toast === 'function') toast('ENTER A STEP COUNT'); return; }

  const date  = _logStepDate || (typeof localDateStr === 'function' ? localDateStr() : '');
  const cid   = 'custom_' + Date.now();
  _logStepData[cid] = { steps, label: name, startSteps: null, endSteps: null };

  const total = DEFAULT_WALK_SECTIONS.reduce((sum, s) => sum + (_logStepData[s.id]?.steps || 0), 0) + steps;

  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({ sections: _logStepData, total, date, updated: new Date().toISOString() });

    const existing = await encryptedLoad('steps');
    const idx = existing.findIndex(e => e.date === date);
    const entry = {
      saved: new Date().toISOString(), date, total: String(total),
      morning: String(_logStepData.morning?.steps || 0),
      lunch:   String(_logStepData.lunch?.steps   || 0),
      pre:     String(_logStepData.pre?.steps      || 0),
      post:    String(_logStepData.post?.steps     || 0),
      evening: String(_logStepData.evening?.steps  || 0),
    };
    idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
    await encryptedSave('steps', existing);

    const nameEl  = document.getElementById('logCustomWalkName');
    const stepsEl = document.getElementById('logCustomWalkSteps');
    if (nameEl)  nameEl.value  = '';
    if (stepsEl) stepsEl.value = '';

    await renderLogStepSections();
    updateLogStepRing();
    if (typeof loadStats === 'function') loadStats();
    if (typeof toast === 'function') toast('✓ ' + name + ' — ' + steps.toLocaleString() + ' STEPS LOGGED');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
window.saveLogCustomWalk = saveLogCustomWalk;

// ── Date navigation for Log Steps tab ───────────────────────
async function changeStepsLogDate() {
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl) _logStepDate = dateEl.value;
  await renderLogStepSections();
}
window.changeStepsLogDate = changeStepsLogDate;

function stepsLogDateOffset(days) {
  const today  = typeof localDateStr === 'function' ? localDateStr() : new Date().toISOString().split('T')[0];
  const base   = _logStepDate || today;
  const d      = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  _logStepDate = d.toISOString().split('T')[0];
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl) dateEl.value = _logStepDate;
  renderLogStepSections();
}
window.stepsLogDateOffset = stepsLogDateOffset;

function stepsLogSetToday() {
  const today  = typeof localDateStr === 'function' ? localDateStr() : new Date().toISOString().split('T')[0];
  _logStepDate = today;
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl) dateEl.value = today;
  renderLogStepSections();
}
window.stepsLogSetToday = stepsLogSetToday;

// ── Mode tab helpers ─────────────────────────────────────────
function switchLogStepMode(sectionId, mode, highlight = true) {
  const totalPanel = document.getElementById('logstepmode-total-' + sectionId);
  const rangePanel = document.getElementById('logstepmode-range-' + sectionId);
  if (totalPanel) totalPanel.style.display = mode === 'total' ? 'flex'  : 'none';
  if (rangePanel) rangePanel.style.display = mode === 'range' ? 'block' : 'none';
  if (highlight) highlightLogModeTab(sectionId, mode);
}
window.switchLogStepMode = switchLogStepMode;

function highlightLogModeTab(sectionId, activeMode) {
  ['total', 'range'].forEach(m => {
    const btn = document.getElementById('logmodetab-' + m + '-' + sectionId);
    if (!btn) return;
    btn.style.background = m === activeMode ? 'var(--accent-dim)' : 'var(--bg3)';
    btn.style.color      = m === activeMode ? 'var(--accent2)'    : 'var(--text-dim)';
  });
}
window.highlightLogModeTab = highlightLogModeTab;

function calcLogStepDiff(sectionId) {
  const startEl = document.getElementById('logstepstart-' + sectionId);
  const endEl   = document.getElementById('logstepend-'   + sectionId);
  const diffEl  = document.getElementById('logstepdiff-'  + sectionId);
  if (!startEl || !endEl || !diffEl) return;
  const start = parseInt(startEl.value) || 0;
  const end   = parseInt(endEl.value)   || 0;
  if (start > 0 && end > start) {
    diffEl.textContent = '= ' + (end - start).toLocaleString() + ' steps this walk';
    diffEl.style.color = 'var(--accent2)';
  } else if (end > 0 && end <= start) {
    diffEl.textContent = 'End steps must be greater than start steps';
    diffEl.style.color = 'var(--danger)';
  } else {
    diffEl.textContent = '';
  }
}
window.calcLogStepDiff = calcLogStepDiff;

// ═══════════════════════════════════════════════════════════
// BREATHING / DECOMPRESSION
// ═══════════════════════════════════════════════════════════
function renderDecompressionSection() {
  // Decompression section is already in index.html — nothing to inject
}
window.renderDecompressionSection = renderDecompressionSection;

let _breathInterval = null;

function startBreath(mode) {
  if (_breathInterval) clearInterval(_breathInterval);

  const ui     = document.getElementById('breathUI');
  const circle = document.getElementById('breathCircle');
  const timer  = document.getElementById('breathTimer');
  const instr  = document.getElementById('breathInstr');
  if (!ui) return;

  ui.style.display = 'block';

  const patterns = {
    sigh: { phases: [
      { label: 'INHALE (nose)',        dur: 2, cls: 'inhale' },
      { label: 'INHALE TOP-UP (nose)', dur: 1, cls: 'inhale' },
      { label: 'EXHALE (mouth, long)', dur: 6, cls: 'exhale' },
    ], rounds: 5 },
    '478': { phases: [
      { label: 'INHALE',  dur: 4, cls: 'inhale' },
      { label: 'HOLD',    dur: 7, cls: 'hold'   },
      { label: 'EXHALE',  dur: 8, cls: 'exhale' },
    ], rounds: 4 },
    scan: { phases: [
      { label: 'BREATHE IN',  dur: 4, cls: 'inhale' },
      { label: 'BREATHE OUT', dur: 6, cls: 'exhale' },
    ], rounds: 10 },
  };

  const pattern = patterns[mode];
  if (!pattern) return;

  let round = 0, phaseIdx = 0, phaseTime = 0;

  function tick() {
    if (round >= pattern.rounds) {
      clearInterval(_breathInterval);
      circle.textContent = 'DONE ✓';
      circle.className   = 'breath-circle';
      timer.textContent  = '';
      instr.textContent  = 'Great work. Cortisol is dropping.';
      return;
    }
    const phase = pattern.phases[phaseIdx];
    circle.textContent = phase.label;
    circle.className   = 'breath-circle ' + phase.cls;
    timer.textContent  = phase.dur - phaseTime;
    phaseTime++;
    if (phaseTime >= phase.dur) {
      phaseTime = 0;
      phaseIdx++;
      if (phaseIdx >= pattern.phases.length) {
        phaseIdx = 0;
        round++;
        if (round < pattern.rounds) instr.textContent = 'Round ' + (round + 1) + ' of ' + pattern.rounds;
      }
    }
  }

  circle.className   = 'breath-circle';
  circle.textContent = 'READY';
  timer.textContent  = '';
  instr.textContent  = 'Round 1 of ' + pattern.rounds;
  _breathInterval    = setInterval(tick, 1000);
}
window.startBreath = startBreath;

// ═══════════════════════════════════════════════════════════
// CALORIE UTILITIES — used by workouts-core.js set tracker
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

const WEIGHTED_EXERCISES = new Set([
  'BENCH PRESS','OVERHEAD PRESS','INCLINE DB PRESS','BENT-OVER ROW','DB ROW (SINGLE ARM)',
  'BARBELL ROW','SQUAT','GOBLET SQUAT','BARBELL SQUAT','ROMANIAN DEADLIFT',
  'DEADLIFT','HIP THRUST','BICEP CURL','HAMMER CURL','LATERAL RAISE',
  'TRICEP OVERHEAD EXT.','SKULL CRUSHER','LEG PRESS','SHOULDER PRESS',
  'DUMBBELL BENCH PRESS','DUMBBELL OVERHEAD PRESS','DUMBBELL FLY',
  'BARBELL HIP THRUST','DUMBBELL BICEP CURL','CABLE BICEP CURL',
]);
window.WEIGHTED_EXERCISES = WEIGHTED_EXERCISES;

function getWeightKg() {
  const lbs = (typeof SESSION !== 'undefined' && SESSION) ? (SESSION.weight || 0) : 0;
  return lbs > 0 ? lbs * 0.453592 : 0;
}
window.getWeightKg = getWeightKg;

function metModifier(weightLbs, bodyLbs) {
  if (!weightLbs || !bodyLbs) return 1;
  return 1 + (weightLbs / bodyLbs) * 0.33;
}
window.metModifier = metModifier;

function calcItemCalories(item, weightLbs) {
  const weightKg = getWeightKg();
  if (!weightKg) return null;
  const name       = (item.name || '').toUpperCase();
  const met        = EXERCISE_MET[name] || 4.0;
  const secPerRep  = SEC_PER_REP[name]  || DEFAULT_SEC_PER_REP;
  const repMatch   = (item.sets || '').match(/[×x](\d+)/);
  const reps       = repMatch ? parseInt(repMatch[1]) : 10;
  const setsMatch  = (item.sets || '').match(/^(\d+)/);
  const sets       = setsMatch ? parseInt(setsMatch[1]) : 3;
  const minutes    = (reps * sets * secPerRep) / 60;
  const bodyLbs    = (typeof SESSION !== 'undefined' && SESSION) ? (SESSION.weight || 0) : 0;
  const bwPct      = BODYWEIGHT_PCT[name];
  const effLbs     = weightLbs || (bwPct ? bodyLbs * bwPct : 0);
  return Math.round(met * metModifier(effLbs, bodyLbs) * weightKg * minutes);
}
window.calcItemCalories = calcItemCalories;

function calcActualCalories(item, actual) {
  const weightKg = getWeightKg();
  if (!weightKg) return 0;
  const sets = (actual && actual.sets) ? actual.sets.filter(s => s?.reps) : [];
  if (!sets.length) return 0;
  const name      = (item.name || '').toUpperCase();
  const met       = EXERCISE_MET[name] || 4.0;
  const secPerRep = SEC_PER_REP[name]  || DEFAULT_SEC_PER_REP;
  const bodyLbs   = (typeof SESSION !== 'undefined' && SESSION) ? (SESSION.weight || 0) : 0;
  const bwPct     = BODYWEIGHT_PCT[name];
  return sets.reduce((total, s) => {
    const reps   = parseInt(s.reps) || 0;
    const effLbs = parseFloat(s.weight) || (bwPct ? bodyLbs * bwPct : 0);
    const mins   = (reps * secPerRep) / 60;
    return total + Math.min(Math.round(met * metModifier(effLbs, bodyLbs) * weightKg * mins), 25);
  }, 0);
}
window.calcActualCalories = calcActualCalories;

function renderCalorieBurnCard() { return ''; }
window.renderCalorieBurnCard = renderCalorieBurnCard;

function updateCalorieBurnDisplay() {}
window.updateCalorieBurnDisplay = updateCalorieBurnDisplay;
