// ═══════════════════════════════════════════════════════════
// AI PROMPT GENERATOR — AdaptFit AI
// Builds a fully-populated prompt from the current user's
// SESSION and userGoals data, ready to paste into any AI.
// ═══════════════════════════════════════════════════════════

// ── Equipment label map ─────────────────────────────────────
const EQUIPMENT_LABELS = {
  // Dumbbells / Kettlebells rendered separately (dynamic weights)
  // Barbells
  'bar-standard':   'Standard Barbell (45 lb)',
  'bar-ez':         'EZ Curl Bar',
  'bar-trap':       'Trap Bar / Hex Bar',
  'bar-safety':     'Safety Squat Bar',
  // Plates
  'plates':         'Weight Plates',
  'plate-2.5':      '2.5 lb plates',
  'plate-5':        '5 lb plates',
  'plate-10':       '10 lb plates',
  'plate-25':       '25 lb plates',
  'plate-35':       '35 lb plates',
  'plate-45':       '45 lb plates',
  // Benches & Racks
  'bench-flat':     'Flat Bench',
  'bench-adjustable':'Adjustable / Incline Bench',
  'rack-squat':     'Squat Rack / Power Rack',
  'rack-smith':     'Smith Machine',
  // Machines
  'machine-cable':  'Cable Machine / Functional Trainer',
  'machine-lat':    'Lat Pulldown Machine',
  'machine-row':    'Seated Row Machine',
  'machine-leg-press':'Leg Press Machine',
  'machine-leg-curl':'Leg Curl Machine',
  'machine-leg-ext':'Leg Extension Machine',
  'machine-chest-press':'Chest Press Machine',
  'machine-shoulder-press':'Shoulder Press Machine',
  'machine-pec-deck':'Pec Deck / Chest Fly Machine',
  'machine-assisted-pullup':'Assisted Pull-Up Machine',
  'machine-smith':  'Smith Machine',
  // Cardio
  'cardio-treadmill':'Treadmill',
  'cardio-bike':    'Stationary Bike',
  'cardio-elliptical':'Elliptical',
  'cardio-rower':   'Rowing Machine',
  'cardio-skierg':  'SkiErg',
  'cardio-stairmaster':'StairMaster',
  'cardio-airbike': 'Air Bike / Assault Bike',
  'cardio-jump-rope':'Jump Rope',
  // Accessories
  'acc-pullup-bar': 'Pull-Up Bar',
  'acc-dip-bar':    'Dip Bars / Parallel Bars',
  'acc-resistance-bands':'Resistance Bands',
  'acc-ab-wheel':   'Ab Wheel',
  'acc-foam-roller':'Foam Roller',
  'acc-yoga-mat':   'Yoga Mat / Exercise Mat',
  'acc-trx':        'TRX / Suspension Trainer',
  'acc-box':        'Plyo Box / Step Platform',
  'acc-sled':       'Sled / Push Sled',
  'acc-battle-rope':'Battle Ropes',
  'acc-medicine-ball':'Medicine Ball',
  'acc-stability-ball':'Stability / Swiss Ball',
  'acc-landmine':   'Landmine Attachment',
  'acc-dipbelt':    'Dip Belt (weighted)',
  'acc-weightbelt': 'Lifting Belt',
  'acc-straps':     'Lifting Straps',
};

// ── Format equipment list from SESSION.equipment ─────────────
function formatEquipmentList(equipment) {
  if (!equipment) return 'Bodyweight only (no equipment listed)';
  const lines = [];

  // Dumbbells
  if (equipment.dumbbells && equipment.dumbbells.length) {
    const pairs = equipment.dumbbells
      .map(d => `${d.weight} lb${d.qty > 1 ? ` ×${d.qty} pairs` : ''}`)
      .join(', ');
    lines.push(`Dumbbells: ${pairs}`);
  }

  // Kettlebells
  if (equipment.kettlebells && equipment.kettlebells.length) {
    const kbs = equipment.kettlebells
      .map(k => `${k.weight} lb`)
      .join(', ');
    lines.push(`Kettlebells: ${kbs}`);
  }

  // Everything else — from flat boolean flags
  const other = [];
  for (const [key, val] of Object.entries(equipment)) {
    if (key === 'dumbbells' || key === 'kettlebells') continue;
    if (val === true && EQUIPMENT_LABELS[key]) {
      other.push(EQUIPMENT_LABELS[key]);
    }
  }

  // Plate sizes
  if (equipment.plates) {
    const plateSizes = ['2.5','5','10','25','35','45']
      .filter(s => equipment['plate-' + s])
      .map(s => s + ' lb');
    if (plateSizes.length) other.push(`Weight Plates (${plateSizes.join(', ')})`);
    else other.push('Weight Plates (sizes not specified)');
  }

  if (other.length) lines.push(...other);
  return lines.length ? lines.join('\n  ') : 'Bodyweight only (no equipment listed)';
}

