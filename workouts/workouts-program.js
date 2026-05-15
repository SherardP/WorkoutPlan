// =============================================
// workouts-program.js - Program Generation Wizard
// =============================================
// NOTE: The actual generateProgram() engine lives in workouts-core.js.
// This file handles ONLY the wizard UI → userGoals → generateProgram() call chain.

// ─── Wizard state ───────────────────────────────────────────
let programWizardData = {};

// ─── Entry point ────────────────────────────────────────────
function confirmGenerateProgram() {
    // Close any existing wizard
    const existing = document.getElementById('program-wizard-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'program-wizard-modal';
    modal.style.cssText = [
        'position:fixed;top:0;left:0;width:100%;height:100%;',
        'background:rgba(0,0,0,0.92);z-index:9000;overflow-y:auto;',
        'padding:20px;display:flex;align-items:flex-start;justify-content:center;'
    ].join('');

    modal.innerHTML = `
        <div style="max-width:580px;width:100%;background:var(--bg2);border:2px solid var(--accent2);
                    padding:28px;margin:auto;">
            <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--accent2);
                        letter-spacing:.06em;margin-bottom:6px;">⚡ PROGRAM BUILDER</div>
            <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);
                        margin-bottom:24px;letter-spacing:.1em;">
                5 QUICK QUESTIONS — PROGRAM GENERATED TO YOUR GOALS
            </div>
            <div id="wizard-content"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Seed wizard data from current userGoals so existing settings aren't lost
    programWizardData = {
        timeOfDay:  'varies',
        habitLevel: 'solid',
        split:      (userGoals && userGoals.preferredSplit) || 'auto',
        recovery:   'fresh',
        struggle:   'results'
    };

    showWizardStep(1);
}

// ─── Step renderer ───────────────────────────────────────────
function showWizardStep(step) {
    const content = document.getElementById('wizard-content');
    if (!content) return;

    const stepHtml = {
        1: `
            <div class="wiz-q">WHEN DO YOU USUALLY TRAIN?</div>
            <div class="wiz-opts">
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('timeOfDay','morning',this)">
                    🌅 Morning
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('timeOfDay','midday',this)">
                    ☀️ Midday
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('timeOfDay','evening',this)">
                    🌙 Evening
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('timeOfDay','varies',this)">
                    🔀 Varies
                </button>
            </div>
        `,
        2: `
            <div class="wiz-q">HOW CONSISTENT IS YOUR TRAINING HABIT?</div>
            <div class="wiz-opts">
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('habitLevel','new',this)">
                    🌱 Just starting out
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('habitLevel','onoff',this)">
                    📉 On-and-off
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('habitLevel','solid',this)">
                    💪 Pretty consistent
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('habitLevel','advanced',this)">
                    🎖️ Very advanced / athlete
                </button>
            </div>
        `,
        3: `
            <div class="wiz-q">PREFERRED TRAINING SPLIT?</div>
            <div class="wiz-opts">
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('split','auto',this)">
                    🤖 Auto (recommended)
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('split','upper_lower',this)">
                    ↕️ Upper / Lower
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('split','ppl',this)">
                    🔄 Push / Pull / Legs
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('split','fullbody',this)">
                    🏋️ Full Body
                </button>
            </div>
        `,
        4: `
            <div class="wiz-q">HOW DO YOU FEEL GOING INTO WORKOUTS?</div>
            <div class="wiz-opts">
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('recovery','fresh',this)">
                    ✅ Fresh and recovered
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('recovery','sore',this)">
                    😬 Often sore
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('recovery','tired',this)">
                    😴 Tired / stressed
                </button>
            </div>
        `,
        5: `
            <div class="wiz-q">WHAT'S YOUR BIGGEST STRUGGLE?</div>
            <div class="wiz-opts">
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('struggle','results',this)">
                    📊 Not seeing results
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('struggle','motivation',this)">
                    🔥 Staying motivated
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('struggle','time',this)">
                    ⏱️ Not enough time
                </button>
                <button class="btn btn-s wiz-opt" onclick="selectWizardOption('struggle','technique',this)">
                    🎯 Technique / form
                </button>
            </div>
        `,
    };

    const isLast = step === 5;
    const isFirst = step === 1;

    content.innerHTML = `
        <style>
            .wiz-progress { display:flex; gap:6px; margin-bottom:20px; }
            .wiz-progress-dot {
                flex:1; height:4px; border-radius:2px;
                background:var(--bg3); border:1px solid var(--border);
            }
            .wiz-progress-dot.done { background:var(--accent2); }
            .wiz-step-label {
                font-family:var(--font-mono); font-size:0.6rem;
                color:var(--text-dim); letter-spacing:.15em; margin-bottom:14px;
            }
            .wiz-q {
                font-family:var(--font-mono); font-size:0.85rem;
                color:var(--text); letter-spacing:.05em;
                margin-bottom:18px; line-height:1.5;
            }
            .wiz-opts { display:grid; gap:10px; margin-bottom:24px; }
            .wiz-opts .btn { text-align:left; padding:12px 16px; font-size:0.75rem; }
            .wiz-opts .btn.selected {
                background:var(--accent-dim);
                border-color:var(--accent2);
                color:var(--accent2);
            }
            .wiz-nav { display:flex; gap:10px; }
            .wiz-nav .btn { flex:1; }
        </style>

        <div class="wiz-progress">
            ${[1,2,3,4,5].map(i => `<div class="wiz-progress-dot ${i <= step ? 'done' : ''}"></div>`).join('')}
        </div>
        <div class="wiz-step-label">STEP ${step} OF 5</div>

        ${stepHtml[step] || ''}

        <div class="wiz-nav">
            ${!isFirst
                ? `<button class="btn btn-s" onclick="showWizardStep(${step - 1})" style="flex:0.4;">← Back</button>`
                : `<button class="btn btn-s" onclick="closeWizard()" style="flex:0.4;">Cancel</button>`}
            ${!isLast
                ? `<button class="btn btn-p" onclick="showWizardStep(${step + 1})">Continue →</button>`
                : `<button class="btn btn-p" id="wiz-generate-btn" onclick="finishProgramGeneration()">
                       ⚡ GENERATE MY PROGRAM
                   </button>`}
        </div>
    `;

    // Re-highlight any already-selected option for this step
    const keyMap = {1:'timeOfDay', 2:'habitLevel', 3:'split', 4:'recovery', 5:'struggle'};
    const key = keyMap[step];
    if (key && programWizardData[key]) {
        content.querySelectorAll('.wiz-opt').forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${programWizardData[key]}'`)) {
                btn.classList.add('selected');
            }
        });
    }
}

