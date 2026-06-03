// ═══════════════════════════════════════════════════════════
// logdata.js — Log Data tab: workout, steps, body, nutrition, history
// Body log section is fully config-driven via dashboard-config.js
// ═══════════════════════════════════════════════════════════

// ── Tab switcher (called from index.html nav) ─────────────
function logTab(t) {
  ['workout','steps','body','nutrition','history'].forEach(x => {
    const el = document.getElementById('log-'+x);
    if (el) el.style.display = x === t ? 'block' : 'none';
    const b = document.getElementById('lt-'+x);
    if (b) { b.className = x === t ? 'btn btn-p' : 'btn btn-s'; }
  });
  if (t === 'workout')   { autoPopulateWorkoutLog(); }
  if (t === 'steps')     { initLogStepsPanel(); }
  if (t === 'body')      { initBodyLog(); }
  if (t === 'nutrition') { autoPopulateNutritionLog(); }
  if (t === 'history')   { showHist('workout'); }
}

// ═══════════════════════════════════════════════════════════
// BODY LOG — fully dynamic, driven by dashboard-config.js
// ═══════════════════════════════════════════════════════════

// Called when the body tab is shown — upgrades the static HTML
// in index.html to the dynamic config-driven version
async function initBodyLog() {
  // Ensure dashConfig is loaded
  if (typeof loadDashConfig === 'function') await loadDashConfig();

  _upgradeBodyLogHTML();

  // Set default date to today if empty
  const dateEl = document.getElementById('b-date');
  if (dateEl && !dateEl.value) dateEl.value = localDateStr();

  // Render fields from config
  if (typeof renderBodyLogFields === 'function') renderBodyLogFields();

  // Populate from DB
  await autoPopulateBodyLog();
}

// body-log-fields div and configure button are now in index.html directly.
// This function is kept as a no-op for safety but does nothing.
function _upgradeBodyLogHTML() {
  // Static fields removed from index.html — body-log-fields div is already there.
  // renderBodyLogFields() populates it from dashboard-config.js.
}

// ── autoPopulateBodyLog — config-aware ───────────────────
// Overrides the version in dashboard.js
async function autoPopulateBodyLog() {
  if (typeof loadDashConfig === 'function') await loadDashConfig();
  if (typeof renderBodyLogFields === 'function') renderBodyLogFields();

  const today = localDateStr();
  const dateEl = document.getElementById('b-date');
  if (dateEl && !dateEl.value) dateEl.value = today;
  const targetDate = dateEl?.value || today;

  const noteEl = document.getElementById('body-prefill-note');
  const enabled = typeof getEnabledMeasurements === 'function'
    ? getEnabledMeasurements()
    : _fallbackMeasurements();

  // Clear all fields
  enabled.forEach(m => {
    const el   = document.getElementById(`b-${m.id}`);
    const prev = document.getElementById(`b-${m.id}-prev`);
    if (el) { el.value = ''; el.style.color = 'var(--text)'; }
    if (prev) prev.textContent = '';
  });

  let body = [];
  try { body = await encryptedLoad('body'); } catch(e) {}

  if (!body.length) {
    if (noteEl) { noteEl.style.color = 'var(--text-dim)'; noteEl.textContent = 'No previous entries found'; }
    return;
  }

  const exactEntry = body.find(e => e.date === targetDate);

  if (exactEntry) {
    if (noteEl) { noteEl.style.color = '#4caf50'; noteEl.textContent = `✓ Entry for ${targetDate} loaded`; }
    if (typeof populateBodyLogFromEntry === 'function') {
      populateBodyLogFromEntry(exactEntry);
    } else {
      enabled.forEach(m => {
        const el = document.getElementById(`b-${m.id}`);
        if (el && exactEntry[m.id] !== undefined) el.value = exactEntry[m.id];
      });
    }
  } else {
    const prev = body.find(e => e.date < targetDate) || body[0];
    if (!prev) {
      if (noteEl) { noteEl.style.color = 'var(--text-dim)'; noteEl.textContent = 'No previous entries to pre-fill from'; }
      return;
    }
    if (noteEl) { noteEl.style.color = 'var(--accent2)'; noteEl.textContent = `Pre-filled from ${prev.date} — update any values that changed`; }
    if (typeof prefillBodyLogFromPrev === 'function') {
      prefillBodyLogFromPrev(prev, targetDate);
    } else {
      enabled.forEach(m => {
        const el   = document.getElementById(`b-${m.id}`);
        const prevEl = document.getElementById(`b-${m.id}-prev`);
        if (el && prev[m.id] !== undefined) {
          el.value = prev[m.id];
          el.style.color = 'var(--text-dim)';
          if (prevEl) prevEl.textContent = `Last: ${prev[m.id]}`;
          el.oninput = () => { el.style.color = 'var(--text)'; if (prevEl) prevEl.textContent = ''; };
        }
      });
    }
  }
}

