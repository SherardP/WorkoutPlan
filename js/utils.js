// =============================================
// utils.js - Helper Functions & Constants
// =============================================

//const DEFAULT_SEC_PER_REP = 3;
const BODYWEIGHT_PCT = {
    "PUSH-UP": 0.64,
    "PULL-UP": 0.97,
    "SQUAT": 0.0,
    "DEADLIFT": 0.0,
    // Add more as needed
};

/*const EXERCISE_MET = {
    "BENCH PRESS": 6.0,
    "SQUAT": 7.0,
    "DEADLIFT": 7.5,
    "OVERHEAD PRESS": 5.5,
    // Add more...
};*/

// Calorie calculation
function getWeightKg() {
    return SESSION?.weight ? SESSION.weight * 0.453592 : 70;
}

function metModifier(liftedLbs, bodyLbs) {
    if (!bodyLbs) return 1;
    return 1 + (liftedLbs / bodyLbs) * 0.4;
}

function calcSetCalories(item, reps, weightLbs) {
    const weightKg = getWeightKg();
    if (!weightKg || !reps) return 0;
    
    const name = (item.name || '').toUpperCase();
    const met = EXERCISE_MET[name] || 5.0;
    const secPerRep = 3;
    const setMinutes = (reps * secPerRep) / 60;
    
    const raw = met * metModifier(weightLbs || 0, SESSION.weight || 0) * weightKg * setMinutes;
    return Math.min(Math.round(raw), 25);
}

function calcActualCalories(item, actual) {
    if (!actual || !actual.sets) return 0;
    return actual.sets.reduce((sum, set) => {
        if (!set || !set.reps) return sum;
        const wt = parseFloat(set.weight) || 0;
        return sum + calcSetCalories(item, parseInt(set.reps), wt);
    }, 0);
}