// ── Format training focus ranked list ────────────────────────
function formatTrainingFocus(userGoals) {
  const priority = userGoals.focusPriority || userGoals.trainingFocus || [];
  if (!priority.length) return 'Not specified';
  return priority.map((id, i) => {
    const opt = TRAINING_FOCUS_OPTIONS.find(o => o.id === id);
    return `  ${i + 1}. ${opt ? opt.label : id}`;
  }).join('\n');
}

// ── Format special flags ─────────────────────────────────────
function formatSpecialFlags(userGoals) {
  const flags = userGoals.specialFlags || [];
  if (!flags.length) return 'None';
  return flags.map(id => {
    const opt = SPECIAL_FLAG_OPTIONS.find(o => o.id === id);
    return opt ? `${opt.icon} ${opt.label}` : id;
  }).join(', ');
}

// ── Format muscle goals ──────────────────────────────────────
function formatMuscleGoals(userGoals) {
  const priority  = userGoals.musclePriority  || [];
  const bpGoals   = userGoals.bodyPartGoals   || {};

  const lines = [];

  // Priority muscles first
  if (priority.length) {
    lines.push('Priority muscles (ranked — gets the most exercises):');
    priority.forEach((muscleId, i) => {
      const bp     = BODY_PARTS.find(b => b.id === 'bp-' + muscleId);
      const label  = bp ? bp.label : muscleId;
      const goalId = bpGoals['bp-' + muscleId] || 'none';
      const gt     = BP_GOAL_TYPES.find(g => g.id === goalId);
      const gLabel = gt && gt.id !== 'none' ? ` [Goal: ${gt.label}]` : '';
      lines.push(`  #${i + 1} ${label}${gLabel}`);
    });
  }

  // Non-priority muscles that have a goal set
  const nonPriority = BODY_PARTS.filter(bp => {
    const muscleId = bp.id.replace('bp-', '');
    const goalId   = bpGoals[bp.id] || 'none';
    return !priority.includes(muscleId) && goalId !== 'none';
  });

  if (nonPriority.length) {
    if (lines.length) lines.push('');
    lines.push('Other muscle goals:');
    nonPriority.forEach(bp => {
      const goalId = bpGoals[bp.id];
      const gt     = BP_GOAL_TYPES.find(g => g.id === goalId);
      if (gt) lines.push(`  ${bp.label}: ${gt.label} — ${gt.desc}`);
    });
  }

  return lines.length ? lines.join('\n') : 'No specific muscle goals set';
}

// ── Wizard answer labels ─────────────────────────────────────
function formatWizAnswer(field, value) {
  const maps = {
    time: {
      morning: 'Morning (before 10am) — cortisol naturally high, longer warm-up needed',
      midday:  'Midday (10am–2pm) — peak performance window',
      evening: 'Evening (after 5pm) — cortisol low, great for strength',
      varies:  'Varies — no time-specific adjustments',
    },
    habit: {
      new:    'Just getting started (under 3 months) — habit not locked in yet',
      onoff:  'On and off for a while — knows movements but keeps falling off',
      solid:  'Pretty consistent (6+ months) — habit is solid',
      locked: 'Years of consistent training — fully locked in',
    },
    recovery: {
      fresh: 'Recovers well — ready each session',
      sore:  'Gets sore and stays sore — needs more recovery time',
      tired: 'Often tired or stressed — high life stress / poor sleep',
    },
    struggle: {
      consistency: 'Staying consistent',
      results:     'Not seeing results',
      intensity:   'Not pushing hard enough',
      injury:      'Getting hurt or having pain',
      time:        'Not enough time',
    },
  };
  const map = maps[field] || {};
  return map[value] || value || 'Not specified';
}