// ── saveEntry — unified save for all log types ────────────
// Called from index.html as saveEntry('body'), saveEntry('workout'), etc.
async function saveEntry(type) {
  if (type === 'body') {
    await _saveBodyEntry();
  } else if (type === 'workout') {
    await _saveWorkoutEntry();
  } else if (type === 'steps') {
    await _saveStepsEntry();
  } else if (type === 'nutrition') {
    await saveNutrition();
  }
}

// ── Body save — collects ALL enabled measurement fields ───
async function _saveBodyEntry() {
  await loadDashConfig?.();

  const dateEl = document.getElementById('b-date');
  const date   = dateEl?.value || localDateStr();

  const enabled = typeof getEnabledMeasurements === 'function'
    ? getEnabledMeasurements()
    : _fallbackMeasurements();

  const values = {};
  enabled.forEach(m => {
    const el = document.getElementById(`b-${m.id}`);
    if (el && el.value !== '' && el.value !== null) {
      const v = parseFloat(el.value);
      if (!isNaN(v)) values[m.id] = v;
    }
  });

  if (!Object.keys(values).length) {
    toast('⚠ NO DATA — Enter at least one measurement');
    return;
  }

  const entry = { date, ...values };

  let body = [];
  try { body = await encryptedLoad('body'); } catch(e) {}

  const idx = body.findIndex(e => e.date === date);
  if (idx >= 0) body[idx] = { ...body[idx], ...entry }; // merge — preserves old fields
  else body.unshift(entry);
  body.sort((a, b) => (b.date||'').localeCompare(a.date||''));

  await encryptedSave('body', body);

  // ── Sync weight back to profile ───────────────────────────
  // When weight is logged, update SESSION and Firebase profile so
  // BMI, calorie burn, and all profile displays stay in sync.
  if (values.weight && SESSION) {
    SESSION.weight = values.weight;
    try {
      await saveUser(SESSION.username, { weight: values.weight });
    } catch(e) { console.warn('Weight profile sync failed:', e); }
    // Refresh BMI preview if profile modal is open
    if (typeof updateBMIPreview === 'function') updateBMIPreview();
    // Refresh calorie burn card if visible
    if (typeof updateCalorieBurnDisplay === 'function') updateCalorieBurnDisplay();
  }

  const noteEl = document.getElementById('body-prefill-note');
  if (noteEl) { noteEl.style.color = '#4caf50'; noteEl.textContent = `✓ SAVED for ${date}`; }
  toast('✓ BODY METRICS SAVED');
}

// ── Workout save ──────────────────────────────────────────
async function _saveWorkoutEntry() {
  const date  = document.getElementById('l-date')?.value || localDateStr();
  const day   = document.getElementById('l-day')?.value   || '';
  const loc   = document.getElementById('l-loc')?.value   || '';
  const dur   = document.getElementById('l-dur')?.value   || '';
  const energy= document.getElementById('l-energy')?.value|| '';
  const decomp= document.getElementById('l-decomp')?.value|| '';
  const exs   = document.getElementById('l-exs')?.value   || '';
  const notes = document.getElementById('l-notes')?.value || '';

  if (!date) { toast('⚠ SELECT A DATE'); return; }

  const entry = { date, day, location: loc, duration: dur, energy, decomp, exercises: exs, notes };

  let workouts = [];
  try { workouts = await encryptedLoad('workout'); } catch(e) {}

  const idx = workouts.findIndex(w => w.date === date && w.day === day);
  if (idx >= 0) workouts[idx] = entry;
  else workouts.unshift(entry);
  workouts.sort((a,b) => (b.date||'').localeCompare(a.date||''));

  await encryptedSave('workout', workouts);
  toast('✓ WORKOUT SAVED');
}

// ── Steps save ────────────────────────────────────────────
async function _saveStepsEntry() {
  const date  = document.getElementById('steps-log-date')?.value || localDateStr();
  const total = parseInt(document.getElementById('s-total')?.value || document.getElementById('logCustomWalkSteps')?.value || 0);

  if (!total) { toast('⚠ ENTER STEP COUNT'); return; }

  let steps = [];
  try { steps = await encryptedLoad('steps'); } catch(e) {}

  const idx = steps.findIndex(s => s.date === date);
  const entry = { date, total, sections: _collectStepSections() };
  if (idx >= 0) steps[idx] = entry;
  else steps.unshift(entry);
  steps.sort((a,b) => (b.date||'').localeCompare(a.date||''));

  await encryptedSave('steps', steps);
  toast('✓ STEPS SAVED');
}

