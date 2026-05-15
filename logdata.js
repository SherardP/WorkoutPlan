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
// STEPS LOG TAB INIT
// ═══════════════════════════════════════════════════════════
function initLogStepsPanel() {
  const dateEl = document.getElementById('steps-log-date');
  if (dateEl && !dateEl.value) dateEl.value = localDateStr();
  if (typeof renderLogStepSections === 'function') renderLogStepSections();
  if (typeof updateLogStepRing === 'function') updateLogStepRing();
}

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