// ── Build the full prompt string ─────────────────────────────
function buildAIPrompt() {
  if (!SESSION) return 'ERROR: Not logged in.';

  const goals = typeof userGoals !== 'undefined' ? userGoals : {};
  const freq  = goals.workoutFreq     || SESSION.workoutFreq     || '?';
  const dur   = goals.sessionDuration || SESSION.sessionDuration || '?';
  const sets  = goals.defaultSets     || 3;
  const today = new Date().toISOString().slice(0, 10);

  // Height formatted
  const htFt  = SESSION.heightFt || '';
  const htIn  = SESSION.heightIn || 0;
  const htStr = htFt ? `${htFt}'${htIn}"` : 'Not specified';

  return `You are AdaptFit AI — an elite, science-driven personal training system. Create highly personalized workout programs that match the app's structure and deliver the requested session duration.

### REQUIRED SECTION NAMES (use these exact keys — no others):
- prevDayStretch
- muscleActivation
- coreWorkout
- pumpWorkout
- stretching

### SESSION DURATION & VOLUME RULES
- Target session length: **${dur} minutes**
- Build a **full, substantial workout** that fills the time:
  - Warm-up + Activation: 10–15 min
  - Core Workout: 45–70 min
  - Pump / Metabolic Work: 15–25 min
  - Stretching + Decompression: 10–15 min
- Target calorie burn: **800–950 calories** for a 2-hour session (scale proportionally for shorter sessions)
- Use longer rest (90–180s) for strength/hypertrophy, shorter rest (45–75s) for fat loss/metabolic emphasis

### CORE PRINCIPLES
- Prioritize the user's **#1 ranked goal** and muscle priorities above all else.
- Maximize movement variety — never put redundant exercises in the same day.
  - ✗ Bad: Glute Bridge + Pilates Bridge + Hip Thrust in one session.
  - ✓ Good: Glute Bridge (activation) → Bulgarian Split Squat (compound) → Hip Thrust ISO Hold (finisher).
- Respect all special flags and only use equipment the user actually has.
- Use science-based programming and progressive overload.
- Use lowercase_with_underscores for all id values (e.g. db_bench, pull_up, hip_thrust).
- splitLabel must be under 50 characters.
- Only include the user's selected training days. Do not add rest days to the JSON.
- Output only the valid JSON object. No explanation, no markdown outside the code block.

### MUSCLE PRIORITY ORDERING RULES (critical — follow exactly)
- **Always lead coreWorkout with the user's #1 priority muscle.** The first exercise in coreWorkout must target that muscle directly.
- **Group priority muscles together** when the split allows it. If glutes and hips are both top priorities and it's a lower day, put ALL glute/hip exercises consecutively before moving to secondary muscles.
- **Do not bury priority muscles** at the end of a session when fatigue is highest.
- **Day assignment** — if the user's top 2–3 priority muscles can be trained together on the same day (e.g. glutes + hamstrings + hips on a lower day), do it. Don't split them across days unnecessarily.
- **pumpWorkout** must also lead with the priority muscle's isolation or finisher exercises before moving to secondary muscles.
- Example for a user with #1 Glutes, #2 Hips, #3 Hamstrings on a lower day:
  - coreWorkout: Hip Thrust → RDL → Bulgarian Split Squat (glutes first, then posterior chain)
  - pumpWorkout: Cable Kickback → Lateral Band Walk → Calf Raise (glutes/hips first, calves last)

### USER PROFILE
- Name: ${SESSION.displayName || SESSION.username}
- Gender: ${SESSION.gender ? SESSION.gender.charAt(0).toUpperCase() + SESSION.gender.slice(1) : 'Not specified'}
- Age: ${SESSION.age || 'Not specified'}
- Height: ${htStr}
- Weight: ${SESSION.weight ? SESSION.weight + ' lbs' : 'Not specified'}

### TRAINING GOALS (ranked — #1 is highest priority)
${formatTrainingFocus(goals)}

### SPECIAL CONSIDERATIONS
${formatSpecialFlags(goals)}

### MUSCLE PRIORITIES & GOALS
${formatMuscleGoals(goals)}

### TRAINING SCHEDULE
- Frequency: ${freq} days/week
- Session Duration: ${dur} minutes
- Default Sets per Exercise: ${sets}
- Training Days: ${goals.workoutDays ? goals.workoutDays.map(d => d.toUpperCase()).join(', ') : 'Not specified'}
- Preferred Split: ${goals.preferredSplit || 'Let the AI decide based on frequency and goals'}

### LIFESTYLE & RECOVERY
- Typical Training Time: ${formatWizAnswer('time', goals.wizTime)}
- Experience / Habit Level: ${formatWizAnswer('habit', goals.wizHabit)}
- Recovery Status: ${formatWizAnswer('recovery', goals.wizRecovery)}
- Biggest Struggle: ${formatWizAnswer('struggle', goals.wizStruggle)}
- Daily Step Goal: ${goals.stepGoal ? goals.stepGoal.toLocaleString() + ' steps/day' : 'Not set'}

### AVAILABLE EQUIPMENT
  ${formatEquipmentList(SESSION.equipment)}

### OUTPUT FORMAT — VALID JSON ONLY
\`\`\`json
{
  "splitLabel": "Upper/Lower 6x — Visceral Fat + Glute Priority",
  "generatedAt": "${today}",
  "days": {
    "mon": {
      "title": "UPPER PUSH",
      "focus": "Chest • Shoulders • Triceps",
      "prevDayStretch": [
        {"id": "thoracic_extension", "name": "Thoracic Extension", "sets": "2×30s", "detail": "Spine mobility from previous lower-body session"}
      ],
      "muscleActivation": [
        {"id": "arm_circles", "name": "Arm Circles", "sets": "2×20 each direction", "detail": "Dynamic shoulder mobility"},
        {"id": "band_pull_aparts", "name": "Band Pull-Aparts", "sets": "2×15", "detail": "Scapular activation"},
        {"id": "push_up_plus", "name": "Push-Up Plus", "sets": "2×10", "detail": "Chest & shoulder activation"}
      ],
      "coreWorkout": [
        {
          "id": "db_bench",
          "name": "Dumbbell Bench Press",
          "sets": "${sets}×8-10",
          "rest": "90-120s",
          "notes": "Primary compound — focus on progressive overload each session",
          "equipment": ["db", "bench-flat"]
        },
        {
          "id": "db_shoulder_press",
          "name": "Dumbbell Shoulder Press",
          "sets": "${sets}×8-10",
          "rest": "90s",
          "notes": "Seated or standing. Lower to ear height for full range.",
          "equipment": ["db"]
        }
      ],
      "pumpWorkout": [
        {
          "id": "lateral_raise",
          "name": "Lateral Raise",
          "sets": "3×12-15",
          "rest": "60s",
          "notes": "Control the descent. Slight forward lean targets mid-delt.",
          "equipment": ["db"]
        },
        {
          "id": "tricep_overhead_extension",
          "name": "Overhead Tricep Extension",
          "sets": "3×12-15",
          "rest": "45s",
          "notes": "Keep elbows tight. Full stretch at bottom.",
          "equipment": ["db"]
        }
      ],
      "stretching": [
        {"id": "doorway_chest_stretch", "name": "Doorway Chest Stretch", "sets": "2×30s each side", "detail": ""},
        {"id": "cross_body_shoulder", "name": "Cross-Body Shoulder Stretch", "sets": "2×30s each side", "detail": ""}
      ]
    }
  }
}
\`\`\``;
}