function _collectStepSections() {
  const ids = ['s-morn','s-lunch','s-pre','s-post','s-eve'];
  const result = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) result[id] = parseInt(el.value);
  });
  return result;
}

// ── Fallback measurement list (if dashboard-config.js not loaded) ─
function _fallbackMeasurements() {
  return [
    { id:'weight', label:'Weight', unit:'lbs' },
    { id:'waist',  label:'Waist',  unit:'in'  },
    { id:'chest',  label:'Chest',  unit:'in'  },
    { id:'hips',   label:'Hips',   unit:'in'  },
    { id:'neck',   label:'Neck',   unit:'in'  },
    { id:'glutes', label:'Glutes', unit:'in'  },
    { id:'thighs', label:'Thighs', unit:'in'  },
    { id:'sleep',  label:'Sleep',  unit:'hrs' },
    { id:'stress', label:'Stress', unit:'/10' },
  ];
}

// ═══════════════════════════════════════════════════════════
// HISTORY TAB
// ═══════════════════════════════════════════════════════════
async function showHist(type) {
  const el = document.getElementById('histContent');
  if (!el) return;
  el.innerHTML = '<div class="mono dim">Loading...</div>';

  let data = [];
  try { data = await encryptedLoad(type); } catch(e) {}

  if (!data.length) {
    el.innerHTML = '<div class="mono dim" style="padding:16px 0;">No entries found.</div>';
    return;
  }

  if (type === 'body') {
    // For body, columns are dynamic based on what's actually been logged
    const allKeys = [...new Set(data.flatMap(e => Object.keys(e).filter(k => k !== 'date')))];
    const enabled = typeof getEnabledMeasurements === 'function' ? getEnabledMeasurements() : _fallbackMeasurements();
    const enabledIds = enabled.map(m => m.id);
    // Show enabled keys first, then any others that have data
    const cols = [...enabledIds.filter(id => allKeys.includes(id)), ...allKeys.filter(k => !enabledIds.includes(k))];
    const colDefs = cols.map(id => {
      const def = enabled.find(m => m.id === id);
      return { id, label: def ? def.label : id, unit: def ? def.unit : '' };
    });

    el.innerHTML = `<div style="overflow-x:auto;">
      <table class="tbl" style="min-width:600px;">
        <tr>
          <th>DATE</th>
          ${colDefs.map(c => `<th>${c.label.toUpperCase()}${c.unit?' ('+c.unit+')':''}</th>`).join('')}
        </tr>
        ${data.slice(0,50).map(e => `<tr>
          <td style="color:var(--accent2);white-space:nowrap;">${e.date||'—'}</td>
          ${colDefs.map(c => `<td>${e[c.id] !== undefined ? e[c.id] : '—'}</td>`).join('')}
        </tr>`).join('')}
      </table>
    </div>`;

  } else if (type === 'workout') {
    el.innerHTML = `<table class="tbl">
      <tr><th>DATE</th><th>DAY</th><th>LOCATION</th><th>DURATION</th><th>ENERGY</th><th>DECOMP</th></tr>
      ${data.slice(0,30).map(w => `<tr>
        <td style="color:var(--accent2);white-space:nowrap;">${w.date||'—'}</td>
        <td>${(w.day||'—').split('—')[0].trim()}</td>
        <td>${w.location||'—'}</td>
        <td>${w.duration||'—'} min</td>
        <td>${w.energy||'—'}/10</td>
        <td style="color:${w.decomp&&w.decomp.includes('YES')?'#4caf50':'var(--text-dim)'}">${w.decomp||'—'}</td>
      </tr>`).join('')}
    </table>`;

  } else if (type === 'steps') {
    el.innerHTML = `<table class="tbl">
      <tr><th>DATE</th><th>TOTAL STEPS</th><th>GOAL</th><th>STATUS</th></tr>
      ${data.slice(0,30).map(s => {
        const goal = userGoals?.stepGoal || 10000;
        const hit  = (+s.total||0) >= goal;
        return `<tr>
          <td style="color:var(--accent2);white-space:nowrap;">${s.date||'—'}</td>
          <td style="font-family:var(--font-display);font-size:1rem;color:${hit?'#4caf50':'var(--text)'};">${(+s.total||0).toLocaleString()}</td>
          <td>${goal.toLocaleString()}</td>
          <td style="color:${hit?'#4caf50':'var(--text-dim)'}">${hit?'✓ HIT':'—'}</td>
        </tr>`;
      }).join('')}
    </table>`;

  } else if (type === 'nutrition') {
    el.innerHTML = `<table class="tbl">
      <tr><th>DATE</th><th>CALORIES</th><th>PROTEIN</th><th>CARBS</th><th>FAT</th><th>WATER</th></tr>
      ${data.slice(0,30).map(n => `<tr>
        <td style="color:var(--accent2);white-space:nowrap;">${n.date||'—'}</td>
        <td>${n.calories||'—'}</td>
        <td>${n.protein||'—'}g</td>
        <td>${n.carbs||'—'}g</td>
        <td>${n.fat||'—'}g</td>
        <td>${n.water||'—'} oz</td>
      </tr>`).join('')}
    </table>`;
  }
}