// ─── Option selection ─────────────────────────────────────────
function selectWizardOption(key, value, btnEl) {
    programWizardData[key] = value;

    // Highlight selection
    if (btnEl && btnEl.closest) {
        btnEl.closest('.wiz-opts').querySelectorAll('.wiz-opt').forEach(b => b.classList.remove('selected'));
        btnEl.classList.add('selected');
    }
}

// ─── Navigation ───────────────────────────────────────────────
function nextWizardStep(step) {
    showWizardStep(step);
}

function closeWizard() {
    const modal = document.getElementById('program-wizard-modal');
    if (modal) modal.remove();
}

// ─── Finish: apply wizard data to userGoals, then run the real generator ──
async function finishProgramGeneration() {
    const btn = document.getElementById('wiz-generate-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Generating...';
    }

    try {
        // ── Map wizard answers → userGoals flags ──────────────────
        if (!userGoals) window.userGoals = {};

        // Time of day → special flags
        const flags = userGoals.specialFlags ? [...userGoals.specialFlags] : [];
        const removeFlag = f => { const i = flags.indexOf(f); if (i !== -1) flags.splice(i, 1); };

        removeFlag('flag-morning'); removeFlag('flag-evening');
        if (programWizardData.timeOfDay === 'morning') flags.push('flag-morning');
        if (programWizardData.timeOfDay === 'evening') flags.push('flag-evening');

        // Habit level → beginner / advanced / on-off flags
        removeFlag('flag-beginner'); removeFlag('flag-advanced'); removeFlag('flag-onoff');
        if (programWizardData.habitLevel === 'new')      flags.push('flag-beginner');
        if (programWizardData.habitLevel === 'advanced') flags.push('flag-advanced');
        if (programWizardData.habitLevel === 'onoff')    flags.push('flag-onoff');

        // Recovery → sore / cortisol flags
        removeFlag('flag-lowvolume'); removeFlag('flag-cortisol');
        if (programWizardData.recovery === 'sore')  flags.push('flag-lowvolume');
        if (programWizardData.recovery === 'tired') flags.push('flag-cortisol');

        // Struggle → results flag
        removeFlag('flag-struggle-results');
        if (programWizardData.struggle === 'results') flags.push('flag-struggle-results');

        userGoals.specialFlags    = flags;
        userGoals.preferredSplit  = programWizardData.split || 'auto';

        // ── Run the real generator from workouts-core.js ──────────
        if (typeof generateProgram !== 'function') {
            throw new Error('generateProgram() not found — make sure workouts-core.js is loaded first.');
        }

        const program = generateProgram();

        if (!program || !program.days) {
            throw new Error('generateProgram() returned empty result. Check userGoals setup.');
        }

        // Save to Firebase
        await saveGeneratedProgram(program);
        SESSION._program = program;

        // Update the subtitle
        const workoutSub = document.getElementById('workoutSub');
        if (workoutSub) {
            workoutSub.textContent = `// ${program.splitLabel.toUpperCase()} — GENERATED PROGRAM //`;
        }
        const genEl = document.getElementById('programGeneratedAt');
        if (genEl) {
            const d = new Date(program.generatedAt);
            genEl.textContent = `Generated ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
        }

        closeWizard();

        // Show today's workout day
        const day = (typeof todayDayId === 'function') ? todayDayId() : 'mon';
        showWorkoutDay(day === 'sun' ? 'mon' : day);

        if (typeof toast === 'function') toast('✓ Program generated and saved!', 2500);

    } catch(e) {
        console.error('finishProgramGeneration error:', e);
        if (btn) {
            btn.disabled = false;
            btn.textContent = '⚡ GENERATE MY PROGRAM';
        }
        alert('Error generating program: ' + e.message);
    }
}

// ─── Expose to global scope ───────────────────────────────────
window.confirmGenerateProgram  = confirmGenerateProgram;
window.showWizardStep          = showWizardStep;
window.selectWizardOption      = selectWizardOption;
window.nextWizardStep          = nextWizardStep;
window.closeWizard             = closeWizard;
window.finishProgramGeneration = finishProgramGeneration;
window.restoreBackupProgram    = restoreBackupProgram;


// ═══════════════════════════════════════════════════════════
// STEPS TAB — goal-aware recommendation (unchanged)
// ═══════════════════════════════════════════════════════════
function renderStepsTabRecommendation() {
  const card    = document.getElementById('stepsTabRecommendation');
  const urgEl   = document.getElementById('stepsRecUrgency');
  const targetEl= document.getElementById('stepsRecTarget');
  const whyEl   = document.getElementById('stepsRecWhy');
  const applyBtn= document.getElementById('stepsRecApplyBtn');
  if (!card) return;

  const priority = userGoals?.focusPriority || userGoals?.trainingFocus || [];
  let rec = null;
  for (const fid of priority) {
    if (typeof STEP_RECS !== 'undefined' && STEP_RECS[fid]) {
      rec = { ...STEP_RECS[fid], focusId: fid }; break;
    }
  }

  if (!rec) { card.style.display = 'none'; return; }

  card.style.display = 'block';
  urgEl.textContent   = rec.urgency + '  ' + ((typeof GOAL_ACTIONS !== 'undefined' && GOAL_ACTIONS[rec.focusId]?.label) || '');
  targetEl.textContent= rec.label;
  whyEl.textContent   = rec.why;
  applyBtn.textContent= `⭐ SET GOAL TO ${rec.steps.toLocaleString()} STEPS`;
  applyBtn.onclick = () => {
    if (typeof setStepPreset === 'function') setStepPreset(rec.steps);
    const ci = document.getElementById('goalStepCustom');
    if (ci) ci.value = rec.steps;
    applyBtn.textContent = '✓ GOAL UPDATED';
    applyBtn.style.background = 'var(--success)';
    setTimeout(() => {
      applyBtn.textContent = `⭐ SET GOAL TO ${rec.steps.toLocaleString()} STEPS`;
      applyBtn.style.background = '';
    }, 2500);
  };
}

// ═══════════════════════════════════════════════════════════
// STEPS TRACKER (unchanged from original)
// ═══════════════════════════════════════════════════════════
async function loadStepsPage() {
  await loadGoals();
  renderStepsTabRecommendation();
  const today = localDateStr();
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('steplog').doc(today).get();
    if (doc.exists) {
      const raw = doc.data().sections || {};
      todayStepData = {};
      for (const [k, v] of Object.entries(raw)) {
        todayStepData[k] = (typeof v === 'object') ? v : { steps: v, startSteps: null, endSteps: null };
      }
    } else { todayStepData = {}; }
  } catch(e) { todayStepData = {}; }
  renderStepSections();
  updateStepProgress();
}

function renderStepSections() {
  const el = document.getElementById('stepSections'); if(!el) return;
  const goal = (userGoals && userGoals.stepGoal) || 10000;

  if (typeof DEFAULT_WALK_SECTIONS === 'undefined') return;

  el.innerHTML = DEFAULT_WALK_SECTIONS.map((s, idx) => {
    const saved = todayStepData[s.id] || {};
    const done = saved.steps || 0;
    const savedStart = saved.startSteps || '';
    const savedEnd = saved.endSteps || '';
    const target = Math.round(goal * s.pct);
    const pct = Math.min(100, Math.round(done / target * 100));
    const complete = done >= target;

    const prevSection = idx > 0 ? DEFAULT_WALK_SECTIONS[idx - 1] : null;
    const prevEnd = prevSection ? (todayStepData[prevSection.id]?.endSteps || '') : '';
    const autoStart = savedStart || prevEnd;

    return `<div class="card mb16" id="stepcard-${s.id}"
      style="border-left:4px solid ${complete?'#4caf50':s.star?'var(--accent2)':'var(--border)'};">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
        <div style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;color:${s.star?'var(--accent2)':'var(--text)'};letter-spacing:.1em;">
          ${s.star?'⭐ ':''}${s.label}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.65rem;color:${complete?'#4caf50':'var(--text-dim)'};">
          ${done.toLocaleString()} / ${target.toLocaleString()} steps
        </div>
      </div>
      <div style="height:4px;background:var(--bg3);border-radius:2px;margin-bottom:14px;">
        <div style="height:100%;width:${pct}%;background:${complete?'#4caf50':'var(--accent2)'};border-radius:2px;transition:width 0.5s;"></div>
      </div>
      <div style="display:flex;gap:0;margin-bottom:12px;border:1px solid var(--border);overflow:hidden;">
        <button id="modetab-total-${s.id}" onclick="switchStepMode('${s.id}','total')"
          style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:.1em;cursor:pointer;border:none;background:var(--bg3);color:var(--text-dim);border-right:1px solid var(--border);">
          TOTAL STEPS
        </button>
        <button id="modetab-range-${s.id}" onclick="switchStepMode('${s.id}','range')"
          style="flex:1;padding:6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:.1em;cursor:pointer;border:none;background:var(--bg3);color:var(--text-dim);">
          START → END
        </button>
      </div>
      <div id="stepmode-total-${s.id}" style="display:flex;gap:8px;align-items:center;">
        <input type="number" id="stepinput-${s.id}" value="${done||''}"
          placeholder="Enter step count for this walk" min="0" max="50000"
          style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);
          font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;">
        <button class="btn btn-p" onclick="saveStepSection('${s.id}','total')"
          style="white-space:nowrap;font-size:0.65rem;padding:9px 14px;">
          ${complete?'✓ UPDATE':'SAVE'}
        </button>
      </div>
      <div id="stepmode-range-${s.id}" style="display:none;">
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:8px;">
          <div>
            <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">START STEPS</div>
            <input type="number" id="stepstart-${s.id}" value="${autoStart}"
              placeholder="Watch reading at start" min="0"
              oninput="calcStepDiff('${s.id}')"
              style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);
              font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;box-sizing:border-box;">
          </div>
          <div style="font-family:var(--font-display);font-size:1.2rem;color:var(--border2);padding-top:20px;">→</div>
          <div>
            <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">END STEPS</div>
            <input type="number" id="stepend-${s.id}" value="${savedEnd||''}"
              placeholder="Watch reading at end" min="0"
              oninput="calcStepDiff('${s.id}')"
              style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);
              font-family:var(--font-mono);font-size:0.85rem;padding:9px 10px;outline:none;box-sizing:border-box;">
          </div>
        </div>
        <div id="stepdiff-${s.id}" style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent2);
          text-align:center;margin-bottom:8px;min-height:18px;">
          ${savedStart && savedEnd ? `= ${(savedEnd - savedStart).toLocaleString()} steps this walk` : ''}
        </div>
        <button class="btn btn-p" onclick="saveStepSection('${s.id}','range')"
          style="width:100%;font-size:0.65rem;padding:9px;">
          ${complete?'✓ UPDATE':'SAVE WALK'}
        </button>
      </div>
      ${complete ? `<div style="font-family:var(--font-mono);font-size:0.62rem;color:#4caf50;margin-top:8px;text-align:center;">✓ SECTION TARGET MET</div>` : ''}
    </div>`;
  }).join('');

  DEFAULT_WALK_SECTIONS.forEach(s => {
    const saved = todayStepData[s.id] || {};
    const hasRange = saved.startSteps || saved.endSteps;
    if (hasRange) switchStepMode(s.id, 'range', false);
    else highlightModeTab(s.id, 'total');
  });
}

function switchStepMode(sectionId, mode, highlight=true) {
  const totalPanel = document.getElementById(`stepmode-total-${sectionId}`);
  const rangePanel = document.getElementById(`stepmode-range-${sectionId}`);
  if (totalPanel) totalPanel.style.display = mode==='total' ? 'flex' : 'none';
  if (rangePanel) rangePanel.style.display = mode==='range' ? 'block' : 'none';
  if (highlight) highlightModeTab(sectionId, mode);
}

function highlightModeTab(sectionId, activeMode) {
  ['total','range'].forEach(m => {
    const btn = document.getElementById(`modetab-${m}-${sectionId}`);
    if (!btn) return;
    btn.style.background = m===activeMode ? 'var(--accent-dim)' : 'var(--bg3)';
    btn.style.color = m===activeMode ? 'var(--accent2)' : 'var(--text-dim)';
  });
}

function calcStepDiff(sectionId) {
  const startEl = document.getElementById(`stepstart-${sectionId}`);
  const endEl = document.getElementById(`stepend-${sectionId}`);
  const diffEl = document.getElementById(`stepdiff-${sectionId}`);
  if (!startEl || !endEl || !diffEl) return;
  const start = parseInt(startEl.value) || 0;
  const end = parseInt(endEl.value) || 0;
  if (start > 0 && end > start) {
    diffEl.textContent = `= ${(end - start).toLocaleString()} steps this walk`;
    diffEl.style.color = 'var(--accent2)';
  } else if (end > 0 && end <= start) {
    diffEl.textContent = 'End steps must be greater than start steps';
    diffEl.style.color = 'var(--danger)';
  } else {
    diffEl.textContent = '';
  }
}

async function saveStepSection(sectionId, mode) {
  if (typeof DEFAULT_WALK_SECTIONS === 'undefined') return;
  let steps = 0, startSteps = null, endSteps = null;

  if (mode === 'range') {
    startSteps = parseInt(document.getElementById(`stepstart-${sectionId}`)?.value) || 0;
    endSteps   = parseInt(document.getElementById(`stepend-${sectionId}`)?.value)   || 0;
    if (endSteps <= startSteps) { if (typeof toast==='function') toast('END STEPS MUST BE GREATER THAN START STEPS'); return; }
    steps = endSteps - startSteps;
  } else {
    steps = parseInt(document.getElementById(`stepinput-${sectionId}`)?.value) || 0;
  }

  todayStepData[sectionId] = { steps, startSteps, endSteps };

  if (mode === 'range' && endSteps) {
    const idx = DEFAULT_WALK_SECTIONS.findIndex(s => s.id === sectionId);
    const next = DEFAULT_WALK_SECTIONS[idx + 1];
    if (next && !todayStepData[next.id]?.startSteps) {
      const nextStartEl = document.getElementById(`stepstart-${next.id}`);
      if (nextStartEl) nextStartEl.value = endSteps;
    }
  }

  const today = localDateStr();
  const total = DEFAULT_WALK_SECTIONS.reduce((sum, s) => sum + (todayStepData[s.id]?.steps || 0), 0);

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

    renderStepSections();
    if (typeof updateStepProgress === 'function') updateStepProgress();
    if (typeof loadStats === 'function') loadStats();
    const label = DEFAULT_WALK_SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
    if (typeof toast === 'function') toast(`✓ ${label} SAVED — ${steps.toLocaleString()} STEPS`);
  } catch(e) {
    if (typeof toast === 'function') toast('ERROR: ' + e.message);
  }
}