// ── Show the modal with the generated prompt ─────────────────
function showAIPromptModal() {
  // Build or reuse modal
  let modal = document.getElementById('aiPromptModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'aiPromptModal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:2000;
      display:flex;align-items:flex-start;justify-content:center;
      padding:20px;box-sizing:border-box;overflow-y:auto;
    `;
    modal.innerHTML = `
      <div style="max-width:760px;width:100%;background:var(--bg2);
        border:2px solid var(--accent2);padding:28px;position:relative;margin:auto;">

        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;gap:12px;">
          <div>
            <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;margin-bottom:2px;">
              ⚡ AI PROMPT GENERATOR
            </div>
            <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text-bright);letter-spacing:.06em;">
              GENERATE WITH EXTERNAL AI
            </div>
          </div>
          <button onclick="document.getElementById('aiPromptModal').style.display='none'"
            style="background:none;border:none;color:var(--text-dim);font-size:1.6rem;cursor:pointer;
            line-height:1;flex-shrink:0;padding:0;">✕</button>
        </div>

        <!-- Instructions -->
        <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);
          line-height:1.8;margin-bottom:16px;padding:10px 14px;
          background:var(--bg3);border-left:3px solid var(--accent2);">
          <strong style="color:var(--accent2);">HOW TO USE:</strong><br>
          1. Click <strong style="color:var(--text);">COPY PROMPT</strong> below.<br>
          2. Paste into <strong style="color:var(--text);">Claude</strong>, <strong style="color:var(--text);">Grok</strong>, <strong style="color:var(--text);">ChatGPT</strong>, or any AI chat.<br>
          3. Copy the JSON it returns.<br>
          4. Come back here and click <strong style="color:var(--text);">IMPORT JSON</strong> to load your new program.
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          <button id="aiPromptCopyBtn" onclick="copyAIPrompt()"
            class="btn btn-p" style="flex:1;min-width:140px;font-size:0.75rem;padding:12px;">
            📋 COPY PROMPT
          </button>
          <button onclick="showImportJSON()"
            class="btn btn-s" style="flex:1;min-width:140px;font-size:0.75rem;padding:12px;">
            📥 IMPORT JSON
          </button>
        </div>

        <!-- Import JSON area (hidden by default) -->
        <div id="aiImportArea" style="display:none;margin-bottom:16px;">
          <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);
            letter-spacing:.1em;margin-bottom:6px;">PASTE AI-GENERATED JSON HERE</div>
          <textarea id="aiImportJSON" rows="10"
            placeholder='Paste the JSON from Claude / Grok / ChatGPT here...'
            style="width:100%;background:var(--bg3);border:1px solid var(--border);
            color:var(--text);font-family:var(--font-mono);font-size:0.68rem;
            padding:10px;outline:none;resize:vertical;box-sizing:border-box;line-height:1.5;"></textarea>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button onclick="importAIProgram()" class="btn btn-p" style="flex:1;font-size:0.72rem;">
              ✓ LOAD THIS PROGRAM
            </button>
            <button onclick="document.getElementById('aiImportArea').style.display='none'"
              class="btn btn-s" style="font-size:0.72rem;">CANCEL</button>
          </div>
          <div id="aiImportMsg" style="font-family:var(--font-mono);font-size:0.65rem;
            min-height:18px;margin-top:8px;text-align:center;"></div>
        </div>

        <!-- Prompt preview -->
        <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);
          letter-spacing:.1em;margin-bottom:6px;">PROMPT PREVIEW</div>
        <div style="position:relative;">
          <textarea id="aiPromptText" readonly rows="22"
            style="width:100%;background:var(--bg3);border:1px solid var(--border);
            color:var(--text);font-family:var(--font-mono);font-size:0.62rem;
            padding:12px;outline:none;resize:vertical;box-sizing:border-box;
            line-height:1.6;white-space:pre;"></textarea>
        </div>

        <!-- Character count -->
        <div id="aiPromptCharCount" style="font-family:var(--font-mono);font-size:0.55rem;
          color:var(--text-dim);margin-top:6px;text-align:right;"></div>

      </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Generate fresh prompt and populate
  modal.style.display = 'flex';
  const prompt = buildAIPrompt();
  const ta = document.getElementById('aiPromptText');
  ta.value = prompt;
  document.getElementById('aiPromptCharCount').textContent =
    `${prompt.length.toLocaleString()} characters · ~${Math.ceil(prompt.length / 4).toLocaleString()} tokens`;
}