// Date helpers
function localDateStr(date) {
	const d = date || new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function getToday() {
    return localDateStr(new Date());
}

// Toast notification
function toast(message, duration = 3000) {
    let toastEl = document.getElementById('toast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, duration);
}

// Theme handling
function applyTheme(gender) {
    if (gender === 'female') {
        document.body.classList.add('theme-female');
    } else {
        document.body.classList.remove('theme-female');
    }
}

// Find exercise by ID
function findExerciseById(itemId) {
    const W = window.getActiveWorkouts ? window.getActiveWorkouts() : {};
    for (const day of Object.values(W)) {
        for (const list of [day.prevDayStretch, day.preStretch, day.warmup, day.exercises, day.cooldown]) {
            const found = list?.find(i => i.id === itemId);
            if (found) return found;
        }
    }
    return null;
}

// ═══════════════════════════════════════════════════════════
// CALORIE BURN CALCULATOR — MET-based
// ═══════════════════════════════════════════════════════════

// MET values per exercise type (Compendium of Physical Activities)
const EXERCISE_MET = {
  // Strength / resistance (increases with load — base + modifier)
  'BENCH PRESS':5.0, 'OVERHEAD PRESS':5.0, 'INCLINE DB PRESS':4.8, 'FLOOR PRESS':4.8,
  'ARCHER PUSH-UP':4.5, 'PUSH-UP VARIATIONS':4.5, 'PUSH-UP BURNOUT':5.5,
  'GOBLET SQUAT':5.5, 'ROMANIAN DEADLIFT':5.5, 'SINGLE-LEG DEADLIFT':5.0,
  'BULGARIAN SPLIT SQUAT':5.5, 'SUMO SQUAT':5.5, 'REVERSE LUNGE':4.8,
  'WALKING LUNGE':5.0, 'WALL SIT':4.0, 'HIP THRUST':4.5, 'GLUTE BRIDGE':3.5,
  'DB ROW (SINGLE ARM)':4.8, 'BENT-OVER ROW':5.0, 'RENEGADE ROW':6.0,
  'BICEP CURL':3.5, 'HAMMER CURL':3.5, 'TRICEP DIPS':4.0, 'TRICEP OVERHEAD EXT.':3.5,
  'LATERAL RAISES':3.0, 'REAR DELT RAISE':3.0,
  'PLANK VARIATIONS':4.0, 'DEAD BUG':3.5, 'BICYCLE CRUNCH':5.0, 'HANGING LEG RAISE':4.5,
  'LEG RAISES':4.0, 'SIDE PLANK HIP DIP':4.0, 'RUSSIAN TWIST':4.5,
  // High intensity
  'MOUNTAIN CLIMBERS':8.0, 'BURPEE FINISHER':10.0,
  'SQUAT BURNOUT':8.0, 'LUNGE BURNOUT':7.5, 'ROW BURNOUT':6.5, 'GLUTE KICKBACK':4.0,
  'LATERAL BAND WALK':4.0, 'DONKEY KICK':3.5, 'MOBILITY FLOW':2.5,
  'SINGLE-LEG DEADLIFT':5.0,
  // Warm-up / cooldown (lower intensity)
  'ARM CIRCLES':2.5, 'SHOULDER PASS-THROUGHS':2.5, 'SCAPULAR PUSH-UPS':3.0,
  'BAND PULL-APARTS':2.8, 'PUSH-UP PLUS':3.5, 'HIP CIRCLES':2.5,
  'LEG SWINGS (FRONT/BACK)':2.8, 'GLUTE BRIDGE':3.5, 'CLAMSHELL':3.0,
  'BODYWEIGHT SQUAT':4.0, 'DEAD HANG':2.5, 'PRONE COBRA':2.8,
  'SCAPULAR RETRACTIONS':2.5, 'BIRD DOG':3.0, 'HOLLOW HOLD':4.0, 'PLANK HOLD':4.0,
  'DOORWAY CHEST STRETCH':2.0, 'CROSS-BODY SHOULDER STRETCH':2.0, 'PIGEON STRETCH':2.0,
  'SEATED HAMSTRING STRETCH':2.0, 'HIP FLEXOR LUNGE STRETCH':2.0, 'CHILD\'S POSE':2.0,
  'COBRA STRETCH':2.0, 'SUPINE TWIST':2.0, 'CAT-COW':2.5, 'BUTTERFLY STRETCH':2.0,
  'THORACIC EXTENSION':2.0, 'WORLD\'S GREATEST STRETCH':2.8, 'FOAM ROLL':2.5,
};

// Exercises that use weights (show lbs input)
const WEIGHTED_EXERCISES = new Set([
  'BENCH PRESS','OVERHEAD PRESS','INCLINE DB PRESS','FLOOR PRESS','LATERAL RAISES',
  'TRICEP OVERHEAD EXT.','GOBLET SQUAT','ROMANIAN DEADLIFT','SINGLE-LEG DEADLIFT',
  'BULGARIAN SPLIT SQUAT','SUMO SQUAT','WALKING LUNGE','REVERSE LUNGE','HIP THRUST',
  'DB ROW (SINGLE ARM)','BENT-OVER ROW','RENEGADE ROW','BICEP CURL','HAMMER CURL',
  'TRICEP DIPS','REAR DELT RAISE','DEAD BUG','BICYCLE CRUNCH','RUSSIAN TWIST',
  'HANGING LEG RAISE','LEG RAISES','SIDE PLANK HIP DIP','GLUTE KICKBACK',
]);

// Bodyweight exercises and what % of bodyweight they use as effective load
// Source: ACSM / biomechanics research
/*const BODYWEIGHT_PCT = {
  'PUSH-UP VARIATIONS': 0.64,   // ~64% bodyweight
  'PUSH-UP BURNOUT':    0.64,
  'PUSH-UP PLUS':       0.64,
  'SCAPULAR PUSH-UPS':  0.60,
  'ARCHER PUSH-UP':     0.70,   // asymmetric → higher
  'TRICEP DIPS':        0.75,   // bench dip ~75%
  'PULL-UP':            1.00,   // full bodyweight
  'DEAD HANG':          1.00,
  'HANGING LEG RAISE':  0.20,   // legs only ~20%
  'PLANK VARIATIONS':   0.70,
  'PLANK HOLD':         0.70,
  'HOLLOW HOLD':        0.50,
  'DEAD BUG':           0.30,
  'BIRD DOG':           0.25,
  'BICYCLE CRUNCH':     0.25,
  'MOUNTAIN CLIMBERS':  0.60,
  'BURPEE FINISHER':    0.65,
  'GOBLET SQUAT':       0.0,    // uses external weight only
  'BODYWEIGHT SQUAT':   0.80,
  'SQUAT BURNOUT':      0.80,
  'WALL SIT':           0.70,
  'GLUTE BRIDGE':       0.50,
  'HIP THRUST':         0.50,
  'WALKING LUNGE':      0.80,
  'REVERSE LUNGE':      0.80,
  'LUNGE BURNOUT':      0.80,
  'BULGARIAN SPLIT SQUAT': 0.80,
  'DONKEY KICK':        0.15,
  'FIRE HYDRANT':       0.15,
  'CLAMSHELL':          0.10,
  'SIDE PLANK HIP DIP': 0.30,
  'RUSSIAN TWIST':      0.20,
  'LEG RAISES':         0.20,
};*/
function estimateDuration(item) {
  if (!item.sets) return 3; // warmup/cooldown item
  const s = item.sets.toLowerCase();
  if (s.includes('max→')) return 5; // burnout
  if (s.includes('5×5')) return 14; // 5 sets × ~45s work + 2min rest
  if (s.includes('4×')) return 12;
  if (s.includes('3×')) return 9;
  if (s.includes('10–15 min')) return 12;
  if (s.includes('45–90')) return 8;
  return 8;
}

// ── REP DURATION TABLE (seconds per rep, research-based) ──
// Accounts for actual movement time — NOT including rest between sets
const SEC_PER_REP = {
  // Slow controlled movements
  'BENCH PRESS':4.0, 'OVERHEAD PRESS':4.0, 'INCLINE DB PRESS':4.0,
  'FLOOR PRESS':4.0, 'GOBLET SQUAT':4.0, 'ROMANIAN DEADLIFT':4.5,
  'SINGLE-LEG DEADLIFT':4.5, 'BULGARIAN SPLIT SQUAT':4.0,
  'SUMO SQUAT':4.0, 'HIP THRUST':4.0, 'BENT-OVER ROW':4.0,
  'DB ROW (SINGLE ARM)':4.0, 'RENEGADE ROW':5.0,
  'BICEP CURL':4.0, 'HAMMER CURL':4.0,
  'TRICEP OVERHEAD EXT.':4.0, 'TRICEP DIPS':4.0,
  'LATERAL RAISES':3.5, 'REAR DELT RAISE':3.5,
  // Bodyweight / moderate
  'PUSH-UP VARIATIONS':2.5, 'PUSH-UP BURNOUT':2.0, 'PUSH-UP PLUS':2.5,
  'SCAPULAR PUSH-UPS':2.5, 'ARCHER PUSH-UP':3.0,
  'BODYWEIGHT SQUAT':2.5, 'SQUAT BURNOUT':2.0, 'WALKING LUNGE':2.0,
  'REVERSE LUNGE':2.0, 'LUNGE BURNOUT':2.0,
  'BICYCLE CRUNCH':1.5, 'MOUNTAIN CLIMBERS':0.8, 'BURPEE FINISHER':4.0,
  'DEAD BUG':4.0, 'BIRD DOG':4.0, 'RUSSIAN TWIST':1.5,
  'LEG RAISES':2.5, 'HANGING LEG RAISE':3.0, 'SIDE PLANK HIP DIP':2.0,
  'GLUTE BRIDGE':2.5, 'DONKEY KICK':1.5, 'GLUTE KICKBACK':1.5,
  // Fast / activation
  'ARM CIRCLES':0.5,        // 0.5 sec each — so 40 reps = 20 sec
  'LEG SWINGS (FRONT/BACK)':1.0,
  'HIP CIRCLES':0.8,
  'BAND PULL-APARTS':1.5,
  'SHOULDER PASS-THROUGHS':2.0,
  'CLAMSHELL':2.0,
  // Stretches / holds — measured in reps as seconds held
  'PLANK VARIATIONS':1.0, 'PLANK HOLD':1.0, 'HOLLOW HOLD':1.0,
  'WALL SIT':1.0, 'DEAD HANG':1.0,
};
const DEFAULT_SEC_PER_REP = 3.0;

// Hard per-exercise calorie ceiling (sanity cap)
// These are generous upper bounds for a single exercise in one session
const CAL_CEILING = {
  'BURPEE FINISHER':120, 'MOUNTAIN CLIMBERS':80, 'SQUAT BURNOUT':100,
  'LUNGE BURNOUT':80, 'PUSH-UP BURNOUT':60,
  default: 60,  // most exercises: max ~60 kcal in one go
};

// Calculate calories for a single exercise based on actual reps/sets/weight done
function calcActualCalories(item, actualData) {
  const weightKg  = getWeightKg();
  const bodyLbs   = SESSION.weight || 0;
  if (!weightKg) return null;

  const name = item.name?.toUpperCase() || '';
  const met  = EXERCISE_MET[name] || 3.5;
  const sets = (actualData?.sets || []).filter(s => s?.reps && parseInt(s.reps) > 0);

  if (!sets.length) {
    // No reps entered — use a short conservative estimate (don't overcount)
    const dur = item.sets ? 6 / 60 : 2 / 60; // 6 min for strength, 2 min for warmup
    return Math.round(met * weightKg * dur);
  }

  let totalCals = 0;
  const secPerRep = SEC_PER_REP[name] || DEFAULT_SEC_PER_REP;

  sets.forEach(set => {
    const reps = parseInt(set.reps) || 0;
    if (!reps) return;

    let effectiveLbs = parseFloat(set.weight) || parseFloat(exerciseWeights[item.id]) || 0;
    if (!effectiveLbs) {
      const bwPct = BODYWEIGHT_PCT[name];
      if (bwPct) effectiveLbs = bodyLbs * bwPct;
    }

    const setMinutes = (reps * secPerRep) / 60;
    const mod = metModifier(effectiveLbs, bodyLbs);
    totalCals += met * mod * weightKg * setMinutes;
  });

  // Apply sanity cap
  const ceiling = CAL_CEILING[name] ?? CAL_CEILING.default;
  return Math.min(Math.round(totalCals), ceiling);
}

// MET modifier based on weight used relative to bodyweight
function metModifier(lbs, bodyweightLbs) {
  if (!lbs || !bodyweightLbs) return 1.0;
  const ratio = lbs / bodyweightLbs;
  if (ratio > 0.75) return 1.35;
  if (ratio > 0.5)  return 1.20;
  if (ratio > 0.25) return 1.10;
  return 1.0;
}

// Compute calories for one exercise item (used for live display)
function calcItemCalories(item, weightLbs) {
  const weightKg   = getWeightKg();
  const bodyLbs    = SESSION.weight || 0;
  if (!weightKg) return null;
  const met = EXERCISE_MET[item.name?.toUpperCase()] || 4.0;
  const dur = estimateDuration(item) / 60;

  // Use external weight if provided, otherwise bodyweight percentage
  let effectiveLbs = parseFloat(weightLbs) || 0;
  if (!effectiveLbs) {
    const bwPct = BODYWEIGHT_PCT[item.name?.toUpperCase()];
    if (bwPct) effectiveLbs = bodyLbs * bwPct;
  }

  const mod = metModifier(effectiveLbs, bodyLbs);
  return Math.round(met * mod * weightKg * dur);
}

// Compute total workout calories for all items in a day
function calcWorkoutCalories(w, exerciseWeightsMap) {
  const weightKg = getWeightKg();
  if (!weightKg) return null;
  let total = 0;
  const allItems = [...(w.prevDayStretch||[]), ...(w.preStretch||[]), ...(w.warmup||[]), ...(w.exercises||[]), ...(w.cooldown||[])];
  for (const item of allItems) {
    const actual = exerciseActuals?.[item.id];
    if (actual?.sets?.some(s => s?.reps)) {
      // Use actual reps data for precise calculation
      total += calcActualCalories(item, actual) || 0;
    } else {
      // Fall back to estimated duration + weight modifier
      const met = EXERCISE_MET[item.name?.toUpperCase()] || 4.0;
      const dur = estimateDuration(item) / 60;
      const lbs = exerciseWeightsMap?.[item.id] || 0;
      const mod = metModifier(lbs, SESSION.weight);
      total += met * mod * weightKg * dur;
    }
  }
  return Math.round(total);
}


function updateExerciseWeight(itemId, lbs) {
  exerciseWeights[itemId] = parseFloat(lbs) || 0;
  updateCalorieBurnDisplay();
}

function updateCalorieBurnDisplay() {
  const W = getActiveWorkouts();
  const dayId = document.getElementById('calBurnDayId')?.value;
  if (!dayId || !W[dayId]) return;
  const cals = calcWorkoutCalories(W[dayId], exerciseWeights);
  const el = document.getElementById('calBurnTotal');
  if (el && cals !== null) el.textContent = cals.toLocaleString();
}

function renderCalorieBurnCard(dayId, w) {
  const weightKg  = getWeightKg();
  const weightLbs = SESSION.weight;
  const bmi       = getSessionBMI();
  const cals      = calcWorkoutCalories(w, exerciseWeights);

  // BMI category + color
  let bmiColor = 'var(--text-dim)', bmiCat = '—', bmiNum = '—';
  if (bmi) {
    bmiNum = bmi.toFixed(1);
    if      (bmi < 18.5) { bmiCat = 'UNDERWEIGHT';   bmiColor = '#64b5f6'; }
    else if (bmi < 25)   { bmiCat = 'NORMAL';         bmiColor = '#4caf50'; }
    else if (bmi < 30)   { bmiCat = 'OVERWEIGHT';     bmiColor = '#ff9800'; }
    else if (bmi < 35)   { bmiCat = 'OBESE I';        bmiColor = '#f44336'; }
    else if (bmi < 40)   { bmiCat = 'OBESE II';       bmiColor = '#e53935'; }
    else                 { bmiCat = 'OBESE III';      bmiColor = '#b71c1c'; }
  }

  // Height display
  const htDisplay = SESSION.heightFt
    ? `${SESSION.heightFt}'${SESSION.heightIn||0}"  /  ${((SESSION.heightFt*12+(SESSION.heightIn||0))*2.54).toFixed(0)} cm`
    : '—';
  const wtDisplay = weightLbs
    ? `${weightLbs} lbs  /  ${(weightLbs*0.453592).toFixed(1)} kg`
    : '—';

  const noStats = !weightKg ? `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;margin-top:8px;
      background:var(--accent)11;border:1px solid var(--accent)44;">
      <span style="font-size:1.2rem;">⚠</span>
      <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent);">
        Tap your name in the header to add height & weight — enables calorie estimates and BMI
      </div>
    </div>` : '';

  return `<div class="card mb16" style="border-left:4px solid var(--accent2);">
    <input type="hidden" id="calBurnDayId" value="${dayId}">

    <!-- Header row -->
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
      <div>
        <div class="card-label">CALORIE BURN + BMI</div>
        <div style="font-family:var(--font-display);font-size:1rem;color:var(--text-bright);">LIVE WORKOUT TRACKER</div>
        ${weightKg ? `<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-top:2px;">
          Enter weights on exercises below — total updates live
        </div>` : ''}
      </div>
    </div>

    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:${noStats?'0':'0'};">
      <!-- Calorie burn -->
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">EST. BURN</div>
        <div style="font-family:var(--font-display);font-size:1.8rem;color:var(--accent2);line-height:1;" id="calBurnTotal">
          ${cals !== null ? cals : '—'}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">kcal</div>
      </div>
      <!-- BMI -->
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">BMI</div>
        <div style="font-family:var(--font-display);font-size:1.8rem;color:${bmiColor};line-height:1;">${bmiNum}</div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:${bmiColor};">${bmiCat}</div>
      </div>
      <!-- Weight -->
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">WEIGHT</div>
        <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text);line-height:1;">
          ${weightLbs ? weightLbs : '—'}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">
          ${weightKg ? `${weightKg.toFixed(1)} kg` : 'lbs'}
        </div>
      </div>
      <!-- Height -->
      <div style="background:var(--bg3);padding:12px 8px;text-align:center;border:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">HEIGHT</div>
        <div style="font-family:var(--font-display);font-size:1.2rem;color:var(--text);line-height:1;">
          ${SESSION.heightFt ? `${SESSION.heightFt}'${SESSION.heightIn||0}"` : '—'}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">
          ${SESSION.heightFt ? `${((SESSION.heightFt*12+(SESSION.heightIn||0))*2.54).toFixed(0)} cm` : ''}
        </div>
      </div>
    </div>

    ${bmi ? `<div style="margin-top:8px;padding:8px 12px;background:${bmiColor}11;border:1px solid ${bmiColor}33;
      font-family:var(--font-mono);font-size:0.62rem;color:${bmiColor};line-height:1.6;">
      ${bmi < 25 ? '✓ BMI in healthy range — focus on body composition (muscle vs fat) rather than weight alone.'
        : bmi < 30 ? '↑ BMI in overweight range — visceral fat loss protocol is ideal. Step target + strength training combination.'
        : '⚠ BMI in obese range — prioritize visceral fat reduction. Consistent steps + progressive strength + sleep are your primary levers.'}
    </div>` : ''}

    ${noStats}
  </div>`;
}

const DEFAULT_WALK_SECTIONS = [
  {id:'morning', label:'MORNING WALK',      time:'7–8 AM',    pct:0.20,  note:'Cortisol alignment · fat-burning zone',               star:false},
  {id:'lunch',   label:'LUNCH WALK',         time:'12–1 PM',   pct:0.25,  note:'Blood sugar control · breaks sedentary sitting',      star:false},
  {id:'pre',     label:'PRE-WORKOUT WALK',   time:'5–5:30 PM', pct:0.20,  note:'Transitions out of work-stress mode',                 star:false},
  {id:'post',    label:'POST-WORKOUT WALK',  time:'After gym', pct:0.20,  note:'★ MOST IMPORTANT — drives cortisol down before sleep', star:true},
  {id:'evening', label:'EVENING WALK',       time:'After 7 PM',pct:0.15,  note:'Wind-down · final daily activity',                    star:false},
];

var userGoals = { stepGoal:10000, workoutFreq:6, workoutDays:['mon','tue','wed','thu','fri','sat'], sessionDuration:90 };
var selectedDays = new Set(['mon','tue','wed','thu','fri','sat']);
var currentFreqGoal = 6;
var currentDurationGoal = 90;
// todayStepData stores per-section: { id: { steps, startSteps, endSteps } }
var todayStepData = {};

// Export for other modules
window.utils = {
    calcSetCalories,
    calcActualCalories,
    toast,
    applyTheme,
    getToday,
    localDateStr,
    findExerciseById
};

window.getToday = getToday;