// ═══════════════════════════════════════════════════════════
// CLEAR DATA
// ═══════════════════════════════════════════════════════════
async function clearData() {
  if (!confirm('DELETE ALL YOUR LOGGED DATA? This cannot be undone.')) return;
  if (!confirm('Are you absolutely sure? All workouts, steps, body metrics, and nutrition will be permanently deleted.')) return;
  try {
    for (const type of ['workout','steps','body','nutrition']) {
      await encryptedSave(type, []);
    }
    toast('✓ ALL DATA CLEARED');
    showHist('workout');
  } catch(e) {
    toast('ERROR: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════
// RELOAD LOG FOR DATE — called by date input onchange in HTML
// ═══════════════════════════════════════════════════════════
async function reloadLogForDate(type) {
  if (type === 'body')      await autoPopulateBodyLog();
  if (type === 'workout')   await autoPopulateWorkoutLog();
  if (type === 'nutrition') await autoPopulateNutritionLog();
  if (type === 'steps')     await changeStepsLogDate?.();
}

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// STEPS LOG TAB — fully self-contained, no external deps
// ═══════════════════════════════════════════════════════════

const _WALKS = [
  { id:'morning', label:'MORNING WALK',       pct:0.20, star:false },
  { id:'lunch',   label:'LUNCH WALK',          pct:0.20, star:false },
  { id:'pre',     label:'PRE-WORKOUT WALK',    pct:0.10, star:false },
  { id:'post',    label:'POST-WORKOUT WALK',   pct:0.30, star:true  },
  { id:'evening', label:'EVENING WIND-DOWN',   pct:0.20, star:false },
];
var _lsDate = '';
var _lsData = {};

// Always read the live userGoals value — never fall back to a stale 10000
function _lsGoal() {
  // userGoals is declared as var in utils.js, making it a true global.
  // Object.assign in loadGoals() mutates it in place so this always reflects
  // whatever was last saved in Firebase.
  return (typeof userGoals !== 'undefined' && userGoals.stepGoal && userGoals.stepGoal > 0)
    ? userGoals.stepGoal : 10000;
}

async function initLogStepsPanel() {
  // ── Always load the latest goals first so stepGoal is current ──
  if (typeof loadGoals === 'function') {
    try { await loadGoals(); } catch(e) {}
  }
  var dateEl = document.getElementById('steps-log-date');
  _lsDate = localDateStr();
  if (dateEl && !dateEl.value) dateEl.value = _lsDate;
  else if (dateEl && dateEl.value) _lsDate = dateEl.value;
  _renderLogWalkCards();
  _loadAndRefreshLogSteps();
}

async function _loadAndRefreshLogSteps() {
  try {
    var doc = await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(_lsDate).get();
    _lsData = {};
    if (doc.exists) {
      var raw = doc.data().sections || {};
      Object.entries(raw).forEach(function(kv) {
        var k = kv[0], v = kv[1];
        _lsData[k] = (v && typeof v === 'object') ? v : {steps: Number(v)||0};
      });
    }
  } catch(e) { _lsData = {}; }
  _renderLogWalkCards();
  _updateLogRing();
}

function _renderLogWalkCards() {
  var el = document.getElementById('logStepSections');
  if (!el) return;
  var goal = _lsGoal();

  var html = _WALKS.map(function(s, idx) {
    var saved    = _lsData[s.id] || {};
    var done     = saved.steps || 0;
    var sStart   = saved.startSteps || '';
    var sEnd     = saved.endSteps   || '';
    var target   = Math.round(goal * s.pct);
    var pct      = target > 0 ? Math.min(100, Math.round(done / target * 100)) : 0;
    var complete = done >= target && target > 0;
    // Find the most recent endSteps from ANY earlier section (handles skipped walks)
    var autoStart = sStart;
    if (!autoStart && idx > 0) {
      for (var pi = idx - 1; pi >= 0; pi--) {
        var prevSec = _lsData[_WALKS[pi].id];
        if (prevSec && prevSec.endSteps) {
          autoStart = prevSec.endSteps;
          break;
        }
      }
    }
    autoStart = autoStart || '';
    var bc = complete ? '#4caf50' : s.star ? 'var(--accent2)' : 'var(--border)';
    var lc = s.star ? 'var(--accent2)' : 'var(--text)';
    var diffText = (sStart && sEnd) ? '= ' + (sEnd - sStart).toLocaleString() + ' steps this walk' : '';

    return '<div class="card mb16" id="logstepcard-' + s.id + '" style="border-left:4px solid ' + bc + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">' +
        '<div style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;color:' + lc + ';letter-spacing:.1em;">' + (s.star ? '⭐ ' : '') + s.label + '</div>' +
        '<div style="font-family:var(--font-mono);font-size:0.65rem;color:' + (complete ? '#4caf50' : 'var(--text-dim)') + ';">' + done.toLocaleString() + ' / ' + target.toLocaleString() + ' steps</div>' +
      '</div>' +
      '<div style="height:4px;background:var(--bg3);border-radius:2px;margin-bottom:14px;">' +
        '<div style="height:100%;width:' + pct + '%;background:' + (complete ? '#4caf50' : 'var(--accent2)') + ';border-radius:2px;transition:width 0.5s;"></div>' +
      '</div>' +
      '<div style="display:flex;margin-bottom:12px;border:1px solid var(--border);overflow:hidden;">' +
        '<button onclick="_lsMode(\'' + s.id + '\',\'total\')" id="lsmtab-total-' + s.id + '" style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;cursor:pointer;border:none;border-right:1px solid var(--border);background:var(--accent-dim);color:var(--accent2);">TOTAL STEPS</button>' +
        '<button onclick="_lsMode(\'' + s.id + '\',\'range\')" id="lsmtab-range-' + s.id + '" style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;cursor:pointer;border:none;background:var(--bg3);color:var(--text-dim);">START → END</button>' +
      '</div>' +
      '<div id="lsm-total-' + s.id + '" style="display:flex;gap:8px;align-items:center;">' +
        '<input type="number" id="lsinput-' + s.id + '" value="' + (done || '') + '" placeholder="Steps for this walk" min="0" max="50000" style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;">' +
        '<button class="btn btn-p" onclick="_lsSave(\'' + s.id + '\',\'total\')" style="white-space:nowrap;font-size:0.65rem;padding:9px 14px;">' + (complete ? '✓ UPDATE' : 'SAVE') + '</button>' +
      '</div>' +
      '<div id="lsm-range-' + s.id + '" style="display:none;">' +
        '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:8px;">' +
          '<div>' +
            '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">START STEPS</div>' +
            '<input type="number" id="lsstart-' + s.id + '" value="' + autoStart + '" placeholder="Watch at start" min="0" oninput="_lsDiff(\'' + s.id + '\')" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;box-sizing:border-box;">' +
          '</div>' +
          '<div style="font-family:var(--font-display);font-size:1.2rem;color:var(--border2);padding-top:20px;">→</div>' +
          '<div>' +
            '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">END STEPS</div>' +
            '<input type="number" id="lsend-' + s.id + '" value="' + (sEnd || '') + '" placeholder="Watch at end" min="0" oninput="_lsDiff(\'' + s.id + '\')" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;box-sizing:border-box;">' +
          '</div>' +
        '</div>' +
        '<div id="lsdiff-' + s.id + '" style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent2);text-align:center;margin-bottom:8px;min-height:18px;">' + diffText + '</div>' +
        '<button class="btn btn-p" onclick="_lsSave(\'' + s.id + '\',\'range\')" style="width:100%;font-size:0.65rem;padding:9px;">' + (complete ? '✓ UPDATE' : 'SAVE WALK') + '</button>' +
      '</div>' +
      (complete ? '<div style="font-family:var(--font-mono);font-size:0.62rem;color:#4caf50;margin-top:8px;text-align:center;">✓ SECTION TARGET MET</div>' : '') +
    '</div>';
  }).join('');

  el.innerHTML = html;

  // Restore range tabs
  _WALKS.forEach(function(s) {
    if (_lsData[s.id] && (_lsData[s.id].startSteps || _lsData[s.id].endSteps)) {
      _lsMode(s.id, 'range', false);
    }
  });

  // Append any custom walk rows below the 5 fixed sections
  var customKeys = Object.keys(_lsData).filter(function(k){ return k.indexOf('custom_') === 0; });
  if (customKeys.length > 0) {
    var customHtml = '<div style="margin-top:8px;">' +
      '<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.12em;margin-bottom:8px;">ADDITIONAL WALKS</div>';
    customKeys.forEach(function(k) {
      var w = _lsData[k] || {};
      var wSteps = w.steps || 0;
      var wLabel = w.label || 'Custom Walk';
      var safeKey = k.replace(/'/g, "\'");
      customHtml +=
        '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;' +
        'margin-bottom:6px;background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--border2);">' +
          '<div style="flex:1;font-family:var(--font-mono);font-size:0.7rem;color:var(--text);">' + wLabel + '</div>' +
          '<div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent2);white-space:nowrap;">' + wSteps.toLocaleString() + ' steps</div>' +
          '<button data-delkey="' + k + '" class="ls-del-btn" style="font-family:var(--font-mono);font-size:0.58rem;padding:3px 8px;cursor:pointer;background:transparent;border:1px solid var(--danger);color:var(--danger);white-space:nowrap;">✕ DELETE</button>' +
        '</div>';
    });
    customHtml += '</div>';
    el.innerHTML += customHtml;

    // Attach delete handlers via JS (avoids inline onclick quote escaping issues)
    el.querySelectorAll('.ls-del-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.getAttribute('data-delkey');
        if (key) _lsDeleteCustom(key);
      });
    });
  }
}

async function _lsDeleteCustom(key) {
  if (!_lsData[key]) return;
  var label = _lsData[key].label || 'Custom Walk';
  delete _lsData[key];

  var date  = _lsDate || localDateStr();
  var total = Object.values(_lsData).reduce(function(s,v){return s+(v?v.steps||0:0);},0);

  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({sections: _lsData, total: total, date: date, updated: new Date().toISOString()});

    var existing = await encryptedLoad('steps');
    var idx = existing.findIndex(function(e){return e.date===date;});
    var entry = _buildEntry(date, total);
    if (idx >= 0) existing[idx] = entry; else existing.unshift(entry);
    await encryptedSave('steps', existing);

    _renderLogWalkCards();
    _updateLogRing();
    if (typeof loadStats === 'function') loadStats();
    if (typeof toast === 'function') toast('✓ ' + label + ' DELETED');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
window._lsDeleteCustom = _lsDeleteCustom;

function _updateLogRing() {
  try {
    var goal  = _lsGoal();
    // Sum ALL sections including custom walks
    var total = Object.values(_lsData).reduce(function(s, v) { return s + (v ? (v.steps || 0) : 0); }, 0);
    var pct   = Math.min(100, Math.round(total / goal * 100));
    var off   = 345.4 - (345.4 * pct / 100);
    var today = localDateStr();

    var r = document.getElementById('logStepRingFill');    if(r) r.style.strokeDashoffset = String(off);
    var p = document.getElementById('logStepRingPct');     if(p) p.textContent = pct + '%';
    var t = document.getElementById('logStepTodayTotal');  if(t) t.textContent = total.toLocaleString();
    var g = document.getElementById('logStepGoalDisplay'); if(g) g.textContent = goal.toLocaleString();
    var l = document.getElementById('logStepsTodayLabel'); if(l) l.textContent = (!_lsDate || _lsDate === today) ? "TODAY'S STEPS" : _lsDate;

    var banner = document.getElementById('steps-log-date-banner');
    if (banner) {
      if (_lsDate && _lsDate !== today) {
        var d = new Date(_lsDate + 'T12:00:00');
        banner.style.display = 'block';
        banner.textContent = '📅 LOGGING FOR ' + d.toLocaleDateString('en-US', {weekday:'long',month:'long',day:'numeric'}).toUpperCase();
      } else {
        banner.style.display = 'none';
      }
    }
  } catch(e) {}
}

function _buildEntry(date, total) {
  return {
    saved: new Date().toISOString(), date: date, total: String(total),
    morning: String(_lsData.morning ? _lsData.morning.steps||0 : 0),
    lunch:   String(_lsData.lunch   ? _lsData.lunch.steps||0   : 0),
    pre:     String(_lsData.pre     ? _lsData.pre.steps||0     : 0),
    post:    String(_lsData.post    ? _lsData.post.steps||0    : 0),
    evening: String(_lsData.evening ? _lsData.evening.steps||0 : 0),
  };
}

async function _lsSave(sectionId, mode) {
  try {
    var steps = 0, startSteps = null, endSteps = null;
    if (mode === 'range') {
      startSteps = parseInt(document.getElementById('lsstart-' + sectionId) ? document.getElementById('lsstart-' + sectionId).value : '0') || 0;
      endSteps   = parseInt(document.getElementById('lsend-'   + sectionId) ? document.getElementById('lsend-'   + sectionId).value : '0') || 0;
      if (endSteps <= startSteps) { if(typeof toast==='function') toast('END MUST BE GREATER THAN START'); return; }
      steps = endSteps - startSteps;
    } else {
      steps = parseInt(document.getElementById('lsinput-' + sectionId) ? document.getElementById('lsinput-' + sectionId).value : '0') || 0;
    }
    _lsData[sectionId] = {steps: steps, startSteps: startSteps, endSteps: endSteps};

    // Propagate endSteps forward to all subsequent sections that don't yet have a startSteps
    if (mode === 'range' && endSteps) {
      var idx2 = _WALKS.findIndex(function(s) { return s.id === sectionId; });
      for (var fi = idx2 + 1; fi < _WALKS.length; fi++) {
        var fwalk = _WALKS[fi];
        // Only fill if this section has no saved startSteps yet
        if (!(_lsData[fwalk.id] && _lsData[fwalk.id].startSteps)) {
          // Update the DOM input if it's visible (range mode open)
          var ne = document.getElementById('lsstart-' + fwalk.id);
          if (ne && !ne.value) ne.value = endSteps;
        }
        // Stop propagating once we hit a section that already has its own endSteps saved
        if (_lsData[fwalk.id] && _lsData[fwalk.id].endSteps) break;
      }
    }

    var date  = _lsDate || localDateStr();
    var total = _WALKS.reduce(function(s,w){return s+(_lsData[w.id]?_lsData[w.id].steps||0:0);},0);

    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({sections: _lsData, total: total, date: date, updated: new Date().toISOString()});

    var existing = await encryptedLoad('steps');
    var idx = existing.findIndex(function(e){return e.date===date;});
    var entry = _buildEntry(date, total);
    if (idx >= 0) existing[idx] = entry; else existing.unshift(entry);
    await encryptedSave('steps', existing);

    _renderLogWalkCards();
    _updateLogRing();
    if (typeof loadStats === 'function') loadStats();
    var label = (_WALKS.find(function(s){return s.id===sectionId;})||{}).label || sectionId;
    if (typeof toast === 'function') toast('✓ ' + label + ' SAVED — ' + steps.toLocaleString() + ' STEPS');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}

async function saveLogCustomWalk() {
  try {
    var nameEl  = document.getElementById('logCustomWalkName');
    var stepsEl = document.getElementById('logCustomWalkSteps');
    var name  = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : 'Custom Walk';
    var steps = parseInt((stepsEl && stepsEl.value) ? stepsEl.value : '0') || 0;
    if (!steps) { if(typeof toast==='function') toast('ENTER A STEP COUNT'); return; }

    var date  = _lsDate || localDateStr();
    var cid   = 'custom_' + Date.now();
    _lsData[cid] = {steps: steps, label: name};

    // Total = all sections including ALL custom entries
    var total = Object.values(_lsData).reduce(function(s,v){return s+(v?v.steps||0:0);},0);

    await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(date)
      .set({sections: _lsData, total: total, date: date, updated: new Date().toISOString()});

    var existing = await encryptedLoad('steps');
    var idx = existing.findIndex(function(e){return e.date===date;});
    var entry = _buildEntry(date, total);
    if (idx >= 0) existing[idx] = entry; else existing.unshift(entry);
    await encryptedSave('steps', existing);

    // Clear inputs for next custom walk entry
    if (nameEl)  nameEl.value  = '';
    if (stepsEl) stepsEl.value = '';

    // Re-render cards (shows updated sections + custom rows) and update ring
    _renderLogWalkCards();
    _updateLogRing();
    if (typeof loadStats === 'function') loadStats();
    if (typeof toast === 'function') toast('✓ ' + name + ' — ' + steps.toLocaleString() + ' STEPS LOGGED');
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}

async function changeStepsLogDate() {
  var d = document.getElementById('steps-log-date');
  if (d) _lsDate = d.value;
  _renderLogWalkCards();
  _loadAndRefreshLogSteps();
}

function stepsLogDateOffset(days) {
  var base = _lsDate || localDateStr();
  var d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  _lsDate = d.toISOString().split('T')[0];
  var el = document.getElementById('steps-log-date');
  if (el) el.value = _lsDate;
  _renderLogWalkCards();
  _loadAndRefreshLogSteps();
}

function stepsLogSetToday() {
  _lsDate = localDateStr();
  var el = document.getElementById('steps-log-date');
  if (el) el.value = _lsDate;
  _renderLogWalkCards();
  _loadAndRefreshLogSteps();
}

function _lsMode(id, mode, highlight) {
  var t = document.getElementById('lsm-total-' + id);
  var r = document.getElementById('lsm-range-' + id);
  if (t) t.style.display = mode === 'total' ? 'flex'  : 'none';
  if (r) r.style.display = mode === 'range' ? 'block' : 'none';
  if (highlight === false) return;
  ['total','range'].forEach(function(m) {
    var b = document.getElementById('lsmtab-' + m + '-' + id);
    if (!b) return;
    b.style.background = m === mode ? 'var(--accent-dim)' : 'var(--bg3)';
    b.style.color      = m === mode ? 'var(--accent2)'    : 'var(--text-dim)';
  });
}

function _lsDiff(id) {
  var s = parseInt((document.getElementById('lsstart-'+id)||{}).value)||0;
  var e = parseInt((document.getElementById('lsend-'+id)||{}).value)||0;
  var d = document.getElementById('lsdiff-'+id);
  if (!d) return;
  if (s > 0 && e > s) { d.textContent = '= '+(e-s).toLocaleString()+' steps this walk'; d.style.color='var(--accent2)'; }
  else if (e > 0 && e <= s) { d.textContent='End must be greater than start'; d.style.color='var(--danger)'; }
  else d.textContent = '';
}

window.initLogStepsPanel  = initLogStepsPanel;
window.saveLogCustomWalk  = saveLogCustomWalk;
window.changeStepsLogDate = changeStepsLogDate;
window.stepsLogDateOffset = stepsLogDateOffset;
window.stepsLogSetToday   = stepsLogSetToday;
window._lsMode            = _lsMode;
window._lsDiff            = _lsDiff;
window._lsSave            = _lsSave;


// ═══════════════════════════════════════════════════════════
// NUTRITION — stub (full implementation in nutrition.js)
// ═══════════════════════════════════════════════════════════
async function autoPopulateNutritionLog() {
  const today = localDateStr();
  const dateEl = document.getElementById('n-date');
  if (dateEl && !dateEl.value) dateEl.value = today;
  const targetDate = dateEl?.value || today;

  let nutrition = [];
  try { nutrition = await encryptedLoad('nutrition'); } catch(e) {}

  const entry = nutrition.find(n => n.date === targetDate);
  if (!entry) return;

  // Populate meal fields if they exist
  const fields = [
    { cal:'n-bk-cal', prot:'n-bk-prot', carb:'n-bk-carb', fat:'n-bk-fat', food:'n-bk-food', key:'breakfast' },
    { cal:'n-ln-cal', prot:'n-ln-prot', carb:'n-ln-carb', fat:'n-ln-fat', food:'n-ln-food', key:'lunch' },
    { cal:'n-dn-cal', prot:'n-dn-prot', carb:'n-dn-carb', fat:'n-dn-fat', food:'n-dn-food', key:'dinner' },
  ];
  fields.forEach(f => {
    const meal = entry[f.key] || {};
    _setVal(f.cal,  meal.calories || entry.calories || '');
    _setVal(f.prot, meal.protein  || entry.protein  || '');
    _setVal(f.carb, meal.carbs    || entry.carbs    || '');
    _setVal(f.fat,  meal.fat      || entry.fat      || '');
    _setVal(f.food, meal.food     || '');
  });

  if (typeof updateNutritionTotals === 'function') updateNutritionTotals();
  if (typeof loadWaterForDate === 'function') loadWaterForDate(targetDate);
}

function _setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== '') el.value = val;
}

// ═══════════════════════════════════════════════════════════
// EXPOSE GLOBALS
// ═══════════════════════════════════════════════════════════
window.logTab               = logTab;
window.initBodyLog          = initBodyLog;
window.autoPopulateBodyLog  = autoPopulateBodyLog;
window.saveEntry            = saveEntry;
window.showHist             = showHist;
window.clearData            = clearData;
window.reloadLogForDate     = reloadLogForDate;
window.initLogStepsPanel    = initLogStepsPanel;
window.autoPopulateNutritionLog = autoPopulateNutritionLog;
