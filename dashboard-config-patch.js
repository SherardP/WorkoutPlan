// ═══════════════════════════════════════════════════════════
// BODY LOG PATCH — replaces hardcoded fields with dynamic ones
// Drop this into js/logdata.js (or a new js/logdata-patch.js)
// and call patchBodyLog() once after the page loads.
// ═══════════════════════════════════════════════════════════

// ── 1. Inject the config button into the body log header ──
// Call once after sec-log is shown. Idempotent.
function patchBodyLog() {
  // Insert "CONFIGURE" button next to the BODY LOG header if not already there
  const bodyCard = document.querySelector('#log-body .card');
  if (!bodyCard || document.getElementById('body-log-config-btn')) return;

  const header = bodyCard.querySelector('.card-label');
  if (header && !header.querySelector('#body-log-config-btn')) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px;';
    const clone = header.cloneNode(true);
    wrapper.appendChild(clone);
    const configBtn = document.createElement('button');
    configBtn.id = 'body-log-config-btn';
    configBtn.className = 'btn btn-s';
    configBtn.style.fontSize = '0.55rem';
    configBtn.style.padding = '3px 10px';
    configBtn.textContent = '⚙ CONFIGURE MEASUREMENTS';
    configBtn.onclick = openDashConfigurator;
    wrapper.appendChild(configBtn);
    header.replaceWith(wrapper);
  }

  // Replace static field container with dynamic one
  const existing = document.querySelector('#log-body .log-grid');
  if (existing && !document.getElementById('body-log-fields')) {
    const dynContainer = document.createElement('div');
    dynContainer.id = 'body-log-fields';
    existing.replaceWith(dynContainer);
  }

  // Render fields
  renderBodyLogFields();
}

// ── 2. Updated autoPopulateBodyLog ────────────────────────
// Replaces the one in dashboard.js
async function autoPopulateBodyLog() {
  await getDashConfig(); // ensure config loaded
  patchBodyLog();        // ensure fields exist

  const today = localDateStr();
  const dateEl = document.getElementById('b-date');
  if (dateEl && !dateEl.value) dateEl.value = today;
  const targetDate = dateEl?.value || today;

  const body = await encryptedLoad('body');
  const noteEl = document.getElementById('body-prefill-note');

  // Clear all enabled measurement fields
  getEnabledMeasurements().forEach(m => {
    const el   = document.getElementById(`b-${m.id}`);
    const prev = document.getElementById(`b-${m.id}-prev`);
    if (el) { el.value = ''; el.style.color = 'var(--text)'; }
    if (prev) prev.textContent = '';
  });

  if (!body.length) {
    if (noteEl) noteEl.textContent = 'No previous entries found';
    return;
  }

  const exactEntry = body.find(e => e.date === targetDate);
  if (exactEntry) {
    if (noteEl) noteEl.textContent = `✓ Entry for ${targetDate} loaded`;
    populateBodyLogFromEntry(exactEntry);
  } else {
    const prev = body.find(e => e.date < targetDate) || body[0];
    if (!prev) { if (noteEl) noteEl.textContent = 'No previous entries to pre-fill from'; return; }
    if (noteEl) noteEl.textContent = `Pre-filled from ${prev.date} — update any values that changed`;
    prefillBodyLogFromPrev(prev, targetDate);
  }
}