// ── Copy prompt to clipboard ─────────────────────────────────
async function copyAIPrompt() {
  const ta  = document.getElementById('aiPromptText');
  const btn = document.getElementById('aiPromptCopyBtn');
  if (!ta || !btn) return;
  try {
    await navigator.clipboard.writeText(ta.value);
    btn.textContent = '✓ COPIED!';
    btn.style.background = '#4caf50';
    setTimeout(() => {
      btn.textContent = '📋 COPY PROMPT';
      btn.style.background = '';
    }, 2000);
  } catch(e) {
    // Fallback for browsers that block clipboard API
    ta.select();
    document.execCommand('copy');
    btn.textContent = '✓ COPIED!';
    setTimeout(() => { btn.textContent = '📋 COPY PROMPT'; }, 2000);
  }
}

// ── Show import JSON area ────────────────────────────────────
function showImportJSON() {
  const area = document.getElementById('aiImportArea');
  if (area) {
    area.style.display = 'block';
    area.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('aiImportJSON').focus();
  }
}

// ── Import AI-generated program JSON ────────────────────────
async function importAIProgram() {
  const ta  = document.getElementById('aiImportJSON');
  const msg = document.getElementById('aiImportMsg');
  if (!ta || !msg) return;

  msg.style.color = 'var(--accent2)';
  msg.textContent = 'VALIDATING...';

  let raw = ta.value.trim();

  // Strip markdown code fences — handles ```json, ```, and any whitespace variations
  // Also handles cases where AI includes extra text before/after the JSON block
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    raw = fenceMatch[1].trim();
  } else {
    // No fences — find the first { and last } to extract just the JSON object
    const firstBrace = raw.indexOf('{');
    const lastBrace  = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.slice(firstBrace, lastBrace + 1);
    }
  }

  let program;
  try {
    program = JSON.parse(raw);
  } catch(e) {
    msg.style.color = 'var(--danger)';
    msg.textContent = `JSON PARSE ERROR: ${e.message} — check the AI output for missing brackets or commas.`;
    return;
  }

  // Basic validation
  if (!program.days || typeof program.days !== 'object') {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'INVALID FORMAT: JSON must have a "days" object.';
    return;
  }
  if (!program.splitLabel) {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'INVALID FORMAT: JSON must have a "splitLabel" field.';
    return;
  }

  msg.style.color = 'var(--accent2)';
  msg.textContent = 'SAVING PROGRAM...';

  try {
    // Add metadata
    program.generatedAt = program.generatedAt || new Date().toISOString().slice(0, 10);
    program.source      = 'ai-import';

    // ── Normalise AI key names → canonical app key names ──────
    // AI uses: muscleActivation, coreWorkout, pumpWorkout, stretching
    // App uses: warmup, exercises, pump, cooldown
    // Also adds empty arrays for any missing section so the renderer never breaks.
    if (program.days) {
      Object.keys(program.days).forEach(dayId => {
        const d = program.days[dayId];
        if (!d || d.rest) return;

        // muscleActivation → warmup
        if (!d.warmup && d.muscleActivation) { d.warmup = d.muscleActivation; delete d.muscleActivation; }
        // coreWorkout → exercises
        if (!d.exercises && d.coreWorkout)   { d.exercises = d.coreWorkout;   delete d.coreWorkout;      }
        // pumpWorkout → pump
        if (!d.pump && d.pumpWorkout)         { d.pump = d.pumpWorkout;         delete d.pumpWorkout;      }
        // stretching → cooldown
        if (!d.cooldown && d.stretching)      { d.cooldown = d.stretching;      delete d.stretching;       }

        // Guarantee all sections exist as arrays so renderer never hits undefined
        d.prevDayStretch = d.prevDayStretch || [];
        d.preStretch     = d.preStretch     || [];
        d.warmup         = d.warmup         || [];
        d.exercises      = d.exercises      || [];
        d.pump           = d.pump           || [];
        d.cooldown       = d.cooldown       || [];
      });
    }

    // Save to Firebase (same path as the built-in generator)
    await saveGeneratedProgram(program);
    SESSION._program = program;

    // Update workout page header
    const subEl = document.getElementById('workoutSub');
    if (subEl) subEl.textContent = `// ${program.splitLabel.toUpperCase()} — AI-IMPORTED PROGRAM //`;

    const genEl = document.getElementById('programGeneratedAt');
    if (genEl) genEl.textContent = `Imported ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;

    msg.style.color = '#4caf50';
    msg.textContent = '✓ PROGRAM LOADED — GO TO WORKOUTS TO SEE IT';

    // Close modal after short delay
    setTimeout(() => {
      document.getElementById('aiPromptModal').style.display = 'none';
      nav('workout');
      if (typeof showWorkoutDay === 'function') {
        const day = todayDayId ? (todayDayId() === 'sun' ? 'mon' : todayDayId()) : 'mon';
        showWorkoutDay(day);
      }
      toast('✓ AI PROGRAM IMPORTED — ' + program.splitLabel);
    }, 1800);

  } catch(e) {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'SAVE ERROR: ' + e.message;
  }
}

// ── Expose globally ──────────────────────────────────────────
window.showAIPromptModal = showAIPromptModal;
window.copyAIPrompt      = copyAIPrompt;
window.showImportJSON    = showImportJSON;
window.importAIProgram   = importAIProgram;