// ── 3. Updated saveEntry for body — uses collectBodyLogValues ──
// Call saveBodyEntry() instead of saveEntry('body') — or
// rename saveEntry inside logdata.js to use collectBodyLogValues
async function saveBodyEntry() {
  await getDashConfig();
  const dateEl = document.getElementById('b-date');
  const date   = dateEl?.value || localDateStr();
  const values = collectBodyLogValues();

  if (!Object.keys(values).length) {
    toast('⚠ NO DATA — Enter at least one measurement');
    return;
  }

  const entry = { date, ...values };

  // Load existing body data, replace or push
  const body = await encryptedLoad('body');
  const idx  = body.findIndex(e => e.date === date);
  if (idx >= 0) body[idx] = entry;
  else body.unshift(entry);
  body.sort((a, b) => b.date.localeCompare(a.date));
  await encryptedSave('body', body);

  toast('✓ BODY METRICS SAVED');
  const noteEl = document.getElementById('body-prefill-note');
  if (noteEl) { noteEl.style.color = '#4caf50'; noteEl.textContent = `✓ Saved for ${date}`; }
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD PATCH — adds config button + uses dashConfig
// to filter which KPI cards render.
// ═══════════════════════════════════════════════════════════

// Injects the ⚙ Configure button into the dashboard header area
function injectDashConfigButton() {
  const sub = document.getElementById('dashboardSub');
  if (!sub || document.getElementById('dash-config-open-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'dash-config-open-btn';
  btn.className = 'btn btn-s';
  btn.style.cssText = 'font-size:0.58rem;padding:4px 12px;margin-left:12px;border-color:var(--border2);color:var(--text-dim);';
  btn.textContent = '⚙ CONFIGURE';
  btn.onclick = openDashConfigurator;
  sub.parentNode.insertBefore(btn, sub.nextSibling);
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD KPI CARD BUILDER — config-aware version
// Replace the Today's Snapshot grid in dashboard.js with this
// ═══════════════════════════════════════════════════════════
function buildConfiguredKpiCards(params) {
  // params mirrors what _renderLogSummaryInner computes:
  const {
    todayCalsBurned, todayCalsEaten, todayCalDeficit, todayWorkout,
    todaySteps, todayNutrition, bmi, streak, consistencyPct,
    totalSessions, weeksTraining, avgSteps7d, stepHitPct,
    wtChange, waistChange, latestWeight, latestWaist,
    avgSleep, avgStress, body,
  } = params;

  const visible = cardId => isDashCardVisible(cardId);

  // Map of cardId → card HTML string
  const cardMap = {
    'card-calories-burned': visible('card-calories-burned') && todayCalsBurned ? `
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🔥 CALORIES BURNED</div>
        <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--accent2);">${todayCalsBurned.toLocaleString()}</div>
        <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">${todayWorkout && todaySteps ? 'workout + steps' : todayWorkout ? 'workout est.' : 'steps only'}</div>
      </div>` : '',

    'card-calories-eaten': visible('card-calories-eaten') && todayCalsEaten ? `
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🍽 CALORIES EATEN</div>
        <div style="font-family:var(--font-display);font-size:1.5rem;color:#ff9800;">${todayCalsEaten.toLocaleString()}</div>
        <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">nutrition logged</div>
      </div>` : '',

    'card-net-balance': visible('card-net-balance') && todayCalDeficit !== null ? `
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">⚖️ NET BALANCE</div>
        <div style="font-family:var(--font-display);font-size:1.5rem;color:${todayCalDeficit>0?'#4caf50':'#f44336'};">
          ${todayCalDeficit>0?'−':'+'}${Math.abs(todayCalDeficit).toLocaleString()}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.48rem;color:${todayCalDeficit>0?'#4caf50':'#f44336'};">
          ${todayCalDeficit>0?'✓ calorie deficit':'↑ calorie surplus'}
        </div>
      </div>` : '',

    'card-workout': visible('card-workout') ? (todayWorkout ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid #4caf5033;">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:#4caf50;letter-spacing:.1em;margin-bottom:3px;">✓ WORKOUT</div>
        <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);line-height:1.3;">${(todayWorkout.day||'Session').split('—')[0].trim()}</div>
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);">${todayWorkout.duration||'—'} min · E:${todayWorkout.energy||'—'}/10</div>
      </div>` : `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">WORKOUT</div>
        <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">Not logged</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent);cursor:pointer;" onclick="nav('workout')">→ Go log it</div>
      </div>`) : '',

    'card-steps': visible('card-steps') ? (todaySteps ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid ${(+todaySteps.total||0)>=(userGoals.stepGoal||10000)?'#4caf5033':'var(--border)'};">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">👣 STEPS</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${(+todaySteps.total||0)>=(userGoals.stepGoal||10000)?'#4caf50':'var(--accent2)'};">${(+todaySteps.total||0).toLocaleString()}</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">${(+todaySteps.total||0)>=(userGoals.stepGoal||10000)?'✓ goal hit':'of '+(userGoals.stepGoal||10000).toLocaleString()}</div>
      </div>` : `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">👣 STEPS</div>
        <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">Not logged</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent);cursor:pointer;" onclick="nav('log');setTimeout(()=>logTab('steps'),100);">→ Go log it</div>
      </div>`) : '',

    'card-protein': visible('card-protein') ? (todayNutrition ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🥩 PROTEIN</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${+todayNutrition.protein>=150?'#4caf50':'#ff9800'}">${todayNutrition.protein||'—'}g</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">carbs: ${todayNutrition.carbs||'—'}g · fat: ${todayNutrition.fat||'—'}g</div>
      </div>` : '') : '',

    'card-water': visible('card-water') ? (todayNutrition ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid ${+todayNutrition.water>=96?'#64b5f633':'var(--border)'};">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">💧 WATER</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${+todayNutrition.water>=96?'#64b5f6':'#ff9800'}">${todayNutrition.water||'—'} oz</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">${+todayNutrition.water>=96?'✓ hydrated':'goal: 96 oz'}</div>
      </div>` : '') : '',

    'card-bmi': visible('card-bmi') && bmi ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">⚖️ BMI</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${bmi<25?'#4caf50':bmi<30?'#ff9800':'#f44336'}">${bmi.toFixed(1)}</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">${bmi<25?'Normal':bmi<30?'Overweight':'Obese'} · ${SESSION.weight||'?'} lbs</div>
      </div>` : '',

    'card-streak': visible('card-streak') && streak > 0 ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid ${streak>=7?'#4caf5033':'var(--border)'};">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🔥 STREAK</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${streak>=14?'#ffd700':streak>=7?'#4caf50':streak>=3?'#ff9800':'var(--accent2)'};">${streak}<span style="font-size:0.8rem;"> ${streak===1?'day':'days'}</span></div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">${streak>=14?'Elite 🏆':streak>=7?'Keep going':streak>=3?'Building':'Day '+streak}</div>
      </div>` : '',

    'card-consistency': visible('card-consistency') && consistencyPct > 0 ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">✓ CONSISTENCY</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${consistencyPct>=80?'#4caf50':consistencyPct>=60?'#ff9800':'#f44336'}">${consistencyPct}%</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">${totalSessions} sessions · ${weeksTraining} wks</div>
      </div>` : '',

    'card-steps-7d': visible('card-steps-7d') && avgSteps7d > 0 ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">📊 7-DAY AVG</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${avgSteps7d>=(userGoals.stepGoal||10000)?'#4caf50':'#ff9800'}">${avgSteps7d>=1000?(avgSteps7d/1000).toFixed(1)+'k':avgSteps7d}</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">steps/day avg</div>
      </div>` : '',

    'card-step-rate': visible('card-step-rate') && stepHitPct > 0 ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🎯 STEP RATE</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${stepHitPct>=70?'#4caf50':'#ff9800'}">${stepHitPct}%</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">goal hit days</div>
      </div>` : '',

    'card-weight-delta': visible('card-weight-delta') && wtChange !== null ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">WEIGHT Δ</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${wtChange<0?'#4caf50':wtChange>0?'#ff9800':'var(--text)'};">${wtChange>0?'+':''}${wtChange} lbs</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">since start · ${latestWeight?.weight||'?'} lbs now</div>
      </div>` : '',

    'card-waist-delta': visible('card-waist-delta') && waistChange !== null ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">📏 WAIST Δ</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${waistChange<0?'#4caf50':waistChange>0?'#ff9800':'var(--text)'};">${waistChange>0?'+':''}${waistChange}"</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">since start · ${latestWaist?.waist||'?'}" now</div>
      </div>` : '',

    'card-sleep': visible('card-sleep') && avgSleep ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">😴 AVG SLEEP</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${+avgSleep>=7?'#4caf50':+avgSleep>=6?'#ff9800':'#f44336'}">${avgSleep}h</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">14-day avg</div>
      </div>` : '',

    'card-stress': visible('card-stress') && avgStress ? `
      <div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">🧠 AVG STRESS</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:${+avgStress<=4?'#4caf50':+avgStress<=6?'#ff9800':'#f44336'}">${avgStress}<span style="font-size:0.7rem;">/10</span></div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">14-day avg</div>
      </div>` : '',

    // Muscle deltas — driven by buildMeasurementDeltaCard helper
    'card-biceps-delta':    buildMeasurementDeltaCard('biceps',    body),
    'card-triceps-delta':   buildMeasurementDeltaCard('triceps',   body),
    'card-forearms-delta':  buildMeasurementDeltaCard('forearms',  body),
    'card-calves-delta':    buildMeasurementDeltaCard('calves',    body),
    'card-shoulders-delta': buildMeasurementDeltaCard('shoulders', body),
    'card-quads-delta':     buildMeasurementDeltaCard('quads',     body),
    'card-chest-m-delta':   buildMeasurementDeltaCard('chest_flex',body),
    'card-chest-delta':     buildMeasurementDeltaCard('chest',     body),
    'card-hips-delta':      buildMeasurementDeltaCard('hips',      body),
    'card-neck-delta':      buildMeasurementDeltaCard('neck',      body),
    'card-glutes-delta':    buildMeasurementDeltaCard('glutes',    body),
    'card-thighs-delta':    buildMeasurementDeltaCard('thighs',    body),
  };

  // Render all custom measurement deltas too
  const cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  (cfg.customMeasurements || []).forEach(c => {
    cardMap[`card-${c.id}-delta`] = buildMeasurementDeltaCard(c.id, body);
  });

  // Render in order, filtering empties
  return Object.values(cardMap).filter(Boolean).join('');
}

window.patchBodyLog            = patchBodyLog;
window.autoPopulateBodyLog     = autoPopulateBodyLog;
window.saveBodyEntry           = saveBodyEntry;
window.injectDashConfigButton  = injectDashConfigButton;
window.buildConfiguredKpiCards = buildConfiguredKpiCards;
