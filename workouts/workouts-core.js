// =============================================
// workouts-core.js - Core Loading & Navigation
// =============================================

let activeProgram = {};
let currentWorkoutDate;

function initWorkouts() {
    currentWorkoutDate = getToday();
}

async function loadWorkouts() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="section" id="sec-workout">
		<div class="page-title">WORK<br><span>OUTS</span></div>
		<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px;">
			<div class="page-sub" id="workoutSub" style="margin:0;">// LOADING PROGRAM... //</div>
			<div style="display:flex;align-items:center;gap:8px;">
				<input type="date" id="workout-date"
					onchange="onWorkoutDateChange()"
					style="background:var(--bg3);border:1px solid var(--border);color:var(--text);
					font-family:var(--font-mono);font-size:0.72rem;padding:5px 9px;outline:none;">
				<button class="btn btn-s" onclick="setWorkoutDate('today')"    style="font-size:0.6rem;padding:5px 9px;">TODAY</button>
				<button class="btn btn-s" onclick="setWorkoutDate('yesterday')" style="font-size:0.6rem;padding:5px 9px;">YESTERDAY</button>
			</div>
		</div>
		<div style="margin-bottom:12px;">
			<button class="btn btn-s" id="generateProgramBtn" onclick="confirmGenerateProgram()"
				style="font-size:0.6rem;padding:4px 12px;border-color:var(--accent2);color:var(--accent2);">
				⚡ GENERATE NEW PROGRAM
			</button>
			<button class="btn btn-s" id="restoreBackupBtn" onclick="restoreBackupProgram()"
				style="font-size:0.6rem;padding:4px 12px;border-color:#4caf50;color:#4caf50;margin-left:6px;">
				↶ RESTORE BACKUP
			</button>
			<span id="programGeneratedAt" style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-left:10px;"></span>
		</div>

		<div class="flex gap8 mb16 fw" id="dayTabs"></div>
		<div id="workoutContent"></div>
    `;

    await loadActiveProgram();
    renderDayTabs();
    renderDecompressionSection();
}

async function loadActiveProgram() {
    activeProgram = await encryptedLoad('program') || {};
    if (Object.keys(activeProgram).length === 0) {
        generateDefaultProgram();
    }
}

function renderDayTabs() {
    const container = document.getElementById('dayTabs');
    container.innerHTML = '';

    Object.keys(activeProgram).forEach(dayId => {
        const day = activeProgram[dayId];
        const btn = document.createElement('button');
        btn.className = 'day-card';
        btn.innerHTML = `
            <div class="day-name">${dayId.toUpperCase()}</div>
            <div class="day-focus">${day.title || 'Training Day'}</div>
        `;
        btn.onclick = () => showWorkoutDay(dayId);
        container.appendChild(btn);
    });
}

function showWorkoutDay(dayId) {
    window.currentDayId = dayId;
    renderWorkoutDay(dayId);   // This will be in workouts-renderer.js
}

// Date handlers
function onWorkoutDateChange() {
    const el = document.getElementById('workout-date');
    if (el) currentWorkoutDate = el.value;
}

function setWorkoutDate(mode) {
    const input = document.getElementById('workout-date');
    if (!input) return;
    const d = new Date();
    if (mode === 'yesterday') d.setDate(d.getDate() - 1);
    input.value = d.toISOString().split('T')[0];
    currentWorkoutDate = input.value;
}

// ═══════════════════════════════════════════════════════════
// WORKOUT DATA
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// WORKOUT DATA — Full Warm-up · Core · Cooldown Structure
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// PROGRAM GENERATOR — Exercise Database + Split Logic
// Based on: Schoenfeld (hypertrophy), ACSM guidelines,
//   Hevy/StrengthLog split research, repetition continuum
// ═══════════════════════════════════════════════════════════

// Equipment requirement keys (match EQUIPMENT CATALOG ids)
// eq: [] means bodyweight — no equipment needed
const EX_DB = [
  // ── CHEST ──────────────────────────────────────────────
  {id:'push_up', name:'Push-Up', muscles:['chest','triceps','shoulders'], eq:[], impact:'low', goals:['tone','fat','recomp','general'], sets_h:'3×10–15', sets_s:'3×5–8', rest_h:60, rest_s:90, ytId:'IODxDxX7oi4',
   progressions:[
    {step:1, name:'Wall Push-Up',       cue:'3×20 comfortably',  detail:'Stand arm-length from wall. Hands flat on wall. Bend elbows until nose nearly touches wall.'},
    {step:2, name:'Incline Push-Up',    cue:'3×15 comfortably',  detail:'Hands on a bench or table. Body in a straight line. More upright = easier.'},
    {step:3, name:'Knee Push-Up',       cue:'3×12 comfortably',  detail:'Knees on floor, hips forward, body straight from knees to head.'},
    {step:4, name:'Push-Up',            cue:'3×10 full ROM',     detail:'Toes on floor, hands shoulder-width, body rigid. Lower until chest nearly touches floor.'},
    {step:5, name:'Slow Push-Up (3-1-3)',cue:'3×8 with tempo',  detail:'3-sec down, 1-sec pause at bottom, 3-sec push up. Builds strength faster than fast reps.'},
  ]},
  {id:'decline_push',    name:'Decline Push-Up',            muscles:['chest','triceps'],                   eq:[],                              impact:'low',  goals:['tone','fat','recomp'],            sets_h:'3×10–15', sets_s:'3×8',    rest_h:60,  rest_s:90,  ytId:'T3N-TO4rqEk'},
  {id:'diamond_push',    name:'Diamond Push-Up',            muscles:['triceps','chest'],                   eq:[],                              impact:'low',  goals:['tone','size'],                    sets_h:'3×10',    sets_s:'3×8',    rest_h:60,  rest_s:90,  ytId:'J0DXcc8W4h8'},
  {id:'db_bench',        name:'Dumbbell Bench Press',       muscles:['chest','triceps','shoulders'],       eq:['db'],                          impact:'low',  goals:['size','strength','recomp'],       sets_h:'4×8–12',  sets_s:'4×4–6',  rest_h:90,  rest_s:150, ytId:'VmB1G1K7v0c'},
  {id:'db_incline',      name:'Incline DB Press',           muscles:['chest','shoulders','triceps'],       eq:['db','bench-adj'],              impact:'low',  goals:['size','strength'],                sets_h:'3×10–12', sets_s:'3×5–8',  rest_h:90,  rest_s:120, ytId:'8iPEnn-ltC8'},
  {id:'db_fly',          name:'Dumbbell Fly',               muscles:['chest'],                             eq:['db','bench-flat'],             impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'eozdVDA78K0'},
  {id:'bb_bench',        name:'Barbell Bench Press',        muscles:['chest','triceps','shoulders'],       eq:['bar-olympic','bench-flat','rack-power'], impact:'low', goals:['size','strength'],      sets_h:'4×6–10',  sets_s:'5×3–5',  rest_h:120, rest_s:180, ytId:'vcBig73ojpE'},
  {id:'bb_incline',      name:'Incline Barbell Press',      muscles:['chest','shoulders','triceps'],       eq:['bar-olympic','bench-adj','rack-power'], impact:'low', goals:['size','strength'],        sets_h:'4×8–10',  sets_s:'4×4–6',  rest_h:120, rest_s:180, ytId:'SrxJc14ygaI'},
  {id:'mach_chest_press',name:'Machine Chest Press',        muscles:['chest','triceps'],                   eq:['mach-chestpress'],             impact:'low',  goals:['size','tone','beginner'],         sets_h:'3×10–12', sets_s:'3×6–8',  rest_h:90,  rest_s:120, ytId:'xUm0BiZCL0E'},
  {id:'cable_fly',       name:'Cable Chest Fly',            muscles:['chest'],                             eq:['mach-cable'],                  impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'taI4XduLpTk'},
  {id:'pec_deck',        name:'Pec Deck Fly',               muscles:['chest'],                             eq:['mach-pecdeck'],                impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'Z57CtFmRMxA'},

  // ── BACK / LATS ─────────────────────────────────────────
  {id:'db_row',          name:'Single-Arm DB Row',          muscles:['back-upper','lats','biceps'],        eq:['db'],                          impact:'low',  goals:['size','strength','recomp'],       sets_h:'4×10–12', sets_s:'4×5–6',  rest_h:90,  rest_s:150, ytId:'roCP442LA5g'},
  {id:'bent_row_db',     name:'Bent-Over DB Row',           muscles:['back-upper','lats','biceps'],        eq:['db'],                          impact:'low',  goals:['size','strength'],                sets_h:'4×10–12', sets_s:'4×5–6',  rest_h:90,  rest_s:150, ytId:'FWJR5Ve8bnQ'},
  {id:'bb_row',          name:'Barbell Row',                muscles:['back-upper','lats','biceps'],        eq:['bar-olympic'],                 impact:'low',  goals:['size','strength'],                sets_h:'4×8–10',  sets_s:'5×4–6',  rest_h:120, rest_s:180, ytId:'G8l_8chR5BE'},
  {id:'lat_pull',        name:'Lat Pulldown',               muscles:['lats','biceps','back-upper'],        eq:['mach-latpull'],                impact:'low',  goals:['size','tone','beginner'],         sets_h:'4×10–12', sets_s:'4×6–8',  rest_h:90,  rest_s:120, ytId:'CAwf7n6Ts5o'},
  {id:'seated_row',      name:'Seated Cable Row',           muscles:['back-upper','lats','biceps'],        eq:['mach-seatedrow'],              impact:'low',  goals:['size','tone','posture'],          sets_h:'4×10–12', sets_s:'4×6–8',  rest_h:90,  rest_s:120, ytId:'GZbfZ033f2s'},
  {id:'cable_row',       name:'Cable Row',                  muscles:['back-upper','lats'],                 eq:['mach-cable'],                  impact:'low',  goals:['size','tone'],                    sets_h:'3×12',    sets_s:'3×8',    rest_h:90,  rest_s:120, ytId:'GZbfZ033f2s'},
  {id:'pull_up',         name:'Pull-Up / Chin-Up',          muscles:['lats','biceps','back-upper'],        eq:['rack-pullup'],                 impact:'low',  goals:['size','strength','tone'],         sets_h:'4×6–10',  sets_s:'4×4–6',  rest_h:120, rest_s:150, ytId:'eGo4IYlbE5g'},
  {id:'doorframe_pullup',name:'Doorframe Pull-Up Bar',      muscles:['lats','biceps'],                     eq:['acc-pullbar'],                 impact:'low',  goals:['size','strength','tone'],         sets_h:'4×6–10',  sets_s:'4×4–6',  rest_h:120, rest_s:150, ytId:'eGo4IYlbE5g'},
  {id:'inverted_row',    name:'Inverted Row (TRX)',         muscles:['back-upper','biceps'],               eq:['acc-trx'],                     impact:'low',  goals:['tone','recomp','general'],        sets_h:'3×12',    sets_s:'3×8',    rest_h:90,  rest_s:120, ytId:'LRN-CmKuByI'},
  {id:'back_ext',        name:'Back Extension',             muscles:['back-lower'],                        eq:['mach-backext'],                impact:'low',  goals:['strength','posture'],             sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'ph3pOHHCMnk'},
  {id:'superman',        name:'Superman Hold',              muscles:['back-lower'],                        eq:[],                              impact:'low',  goals:['posture','general','lowimpact'],  sets_h:'3×12',    sets_s:'3×10',   rest_h:60,  rest_s:60,  ytId:'cc6UVNM5oMI'},
  {id:'good_morning_db', name:'Good Morning (DB)',          muscles:['back-lower','hamstrings'],           eq:['db'],                          impact:'low',  goals:['strength','posture'],             sets_h:'3×12',    sets_s:'3×8',    rest_h:90,  rest_s:120, ytId:'YA-h3n9l5x0'},

  // ── SHOULDERS ───────────────────────────────────────────
  {id:'db_ohp',          name:'Dumbbell Overhead Press',   muscles:['shoulders','triceps'],               eq:['db'],                          impact:'low',  goals:['size','strength','tone'],         sets_h:'4×10–12', sets_s:'4×5–6',  rest_h:90,  rest_s:150, ytId:'qEwKCR5JCog'},
  {id:'bb_ohp',          name:'Barbell Overhead Press',    muscles:['shoulders','triceps'],               eq:['bar-olympic'],                 impact:'low',  goals:['size','strength'],                sets_h:'4×8–10',  sets_s:'5×4–6',  rest_h:120, rest_s:180, ytId:'2yjwXTZbrDM'},
  {id:'mach_shoulder',   name:'Machine Shoulder Press',    muscles:['shoulders','triceps'],               eq:['mach-shoulderpr'],             impact:'low',  goals:['size','tone','beginner'],         sets_h:'3×12',    sets_s:'3×8',    rest_h:90,  rest_s:120, ytId:'Wqq9zBGMo2I'},
  {id:'lateral_raise',   name:'Lateral Raise',             muscles:['shoulders'],                         eq:['db'],                          impact:'low',  goals:['size','tone'],                    sets_h:'4×15',    sets_s:'4×12',   rest_h:60,  rest_s:60,  ytId:'3VcKaXpzqRo'},
  {id:'front_raise',     name:'Front Raise (DB)',          muscles:['shoulders'],                         eq:['db'],                          impact:'low',  goals:['tone'],                           sets_h:'3×12',    sets_s:'3×10',   rest_h:60,  rest_s:60,  ytId:'ObhpgyVKiME'},
  {id:'rear_delt_raise', name:'Rear Delt Raise',           muscles:['back-upper','shoulders'],            eq:['db'],                          impact:'low',  goals:['posture','size','tone'],          sets_h:'3×15',    sets_s:'3×12',   rest_h:60,  rest_s:60,  ytId:'Rep-GkxHMKU'},
  {id:'face_pull',       name:'Face Pull (Cable)',         muscles:['back-upper','shoulders'],            eq:['mach-cable','mach-latpull'],   impact:'low',  goals:['posture','tone'],                 sets_h:'3×15–20', sets_s:'3×12',   rest_h:60,  rest_s:60,  ytId:'rep-GkxHMKU'},
  {id:'band_pull_apart', name:'Band Pull-Apart',           muscles:['back-upper','shoulders'],            eq:['acc-bands'],                   impact:'low',  goals:['posture','general','lowimpact'],  sets_h:'3×20',    sets_s:'3×15',   rest_h:45,  rest_s:60,  ytId:'0kgSBxbG6zo'},

  // ── ARMS — BICEPS ───────────────────────────────────────
  {id:'db_curl',         name:'Dumbbell Bicep Curl',       muscles:['biceps'],                            eq:['db'],                          impact:'low',  goals:['size','tone'],                    sets_h:'3×12',    sets_s:'3×8',    rest_h:60,  rest_s:90,  ytId:'ykJmrZ5v0Oo'},
  {id:'hammer_curl',     name:'Hammer Curl',               muscles:['biceps','forearms'],                 eq:['db'],                          impact:'low',  goals:['size','tone'],                    sets_h:'3×12',    sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'0xyZbNqL_U0'},
  {id:'ez_curl',         name:'EZ Bar Curl',               muscles:['biceps'],                            eq:['bar-ezcurl'],                  impact:'low',  goals:['size','strength'],                sets_h:'3×10',    sets_s:'3×6–8',  rest_h:90,  rest_s:120, ytId:'av7-8igZwVE'},
  {id:'preacher_curl',   name:'Preacher Curl',             muscles:['biceps'],                            eq:['rack-preacher'],               impact:'low',  goals:['size','tone'],                    sets_h:'3×12',    sets_s:'3×8',    rest_h:90,  rest_s:90,  ytId:'ykJmrZ5v0Oo'},
  {id:'cable_curl',      name:'Cable Bicep Curl',          muscles:['biceps'],                            eq:['mach-cable','mach-latpull'],   impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'ykJmrZ5v0Oo'},
  {id:'mach_curl',       name:'Machine Bicep Curl',        muscles:['biceps'],                            eq:['mach-biccurl'],                impact:'low',  goals:['size','tone','beginner'],         sets_h:'3×12',    sets_s:'3×8',    rest_h:60,  rest_s:90,  ytId:'ykJmrZ5v0Oo'},

  // ── ARMS — TRICEPS ──────────────────────────────────────
  {id:'tricep_dip',      name:'Tricep Dip',                muscles:['triceps','chest','shoulders'],       eq:['rack-dip'],                    impact:'low',  goals:['size','strength','tone'],         sets_h:'3×10–15', sets_s:'4×6–8',  rest_h:90,  rest_s:120, ytId:'0326dy_-CzM'},
  {id:'portable_dip',    name:'Tricep Dip (portable bars)',muscles:['triceps','chest','shoulders'],       eq:['acc-dipbar'],                  impact:'low',  goals:['size','strength','tone'],         sets_h:'3×10–15', sets_s:'4×6–8',  rest_h:90,  rest_s:120, ytId:'0326dy_-CzM'},
  {id:'tricep_ext_db',   name:'Tricep Overhead Ext. (DB)', muscles:['triceps'],                           eq:['db'],                          impact:'low',  goals:['size','tone'],                    sets_h:'3×12',    sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'_gsUck-7f74'},
  {id:'skull_crusher',   name:'Skull Crusher (EZ)',        muscles:['triceps'],                           eq:['bar-ezcurl','bench-flat'],     impact:'low',  goals:['size','strength'],                sets_h:'3×10–12', sets_s:'3×8',    rest_h:90,  rest_s:120, ytId:'d_KZxHnaard'},
  {id:'cable_tricep',    name:'Cable Tricep Pressdown',    muscles:['triceps'],                           eq:['mach-cable','mach-latpull'],   impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'2-LAMcpzODU'},
  {id:'mach_tricep',     name:'Machine Tricep Extension',  muscles:['triceps'],                           eq:['mach-tricext'],                impact:'low',  goals:['size','tone','beginner'],         sets_h:'3×12',    sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'2-LAMcpzODU'},
  {id:'close_grip_push', name:'Close-Grip Push-Up',        muscles:['triceps','chest'],                   eq:[],                              impact:'low',  goals:['tone','general'],                 sets_h:'3×12',    sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'J0DXcc8W4h8'},

  // ── CORE / ABS ──────────────────────────────────────────
  {id:'plank', name:'Plank', muscles:['core'], eq:[], impact:'low', goals:['tone','fat','general','lowimpact'], sets_h:'3×30–60s', sets_s:'3×30s', rest_h:45, rest_s:60, ytId:'ASdvN_XEl_c',
   progressions:[
    {step:1, name:'Dead Bug',           cue:'3×10/side without lower back lifting', detail:'Lie on back. Press lower back to floor. Extend opposite arm and leg. Learn to brace.'},
    {step:2, name:'Forearm Plank (15s)',cue:'3×15 sec with flat back',  detail:'Elbows under shoulders, toes on floor. Hips level. No sagging or piking.'},
    {step:3, name:'Forearm Plank (30s)',cue:'3×30 sec',                 detail:'Same position, longer hold. Focus on breathing while braced.'},
    {step:4, name:'Plank (60 sec)',     cue:'3×60 sec solid',           detail:'Full 60-second hold with straight line from head to heels.'},
    {step:5, name:'RKC Plank',         cue:'3×30 sec intense brace',   detail:'Squeeze EVERYTHING — fists, abs, glutes, quads — as hard as possible. Harder than a standard plank held twice as long.'},
  ]},
  {id:'dead_bug',        name:'Dead Bug',                  muscles:['core'],                              eq:[],                              impact:'low',  goals:['general','lowimpact','posture'],  sets_h:'3×10/side',sets_s:'3×8',   rest_h:45,  rest_s:60,  ytId:'4XLEnBss230'},
  {id:'hollow_hold',     name:'Hollow Body Hold',          muscles:['core'],                              eq:[],                              impact:'low',  goals:['tone','strength'],                sets_h:'3×20–30s',sets_s:'3×20s',  rest_h:45,  rest_s:60,  ytId:'LlDNef_Lcbd'},
  {id:'crunch',          name:'Crunch / Sit-Up',           muscles:['core'],                              eq:[],                              impact:'low',  goals:['fat','tone'],                     sets_h:'3×20',    sets_s:'3×15',   rest_h:45,  rest_s:60,  ytId:'MKmrqckCjpI'},
  {id:'leg_raise',       name:'Hanging Leg Raise',         muscles:['core'],                              eq:['rack-pullup','acc-pullbar'],   impact:'low',  goals:['tone','size'],                    sets_h:'3×12',    sets_s:'3×8',    rest_h:60,  rest_s:90,  ytId:'JB2oyawG9KI'},
  {id:'russian_twist',   name:'Russian Twist',             muscles:['core'],                              eq:[],                              impact:'low',  goals:['fat','tone'],                     sets_h:'3×20',    sets_s:'3×15',   rest_h:45,  rest_s:60,  ytId:'wkD8rjkodUI'},
  {id:'ab_roller',       name:'Ab Wheel Rollout',          muscles:['core'],                              eq:['acc-abroll'],                  impact:'low',  goals:['size','strength'],                sets_h:'3×8–12',  sets_s:'3×8',    rest_h:90,  rest_s:90,  ytId:'AGEwnbDNiLs'},
  {id:'cable_crunch',    name:'Cable Crunch',              muscles:['core'],                              eq:['mach-cable','mach-latpull'],   impact:'low',  goals:['size','tone'],                    sets_h:'3×15',    sets_s:'3×12',   rest_h:60,  rest_s:90,  ytId:'AV5U7oGSGOY'},
  {id:'pallof_press',    name:'Pallof Press (Cable)',      muscles:['core'],                              eq:['mach-cable'],                  impact:'low',  goals:['posture','strength'],             sets_h:'3×12/side',sets_s:'3×10', rest_h:60,  rest_s:90,  ytId:'AV5U7oGSGOY'},

  // ── GLUTES ──────────────────────────────────────────────
  {id:'glute_bridge',    name:'Glute Bridge',              muscles:['glutes','hamstrings'],               eq:[],                              impact:'low',  goals:['size','tone','fat','lowimpact'],  sets_h:'4×15–20', sets_s:'3×12',   rest_h:60,  rest_s:90,  ytId:'wPM8icPu6H8'},
  {id:'hip_thrust_db',   name:'Hip Thrust (DB)',           muscles:['glutes','hamstrings'],               eq:['db','bench-flat'],             impact:'low',  goals:['size','strength','tone'],         sets_h:'4×12–15', sets_s:'4×8',    rest_h:90,  rest_s:120, ytId:'wPM8icPu6H8'},
  {id:'hip_thrust_bb',   name:'Barbell Hip Thrust',        muscles:['glutes','hamstrings'],               eq:['bar-olympic','bench-flat'],    impact:'low',  goals:['size','strength'],                sets_h:'4×10–12', sets_s:'4×6–8',  rest_h:120, rest_s:150, ytId:'SEdqd6lZKyk'},
  {id:'rdl_db',          name:'Romanian Deadlift (DB)',    muscles:['hamstrings','glutes','back-lower'],  eq:['db'],                          impact:'low',  goals:['size','strength','tone'],         sets_h:'4×10–12', sets_s:'4×5–6',  rest_h:90,  rest_s:150, ytId:'JCXUYuzwNrM'},
  {id:'rdl_bb',          name:'Romanian Deadlift (Bar)',   muscles:['hamstrings','glutes','back-lower'],  eq:['bar-olympic'],                 impact:'low',  goals:['size','strength'],                sets_h:'4×8–10',  sets_s:'5×4–6',  rest_h:120, rest_s:180, ytId:'JCXUYuzwNrM'},
  {id:'hip_abduct_mach', name:'Hip Abduction Machine',    muscles:['hips','glutes'],                     eq:['mach-hipabduct'],              impact:'low',  goals:['tone','size','fat'],              sets_h:'3×15–20', sets_s:'3×12',   rest_h:60,  rest_s:90,  ytId:'jNvzBdHwCBs'},
  {id:'fire_hydrant',    name:'Fire Hydrant',              muscles:['hips','glutes'],                     eq:[],                              impact:'low',  goals:['tone','fat','lowimpact'],         sets_h:'3×15/side',sets_s:'3×12', rest_h:45,  rest_s:60,  ytId:'la-bz6yYIIA'},
  {id:'donkey_kick',     name:'Donkey Kick',               muscles:['hips','glutes'],                     eq:[],                              impact:'low',  goals:['tone','fat','lowimpact'],         sets_h:'3×15/side',sets_s:'3×12', rest_h:45,  rest_s:60,  ytId:'SJ1iR_0Srew'},
  {id:'cable_kickback',  name:'Cable Glute Kickback',      muscles:['hips','glutes'],                     eq:['mach-cable','acc-anklestrap'], impact:'low',  goals:['tone','size','fat'],              sets_h:'3×15/side',sets_s:'3×12', rest_h:60,  rest_s:90,  ytId:'SJ1iR_0Srew'},

  // ── QUADS ───────────────────────────────────────────────
  {id:'goblet_squat',    name:'Goblet Squat',              muscles:['quads','glutes','core'],             eq:['db'],                          impact:'low',  goals:['size','strength','tone','fat'],   sets_h:'4×10–12', sets_s:'4×5–6',  rest_h:90,  rest_s:150, ytId:'MxsFDhcyFyE'},
  {id:'bb_squat',        name:'Barbell Squat',             muscles:['quads','glutes','hamstrings','core'],eq:['bar-olympic','rack-power'],    impact:'low',  goals:['size','strength'],                sets_h:'4×8–10',  sets_s:'5×3–5',  rest_h:150, rest_s:240, ytId:'bEv6CCg2BC8'},
  {id:'leg_press',       name:'Leg Press',                 muscles:['quads','glutes','hamstrings'],       eq:['mach-legpress'],               impact:'low',  goals:['size','strength','tone','beginner'],sets_h:'4×10–12',sets_s:'4×6–8', rest_h:90, rest_s:150, ytId:'IZxyjrxqgFY'},
  {id:'leg_ext',         name:'Leg Extension',             muscles:['quads'],                             eq:['mach-legext'],                 impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×10',   rest_h:60,  rest_s:90,  ytId:'m0FOpx_-eE0'},
  {id:'bss',             name:'Bulgarian Split Squat',     muscles:['quads','glutes','hamstrings'],       eq:['db','bench-flat'],             impact:'low',  goals:['size','strength','tone'],         sets_h:'3×8–10/side',sets_s:'3×6', rest_h:90,  rest_s:120, ytId:'2C-uNgbwi_k'},
  {id:'step_up',         name:'Step-Up (DB or BW)',        muscles:['quads','glutes'],                    eq:[],                              impact:'low',  goals:['tone','fat','lowimpact'],         sets_h:'3×10/side',sets_s:'3×8',   rest_h:60,  rest_s:90,  ytId:'5clYkSsgbnU'},
  {id:'wall_sit',        name:'Wall Sit',                  muscles:['quads'],                             eq:[],                              impact:'low',  goals:['tone','fat','lowimpact'],         sets_h:'3×30–60s',sets_s:'3×30s',  rest_h:60,  rest_s:60,  ytId:'y-wV4Venusw'},
  {id:'sumo_squat',      name:'Sumo Squat (DB)',           muscles:['quads','glutes','hamstrings'],       eq:['db'],                          impact:'low',  goals:['size','tone'],                    sets_h:'4×12',    sets_s:'4×8',    rest_h:90,  rest_s:120, ytId:'p0FvazKRN2A'},

  // ── HAMSTRINGS ──────────────────────────────────────────
  {id:'leg_curl',        name:'Lying Leg Curl',            muscles:['hamstrings'],                        eq:['mach-legcurl'],                impact:'low',  goals:['size','tone'],                    sets_h:'3×12–15', sets_s:'3×8–10', rest_h:90,  rest_s:90,  ytId:'ELOCsoDSmrg'},
  {id:'nordic_curl',     name:'Nordic Hamstring Curl',     muscles:['hamstrings'],                        eq:[],                              impact:'low',  goals:['strength'],                       sets_h:'3×6–8',   sets_s:'3×5',    rest_h:120, rest_s:180, ytId:'L7raxhEh73Y'},
  {id:'kb_swing',        name:'Kettlebell Swing',          muscles:['hamstrings','glutes','back-lower','core'],eq:['acc-kb'],              impact:'mod',  goals:['fat','size','strength','recomp'],  sets_h:'5×15–20', sets_s:'4×10',   rest_h:60,  rest_s:120, ytId:'mKDJeqHcTEk'},
  {id:'deadlift_db',     name:'Deadlift (DB)',             muscles:['hamstrings','glutes','back-lower'],  eq:['db'],                          impact:'low',  goals:['size','strength'],                sets_h:'4×10',    sets_s:'4×6',    rest_h:120, rest_s:180, ytId:'op9kVnSso6Q'},
  {id:'deadlift_bb',     name:'Conventional Deadlift',     muscles:['hamstrings','glutes','back-lower','back-upper'],eq:['bar-olympic'],  impact:'low',  goals:['size','strength'],                sets_h:'4×6–8',   sets_s:'5×3–5',  rest_h:180, rest_s:240, ytId:'op9kVnSso6Q'},
  {id:'trap_deadlift',   name:'Trap Bar Deadlift',         muscles:['hamstrings','quads','glutes','back-lower'],eq:['bar-trap'],         impact:'low',  goals:['size','strength'],                sets_h:'4×8',     sets_s:'5×3–5',  rest_h:150, rest_s:240, ytId:'yGAoFUlScLw'},

  // ── CALVES ──────────────────────────────────────────────
  {id:'standing_calf',   name:'Standing Calf Raise',       muscles:['calves'],                            eq:[],                              impact:'low',  goals:['size','tone','general'],          sets_h:'4×15–20', sets_s:'4×10',   rest_h:60,  rest_s:60,  ytId:'gwLzBIX8rqY'},
  {id:'seated_calf',     name:'Seated Calf Raise',         muscles:['calves'],                            eq:['mach-calf'],                   impact:'low',  goals:['size','tone'],                    sets_h:'4×15–20', sets_s:'4×10',   rest_h:60,  rest_s:60,  ytId:'YJmF8LB4Qos'},
  {id:'leg_press_calf',  name:'Calf Press on Leg Press',   muscles:['calves'],                            eq:['mach-legpress'],               impact:'low',  goals:['size','tone'],                    sets_h:'4×15–20', sets_s:'4×12',   rest_h:60,  rest_s:60,  ytId:'gwLzBIX8rqY'},

  // ── CARDIO / CONDITIONING ───────────────────────────────
  {id:'treadmill_walk',  name:'Treadmill Walk',            muscles:[],                                    eq:['cardio-treadmill'],            impact:'low',  goals:['fat','endurance','lowimpact'],    sets_h:'1×20–30min',sets_s:'1×15min',rest_h:0,   rest_s:0,   ytId:''},
  {id:'treadmill_run',   name:'Treadmill Run',             muscles:[],                                    eq:['cardio-treadmill'],            impact:'high', goals:['fat','endurance'],                sets_h:'1×20–30min',sets_s:'1×15min',rest_h:0,   rest_s:0,   ytId:''},
  {id:'bike_steady',     name:'Stationary Bike (steady)',  muscles:[],                                    eq:['cardio-bike-up','cardio-bike-rec'],impact:'low',goals:['fat','endurance','lowimpact'], sets_h:'1×20–30min',sets_s:'1×15min',rest_h:0,   rest_s:0,   ytId:''},
  {id:'rowing_machine',  name:'Rowing Machine',            muscles:['back-upper','core'],                 eq:['cardio-rower'],                impact:'low',  goals:['fat','endurance','size'],         sets_h:'5×500m',  sets_s:'4×500m', rest_h:90,  rest_s:120, ytId:''},
  {id:'elliptical',      name:'Elliptical',                muscles:[],                                    eq:['cardio-elliptical'],           impact:'low',  goals:['fat','endurance','lowimpact'],    sets_h:'1×25min', sets_s:'1×20min',rest_h:0,   rest_s:0,   ytId:''},
  {id:'jump_rope',       name:'Jump Rope',                 muscles:[],                                    eq:['acc-jumprope'],                impact:'high', goals:['fat','endurance'],                sets_h:'5×2min',  sets_s:'4×1min', rest_h:60,  rest_s:60,  ytId:''},
  {id:'hiit_bike',       name:'HIIT Air Bike Intervals',   muscles:[],                                    eq:['cardio-airbike'],              impact:'low',  goals:['fat','endurance','recomp'],       sets_h:'8×20s on/40s off',sets_s:'6×20s',rest_h:0,rest_s:0, ytId:''},

  // ── YOGA ────────────────────────────────────────────────
  // All yoga is bodyweight (eq:[]) and categorized by style/goal
  {id:'yoga_sun_sal',    name:'Sun Salutation (Vinyasa)',  muscles:['chest','back-upper','core','shoulders','hamstrings'],eq:[],impact:'low',goals:['yoga','mobility','endurance','fat'],sets_h:'5–10 rounds',sets_s:'3 rounds',rest_h:30,rest_s:60,  ytId:'eqVMAPM00GM'},
  {id:'yoga_warrior1',   name:'Warrior I Sequence',        muscles:['quads','glutes','shoulders'],        eq:[],              impact:'low',  goals:['yoga','strength','mobility'],      sets_h:'3×60 sec/side',sets_s:'2×45s',rest_h:30,rest_s:30,  ytId:'eqVMAPM00GM'},
  {id:'yoga_warrior2',   name:'Warrior II Sequence',       muscles:['quads','glutes','shoulders'],        eq:[],              impact:'low',  goals:['yoga','strength','tone'],          sets_h:'3×60 sec/side',sets_s:'2×45s',rest_h:30,rest_s:30,  ytId:'eqVMAPM00GM'},
  {id:'yoga_chair',      name:'Chair Pose (Utkatasana)',   muscles:['quads','glutes','core'],             eq:[],              impact:'low',  goals:['yoga','strength','tone','lowimpact'],sets_h:'3×30–60s',sets_s:'3×30s',rest_h:30,rest_s:30,  ytId:'eqVMAPM00GM'},
  {id:'yoga_tree',       name:'Tree Pose (Balance)',       muscles:['core','glutes'],                     eq:[],              impact:'low',  goals:['yoga','mobility','posture'],       sets_h:'3×45s/side',sets_s:'2×30s',rest_h:20,rest_s:20,   ytId:'eqVMAPM00GM'},
  {id:'yoga_downdog',    name:'Downward Dog Hold',         muscles:['hamstrings','calves','shoulders','lats'],eq:[],          impact:'low',  goals:['yoga','mobility','posture'],       sets_h:'3×45–60s',sets_s:'3×30s',rest_h:30,rest_s:30,    ytId:'eqVMAPM00GM'},
  {id:'yoga_pigeon',     name:'Pigeon Pose (deep hold)',   muscles:['glutes','hamstrings'],               eq:[],              impact:'low',  goals:['yoga','mobility','lowimpact'],     sets_h:'2×90s/side',sets_s:'2×60s',rest_h:30,rest_s:30,   ytId:'O11Md_bJCfk'},
  {id:'yoga_low_lunge',  name:'Low Lunge (Crescent)',      muscles:['quads','glutes','core'],             eq:[],              impact:'low',  goals:['yoga','mobility','tone'],          sets_h:'3×45s/side',sets_s:'2×30s',rest_h:20,rest_s:20,   ytId:'YQmpR9OO7Zk'},
  {id:'yoga_boat',       name:'Boat Pose (Navasana)',      muscles:['core'],                              eq:[],              impact:'low',  goals:['yoga','strength','tone'],          sets_h:'3×30s',sets_s:'3×20s',rest_h:30,rest_s:30,         ytId:'ASdvN_XEl_c'},
  {id:'yoga_bridge',     name:'Bridge Pose (Setu)',        muscles:['glutes','hamstrings','core'],        eq:[],              impact:'low',  goals:['yoga','strength','tone','lowimpact'],sets_h:'3×30s',sets_s:'3×20s',rest_h:30,rest_s:30,       ytId:'wPM8icPu6H8'},
  {id:'yoga_plank_yog',  name:'Yoga Plank Hold',          muscles:['core','shoulders','chest'],          eq:[],              impact:'low',  goals:['yoga','strength','tone'],          sets_h:'3×45s',sets_s:'3×30s',rest_h:30,rest_s:45,         ytId:'ASdvN_XEl_c'},
  {id:'yoga_yin_strap',  name:'Yin Dragon Pose',          muscles:['quads','hamstrings','glutes'],       eq:[],              impact:'low',  goals:['yoga','mobility','lowimpact'],     sets_h:'2×3 min/side',sets_s:'1×2 min',rest_h:60,rest_s:60, ytId:'O11Md_bJCfk'},
  {id:'yoga_yin_butter', name:'Yin Butterfly Pose',       muscles:['hamstrings','glutes'],               eq:[],              impact:'low',  goals:['yoga','mobility','lowimpact'],     sets_h:'1×3 min',sets_s:'1×2 min',rest_h:60,rest_s:60,      ytId:'O11Md_bJCfk'},
  {id:'yoga_power_flow', name:'Power Yoga Flow',          muscles:['chest','core','shoulders','quads'],  eq:[],              impact:'mod',  goals:['yoga','fat','endurance'],          sets_h:'1×20 min',sets_s:'1×15 min',rest_h:0,rest_s:0,      ytId:'eqVMAPM00GM', block_from_generator:true},
  {id:'yoga_ashtanga',   name:'Ashtanga Primary Series',  muscles:['chest','core','back-upper','quads','hamstrings'],eq:[],  impact:'mod',  goals:['yoga','strength','endurance'],    sets_h:'1×30 min',sets_s:'1×20 min',rest_h:0,rest_s:0,      ytId:'eqVMAPM00GM', block_from_generator:true},
  {id:'yoga_restorative',name:'Restorative Yoga Session', muscles:[],                                    eq:[],              impact:'low',  goals:['yoga','mobility','lowimpact','posture'],sets_h:'1×30 min',sets_s:'1×20 min',rest_h:0,rest_s:0, ytId:'eqVMAPM00GM', block_from_generator:true},

  // ── PILATES ─────────────────────────────────────────────
  {id:'pil_hundred',     name:'The Hundred',              muscles:['core'],                              eq:[],              impact:'low',  goals:['pilates','tone','strength'],       sets_h:'3×100 pumps',sets_s:'2×100',rest_h:60,rest_s:60,   ytId:'ASdvN_XEl_c'},
  {id:'pil_roll_up',     name:'Roll Up',                  muscles:['core'],                              eq:[],              impact:'low',  goals:['pilates','tone','mobility'],       sets_h:'3×10',sets_s:'3×8',rest_h:45,rest_s:60,            ytId:'ASdvN_XEl_c'},
  {id:'pil_single_leg',  name:'Single Leg Circle',        muscles:['core','glutes'],                     eq:[],              impact:'low',  goals:['pilates','tone','mobility'],       sets_h:'3×10/side',sets_s:'3×8',rest_h:30,rest_s:30,       ytId:'ASdvN_XEl_c'},
  {id:'pil_rolling',     name:'Rolling Like a Ball',      muscles:['core','back-lower'],                 eq:[],              impact:'low',  goals:['pilates','mobility','posture'],    sets_h:'3×10',sets_s:'3×8',rest_h:30,rest_s:30,            ytId:'ASdvN_XEl_c'},
  {id:'pil_series_5',    name:'Series of Five (Pilates)', muscles:['core'],                              eq:[],              impact:'low',  goals:['pilates','tone','strength'],       sets_h:'3 full rounds',sets_s:'2 rounds',rest_h:60,rest_s:60,ytId:'ASdvN_XEl_c'},
  {id:'pil_spine_stretch',name:'Spine Stretch Forward',   muscles:['back-lower','hamstrings','core'],    eq:[],              impact:'low',  goals:['pilates','mobility','posture'],    sets_h:'3×8',sets_s:'3×6',rest_h:30,rest_s:30,            ytId:'eqVMAPM00GM'},
  {id:'pil_saw',         name:'The Saw',                  muscles:['core','back-upper','hamstrings'],    eq:[],              impact:'low',  goals:['pilates','mobility','posture'],    sets_h:'3×8/side',sets_s:'3×6',rest_h:30,rest_s:30,        ytId:'eqVMAPM00GM'},
  {id:'pil_swan',        name:'Swan Dive Prep',           muscles:['back-lower','back-upper','glutes'],  eq:[],              impact:'low',  goals:['pilates','posture','strength'],    sets_h:'3×10',sets_s:'3×8',rest_h:30,rest_s:30,            ytId:'Mfbv5XEGZJI'},
  {id:'pil_side_kick',   name:'Side Kick Series',         muscles:['glutes','hamstrings','core'],        eq:[],              impact:'low',  goals:['pilates','tone','lowimpact'],      sets_h:'3×12/side',sets_s:'3×10',rest_h:30,rest_s:30,      ytId:'SJ1iR_0Srew'},
  {id:'pil_teaser',      name:'The Teaser',               muscles:['core'],                              eq:[],              impact:'low',  goals:['pilates','strength','tone'],       sets_h:'3×8',sets_s:'3×6',rest_h:45,rest_s:60,            ytId:'ASdvN_XEl_c'},
  {id:'pil_plank',       name:'Pilates Plank Variations', muscles:['core','shoulders'],                  eq:[],              impact:'low',  goals:['pilates','strength','tone'],       sets_h:'3×30–45s',sets_s:'3×30s',rest_h:45,rest_s:45,     ytId:'ASdvN_XEl_c'},
  {id:'pil_bridge',      name:'Pilates Bridge',           muscles:['glutes','hamstrings','core'],        eq:[],              impact:'low',  goals:['pilates','tone','lowimpact'],      sets_h:'3×12',sets_s:'3×10',rest_h:30,rest_s:30,           ytId:'wPM8icPu6H8'},
  {id:'pil_legpull',     name:'Leg Pull Front/Back',      muscles:['core','glutes','shoulders'],         eq:[],              impact:'low',  goals:['pilates','strength','tone'],       sets_h:'3×8/side',sets_s:'3×6',rest_h:45,rest_s:45,        ytId:'ASdvN_XEl_c'},


  // ── CALISTHENICS — progressive bodyweight ───────────────
  // Each exercise includes a progressions[] ladder: beginner → advanced.
  // The workout renderer shows the user's current step and what comes next.
  {id:'cal_pushup', name:'Push-Up (Standard)', muscles:['chest','triceps','shoulders','core'], eq:[], impact:'low', goals:['calisthenics','tone','strength'], sets_h:'4×max', sets_s:'5×max', rest_h:90, rest_s:120, ytId:'IODxDxX7oi4',
   progressions:[
    {step:1, name:'Wall Push-Up',            cue:'Can do 3×20 comfortably',  detail:'Stand arm-length from wall. Hands flat on wall. Bend elbows until nose nearly touches wall.'},
    {step:2, name:'Incline Push-Up',         cue:'Can do 3×15 comfortably',  detail:'Hands on a bench, table, or step. Body in a straight line. More upright = easier.'},
    {step:3, name:'Knee Push-Up',            cue:'Can do 3×12 comfortably',  detail:'Knees on floor, hips forward, body straight from knees to head. Full range of motion.'},
    {step:4, name:'Push-Up (Standard)',      cue:'Can do 3×10 comfortably',  detail:'Toes on floor, hands shoulder-width, body rigid. Lower until chest nearly touches floor.'},
    {step:5, name:'Slow Push-Up (3-1-3)',    cue:'3-sec down, 1-sec pause, 3-sec up. 3×8', detail:'Time under tension builds strength faster. Use a 3-count down, 1-second pause at bottom, 3-count push up.'},
  ]},
  {id:'cal_diamond_pu', name:'Diamond Push-Up', muscles:['triceps','chest'], eq:[], impact:'low', goals:['calisthenics','tone','strength'], sets_h:'4×max', sets_s:'4×max', rest_h:90, rest_s:120, ytId:'J0DXcc8W4h8',
   progressions:[
    {step:1, name:'Close-Grip Knee Push-Up', cue:'Can do 3×12',              detail:'Hands narrow (thumb and forefinger touching), knees on floor. Elbows stay close to body.'},
    {step:2, name:'Close-Grip Push-Up',      cue:'Can do 3×10',              detail:'Full push-up with hands close together. Elbows track back, not flared.'},
    {step:3, name:'Diamond Push-Up',         cue:'Can do 3×8 with good form',detail:'Index fingers and thumbs form a diamond shape. Intense tricep and inner chest work.'},
    {step:4, name:'Weighted Diamond Push-Up',cue:'3×10 with backpack weight', detail:'Add a loaded backpack for extra resistance once diamonds are solid.'},
  ]},
  {id:'cal_archer_pu', name:'Archer Push-Up', muscles:['chest','triceps','shoulders'], eq:[], impact:'low', goals:['calisthenics','strength'], sets_h:'3×6/side', sets_s:'4×6', rest_h:120, rest_s:150, ytId:'IODxDxX7oi4',
   progressions:[
    {step:1, name:'Wide Push-Up',            cue:'Can do 3×15 wide-grip',    detail:'Hands wider than shoulders. Shifts load toward the one-arm side.'},
    {step:2, name:'Uneven Push-Up',          cue:'Can do 3×8/side',          detail:'One hand on floor, other on a book/block. Alternate sides each set.'},
    {step:3, name:'Assisted Archer Push-Up', cue:'Can do 3×5/side',          detail:'Extended arm bent slightly for assistance. Gradually straighten it each session.'},
    {step:4, name:'Archer Push-Up',          cue:'Can do 3×6/side strict',   detail:'One arm fully extended to side, one arm doing the push-up. The extended arm helps minimally.'},
  ]},
  {id:'cal_pseudo_planch', name:'Pseudo Planche Push-Up', muscles:['chest','shoulders','core'], eq:[], impact:'low', goals:['calisthenics','strength'], sets_h:'3×5–8', sets_s:'4×5', rest_h:120, rest_s:180, ytId:'IODxDxX7oi4',
   progressions:[
    {step:1, name:'Plank Hold',              cue:'Can hold 3×45 sec',        detail:'Straight arm plank. Build shoulder and core endurance first.'},
    {step:2, name:'Tuck Planche Lean',       cue:'Can hold 3×20 sec',        detail:'Lean forward in push-up position, weight over wrists. Fingers point to sides/back.'},
    {step:3, name:'Pseudo Planche Lean',     cue:'Can hold 3×30 sec',        detail:'Full lean forward, straight legs, fingers pointing backward. Core and shoulders screaming — that is normal.'},
    {step:4, name:'Pseudo Planche Push-Up',  cue:'Can do 3×5 full ROM',      detail:'From the leaned position, perform a push-up while maintaining the forward lean throughout.'},
  ]},
  {id:'cal_pullup', name:'Pull-Up', muscles:['lats','biceps','back-upper'], eq:['rack-pullup','acc-pullbar'], impact:'low', goals:['calisthenics','strength','size'], sets_h:'4×max', sets_s:'5×max', rest_h:120, rest_s:150, ytId:'eGo4IYlbE5g',
   progressions:[
    {step:1, name:'Dead Hang',               cue:'Can hang 3×30 sec',        detail:'Just hang from the bar with straight arms. Builds grip, shoulder health, and lat activation.'},
    {step:2, name:'Scapular Pull-Up',        cue:'Can do 3×10',              detail:'From a dead hang, depress and retract your shoulder blades without bending the elbows. Tiny movement, huge activation.'},
    {step:3, name:'Assisted Pull-Up (band)', cue:'Can do 3×8 with band',     detail:'Loop a resistance band around the bar and your foot/knee. Band removes 20–60 lbs of your bodyweight.'},
    {step:4, name:'Negative Pull-Up',        cue:'Can do 3×5 slow 5-sec descent', detail:'Jump or step to the top position. Lower yourself as slowly as possible. Builds the same muscles as the full movement.'},
    {step:5, name:'Pull-Up',                 cue:'Can do 3×5 unassisted',    detail:'Full pull-up from dead hang to chin over bar. Overhand grip, shoulder-width.'},
    {step:6, name:'Weighted Pull-Up',        cue:'Can do 3×8 bodyweight',    detail:'Add weight via belt, backpack, or vest. Progress as you would with any weighted exercise.'},
  ]},
  {id:'cal_chinup', name:'Chin-Up', muscles:['biceps','lats'], eq:['rack-pullup','acc-pullbar'], impact:'low', goals:['calisthenics','strength','size'], sets_h:'4×max', sets_s:'4×max', rest_h:120, rest_s:150, ytId:'eGo4IYlbE5g',
   progressions:[
    {step:1, name:'Dead Hang (underhand)',   cue:'Can hang 3×20 sec',        detail:'Underhand grip (palms toward you). Easier on bicep tendons.'},
    {step:2, name:'Assisted Chin-Up (band)', cue:'Can do 3×8 with band',     detail:'Band assistance. Chin-up grip (underhand). Easier than pull-ups for most beginners — great starting point.'},
    {step:3, name:'Negative Chin-Up',        cue:'Can do 3×5 slow descent',  detail:'Jump to top, lower for 5 seconds. Builds bicep and lat strength through the full range.'},
    {step:4, name:'Chin-Up',                 cue:'Can do 3×5 unassisted',    detail:'Underhand grip, full hang to chin over bar.'},
  ]},
  {id:'cal_archer_pu2', name:'Archer Pull-Up', muscles:['lats','biceps'], eq:['rack-pullup'], impact:'low', goals:['calisthenics','strength'], sets_h:'3×4/side', sets_s:'4×4', rest_h:150, rest_s:180, ytId:'eGo4IYlbE5g',
   progressions:[
    {step:1, name:'Wide-Grip Pull-Up',       cue:'Can do 3×6 wide',          detail:'Hands wider than shoulders. Shifts work toward the primary side of an archer pull-up.'},
    {step:2, name:'Assisted Archer Pull-Up', cue:'Can do 3×4/side with band',detail:'One arm pulls, other arm has a band assist. Gradually reduce band assistance.'},
    {step:3, name:'Archer Pull-Up',          cue:'Can do 3×4/side',          detail:'One arm pulls, other arm nearly straight pointing to the side. Minimal assistance from extended arm.'},
  ]},
  {id:'cal_dip', name:'Dip (Bodyweight)', muscles:['triceps','chest','shoulders'], eq:['rack-dip','acc-dipbar'], impact:'low', goals:['calisthenics','strength','size'], sets_h:'4×max', sets_s:'4×max', rest_h:120, rest_s:150, ytId:'0326dy_-CzM',
   progressions:[
    {step:1, name:'Bench Dip',               cue:'Can do 3×15',              detail:'Hands on bench behind you, feet on floor. Bend elbows to 90° then push up.'},
    {step:2, name:'Elevated Bench Dip',      cue:'Can do 3×12 with feet on box', detail:'Feet elevated on a second bench or box. Increases depth and shoulder load.'},
    {step:3, name:'Assisted Dip (band)',     cue:'Can do 3×8 with band',     detail:'Band from bar to your knees removes 30–50 lbs of load.'},
    {step:4, name:'Negative Dip',            cue:'Can do 3×5 slow descent',  detail:'Jump to top position, lower for 4 seconds. Full range of motion.'},
    {step:5, name:'Dip (Bodyweight)',        cue:'Can do 3×8 unassisted',    detail:'Full bodyweight parallel bar dip. Slight forward lean hits chest; upright hits triceps.'},
    {step:6, name:'Weighted Dip',            cue:'Can do 3×10 bodyweight',   detail:'Add weight via belt or backpack. Treat like bench press progression.'},
  ]},
  {id:'cal_bw_squat', name:'Bodyweight Squat', muscles:['quads','glutes'], eq:[], impact:'low', goals:['calisthenics','tone','lowimpact'], sets_h:'4×20–30', sets_s:'5×20', rest_h:60, rest_s:90, ytId:'aclHkVaku9U',
   progressions:[
    {step:1, name:'Chair Squat (sit and stand)', cue:'3×15 pain-free',       detail:'Use a chair as a depth guide. Sit down slowly, stand back up. No bouncing off the seat.'},
    {step:2, name:'Box Squat',                cue:'3×15 with box depth',     detail:'Squat to a box or bench, pause without relaxing, stand. Teaches depth without mobility issues.'},
    {step:3, name:'Bodyweight Squat',         cue:'3×20 full depth',         detail:'Feet shoulder-width, toes slightly out. Break parallel. Chest tall throughout.'},
    {step:4, name:'Pause Squat',              cue:'3×12 with 2-sec pause',   detail:'3-count down, 2-second pause at the bottom, 1-count up. Eliminates the bounce reflex.'},
    {step:5, name:'Jump Squat',               cue:'3×10 explosive',          detail:'Full squat then explode upward. Land soft with bent knees. Builds power.'},
  ]},
  {id:'cal_pistol', name:'Pistol Squat', muscles:['quads','glutes','core'], eq:[], impact:'low', goals:['calisthenics','strength'], sets_h:'3×5/side', sets_s:'4×5', rest_h:120, rest_s:150, ytId:'qDcniqddTeE',
   progressions:[
    {step:1, name:'Supported Single-Leg Squat', cue:'3×8/side holding a pole', detail:'Hold a pole, TRX, or door frame. Lower on one leg. Use arms to assist on the way up.'},
    {step:2, name:'Box Pistol Squat',          cue:'3×6/side to a box',      detail:'Lower on one leg to a box or bench. The box limits depth and reduces difficulty.'},
    {step:3, name:'Counterweight Pistol',      cue:'3×5/side arms forward',  detail:'Arms extended forward for balance. Progressively less arm counterbalance needed.'},
    {step:4, name:'Shrimp Squat',              cue:'Can do 3×6/side',        detail:'Slightly easier than pistol for most. Rear foot held up behind you instead of in front.'},
    {step:5, name:'Assisted Pistol Squat',     cue:'3×5/side with fingers on wall', detail:'Fingertips lightly touching a wall for balance only — not pushing through the arm.'},
    {step:6, name:'Pistol Squat',              cue:'3×5/side unassisted',    detail:'Free-standing single-leg squat to full depth. Extended leg stays off the floor throughout.'},
  ]},
  {id:'cal_shrimp_squat', name:'Shrimp Squat', muscles:['quads','glutes','hamstrings'], eq:[], impact:'low', goals:['calisthenics','strength','tone'], sets_h:'3×6/side', sets_s:'4×6', rest_h:90, rest_s:120, ytId:'qDcniqddTeE',
   progressions:[
    {step:1, name:'Rear-Foot Elevated Split Squat', cue:'3×10/side',        detail:'Rear foot on bench, front foot far forward. A lunge with more quad emphasis and balance challenge.'},
    {step:2, name:'Assisted Shrimp Squat',    cue:'3×6/side with support',  detail:'Hold something for balance. Bend rear knee toward floor, keeping torso upright.'},
    {step:3, name:'Shrimp Squat (above floor)', cue:'3×6/side rear knee above floor', detail:'Do not let rear knee touch. The additional inch of range makes it significantly harder.'},
    {step:4, name:'Full Shrimp Squat',        cue:'3×6/side knee to floor', detail:'Rear knee briefly touches floor at the bottom. High quad demand.'},
  ]},
  {id:'cal_lunge', name:'Walking Lunge', muscles:['quads','glutes','hamstrings'], eq:[], impact:'low', goals:['calisthenics','tone','lowimpact'], sets_h:'3×15/leg', sets_s:'4×12', rest_h:60, rest_s:90, ytId:'D7KaRcUTQeE',
   progressions:[
    {step:1, name:'Stationary Lunge (short)',  cue:'3×10/leg no knee pain',  detail:'Step forward, lower back knee toward floor, return to standing. Short stride if knee hurts.'},
    {step:2, name:'Reverse Lunge',             cue:'3×10/leg',               detail:'Step backward instead of forward. Easier on the knee than forward lunges.'},
    {step:3, name:'Walking Lunge',             cue:'3×12/leg',               detail:'Step forward, lower, push forward into the next step. Continuous motion.'},
    {step:4, name:'Weighted Walking Lunge',    cue:'Add dumbbells or backpack', detail:'Hold weights at sides or wear a loaded backpack. Progresses like any loaded exercise.'},
  ]},
  {id:'cal_nordic', name:'Nordic Curl', muscles:['hamstrings'], eq:[], impact:'low', goals:['calisthenics','strength'], sets_h:'3×5–8', sets_s:'4×5', rest_h:120, rest_s:180, ytId:'L7raxhEh73Y',
   progressions:[
    {step:1, name:'Lying Leg Curl (machine)', cue:'3×12 before attempting Nordic', detail:'Build hamstring strength on a machine or with a resistance band before Nordic curls.'},
    {step:2, name:'Glute-Ham Bridge',         cue:'3×15',                   detail:'Lying on floor, bridge up using hamstrings. Builds the same hip-to-knee hamstring chain.'},
    {step:3, name:'Assisted Nordic Curl',     cue:'3×5 with hand push-off', detail:'Use hands to push off floor at the bottom. Reduces the eccentric load so you can complete the rep.'},
    {step:4, name:'Nordic Curl (eccentric only)', cue:'3×5 slow 5-sec descent', detail:'Lower for 5 seconds, then use hands and momentum to get back to start. This builds the strength needed for full reps.'},
    {step:5, name:'Nordic Curl',              cue:'3×5 full reps',          detail:'Full concentric and eccentric. One of the most powerful exercises for hamstring injury prevention.'},
  ]},
  {id:'cal_l_sit', name:'L-Sit Hold', muscles:['core','triceps'], eq:[], impact:'low', goals:['calisthenics','strength','tone'], sets_h:'4×10–20s', sets_s:'5×15s', rest_h:60, rest_s:90, ytId:'ASdvN_XEl_c',
   progressions:[
    {step:1, name:'Seated Leg Compression',   cue:'3×10 reps pulling knees to chest', detail:'Sit on floor, hands beside hips. Lean back, pull knees to chest. Builds hip flexor strength for the L-sit.'},
    {step:2, name:'Support Hold',             cue:'3×30 sec straight-arm support', detail:'Hands on parallettes or chairs, straight arms, just hold yourself up. No leg raise yet.'},
    {step:3, name:'Tuck L-Sit',              cue:'3×10 sec',               detail:'Both knees raised to chest. Ankles below knees. This is the most accessible L-sit progression.'},
    {step:4, name:'One-Leg L-Sit',           cue:'3×10 sec/leg',           detail:'One leg extended, one knee tucked. Alternate legs.'},
    {step:5, name:'L-Sit Hold',              cue:'3×10 sec both legs extended', detail:'Both legs horizontal, fully extended. The full skill.'},
    {step:6, name:'L-Sit 20+ seconds',       cue:'Work toward 3×20 sec',   detail:'The benchmark for solid L-sit. Once there, progress to V-sit.'},
  ]},
  {id:'cal_hollow', name:'Hollow Body Hold', muscles:['core'], eq:[], impact:'low', goals:['calisthenics','strength','tone'], sets_h:'4×20–30s', sets_s:'5×25s', rest_h:45, rest_s:60, ytId:'LlDNef_Lcbd',
   progressions:[
    {step:1, name:'Dead Bug (arms only)',     cue:'3×10 reps',              detail:'Lie on back. Arms up, lower back pressed to floor. Lower and raise arms only. Learn to brace.'},
    {step:2, name:'Dead Bug (full)',          cue:'3×10/side',              detail:'Opposite arm and leg extend toward floor simultaneously. Lower back stays flat.'},
    {step:3, name:'Tuck Hollow Hold',         cue:'3×20 sec',               detail:'Knees tucked to chest, lower back pressed to floor, arms overhead. Hold. The foundation.'},
    {step:4, name:'Half-Hollow Body Hold',    cue:'3×20 sec',               detail:'One leg extended, other knee tucked. Alternate. Builds toward full extension.'},
    {step:5, name:'Hollow Body Hold',         cue:'3×20 sec full extension', detail:'Both legs extended and raised, arms overhead, lower back pressed flat to floor. The full shape.'},
    {step:6, name:'Hollow Body Rock',         cue:'3×10 rocks',             detail:'Rock forward and back while maintaining the hollow position. Teaches dynamic tension.'},
  ]},
  {id:'cal_muscle_up', name:'Muscle-Up (advanced)', muscles:['lats','chest','triceps','shoulders'], eq:['rack-pullup'], impact:'low', goals:['calisthenics','strength'], sets_h:'3×3–5', sets_s:'4×3', rest_h:180, rest_s:240, ytId:'eGo4IYlbE5g',
   progressions:[
    {step:1, name:'Pull-Up (10+ reps)',       cue:'Need 3×10 strict pull-ups first', detail:'Build to 10 solid pull-ups before attempting muscle-ups. This is non-negotiable.'},
    {step:2, name:'High Pull-Up',             cue:'3×5 chest-to-bar',       detail:'Pull until the bar reaches your chest. This builds the high-pull needed to transition.'},
    {step:3, name:'Bar Dip (3×10)',           cue:'Solid bar dips first',    detail:'The push portion of a muscle-up is a bar dip. Ensure this is solid before combining.'},
    {step:4, name:'Band-Assisted Muscle-Up',  cue:'3×3 with band',          detail:'A thick band removes enough weight to feel the transition. Learn the movement pattern.'},
    {step:5, name:'Negative Muscle-Up',       cue:'3×3 slow descent from top', detail:'Jump or press to the top position. Lower slowly through the transition — the hardest part.'},
    {step:6, name:'Kipping Muscle-Up',        cue:'Use momentum to learn',  detail:'A small swing generates momentum through the transition. Not cheating — it is a different skill.'},
    {step:7, name:'Strict Muscle-Up',         cue:'3×3 without momentum',   detail:'From a dead hang, pull and transition over the bar without any kip. Genuine strength requirement.'},
  ]},
  {id:'cal_handstand', name:'Handstand / Wall Handstand', muscles:['shoulders','core','triceps'], eq:[], impact:'low', goals:['calisthenics','strength'], sets_h:'4×20–30s', sets_s:'4×20s', rest_h:90, rest_s:120, ytId:'qEwKCR5JCog',
   progressions:[
    {step:1, name:'Pike Push-Up',             cue:'3×10',                   detail:'Hips high, hands and feet on floor in an inverted V. Press head toward floor then push back up. Builds overhead pressing strength.'},
    {step:2, name:'Elevated Pike Push-Up',    cue:'3×8 feet on bench',      detail:'Feet on a box or bench, hips high. Harder version of pike push-up — closer to the actual handstand angle.'},
    {step:3, name:'Wall Kick-Up (stomach to wall)', cue:'3×20 sec holds',   detail:'Kick up facing the wall. Stomach faces the wall. This is safer and easier to learn balance against.'},
    {step:4, name:'Wall Handstand (back to wall)', cue:'3×20 sec holds',    detail:'Back faces wall. Walk hands in until nearly freestanding. Teaches proper hollow body position.'},
    {step:5, name:'Chest-to-Wall Handstand HSPU', cue:'3×3 push-ups against wall', detail:'Handstand push-up with stomach facing wall. Full shoulder strength builder.'},
    {step:6, name:'Freestanding Handstand',   cue:'3×10 sec balance',       detail:'No wall. Finger tips control balance. Start with a spotter or near a wall for safety.'},
  ]},
  {id:'cal_burpee', name:'Burpee', muscles:['chest','quads','core','shoulders'], eq:[], impact:'high', goals:['calisthenics','fat','endurance'], sets_h:'5×10', sets_s:'5×15', rest_h:60, rest_s:60, ytId:'IODxDxX7oi4',
   progressions:[
    {step:1, name:'Half Burpee (no jump, no push-up)', cue:'3×10 no pain',    detail:'Squat → step back to plank → step forward → stand. Zero impact. Good starting point for knee issues.'},
    {step:2, name:'Step-Back Burpee (with push-up)',  cue:'3×8 controlled',  detail:'Squat → step back to plank → do 1 push-up → step forward → stand tall. No jumping at any point. This is what you want if you can do push-ups but cannot jump.'},
    {step:3, name:'Burpee (no jump)',                 cue:'3×10',            detail:'Squat → jump feet back to plank → do push-up → step feet forward → stand. Feet jump on the way back only — low knee impact on landing since you land in plank position.'},
    {step:4, name:'Burpee (full)',                    cue:'3×10 full form',  detail:'Full movement: squat → jump back to plank → push-up → jump forward → jump up with arms overhead. Full impact version.'},
    {step:5, name:'Burpee with Pull-Up',              cue:'3×8 with bar',    detail:'After the jump, grab the bar above and do a pull-up. Full body compound movement.'},
  ]},

  // ── MILITARY / TACTICAL ─────────────────────────────────
  {id:'mil_pushup_max',  name:'Push-Up Max Set (AFT)',     muscles:['chest','triceps','shoulders','core'], eq:[],              impact:'low',  goals:['military','endurance','strength'],  sets_h:'5×max',   sets_s:'5×max',  rest_h:60, rest_s:90,  ytId:'IODxDxX7oi4'},
  {id:'mil_pullup_max',  name:'Pull-Up Max Set',           muscles:['lats','biceps','back-upper'],         eq:['rack-pullup','acc-pullbar'], impact:'low', goals:['military','strength','endurance'],sets_h:'5×max', sets_s:'5×max', rest_h:90,rest_s:120, ytId:'eGo4IYlbE5g'},
  {id:'mil_plank_hold',  name:'Plank Hold (max time)',     muscles:['core'],                              eq:[],              impact:'low',  goals:['military','strength','endurance'],  sets_h:'4×max',   sets_s:'4×max',  rest_h:60, rest_s:60,  ytId:'ASdvN_XEl_c'},
  {id:'mil_situp_max',   name:'Sit-Up Max Set',            muscles:['core'],                              eq:[],              impact:'low',  goals:['military','endurance'],             sets_h:'4×max',   sets_s:'5×max',  rest_h:60, rest_s:60,  ytId:'MKmrqckCjpI'},
  {id:'mil_flutter',     name:'Flutter Kicks',             muscles:['core'],                              eq:[],              impact:'low',  goals:['military','endurance','tone'],      sets_h:'4×40',    sets_s:'5×40',   rest_h:30, rest_s:45,  ytId:'ASdvN_XEl_c'},
  {id:'mil_mtn_climber', name:'Mountain Climbers',         muscles:['core','quads','shoulders'],           eq:[],              impact:'high', goals:['military','fat','endurance'],       sets_h:'5×30s',   sets_s:'5×45s',  rest_h:30, rest_s:30,  ytId:'IODxDxX7oi4'},
  {id:'mil_sprint_25',   name:'Sprint Intervals (25–50m)', muscles:[],                                    eq:[],              impact:'high', goals:['military','fat','endurance'],       sets_h:'8×25m',   sets_s:'10×25m', rest_h:60, rest_s:60,  ytId:''},
  {id:'mil_sprint_400',  name:'400m Repeats',              muscles:[],                                    eq:[],              impact:'high', goals:['military','endurance'],             sets_h:'4×400m',  sets_s:'6×400m', rest_h:120,rest_s:120, ytId:''},
  {id:'mil_run_2mi',     name:'2-Mile Run (timed)',        muscles:[],                                    eq:[],              impact:'high', goals:['military','endurance'],             sets_h:'1×2mi',   sets_s:'1×2mi',  rest_h:0,  rest_s:0,   ytId:''},
  {id:'mil_burpee_circ', name:'Burpee + Pull-Up Circuit',  muscles:['chest','back-upper','core','quads'], eq:['rack-pullup','acc-pullbar'], impact:'high', goals:['military','fat','endurance'], sets_h:'5×5',    sets_s:'5×8',    rest_h:90, rest_s:60,  ytId:'eGo4IYlbE5g', desc:'5 burpees immediately into 5 pull-ups — no rest between. This is 1 round. Rest 90 sec between rounds. The combination taxes both pushing and pulling muscles with a cardiovascular demand. Significantly harder than burpees alone.'},
  {id:'mil_kb_carry',    name:'Kettlebell Farmer Carry',   muscles:['forearms','core','traps'],            eq:['acc-kb'],      impact:'low',  goals:['military','strength','endurance'],  sets_h:'4×40m',   sets_s:'5×40m',  rest_h:60, rest_s:60,  ytId:'mKDJeqHcTEk'},
  {id:'mil_ruck_march',  name:'Ruck March (30–45 lb pack)',muscles:[],                                    eq:[],              impact:'low',  goals:['military','endurance','fat'],        sets_h:'1×3–5 mi',sets_s:'1×3mi', rest_h:0,  rest_s:0,   ytId:''},
  {id:'mil_sandbag_squat',name:'Sandbag Squat',            muscles:['quads','glutes','core'],             eq:[],              impact:'low',  goals:['military','strength','endurance'],  sets_h:'4×15',    sets_s:'5×12',   rest_h:60, rest_s:90,  ytId:'aclHkVaku9U'},
  {id:'mil_broad_jump',  name:'Broad Jump / Standing Jump',muscles:['quads','glutes'],                    eq:[],              impact:'high', goals:['military','strength'],              sets_h:'4×5',     sets_s:'5×5',    rest_h:90, rest_s:120, ytId:'aclHkVaku9U'},
  {id:'mil_pt_circuit',  name:'PT Circuit (AMRAP)',        muscles:['chest','core','quads','back-upper'],  eq:[],              impact:'high', goals:['military','endurance','fat'],       sets_h:'3×10min', sets_s:'5×10min',rest_h:120,rest_s:90,  ytId:'IODxDxX7oi4', desc:'AMRAP = As Many Rounds As Possible. Set a 10-minute timer. Each round: 10 push-ups → 15 sit-ups → 20 air squats → (5 pull-ups if bar available, or 10 rows). Rest only when needed. Log how many complete rounds you finish. Beat that number next session. This is standard military PT conditioning — the goal is not perfection, it is sustained effort.'},
];

// ── Warm-ups & cool-downs (no equipment needed) ──────────
// ── Per-session-type: PREVIOUS DAY soreness stretches ───
// Static holds, 30–45 sec max (science: <45s has minimal strength impact)
const PREV_DAY_STRETCH_DB = {
  push:[
    {id:'pd_chest_static',  name:'STATIC CHEST STRETCH',        detail:'30 sec each side. Arm on doorframe, lean forward. Releases pec soreness from yesterday\'s pressing.',   ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'pd_shoulder_cross',name:'CROSS-BODY SHOULDER HOLD',    detail:'30 sec each side. Gently pull arm across chest. Eases anterior deltoid tightness.',                     ytId:'KFlSIhgZXOQ', type:'stretch'},
    {id:'pd_tricep_hold',   name:'TRICEP OVERHEAD HOLD',        detail:'30 sec each side. Arm overhead, gentle pressure from other hand. Releases elbow and long head tightness.',ytId:'YwTbYJhLBY4', type:'stretch'},
  ],
  pull:[
    {id:'pd_lat_static',    name:'DOORWAY LAT HOLD',            detail:'30 sec each side. Hold doorframe, lean away. Releases lat soreness after rows.',                         ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'pd_bicep_door',    name:'BICEP DOORFRAME STRETCH',     detail:'30 sec each arm. Palm flat on wall behind you, rotate away. Eases bicep tendon soreness.',               ytId:'bJ1JxDL89P0', type:'stretch'},
    {id:'pd_childs_pose',   name:"CHILD'S POSE",                detail:'45 sec. Kneel, arms forward, sink hips back. Decompresses entire posterior chain from pull work.',        ytId:'eqVMAPM00GM', type:'stretch'},
  ],
  legs:[
    {id:'pd_pigeon',        name:'PIGEON STRETCH',              detail:'45 sec each side. Front shin at 90°, sink hips. Releases glute and hip soreness from squats and lunges.', ytId:'O11Md_bJCfk', type:'stretch'},
    {id:'pd_quad_static',   name:'STANDING QUAD HOLD',          detail:'30 sec each leg. Pull heel to glutes. Eases quad tightness from leg day.',                               ytId:'1f9sDHSIMFc', type:'stretch'},
    {id:'pd_ham_static',    name:'SEATED HAMSTRING HOLD',       detail:'40 sec each leg. Leg extended, reach toward foot. Releases post-leg-day hamstring tightness.',           ytId:'Tio35lx0bic', type:'stretch'},
    {id:'pd_hip_flexor',    name:'HIP FLEXOR LUNGE HOLD',       detail:'40 sec each side. Rear knee down, push hips forward. Reverses hip compression from heavy squats.',       ytId:'YQmpR9OO7Zk', type:'stretch'},
  ],
  upper:[
    {id:'pd_chest_static',  name:'STATIC CHEST STRETCH',        detail:'30 sec each side.',  ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'pd_lat_static',    name:'DOORWAY LAT HOLD',            detail:'30 sec each side.',  ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'pd_shoulder_cross',name:'CROSS-BODY SHOULDER HOLD',    detail:'30 sec each side.',  ytId:'KFlSIhgZXOQ', type:'stretch'},
  ],
  fullbody:[
    {id:'pd_childs_pose',   name:"CHILD'S POSE",                detail:'45 sec. Full back release.',                                                                               ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'pd_pigeon',        name:'PIGEON STRETCH',              detail:'40 sec each side. Hips and glutes.',                                                                       ytId:'O11Md_bJCfk', type:'stretch'},
    {id:'pd_chest_static',  name:'STATIC CHEST STRETCH',        detail:'30 sec each side.',                                                                                        ytId:'eTlnJYWv9Y4', type:'stretch'},
  ],
  yoga:  [{id:'pd_full_body_flow',name:"GENTLE FULL-BODY FLOW", detail:'5 min. Cat-cow, thread needle, supine twist — full passive release before practice.', ytId:'eqVMAPM00GM', type:'stretch'}],
  pilates:[{id:'pd_pil_roll',name:'SPINAL ROLL-DOWN',           detail:'5 reps slowly. Articulate each vertebra, hands toward floor. Wakes the spine gently.',  ytId:'eqVMAPM00GM', type:'stretch'}],
  calisthenics:[
    {id:'pd_cal_chest',  name:'STATIC CHEST STRETCH',    detail:'30 sec each side. Releases pec and shoulder soreness from push progressions.',              ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'pd_cal_lat',    name:'DOORWAY LAT HOLD',         detail:'30 sec each side. Releases lat soreness from pull work.',                                   ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'pd_cal_quad',   name:'STANDING QUAD HOLD',       detail:'30 sec each leg. Releases quad tightness from squat progressions.',                         ytId:'1f9sDHSIMFc', type:'stretch'},
  ],
  military:[
    {id:'pd_mil_light',  name:'GENTLE FULL-BODY SCAN',    detail:'2 min. Note sore spots. Light torso rotation, ankle circles, wrist circles. Military cool-downs are brief — just identify what needs attention today.', ytId:'eqVMAPM00GM', type:'stretch'},
  ],
};

// ── TODAY'S PRE-STRETCH — dynamic, <45 sec per movement ─
// Science: dynamic > static pre-workout for performance
const PRE_STRETCH_DB = {
  push:[
    {id:'ps_arm_swings',    name:'ARM SWINGS (front/back)',      detail:'20 reps each. Arms swing freely across chest and behind. Dynamic pec and shoulder mobility.',             ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_shoulder_circ', name:'SHOULDER CIRCLES',             detail:'15 large circles forward, 15 backward. Lubricates the shoulder joint capsule before pressing.',           ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_thoracic_open', name:'THORACIC OPENER (dynamic)',    detail:'10 reps. Hands behind head, rotate and open chest side to side. Opens mid-back for overhead work.',       ytId:'NVFfJlBNJsI', type:'stretch'},
    {id:'ps_chest_open',    name:'DOORWAY DYNAMIC STRETCH',      detail:'10 slow lean-throughs each side. <20 sec hold. Opens chest without impairing pressing strength.',         ytId:'eTlnJYWv9Y4', type:'stretch'},
  ],
  pull:[
    {id:'ps_lat_reach',     name:'REACHING LAT MOBILIZATION',   detail:'10 reps each side. Reach arm overhead, side-bend, feel lat lengthen. Dynamic, no hold.',                  ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'ps_cat_cow',       name:'CAT-COW (dynamic)',            detail:'10 reps. Spine flexion/extension on all fours. Primes back for rowing patterns.',                         ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'ps_shoulder_circ', name:'SHOULDER CIRCLES',             detail:'15 forward, 15 backward.',                                                                                ytId:'1u9-YNjFm0g', type:'stretch'},
  ],
  legs:[
    {id:'ps_hip_circ',      name:'HIP CIRCLES (dynamic)',        detail:'20 reps each direction. Large circles, slow. Warms the hip joint capsule.',                              ytId:'bVnBdaYn0hY', type:'stretch'},
    {id:'ps_leg_swings_fb', name:'LEG SWINGS (front/back)',      detail:'15 each leg. Hold wall, swing leg front to back. Dynamic hamstring + hip flexor stretch.',               ytId:'KFZ5hLJbR9o', type:'stretch'},
    {id:'ps_leg_swings_lat',name:'LEG SWINGS (side to side)',    detail:'15 each leg. Lateral swing across body. Opens adductors and glute medius.',                              ytId:'KFZ5hLJbR9o', type:'stretch'},
    {id:'ps_ankle_circles', name:'ANKLE CIRCLES',                detail:'10 each direction per ankle. Often skipped — crucial for squat depth and ankle dorsiflexion.',           ytId:'bVnBdaYn0hY', type:'stretch'},
  ],
  upper:[
    {id:'ps_arm_swings',    name:'ARM SWINGS (front/back)',      detail:'20 reps. Dynamic pec and shoulder mobility.',                                                             ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_cat_cow',       name:'CAT-COW (dynamic)',            detail:'10 reps. Full spinal mobilization.',                                                                      ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'ps_thoracic_open', name:'THORACIC OPENER (dynamic)',    detail:'10 reps. Open chest for pressing and pulling.',                                                           ytId:'NVFfJlBNJsI', type:'stretch'},
    {id:'ps_lat_reach',     name:'REACHING LAT MOBILIZATION',   detail:'10 reps each side.',                                                                                      ytId:'lPOOpNe6JM4', type:'stretch'},
  ],
  fullbody:[
    {id:'ps_arm_swings',    name:'ARM SWINGS (front/back)',      detail:'20 reps.',                                                                                               ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_hip_circ',      name:'HIP CIRCLES (dynamic)',        detail:'20 reps each direction.',                                                                                 ytId:'bVnBdaYn0hY', type:'stretch'},
    {id:'ps_cat_cow',       name:'CAT-COW (dynamic)',            detail:'10 reps.',                                                                                                ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'ps_leg_swings_fb', name:'LEG SWINGS (front/back)',      detail:'15 each leg.',                                                                                           ytId:'KFZ5hLJbR9o', type:'stretch'},
  ],
  yoga:[
    {id:'ps_sun_sal_a',     name:'SUN SALUTATION A (3 rounds)', detail:'3 slow rounds of Mountain→Forward Fold→Plank→Cobra→Downward Dog. Warms the entire body for practice.',  ytId:'eqVMAPM00GM', type:'stretch'},
  ],
  pilates:[
    {id:'ps_pil_bridge',    name:'PILATES BRIDGE ROLLS',         detail:'8 reps. Slowly peel spine off floor one vertebra at a time. Activates posterior chain and spine.',      ytId:'wPM8icPu6H8', type:'stretch'},
    {id:'ps_pil_hundred_p', name:'MODIFIED HUNDRED PREP',        detail:'5 reps. Legs tabletop, pump arms 10×, exhale. Warms core and breath connection.',                       ytId:'ASdvN_XEl_c', type:'activate'},
  ],
  calisthenics:[
    {id:'ps_cal_wrist',     name:'WRIST CIRCLES & PREP',          detail:'30 sec each direction. Calisthenics athletes neglect wrists — prep them before push work or risk injury.',  ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_cal_shoulder',  name:'SHOULDER CIRCLES (large)',       detail:'15 forward, 15 backward. Lubricates shoulder capsule before weighted bodyweight movements.',               ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_cal_hip_circ',  name:'HIP CIRCLES (dynamic)',          detail:'20 reps each direction. Essential for squat progressions.',                                                ytId:'bVnBdaYn0hY', type:'stretch'},
    {id:'ps_cal_cat_cow',   name:'CAT-COW (dynamic)',              detail:'10 reps. Full spinal mobilization before core and plank work.',                                           ytId:'eqVMAPM00GM', type:'stretch'},
  ],
  military:[
    {id:'ps_mil_arm_swing',  name:'ARM SWINGS (front/back)',       detail:'20 reps each. Dynamic chest and shoulder opener.',                                                        ytId:'1u9-YNjFm0g', type:'stretch'},
    {id:'ps_mil_high_knees', name:'HIGH KNEES (dynamic)',          detail:'30 sec. Running in place, driving knees high. Elevates heart rate and warms hips.',                      ytId:'KFZ5hLJbR9o', type:'stretch'},
    {id:'ps_mil_leg_swings', name:'LEG SWINGS (front/back)',       detail:'15 each leg. Dynamic hamstring and hip flexor prep before sprints.',                                     ytId:'KFZ5hLJbR9o', type:'stretch'},
  ],
};

// ── MUSCLE ACTIVATION ────────────────────────────────────
const WARMUP_DB = {
  push:[
    {id:'wu_pushup_plus',   name:'PUSH-UP PLUS',           detail:'10 reps. At top of push-up, push extra through shoulder blades — activates serratus anterior.',        ytId:'B5OhsRuaD30', type:'activate'},
    {id:'wu_scap_push',     name:'SCAPULAR PUSH-UPS',      detail:'10 reps. Arms locked, pinch and spread shoulder blades. Primes back for pressing stability.',          ytId:'akgQbxhrhOc', type:'activate'},
    {id:'wu_band_pull',     name:'BAND PULL-APARTS',       detail:'20 reps. Band at chest height, pull apart to T. Activates rear delts — prevents impingement.',         ytId:'0kgSBxbG6zo', type:'activate'},
  ],
  pull:[
    {id:'wu_band_pull',     name:'BAND PULL-APARTS',       detail:'20 reps. Activates rear delts and rhomboids.',                                                         ytId:'0kgSBxbG6zo', type:'activate'},
    {id:'wu_prone_cobra',   name:'PRONE COBRA',            detail:'10 reps, 2-sec hold. Activates mid-back and erectors.',                                                ytId:'Mfbv5XEGZJI', type:'activate'},
    {id:'wu_scap_retract',  name:'SCAPULAR RETRACTIONS',   detail:'15 reps. Squeeze shoulder blades hard toward spine. Establishes scapular control before rows.',        ytId:'akgQbxhrhOc', type:'activate'},
    {id:'wu_ham_curl_light',name:'LIGHT CURL WARM-UP',     detail:'15 reps, very light. Warms brachialis before supinated curls.',                                        ytId:'0xyZbNqL_U0', type:'activate'},
  ],
  legs:[
    {id:'wu_glute_bridge',  name:'GLUTE BRIDGE',           detail:'15 reps, 2-sec hold at top. The #1 glute activation before squats. Prevents quad dominance.',          ytId:'wPM8icPu6H8', type:'activate'},
    {id:'wu_clamshell',     name:'CLAMSHELL',              detail:'20 reps each side. Band optional. Activates glute medius — prevents knee cave on squats.',             ytId:'5bNq7KKGV4E', type:'activate'},
    {id:'wu_bw_squat',      name:'BODYWEIGHT SQUAT',       detail:'15 reps, slow eccentric (3-sec down). Primes movement pattern under zero load.',                       ytId:'aclHkVaku9U', type:'activate'},
  ],
  upper:[
    {id:'wu_arm_circles',   name:'ARM CIRCLES',            detail:'30 reps each direction — small to large.',                                                             ytId:'1u9-YNjFm0g', type:'activate'},
    {id:'wu_band_pull',     name:'BAND PULL-APARTS',       detail:'20 reps. Activates rear delts.',                                                                      ytId:'0kgSBxbG6zo', type:'activate'},
    {id:'wu_scap_push',     name:'SCAPULAR PUSH-UPS',      detail:'10 reps. Primes back for pressing.',                                                                  ytId:'akgQbxhrhOc', type:'activate'},
    {id:'wu_prone_cobra',   name:'PRONE COBRA',            detail:'10 reps, 2-sec hold.',                                                                                ytId:'Mfbv5XEGZJI', type:'activate'},
  ],
  fullbody:[
    {id:'wu_arm_circles',   name:'ARM CIRCLES',            detail:'30 reps each direction.',                                                                             ytId:'1u9-YNjFm0g', type:'activate'},
    {id:'wu_glute_bridge',  name:'GLUTE BRIDGE',           detail:'15 reps, 2-sec hold.',                                                                               ytId:'wPM8icPu6H8', type:'activate'},
    {id:'wu_band_pull',     name:'BAND PULL-APARTS',       detail:'20 reps.',                                                                                           ytId:'0kgSBxbG6zo', type:'activate'},
    {id:'wu_bw_squat',      name:'BODYWEIGHT SQUAT',       detail:'10 reps, slow eccentric.',                                                                           ytId:'aclHkVaku9U', type:'activate'},
  ],
  yoga:[
    {id:'wu_yoga_breath',   name:'PRANAYAMA BREATH WORK',  detail:'3 min. 4-count inhale, 4-count hold, 8-count exhale. Activates parasympathetic system, focuses mind.', ytId:'ASdvN_XEl_c', type:'activate'},
  ],
  pilates:[
    {id:'wu_pil_toe_tap',   name:'TOE TAPS (tabletop)',    detail:'10 reps each leg. Legs at 90°, lower one foot to tap floor, return. Core stays flat. Neutral spine awareness.', ytId:'ASdvN_XEl_c', type:'activate'},
    {id:'wu_pil_arm_circ',  name:'PILATES ARM CIRCLES',    detail:'8 each direction. Arms straight, draw small circles at shoulder height. Scapular stabilization.',     ytId:'1u9-YNjFm0g', type:'activate'},
  ],
  calisthenics:[
    {id:'wu_cal_scap',      name:'SCAPULAR PUSH-UPS',      detail:'10 reps. Arms locked, protract/retract shoulder blades. Essential pre-activation for push progressions.', ytId:'akgQbxhrhOc', type:'activate'},
    {id:'wu_cal_dead_hang', name:'DEAD HANG',              detail:'20–30 sec. Decompresses spine, activates grip, primes lats for pull work.',                              ytId:'VJTZ7cGmkEo', type:'activate'},
    {id:'wu_cal_glute_br',  name:'GLUTE BRIDGE',           detail:'15 reps, 2-sec hold. Activates glutes before squat progressions.',                                      ytId:'wPM8icPu6H8', type:'activate'},
    {id:'wu_cal_hollow_p',  name:'HOLLOW BODY HOLD (short)',detail:'3×10 sec. Establishes tension position foundational to all calisthenics skills.',                      ytId:'LlDNef_Lcbd', type:'activate'},
  ],
  military:[
    {id:'wu_mil_pushup_p',  name:'PUSH-UP PYRAMID (1→5)',  detail:'1,2,3,4,5 reps — fast. Low-volume priming set. Classic military activation before max effort.',         ytId:'IODxDxX7oi4', type:'activate'},
    {id:'wu_mil_squat_p',   name:'BODYWEIGHT SQUAT ×15',   detail:'Fast, explosive. Primes quads and glutes before sprint and carry work.',                                ytId:'aclHkVaku9U', type:'activate'},
    {id:'wu_mil_core_brace',name:'CORE BRACING DRILL',     detail:'5×5 sec hard brace. Stand tall, breathe in, brace abdomen as if about to take a punch. Activates TVA.', ytId:'ASdvN_XEl_c', type:'activate'},
  ],
};

// ── COOL-DOWN — static stretches, 60–90 sec (post-workout = correct timing per science) ──
const COOLDOWN_DB = {
  push:[
    {id:'cd_chest_stretch', name:'DOORWAY CHEST STRETCH',  detail:'60 sec each side. Arm at 90°, lean into doorframe. Full pec + anterior shoulder release.',            ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'cd_cb_shoulder',   name:'CROSS-BODY SHOULDER',    detail:'45 sec each side. Pull arm across body at elbow. Releases rear deltoid.',                             ytId:'KFlSIhgZXOQ', type:'stretch'},
    {id:'cd_tricep_stretch',name:'TRICEP OVERHEAD STRETCH',detail:'45 sec each side. Arm overhead, bend elbow, pull gently with other hand.',                            ytId:'YwTbYJhLBY4', type:'stretch'},
    {id:'cd_thoracic_ext',  name:'THORACIC EXTENSION',     detail:'60 sec. Sit against bench edge at mid-back. Extend over it, arms behind head. Undoes desk posture.',  ytId:'NVFfJlBNJsI', type:'stretch'},
  ],
  pull:[
    {id:'cd_lat_stretch',   name:'DOORWAY LAT STRETCH',    detail:'60 sec each side. Hold doorframe, lean away from arm. Full lat and teres major release.',             ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'cd_childs_pose',   name:"CHILD'S POSE",           detail:'90 sec. Kneel, arms extended forward, forehead to floor. Full spinal decompression.',                ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'cd_bicep_door',    name:'BICEP DOORFRAME STRETCH',detail:'45 sec each arm. Arm straight, palm on wall behind you, rotate away.',                                ytId:'bJ1JxDL89P0', type:'stretch'},
    {id:'cd_thoracic_rot',  name:'THORACIC ROTATION',      detail:'45 sec each side. Seated, hands behind head, rotate from mid-back.',                                 ytId:'NVFfJlBNJsI', type:'stretch'},
  ],
  legs:[
    {id:'cd_pigeon',        name:'PIGEON STRETCH',         detail:'90 sec each side. Front leg at 90°, sink hips toward floor. Deepest glute and hip opener.',           ytId:'O11Md_bJCfk', type:'stretch'},
    {id:'cd_quad_stretch',  name:'STANDING QUAD STRETCH',  detail:'45 sec each leg. Pull foot to glutes, knees together. Fully releases quad tension.',                  ytId:'1f9sDHSIMFc', type:'stretch'},
    {id:'cd_hamstring',     name:'SEATED HAMSTRING STRETCH',detail:'60 sec each leg. Extend leg, reach toward foot, hold. Releases post-RDL hamstring tension.',         ytId:'Tio35lx0bic', type:'stretch'},
    {id:'cd_hip_flexor',    name:'HIP FLEXOR LUNGE STRETCH',detail:'60 sec each side. Rear knee down, push hips forward. Reverses hip flexor compression.',             ytId:'YQmpR9OO7Zk', type:'stretch'},
  ],
  upper:[
    {id:'cd_chest_stretch', name:'DOORWAY CHEST STRETCH',  detail:'60 sec each side.',                                                                                   ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'cd_lat_stretch',   name:'DOORWAY LAT STRETCH',    detail:'60 sec each side.',                                                                                   ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'cd_childs_pose',   name:"CHILD'S POSE",           detail:'60 sec.',                                                                                              ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'cd_thoracic_rot',  name:'THORACIC ROTATION',      detail:'45 sec each side.',                                                                                   ytId:'NVFfJlBNJsI', type:'stretch'},
  ],
  fullbody:[
    {id:'cd_childs_pose',   name:"CHILD'S POSE",           detail:'60 sec. Full back decompression.',                                                                    ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'cd_pigeon',        name:'PIGEON STRETCH',         detail:'60 sec each side. Hips and glutes.',                                                                  ytId:'O11Md_bJCfk', type:'stretch'},
    {id:'cd_chest_stretch', name:'DOORWAY CHEST STRETCH',  detail:'60 sec each side.',                                                                                   ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'cd_thoracic_ext',  name:'THORACIC EXTENSION',     detail:'60 sec.',                                                                                             ytId:'NVFfJlBNJsI', type:'stretch'},
  ],
  yoga:[
    {id:'cd_savasana',      name:'SAVASANA (CORPSE POSE)', detail:'5 min. Lie flat, arms at sides, eyes closed. Full nervous system integration after practice.',        ytId:'eqVMAPM00GM', type:'stretch'},
    {id:'cd_supta_twist',   name:'SUPINE SPINAL TWIST',   detail:'60 sec each side. Lie on back, draw knee across body. Full spinal and hip release.',                   ytId:'O11Md_bJCfk', type:'stretch'},
  ],
  pilates:[
    {id:'cd_pil_swan',      name:'SWAN STRETCH',           detail:'45 sec. Lie prone, press up on forearms, look forward. Releases rectus abdominis after core work.',   ytId:'Mfbv5XEGZJI', type:'stretch'},
    {id:'cd_pil_stretch',   name:'STANDING SIDE STRETCH',  detail:'30 sec each side. Arm overhead, reach to opposite side. Full lateral chain release after Pilates.',   ytId:'lPOOpNe6JM4', type:'stretch'},
  ],
  calisthenics:[
    {id:'cd_cal_chest',     name:'DOORWAY CHEST STRETCH',  detail:'60 sec each side. Releases pec tightness accumulated from push progressions.',                        ytId:'eTlnJYWv9Y4', type:'stretch'},
    {id:'cd_cal_lat',       name:'DOORWAY LAT STRETCH',    detail:'60 sec each side. Full lat release after pull work.',                                                 ytId:'lPOOpNe6JM4', type:'stretch'},
    {id:'cd_cal_wrist_ext', name:'WRIST EXTENSION STRETCH',detail:'45 sec each hand. Palm facing forward, fingers down, gently press back. Calisthenics-specific — reverses wrist load from push work.', ytId:'bJ1JxDL89P0', type:'stretch'},
    {id:'cd_cal_pigeon',    name:'PIGEON STRETCH',         detail:'60 sec each side. Releases hip tightness from squat progressions.',                                   ytId:'O11Md_bJCfk', type:'stretch'},
    {id:'cd_cal_childs',    name:"CHILD'S POSE",           detail:'60 sec. Full spinal decompression after hollow holds and L-sits.',                                    ytId:'eqVMAPM00GM', type:'stretch'},
  ],
  military:[
    // Military: intentionally short — 3-5 min max, minimal holds, breathing priority
    {id:'cd_mil_breath',    name:'DIAPHRAGMATIC BREATHING',detail:'2 min. Hands on belly. Slow 4-count inhale, 6-count exhale. Drives cortisol down after high-intensity work. #1 military recovery tool.', ytId:'ASdvN_XEl_c', type:'stretch'},
    {id:'cd_mil_quad',      name:'STANDING QUAD STRETCH',  detail:'20 sec each leg. Brief static hold. Minimum dose for quad recovery after sprints and carries.',       ytId:'1f9sDHSIMFc', type:'stretch'},
    {id:'cd_mil_chest',     name:'CHEST OPENER HOLD',      detail:'20 sec. Clasp hands behind back, open chest. Quick posterior chain reset after push-up volume.',      ytId:'eTlnJYWv9Y4', type:'stretch'},
  ],
};

// ── Helpers ──────────────────────────────────────────────
function userHasEquipment(req, eq) {
  if (!req || req.length === 0) return true; // bodyweight
  return req.every(r => eq[r]);
}

function pickExercises(musclePriority, goalIds, eq, isLowImpact, isStrength, count, sessionType, goalPriority, glutesIsPriority, alreadyUsed, variationBoost) {
  // Mode-exclusive filtering: yoga/pilates/calisthenics/military sessions
  // must ONLY draw from their own exercise pool, never from weighted exercises
  const exclusiveModes = ['yoga','pilates','calisthenics','military'];
  const isExclusiveMode = exclusiveModes.includes(sessionType);

  // For upper/lower splits: strictly enforce muscle-group separation
  // Upper days MUST NOT contain lower-body exercises and vice versa
  const UPPER_MUSCLES = new Set(['chest','back-upper','back-lower','lats','shoulders','biceps','triceps','forearms']);
  const LOWER_MUSCLES = new Set(['quads','hamstrings','glutes','hips','calves','core']);
  const PUSH_MUSCLES  = new Set(['chest','shoulders','triceps']);
  const PULL_MUSCLES  = new Set(['back-upper','back-lower','lats','biceps','forearms']);
  const isUpperSession = sessionType === 'upper';
  const isLowerSession = sessionType === 'lower' || sessionType === 'legs';
  const isPushSession  = sessionType === 'push';
  const isPullSession  = sessionType === 'pull';

  // Pure glute isolation exercises — get a hard priority boost when glutes are the goal
  const PURE_GLUTE_IDS = new Set(['glute_bridge','hip_thrust_db','hip_thrust_bb','fire_hydrant','donkey_kick','cable_kickback','hip_abduct_mach']);

  const scored = EX_DB
    .filter(e => {
      if (!userHasEquipment(e.eq, eq)) return false;
      if (isLowImpact && e.impact === 'high') return false;
      if (e.block_from_generator) return false;

      // Mode-exclusive sessions (yoga/pilates/calisthenics/military) only draw
      // from their own exercise pool — match by sessionType goal tag only
      if (isExclusiveMode) {
        return e.goals.includes(sessionType);
      }

      // ── STRICT UPPER/LOWER SEPARATION ────────────────────
      // Upper sessions: only exercises whose PRIMARY muscle is an upper body muscle
      // Lower sessions: only exercises whose PRIMARY muscle is a lower body muscle
      // Push: chest/shoulders/triceps only. Pull: back/lats/biceps only.
      // This prevents squats showing up on chest day, or bench press on leg day
      if (isUpperSession) {
        const primary = e.muscles[0];
        if (!UPPER_MUSCLES.has(primary)) return false;
      }
      if (isLowerSession) {
        const primary = e.muscles[0];
        if (!LOWER_MUSCLES.has(primary)) return false;
      }
      if (isPushSession) {
        const primary = e.muscles[0];
        if (!PUSH_MUSCLES.has(primary)) return false;
      }
      if (isPullSession) {
        const primary = e.muscles[0];
        if (!PULL_MUSCLES.has(primary)) return false;
      }

      // Standard mode: match by muscle in session's musclePriority list
      const muscleMatch = e.muscles.some(m => musclePriority.includes(m));
      // Exclude mode-exclusive exercises from standard sessions
      const isExclusiveEx = exclusiveModes.some(m => e.goals.includes(m) && !goalIds.includes(m));
      if (isExclusiveEx) return false;

      // For split sessions: muscle match is REQUIRED (no goal-only fallback)
      // For fullbody: allow goal match as fallback
      if (isUpperSession || isLowerSession || isPushSession || isPullSession) {
        return muscleMatch;
      }
      const goalMatch = e.goals.some(g => goalIds.includes(g));
      return muscleMatch || goalMatch;
    })
    .map(e => {
      let score = 0;

      // Muscle priority scoring — position in priority list matters
      e.muscles.forEach((m, mIdx) => {
        const priorityIdx = musclePriority.indexOf(m);
        if (priorityIdx >= 0) {
          // Higher score for muscles earlier in the priority list
          score += (3 + Math.max(0, 5 - priorityIdx));
        }
      });

      // Goal matching — weighted by priority
      e.goals.forEach(g => {
        if (goalIds.includes(g)) {
          const priorityBoost = goalPriority ? (goalPriority[g] || 1) : 1;
          score += 2 * priorityBoost;
        }
      });

      if (isStrength && e.goals.includes('strength')) score += 4;

      // Glute isolation boost: when glutes are the #1 body-part priority
      if (glutesIsPriority && PURE_GLUTE_IDS.has(e.id)) score += 8;
      if (glutesIsPriority && e.muscles[0] === 'glutes')  score += 4;

      // User muscle priority list boost: rank 1 = +6, rank 2 = +4, rank 3 = +2
      // So explicitly ranked muscles win over generic muscle-match scoring
      if (musclePriority && musclePriority.length) {
        // musclePriority here is boostedMuscles (the passed-in array)
        // Check if this exercise's primary muscle is in the top 3 positions
        const primaryMuscle = e.muscles[0];
        const rankIdx = musclePriority.indexOf(primaryMuscle);
        if (rankIdx === 0) score += 6;
        else if (rankIdx === 1) score += 4;
        else if (rankIdx === 2) score += 2;
      }

      // Downgrade exercises already used on a prior day of the same session type
      // variationBoost doubles the penalty for on-and-off trainers or not-seeing-results
      if (alreadyUsed && alreadyUsed.has(e.id)) {
        score -= variationBoost ? 20 : 10;
      }

      return { ...e, score };
    })
    .sort((a,b) => b.score - a.score);

  // De-duplicate overlapping muscles — pick top-scored, avoid repeating same primary muscle
  // When glutes are priority, allow multiple glute-primary exercises (up to 3)
  // Also block exercises from the same movement FAMILY in the same session
  const EXERCISE_FAMILIES = {
    // All burpee variants — never pair two burpees in same session
    'cal_burpee':      'burpee', 'mil_burpee_circ': 'burpee', 'mil_pt_circuit': 'burpee',
    'cal_pushup':      'pushup', 'cal_diamond_pu':  'pushup', 'cal_archer_pu': 'pushup',
      'cal_pseudo_planch':'pushup', 'push_up': 'pushup', 'mil_pushup_max':'pushup',
    'cal_pullup':      'pullup', 'cal_chinup':      'pullup', 'cal_archer_pu2':'pullup',
      'cal_muscle_up':  'pullup', 'mil_pullup_max': 'pullup',
    'cal_dip':         'dip',    'bench_dip':       'dip',
    'bb_squat':        'squat',  'goblet_squat':    'squat',  'cal_bw_squat':  'squat',
      'sumo_squat':    'squat',  'leg_press':       'squat',
    'rdl_db':          'deadlift','rdl_bb':          'deadlift','deadlift_db':  'deadlift',
      'deadlift_bb':   'deadlift','trap_deadlift':   'deadlift',
    'hip_thrust_db':   'hinge',  'hip_thrust_bb':   'hinge',  'glute_bridge':  'hinge',
  };

  const chosen = [];
  const usedPrimary  = {};
  const usedFamilies = new Set();
  const maxPerMuscle = glutesIsPriority ? { glutes: 3, hips: 2 } : {};

  for (const ex of scored) {
    if (chosen.length >= count) break;
    const primary = ex.muscles[0] || '_none';
    const family  = EXERCISE_FAMILIES[ex.id];

    // Block if same movement family already chosen (e.g. no burpee + burpee circuit)
    if (family && usedFamilies.has(family)) continue;

    const currentCount = usedPrimary[primary] || 0;
    const limit = maxPerMuscle[primary] || 1;
    if (currentCount >= limit && chosen.length >= Math.ceil(count * 0.7)) continue;

    chosen.push(ex);
    usedPrimary[primary] = currentCount + 1;
    if (family) usedFamilies.add(family);
  }
  return chosen;
}

function exerciseToWorkoutItem(ex, dayKey, idx, isStrength, defaultSets) {
  const rawSets = isStrength ? ex.sets_s : ex.sets_h;
  const rest    = isStrength ? ex.rest_s : ex.rest_h;
  const restStr = rest >= 120 ? `${Math.round(rest/60)} min` : rest > 0 ? `${rest} sec` : '';
  const badge   = isStrength ? 'STRENGTH' : ex.goals.includes('size') ? 'HYPERTROPHY' : ex.goals.includes('tone') ? 'TONE' : 'CONDITIONING';

  // Apply defaultSets override — replace the sets number but keep the reps notation
  // e.g. "3×10–12" → "4×10–12" if defaultSets=4
  let sets = rawSets;
  if (defaultSets && typeof rawSets === 'string') {
    sets = rawSets.replace(/^\d+/, String(defaultSets));
  }

  return {
    id: `gen_${dayKey}_${idx}_${ex.id}`,
    name: ex.name.toUpperCase(),
    badge,
    sets,
    rest: restStr,
    ytId: ex.ytId || '',
    desc: `Targets: ${ex.muscles.join(', ')}. ${sets} · ${restStr ? restStr + ' rest' : 'minimal rest'}.`,
    generated: true,
    progressions: ex.progressions || null, // carry the progression ladder
  };
}

// ── Pump-specific item converter ─────────────────────────
// Science: metabolic stress / sarcoplasmic hypertrophy protocol.
// Schoenfeld (2013): high-rep sets at ~50-60% 1RM with short rest maximise
// lactate, H+ ion, and GH accumulation — a distinct stimulus from the
// mechanical tension of the core workout's heavier sets. Both stimuli
// together produce more hypertrophy than either alone.
// Protocol: 3 sets x 15-20 reps, 30-45 sec rest, ~50-60% working weight.
function pumpExerciseToWorkoutItem(ex, dayKey, idx) {
  // Push reps higher than the exercise's normal working range
  const baseReps = ex.sets_h || '3x12';
  const topRepMatch = baseReps.match(/[x×](\d+)/);
  const topRep = topRepMatch ? parseInt(topRepMatch[1]) : 12;
  const pumpReps = topRep <= 10 ? '15-20' : topRep <= 14 ? '20-25' : '25-30';

  return {
    id: `gen_${dayKey}_${idx}_${ex.id}`,
    name: ex.name.toUpperCase(),
    badge: 'PUMP',
    sets: `3x${pumpReps}`,
    rest: '30-45 sec',
    ytId: ex.ytId || '',
    desc: `PUMP SET — ${ex.muscles.join(', ')}. Use ~50-60% of your working weight. ` +
          `Focus on the squeeze and the burn, not the load. ` +
          `Short rest keeps metabolites (lactate, H+) elevated — ` +
          `this drives the growth hormone response that complements the heavy work above.`,
    generated: true,
    pump: true,
    progressions: null,
  };
}

// ── Master program generator ─────────────────────────────
function generateProgram() {
  const eq     = SESSION.equipment || {};
  const goals  = userGoals || {};
  const focus  = goals.trainingFocus || [];
  const flags  = goals.specialFlags  || [];
  const bpg    = goals.bodyPartGoals || {};
  const freq   = goals.workoutFreq   || 4;
  const days   = [...(goals.workoutDays ? goals.workoutDays : ['mon','tue','wed','thu'])];
  const dur    = goals.sessionDuration || 60;
  const isBeginner      = flags.includes('flag-beginner');
  const isAdvanced      = flags.includes('flag-advanced');
  const isLowImpact     = flags.includes('flag-lowimpact');
  const isStrength      = focus.includes('focus-strength');
  const isFatLoss       = focus.includes('focus-fatloss') || focus.includes('focus-visceral') || focus.includes('focus-weightloss');
  const isHypertrophy   = focus.includes('focus-muscle');
  const isTone          = focus.includes('focus-tone');
  const isEndurance     = focus.includes('focus-endurance');
  const isHIIT          = flags.includes('flag-hiit');
  const isYoga          = focus.includes('focus-yoga');

  // Wizard flags
  const isMorning       = flags.includes('flag-morning');       // cortisol high — avoid HIIT
  const isEvening       = flags.includes('flag-evening');        // avoid stimulant circuits
  const isOnOff         = flags.includes('flag-onoff');          // on/off trainer — add variety
  const isLowVolume     = flags.includes('flag-lowvolume');      // gets sore — reduce sets
  const isHighCortisol  = flags.includes('flag-cortisol');       // tired/stressed — lower intensity
  const wantsResults    = flags.includes('flag-struggle-results');// not seeing results — max variation
  const isPilates    = focus.includes('focus-pilates');
  const isCalisthenics = focus.includes('focus-calisthenics');
  const isMilitary   = focus.includes('focus-military');

  // Build goal priority map from ranked focus list
  // focusPriority is an ordered array — first = highest priority
  const focusPriority = goals.focusPriority || focus;
  const totalFocus    = focusPriority.length || 1;
  const goalPriorityMap = {};
  const focusToGoalIds = {
    'focus-strength':      ['strength'],
    'focus-muscle':        ['size'],
    'focus-fatloss':       ['fat','recomp'],
    'focus-visceral':      ['fat','recomp'],
    'focus-weightloss':    ['fat','recomp'],
    'focus-tone':          ['tone'],
    'focus-endurance':     ['endurance'],
    'focus-general':       ['general'],
    'focus-mobility':      ['mobility'],
    'focus-yoga':          ['yoga','mobility'],
    'focus-pilates':       ['pilates','tone'],
    'focus-calisthenics':  ['calisthenics','strength','tone'],
    'focus-military':      ['military','endurance','fat'],
    'focus-recomp':        ['recomp','size','fat'],
  };
  focusPriority.forEach((focusId, rank) => {
    // Higher priority = bigger multiplier. Rank 0 = highest.
    const multiplier = Math.max(1, totalFocus - rank);
    const gids = focusToGoalIds[focusId] || [];
    gids.forEach(gid => {
      goalPriorityMap[gid] = Math.max(goalPriorityMap[gid] || 0, multiplier);
    });
  });

  // Derive goal ids for exercise filtering
  const goalIds = [];
  if (isStrength)      goalIds.push('strength');
  if (isHypertrophy)   goalIds.push('size');
  if (isFatLoss)       goalIds.push('fat','recomp');
  if (isTone)          goalIds.push('tone');
  if (isEndurance)     goalIds.push('endurance');
  if (isBeginner)      goalIds.push('beginner','general');
  if (isLowImpact)     goalIds.push('lowimpact');
  if (isYoga)          goalIds.push('yoga','mobility');
  if (isPilates)       goalIds.push('pilates','tone');
  if (isCalisthenics)  goalIds.push('calisthenics','strength','tone');
  if (isMilitary)      goalIds.push('military','endurance','fat');
  if (flags.includes('flag-posture')) goalIds.push('posture');
  if (goalIds.length === 0) goalIds.push('general','tone','size');

  // Base exercise count from session duration
  let exCount = Math.max(4, Math.min(8, Math.floor(dur / 8)));

  // Wizard adjustments to volume
  if (isLowVolume)    exCount = Math.max(4, exCount - 1); // sore — fewer exercises
  if (isHighCortisol) exCount = Math.max(4, exCount - 1); // tired — lower load
  if (isAdvanced || wantsResults) exCount = Math.min(8, exCount + 1); // advanced or not seeing results — more volume
  if (isBeginner)     exCount = Math.max(4, Math.min(5, exCount));    // new — cap at 5

  // Morning training: flag to suppress HIIT in cardio finisher
  const suppressHIIT = isMorning || isHighCortisol || isEvening;
  // On-off habit: force alreadyUsed penalty higher so variation is maximized
  const variationBoost = isOnOff || wantsResults;

  // ── Glute/hip priority — computed early, needed during split label building ──
  const glutePriority          = bpg['bp-glutes'];
  const hipPriority            = bpg['bp-hips'];
  const userMusclePriorityList = goals.musclePriority || [];
  const glutesIsPriority = glutePriority === 'size' || glutePriority === 'strengthen'
    || hipPriority === 'size' || hipPriority === 'strengthen'
    || userMusclePriorityList.slice(0,3).includes('glutes')
    || userMusclePriorityList.slice(0,3).includes('hips');

  // Pick split based on frequency and user preference
  // Science: Upper/Lower hits each muscle 2-3x/week — optimal for hypertrophy (Schoenfeld 2016)
  // 6-day upper/lower = 3 upper + 3 lower — only appropriate for intermediate/advanced
  // Beginners: 3-4 days optimal; 6 days workable only with shorter sessions (8-14 sets/day)
  let splitType, splitLabel, daySchedule;
  const activeDays = days.slice(0, freq).filter(d => d !== 'sun');
  const preferredSplit = goals.preferredSplit || 'auto';

  // Mode-exclusive sessions (yoga/pilates/calisthenics/military) ONLY override
  // if the user has NOT explicitly chosen a split in the wizard
  const userChoseSplit = preferredSplit && preferredSplit !== 'auto';

  if (!userChoseSplit && isMilitary && isCalisthenics) {
    splitType  = 'military_cal';
    splitLabel = 'Military & Calisthenics';
    const types = ['military','calisthenics','military','calisthenics','military'];
    const subs  = ['PT Circuit — Push/Run/Carry','Bodyweight Strength Progressions','Conditioning & Sprint Work','Pull & Core Progressions','Full Military PT Test Prep'];
    daySchedule = activeDays.map((d,i) => ({ day:d, type:types[i%5], label:types[i%5]==='military'?'MILITARY PT':'CALISTHENICS', sub:subs[i%5] }));
  } else if (!userChoseSplit && isMilitary) {
    splitType  = 'military';
    splitLabel = 'Military / Tactical Fitness';
    const milSubs = ['Push Circuit & Endurance','Sprint-Drag-Carry','Pull & Core Strength','Conditioning — AMRAP','Full PT Test Simulation'];
    daySchedule = activeDays.map((d,i) => ({ day:d, type:'military', label:'MILITARY PT', sub:milSubs[i%milSubs.length] }));
  } else if (!userChoseSplit && isCalisthenics) {
    splitType  = 'calisthenics';
    splitLabel = 'Calisthenics Program';
    const calSubs = ['Push Progressions','Pull Progressions','Legs & Core','Skill Work — Handstand / L-Sit','Full Body Circuit'];
    daySchedule = activeDays.map((d,i) => ({ day:d, type:'calisthenics', label:'CALISTHENICS', sub:calSubs[i%calSubs.length] }));
  } else if (!userChoseSplit && isYoga && isPilates) {
    splitType  = 'yoga_pilates';
    splitLabel = 'Yoga & Pilates Program';
    daySchedule = activeDays.map((d,i) => i % 2 === 0
      ? { day:d, type:'yoga',    label:'YOGA SESSION',    sub:'Flow · Strength · Mobility' }
      : { day:d, type:'pilates', label:'PILATES SESSION', sub:'Core · Precision · Posture' });
  } else if (!userChoseSplit && isYoga) {
    splitType  = 'yoga';
    splitLabel = 'Yoga Program';
    const yogaStyles = ['Vinyasa Flow','Power Yoga','Yin / Restorative','Hatha Fundamentals','Ashtanga','Yoga & Core'];
    daySchedule = activeDays.map((d,i) => ({ day:d, type:'yoga', label:'YOGA SESSION', sub: yogaStyles[i % yogaStyles.length] }));
  } else if (!userChoseSplit && isPilates) {
    splitType  = 'pilates';
    splitLabel = 'Pilates Program';
    const pilStyles = ['Mat Pilates — Core Focus','Pilates — Glutes & Legs','Pilates — Upper Body','Full Body Pilates','Pilates — Spine & Posture'];
    daySchedule = activeDays.map((d,i) => ({ day:d, type:'pilates', label:'PILATES SESSION', sub: pilStyles[i % pilStyles.length] }));
  } else if (freq <= 2) {
    splitType  = 'fullbody';
    splitLabel = 'Full Body Split';
    daySchedule = activeDays.map((d,i) => ({ day:d, type:'fullbody', label:`FULL BODY ${i+1}`, sub:'Complete training stimulus' }));
  } else {
    // Honor wizard split preference, fall back to science-based auto-selection
    let effectiveSplit = preferredSplit;
    if (preferredSplit === 'auto' || !preferredSplit) {
      // Science-based defaults: Upper/Lower is optimal for 4 days (Schoenfeld 2016)
      if (freq === 3) effectiveSplit = 'fullbody';
      else if (freq === 4) effectiveSplit = 'upper_lower';
      else if (freq === 5) effectiveSplit = 'ppl_ul';
      else effectiveSplit = 'ppl';
    }

    if (effectiveSplit === 'upper_lower') {
      splitType  = 'upper_lower';
      splitLabel = freq >= 6 ? 'Upper / Lower Split (6-Day)' : 'Upper / Lower Split';

      // Priority-driven start: if user's top muscles are lower-body, start with lower
      // Maps muscle → session type
      const muscleToSplit = {
        chest:'upper', 'back-upper':'upper', 'back-lower':'upper', lats:'upper',
        shoulders:'upper', biceps:'upper', triceps:'upper', forearms:'upper',
        quads:'lower', hamstrings:'lower', glutes:'lower', hips:'lower',
        calves:'lower', core:'lower',
      };
      const priorityMuscleList = userMusclePriorityList.slice(0, 4);
      const lowerScore = priorityMuscleList.filter(m => muscleToSplit[m] === 'lower').length;
      const upperScore = priorityMuscleList.filter(m => muscleToSplit[m] === 'upper').length;
      // Start with whichever has more priority muscles; tie → lower (common ask for glutes)
      const startType = lowerScore >= upperScore ? 'lower' : 'upper';

      const ulSubsA = 'Chest · Back · Shoulders · Arms';
      const ulSubsB = `${glutesIsPriority ? 'Glutes · Hips · Hamstrings' : 'Quads · Hamstrings · Glutes'} · Calves`;
      const labA = startType === 'upper' ? 'UPPER BODY' : 'LOWER BODY';
      const labB = startType === 'upper' ? 'LOWER BODY' : 'UPPER BODY';
      const subA = startType === 'upper' ? ulSubsA : ulSubsB;
      const subB = startType === 'upper' ? ulSubsB : ulSubsA;
      const varLabA = (n) => startType==='upper'
        ? ['Upper Body','Upper Body — Variation B','Upper Body — Variation C'][n]||'Upper Body'
        : ['Lower Body','Lower Body — Variation B','Lower Body — Variation C'][n]||'Lower Body';
      const varLabB = (n) => startType==='upper'
        ? ['Lower Body','Lower Body — Variation B','Lower Body — Variation C'][n]||'Lower Body'
        : ['Upper Body','Upper Body — Variation B','Upper Body — Variation C'][n]||'Upper Body';

      // Strict alternation — type toggles every day
      daySchedule = activeDays.map((d,i) => {
        const isA = i % 2 === 0;
        const pair = Math.floor(i/2);
        return {
          day: d,
          type:  isA ? startType : (startType === 'upper' ? 'lower' : 'upper'),
          label: isA ? labA : labB,
          sub:   isA ? (pair===0 ? subA : varLabA(pair)) : (pair===0 ? subB : varLabB(pair)),
        };
      });

    } else if (effectiveSplit === 'fullbody') {
      splitType  = 'fullbody';
      splitLabel = 'Full Body';
      daySchedule = activeDays.map((d,i) => ({ day:d, type:'fullbody', label:`FULL BODY ${i+1}`, sub:'All major muscle groups' }));
    } else {
      // PPL — reorder push/pull/legs cycle to put highest-priority session first
      const muscleToPpl = {
        chest:'push', shoulders:'push', triceps:'push',
        'back-upper':'pull', lats:'pull', biceps:'pull', 'back-lower':'pull', forearms:'pull',
        quads:'legs', hamstrings:'legs', glutes:'legs', hips:'legs', calves:'legs', core:'legs',
      };
      // Score each PPL session type by priority rank
      const pplScores = { push:0, pull:0, legs:0 };
      userMusclePriorityList.forEach((m, rankIdx) => {
        const s = muscleToPpl[m];
        if (s) pplScores[s] += (5 - rankIdx); // higher rank = more points
      });
      // Sort sessions by score descending → highest priority goes first
      const pplOrder = ['push','pull','legs'].sort((a,b) => pplScores[b] - pplScores[a]);
      const pplLabels = { push:'PUSH', pull:'PULL', legs:'LEGS' };
      const pplSubs   = {
        push: 'Chest · Shoulders · Triceps',
        pull: 'Back · Biceps · Rear Delts',
        legs: glutesIsPriority ? 'Glutes · Hips · Hamstrings · Quads' : 'Quads · Hamstrings · Glutes',
      };

      if (freq >= 5) {
        splitType  = freq >= 6 ? 'ppl' : 'ppl_ul';
        splitLabel = freq >= 6 ? 'Push / Pull / Legs (6-Day)' : 'Push / Pull / Legs + Upper/Lower';
        // 6-day: run pplOrder twice (A then B variations)
        // 5-day: pplOrder once + upper + lower
        const t = freq >= 6
          ? [...pplOrder, ...pplOrder]
          : [...pplOrder, 'upper','lower'];
        const l = freq >= 6
          ? [...pplOrder.map(p=>pplLabels[p]+' A'), ...pplOrder.map(p=>pplLabels[p]+' B')]
          : [...pplOrder.map(p=>pplLabels[p]), 'UPPER', 'LOWER'];
        const s = freq >= 6
          ? [...pplOrder.map(p=>pplSubs[p]), ...pplOrder.map(p=>pplSubs[p]+' — Variation B')]
          : [...pplOrder.map(p=>pplSubs[p]), 'Full Upper Body', 'Full Lower Body'];
        daySchedule = activeDays.map((d,i) => ({ day:d, type:t[i%t.length], label:l[i%t.length], sub:s[i%t.length] }));
      } else {
        splitType  = 'ppl';
        splitLabel = 'Push / Pull / Legs';
        daySchedule = activeDays.map((d,i) => ({
          day:d, type:pplOrder[i%3], label:pplLabels[pplOrder[i%3]], sub:pplSubs[pplOrder[i%3]]
        }));
      }
    }
  }

  // Muscle groups per session type
  const muscleSets = {
    push:     ['chest','shoulders','triceps'],
    pull:     ['back-upper','lats','biceps','back-lower'],
    legs:     ['quads','hamstrings','glutes','hips','calves'],
    upper:    ['chest','back-upper','lats','shoulders','biceps','triceps'],
    lower:    ['quads','hamstrings','glutes','hips','calves','core'],
    fullbody: ['chest','back-upper','lats','shoulders','quads','hamstrings','glutes','hips','biceps','triceps','core'],
    yoga:     ['core','glutes','hips','hamstrings','shoulders','back-upper'],
    pilates:  ['core','back-lower','glutes','hips','shoulders'],
    calisthenics: ['chest','back-upper','lats','core','quads','glutes','triceps','biceps'],
    military: ['chest','core','quads','back-upper','shoulders'],
  };

  // Build cardio finisher if fat loss / endurance goal
  const cardioFinisher = (isFatLoss || isEndurance) && !suppressHIIT ? EX_DB.filter(e => {
    if (!userHasEquipment(e.eq, eq)) return false;
    if (isLowImpact && e.impact === 'high') return false;
    if (e.block_from_generator) return false;
    return e.goals.includes('fat') || e.goals.includes('endurance');
  }).slice(0,1) : [];

  // Build per-day workout
  const programDays = {};

  // If glutes/hips are a priority, reorder legs muscle set to lead with glutes+hips, not quads
  if (glutesIsPriority) {
    muscleSets.legs  = ['glutes','hips','hamstrings','quads','calves'];
    muscleSets.lower = ['glutes','hips','hamstrings','quads','calves','core'];
  }

  // Track which exercises were used per session type for Upper/Lower variation
  const usedExerciseIds = {};

  daySchedule.forEach((ds, idx) => {
    const muscles = muscleSets[ds.type] || muscleSets.fullbody;

    // Build boostedMuscles: start from session muscles, then inject priorities
    const boostedMuscles = [...muscles];

    // 1. Body-part SIZE/STRONG goals — push to front
    Object.entries(bpg).forEach(([bpId, goal]) => {
      const bpMuscle = bpId.replace('bp-','').replace('-upper','').replace('-lower','');
      if ((goal === 'size' || goal === 'strengthen') && !boostedMuscles.includes(bpMuscle)) {
        boostedMuscles.unshift(bpMuscle);
      }
    });

    // 2. User's explicit muscle priority list (Goals → Priority Muscles card)
    // Insert at the very front in reverse order so rank 1 ends up first
    const userMuscleRank = goals.musclePriority || [];
    [...userMuscleRank].reverse().forEach(m => {
      // Remove existing occurrence then re-insert at front
      const existing = boostedMuscles.indexOf(m);
      if (existing >= 0) boostedMuscles.splice(existing, 1);
      boostedMuscles.unshift(m);
    });

    // For Upper/Lower splits: on the second Upper or Lower day, exclude exercises
    // already used on the first day of that type so workouts actually vary
    const sessionKey = ds.type; // 'upper' or 'lower' etc.
    const alreadyUsed = usedExerciseIds[sessionKey] || new Set();

    const exercises = pickExercises(
      boostedMuscles, goalIds, eq, isLowImpact, isStrength, exCount,
      ds.type, goalPriorityMap, glutesIsPriority, alreadyUsed, variationBoost
    );

    // Record used exercise ids for this session type
    usedExerciseIds[sessionKey] = alreadyUsed;
    exercises.forEach(e => alreadyUsed.add(e.id));

    // Add cardio finisher on some days for fat loss
    if ((isFatLoss || isEndurance) && cardioFinisher.length > 0 && idx % 2 === 0) {
      exercises.push(cardioFinisher[0]);
    }

    // ── PUMP WORKOUT — 2–3 lighter high-rep exercises, same muscles, different from core ──
    // Hard-exclude core exercise EX_DB ids so there's truly zero overlap.
    // pickExercises only penalises alreadyUsed — so we pre-filter EX_DB down to
    // exercises NOT in the core set, run the scorer on that subset, then restore EX_DB.
    const coreExIds = new Set(exercises.map(e => {
      // Generated ids are "gen_day_idx_exId" — extract the base EX_DB id
      const parts = e.id.split('_');
      return parts.length >= 4 ? parts.slice(3).join('_') : e.id;
    }));

    // Temporarily swap EX_DB to the filtered subset for the pump pick
    const _fullEX_DB = EX_DB.splice(0);                        // remove all items
    const pumpPool   = _fullEX_DB.filter(e => !coreExIds.has(e.id) && !e.block_from_generator);
    EX_DB.push(...pumpPool);                                    // only non-core exercises

    const pumpExercises = pickExercises(
      boostedMuscles, goalIds, eq, isLowImpact,
      false,         // pump is never strength-focused — always hypertrophy/tone rep ranges
      3,             // pick up to 3 pump exercises
      ds.type, goalPriorityMap, glutesIsPriority,
      new Set(),     // alreadyUsed is empty — exclusion handled by pool filter above
      true           // maximise variation
    );

    // Restore full EX_DB
    EX_DB.splice(0);
    EX_DB.push(..._fullEX_DB);

    const wuType = ['push','pull','legs','yoga','pilates','calisthenics','military'].includes(ds.type) ? ds.type
      : ds.type === 'lower' ? 'legs' : ds.type === 'upper' ? 'upper' : 'fullbody';
    const cdType = wuType;

    // ── PREVIOUS DAY STRETCH — use the PREVIOUS active workout day's session type ──
    // This way: if today is an upper day preceded by a lower day, the opening
    // stretches target the legs/glutes that were trained yesterday — not today's muscles.
    const prevDs = idx > 0 ? daySchedule[idx - 1] : null;
    const prevType = prevDs
      ? (['push','pull','legs','yoga','pilates','calisthenics','military'].includes(prevDs.type)
          ? prevDs.type
          : prevDs.type === 'lower' ? 'legs' : prevDs.type === 'upper' ? 'upper' : 'fullbody')
      : null;
    const prevDayStretches = prevType
      ? (PREV_DAY_STRETCH_DB[prevType] || PREV_DAY_STRETCH_DB.fullbody).map(w => ({ ...w }))
      : []; // first day of week — no previous workout day, skip section

    programDays[ds.day] = {
      title: ds.label,
      sub: ds.sub,
      sessionType: ds.type,
      rest: false,
      prevDayStretch: prevDayStretches,
      preStretch:     (PRE_STRETCH_DB[wuType]  || PRE_STRETCH_DB.fullbody).map(w => ({ ...w })),
      warmup:         (WARMUP_DB[wuType]        || WARMUP_DB.fullbody).map(w => ({ ...w })),
      exercises:      exercises.map((ex, i) => exerciseToWorkoutItem(ex, ds.day + '_' + idx, i, isStrength, goals.defaultSets)),
      pump:           pumpExercises.map((ex, i) => pumpExerciseToWorkoutItem(ex, ds.day + '_pump_' + idx, i)),
      cooldown:       (COOLDOWN_DB[cdType]      || COOLDOWN_DB.fullbody).map(c => ({ ...c })),
    };
  });

  // Rest days
  const ALL_DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
  ALL_DAYS.forEach(d => {
    if (!programDays[d]) {
      programDays[d] = { title:'REST DAY', sub:'Recovery & Mobility', rest:true,
        prevDayStretch:[], preStretch:[], warmup:[], exercises:[], pump:[], cooldown:[] };
    }
  });

  // Build science summary
  const summary = buildProgramSummary({ splitLabel, freq, isBeginner, isAdvanced, isStrength, isHypertrophy, isTone, isFatLoss, isEndurance, isLowImpact, isHIIT, isYoga, isPilates, isCalisthenics, isMilitary, defaultSets: goals.defaultSets, exCount, goals, bpg, eq });

  return {
    generatedAt: new Date().toISOString(),
    splitLabel,
    splitType,
    summary,
    days: programDays,
  };
}

function buildProgramSummary({ splitLabel, freq, isBeginner, isAdvanced, isStrength, isHypertrophy, isTone, isFatLoss, isEndurance, isLowImpact, isHIIT, isYoga, isPilates, isCalisthenics, isMilitary, defaultSets, exCount, goals, bpg, eq }) {
  const lines = [];

  // Sets goal note — always show
  const setsOpt = SETS_GOAL_OPTIONS.find(o => o.sets === (defaultSets || 3));
  if (setsOpt) lines.push({ icon: setsOpt.icon, head: `${setsOpt.label} Per Exercise — ${setsOpt.headline}`, body: setsOpt.science[0] + ' ' + setsOpt.science[1] });

  // Split rationale
  if (freq <= 3)      lines.push({ icon:'🗓️', head:'Full Body Training', body:`Training ${freq}×/week. Science shows full-body sessions maximize muscle protein synthesis frequency for lower weekly volumes. Ideal for building consistency and foundational strength.` });
  else if (freq === 4) lines.push({ icon:'🗓️', head:'Upper / Lower Split', body:`4 days/week — the gold-standard split for intermediate lifters. Hits each muscle group twice/week, which research consistently shows outperforms once/week training for hypertrophy and strength.` });
  else if (freq === 5) lines.push({ icon:'🗓️', head:'PPL + Upper/Lower (5-Day)', body:`5 days/week combines the specificity of Push/Pull/Legs with the heavy compound volume of Upper/Lower. Upper body hits 3×/week, lower body 2×/week.` });
  else                 lines.push({ icon:'🗓️', head:'Push / Pull / Legs (6-Day)', body:`6 days/week — maximum training frequency. Each muscle trained twice/week with full recovery between sessions. Best for advanced lifters who have earned the volume capacity.` });

  // Rep/set scheme
  if (isStrength)       lines.push({ icon:'🏋️', head:'Strength Focus: 3–6 Reps · Long Rest', body:`Heavy compound movements with 2–4 min rest. Drives neurological adaptations (motor unit recruitment) rather than pure hypertrophy. Progressive overload is the key variable.` });
  else if (isHypertrophy) lines.push({ icon:'💪', head:'Hypertrophy Focus: 6–12 Reps · 60–90s Rest', body:`The classic hypertrophy range maximizes metabolic stress and mechanical tension — the two primary drivers of muscle growth (Schoenfeld, 2010). Aim to reach near-failure on final sets.` });
  else if (isTone)      lines.push({ icon:'✦', head:'Toning Focus: 12–20 Reps · Short Rest', body:`Higher rep ranges with shorter rest increase time under tension and metabolic demand. Builds muscle density without significant size increase. Combine with caloric maintenance.` });
  else if (isFatLoss)   lines.push({ icon:'🔥', head:'Fat Loss: Circuit-Style · Moderate Load', body:`Resistance training preserves muscle during a caloric deficit — critical for metabolic rate. Compound movements burn more calories per session. Cardio finishers added for additional energy expenditure.` });

  // Visceral fat note
  if ((goals.trainingFocus||[]).includes('focus-visceral')) {
    lines.push({ icon:'🎯', head:'Visceral Fat Protocol', body:`Visceral fat responds strongly to: (1) resistance training — increases insulin sensitivity, (2) moderate-intensity cardio — 150+ min/week, (3) cortisol management — avoid long single-bout cardio. Your step splits are working on this too.` });
  }

  // Low impact note
  if (isLowImpact) lines.push({ icon:'🦵', head:'Low Impact Modifications Applied', body:`High-impact exercises (jumping, running) have been excluded. All exercises use controlled movement. Leg press replaces heavy squats where appropriate. Joint-friendly progressions prioritized.` });

  // Body part overrides
  const sizeGoals = Object.entries(bpg).filter(([,g]) => g === 'size').map(([id]) => id.replace('bp-',''));
  const toneGoals = Object.entries(bpg).filter(([,g]) => g === 'tone').map(([id]) => id.replace('bp-',''));
  const fatGoals  = Object.entries(bpg).filter(([,g]) => g === 'fat').map(([id]) => id.replace('bp-',''));
  if (sizeGoals.length) lines.push({ icon:'📈', head:`Prioritized for Size: ${sizeGoals.join(', ')}`, body:`Extra sets allocated to these muscle groups. Volume is the #1 driver of hypertrophy — more sets = more growth stimulus, up to ~15–20 sets/week before diminishing returns.` });
  if (toneGoals.length) lines.push({ icon:'✦', head:`Prioritized for Definition: ${toneGoals.join(', ')}`, body:`Higher rep ranges (15–20) and shorter rest periods for these groups. Creates the muscle density and "toned" appearance without significant mass gain.` });
  if (fatGoals.length)  lines.push({ icon:'🔥', head:`Fat Reduction Focus: ${fatGoals.join(', ')}`, body:`Note: spot reduction is a myth — you cannot target fat loss to specific body parts. However, building muscle in these areas improves their appearance and composition long-term.` });

  // Equipment note
  const hasDB = (eq.dumbbells||[]).length > 0;
  const hasMachines = MACHINES.some(m => eq[m.id]);
  if (!hasDB && !hasMachines) lines.push({ icon:'🏠', head:'Bodyweight Program', body:`Your program is fully bodyweight-based. Research shows bodyweight training produces comparable hypertrophy to free weights when taken to near-failure. Progressive difficulty comes from variations and tempo.` });

  // Beginner/advanced
  if (isBeginner) lines.push({ icon:'🌱', head:'Beginner Protocol Active', body:`Lower volume and simpler movement patterns. Beginners gain muscle at any intensity — consistency and progressive overload matter more than optimization at this stage.` });
  if (isAdvanced) lines.push({ icon:'🎖️', head:'Advanced Lifter Protocol', body:`Higher volume, greater exercise variation, and periodization cues applied. Deload every 4–6 weeks is strongly recommended to prevent accumulated fatigue and stimulate super-compensation.` });
  if (isYoga)    lines.push({ icon:'🧘', head:'Yoga Program Selected', body:`Your program uses yoga sessions. Research shows yoga improves flexibility, balance, and core strength — and reduces cortisol more effectively than most other forms of exercise. Sun Salutations also count as cardiovascular conditioning.` });
  if (isPilates)       lines.push({ icon:'🌀', head:'Pilates Program Selected', body:`Pilates builds deep core stabiliser strength (transverse abdominis, multifidus) that standard gym training largely ignores. Clinical research shows it corrects posture, reduces lower back pain, and improves movement quality for all other training.` });
  if (isCalisthenics)  lines.push({ icon:'💯', head:'Calisthenics Program Selected', body:`Progressive bodyweight training follows a skill ladder — standard push-up → diamond → archer → pseudo-planche, pull-up → archer → muscle-up. Research shows this builds functional strength, body control, and relative strength superior to machine-based training.` });
  if (isMilitary)      lines.push({ icon:'🎖️', head:'Military / Tactical Fitness', body:`AFT-style circuits train push-ups, pull-ups, plank, sprints, and carries. Cool-downs are intentionally short (3–5 min) — focus on diaphragmatic breathing to drive cortisol down fast. High-intensity work demands complete recovery nutrition within 30–45 min post-session.` });

  return lines;
}

// ── Save / load program from Firebase ───────────────────
async function saveGeneratedProgram(program) {
  // Before saving new program, backup the current one
  await backupGeneratedProgram();
  
  await db.collection('userdata').doc(SESSION.username)
    .collection('program').doc('current').set({
      data: JSON.stringify(program),
      generatedAt: program.generatedAt,
    });
  SESSION._program = program;
}

async function backupGeneratedProgram() {
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('program').doc('current').get();
    if (doc.exists) {
      // Save current to backup
      await db.collection('userdata').doc(SESSION.username)
        .collection('program').doc('backup').set(doc.data());
    }
  } catch(e) {
    console.error('Error backing up program:', e);
  }
}

async function restoreBackupProgram() {
  try {
    const backupDoc = await db.collection('userdata').doc(SESSION.username)
      .collection('program').doc('backup').get();
    
    if (!backupDoc.exists) {
      alert('No backup found. Generate or save a program first.');
      return;
    }
    
    // Restore backup to current
    const backupData = backupDoc.data();
    await db.collection('userdata').doc(SESSION.username)
      .collection('program').doc('current').set(backupData);
    
    // Reload program
    SESSION._program = JSON.parse(backupData.data);
    
    // Update UI
    const program = SESSION._program;
    document.getElementById('workoutSub').textContent = `// ${program.splitLabel.toUpperCase()} — RESTORED PROGRAM //`;
    const genEl = document.getElementById('programGeneratedAt');
    if (genEl) {
      const d = new Date(program.generatedAt);
      genEl.textContent = `Generated ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
    }
    showWorkoutDay(todayDayId() === 'sun' ? 'mon' : todayDayId());
    
    alert('✓ Program restored from backup');
  } catch(e) {
    console.error('Error restoring program:', e);
    alert('ERROR: ' + e.message);
  }
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

async function getOrLoadProgram() {
  if (SESSION._program) return SESSION._program;
  return await loadGeneratedProgram();
}

// Returns the active workout day map (generated program or static fallback)
function getActiveWorkouts() {
  if (SESSION._program) return SESSION._program.days;
  const raw = SESSION.gender === 'female' ? WORKOUTS_FEMALE : WORKOUTS_MALE;
  // Ensure all days have a pump array (static data predates the pump feature)
  const patched = {};
  for (const [key, day] of Object.entries(raw)) {
    patched[key] = day.pump ? day : { ...day, pump: [] };
  }
  return patched;
}

const WORKOUTS_MALE = {
  mon:{title:'UPPER PUSH',sub:'Chest · Shoulders · Triceps',
    warmup:[
      {id:'m_mon_wu1',name:'ARM CIRCLES',detail:'30 reps each direction — small to large. Primes shoulder joint.',ytId:'1u9-YNjFm0g',type:'stretch'},
      {id:'m_mon_wu2',name:'SHOULDER PASS-THROUGHS',detail:'15 reps with broomstick or towel. Opens thoracic + shoulder mobility.',ytId:'hZnE2IlPLEM',type:'stretch'},
      {id:'m_mon_wu3',name:'PUSH-UP PLUS',detail:'10 reps. At top of push-up, push extra through shoulder blades — activates serratus anterior.',ytId:'B5OhsrUaD30',type:'activate'},
      {id:'m_mon_wu4',name:'SCAPULAR PUSH-UPS',detail:'10 reps. Arms locked, pinch and spread shoulder blades. Primes back for pressing stability.',ytId:'akgQbxhrhOc',type:'activate'},
      {id:'m_mon_wu5',name:'BAND PULL-APARTS',detail:'20 reps. Band at chest height, pull apart to T-shape. Activates rear delts and prevents shoulder impingement.',ytId:'0kgSBxbG6zo',type:'activate'}
    ],
    exercises:[
      {id:'m_mon_e1',name:'BENCH PRESS',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'60% 1RM',phase2:'75–85% 1RM',phase3:'85–95% 1RM',ytId:'vcBig73ojpE',desc:'Flat bench, grip slightly wider than shoulder-width. Lower to chest 2–3 sec, drive explosively up. Shoulder blades retracted throughout.',hotel:'FLOOR PUSH-UP 5×5 — elevate feet on bed for incline'},
      {id:'m_mon_e2',name:'OVERHEAD PRESS',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'60%',phase2:'75–85%',phase3:'85–95%',ytId:'2yjwXTZbrDM',desc:'Standing, bar/dumbbell at shoulders. Press directly overhead, full extension. Core braced, no lower back arch.',hotel:'PIKE PUSH-UP 5×5 — hips high, pressing straight down'},
      {id:'m_mon_e3',name:'INCLINE DB PRESS',badge:'SECONDARY',sets:'3×10',rest:'90 sec',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'8iPEnn-ltC8',desc:'Bench 30–45°. Dumbbells at chest level, elbows 45° to body. Press up and slightly inward. Lower slowly.',hotel:'DECLINE PUSH-UP 3×10 — feet on bed edge'},
      {id:'m_mon_e4',name:'LATERAL RAISES',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Light',phase2:'Progressive',phase3:'Heavy+slow neg',ytId:'3VcKaXpzqRo',desc:'Raise arms to shoulder height, slight forward lean, tiny elbow bend. Avoid swinging.',hotel:'Pike hold isometric 30 sec ×3'},
      {id:'m_mon_e5',name:'TRICEP OVERHEAD EXT.',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'_gsUck-7f74',desc:'Hold one DB overhead with both hands. Lower behind head, elbows close to ears. Full extension at top.',hotel:'DIAMOND PUSH-UP 3×12'},
      {id:'m_mon_e6',name:'PUSH-UP BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4 only',phase2:'Full',phase3:'Weighted/elevated',ytId:'IODxDxX7oi4',desc:'Military-style burnout. To absolute failure, rest 20 sec, repeat 3 rounds. Metabolic flush finisher.',hotel:'SAME — works perfectly'}
    ],
    cooldown:[
      {id:'m_mon_cd1',name:'DOORWAY CHEST STRETCH',detail:'60 sec each side. Arm at 90°, lean into doorframe. Full chest + anterior shoulder release.',ytId:'eTlnJYWv9Y4',type:'stretch'},
      {id:'m_mon_cd2',name:'CROSS-BODY SHOULDER STRETCH',detail:'30 sec each side. Pull arm across body, hold at elbow. Releases rear deltoid.',ytId:'KFlSIhgZXOQ',type:'stretch'},
      {id:'m_mon_cd3',name:'TRICEP OVERHEAD STRETCH',detail:'30 sec each side. Arm overhead, bend elbow, pull with opposite hand.',ytId:'YwTbYJhLBY4',type:'stretch'},
      {id:'m_mon_cd4',name:'THORACIC EXTENSION',detail:'60 sec. Sit against bench edge at mid-back. Extend over it, arms behind head. Undoes desk posture.',ytId:'NVFfJlBNJsI',type:'stretch'}
    ]},

  tue:{title:'LOWER BODY',sub:'Quads · Hamstrings · Glutes',
    warmup:[
      {id:'m_tue_wu1',name:'HIP CIRCLES',detail:'20 reps each direction. Slow, controlled. Warms hip joint capsule.',ytId:'bVnBdaYn0hY',type:'stretch'},
      {id:'m_tue_wu2',name:'LEG SWINGS (front/back)',detail:'15 swings each leg. Hold wall for balance. Hamstring and hip flexor mobility.',ytId:'KFZ5hLJbR9o',type:'stretch'},
      {id:'m_tue_wu3',name:'GLUTE BRIDGE',detail:'15 reps, 2-sec hold at top. The #1 glute activation before squats. Prevents quad dominance.',ytId:'wPM8icPu6H8',type:'activate'},
      {id:'m_tue_wu4',name:'CLAMSHELL',detail:'20 reps each side. Lying on side, band above knees optional. Activates glute medius — prevents knee cave on squats.',ytId:'5bNq7KKGV4E',type:'activate'},
      {id:'m_tue_wu5',name:'BODYWEIGHT SQUAT',detail:'15 reps, slow eccentric (3-sec down). Primes movement pattern, warms quads/glutes under zero load.',ytId:'aclHkVaku9U',type:'activate'}
    ],
    exercises:[
      {id:'m_tue_e1',name:'GOBLET SQUAT',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Light DB',phase2:'Heavy DB',phase3:'Max load',ytId:'MxsFDhcyFyE',desc:'Hold DB vertically at chest. Feet shoulder-width, toes out. Hip crease below parallel. Drive through whole foot.',hotel:'TEMPO SQUAT 5×5 — 4-sec descent'},
      {id:'m_tue_e2',name:'ROMANIAN DEADLIFT',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Light',phase2:'Heavy',phase3:'Max load',ytId:'JCXUYuzwNrM',desc:'DBs at thighs. Hinge at hips, push back, lower along legs. Feel deep hamstring stretch, drive hips forward.',hotel:'SINGLE-LEG DEADLIFT 5×5 — bodyweight, balance + hamstring stretch'},
      {id:'m_tue_e3',name:'BULGARIAN SPLIT SQUAT',badge:'SECONDARY',sets:'3×8/leg',rest:'90 sec',phase1:'BW',phase2:'Add DBs',phase3:'Heavy DBs',ytId:'2C-uNgbwi_k',desc:'Rear foot on bench. Lower back knee to floor, front shin vertical. Unilateral strength + imbalance fix.',hotel:'SAME — use bed for rear foot'},
      {id:'m_tue_e4',name:'HIP THRUST',badge:'SECONDARY',sets:'3×15',rest:'90 sec',phase1:'BW',phase2:'DB on hips',phase3:'Heavy DB + pause',ytId:'wPM8icPu6H8',desc:'Upper back on bench, DB on hips. Drive hips to ceiling, squeeze glutes hard at top. 1-sec hold.',hotel:'FLOOR GLUTE BRIDGE 3×20'},
      {id:'m_tue_e5',name:'WALKING LUNGE',badge:'SECONDARY',sets:'3×10/leg',rest:'60 sec',phase1:'BW',phase2:'Light DBs',phase3:'Heavy DBs',ytId:'D7KaRcUTQeE',desc:'Long stride, front shin vertical. Drop back knee to floor. Drives glutes, quads, and core stability.',hotel:'SAME — down the hallway'},
      {id:'m_tue_e6',name:'SQUAT BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Jump squats',ytId:'aclHkVaku9U',desc:'BW squats to failure. 20-sec rest. Repeat × 3.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'m_tue_cd1',name:'PIGEON STRETCH',detail:'90 sec each side. Front leg at 90°, sink hips toward floor. Deep glute and hip opener.',ytId:'O11Md_bJCfk',type:'stretch'},
      {id:'m_tue_cd2',name:'STANDING QUAD STRETCH',detail:'30 sec each leg. Pull foot to glutes, knees together. Fully releases quad after heavy squats.',ytId:'1f9sDHSIMFc',type:'stretch'},
      {id:'m_tue_cd3',name:'SEATED HAMSTRING STRETCH',detail:'60 sec each leg. Extend leg, reach toward foot, hold. Releases hamstring tension from RDLs.',ytId:'Tio35lx0bic',type:'stretch'},
      {id:'m_tue_cd4',name:'HIP FLEXOR LUNGE STRETCH',detail:'60 sec each side. Rear knee on floor, push hips forward. Reverses hip flexor tightening from heavy work.',ytId:'YQmpR9OO7Zk',type:'stretch'}
    ]},

  wed:{title:'UPPER PULL',sub:'Back · Biceps · Rear Delts',
    warmup:[
      {id:'m_wed_wu1',name:'BAND PULL-APARTS',detail:'20 reps. Band at chest height, arms straight. Squeezes rear delts and rhomboids — the #1 back activation.',ytId:'0kgSBxbG6zo',type:'activate'},
      {id:'m_wed_wu2',name:'PRONE COBRA',detail:'10 reps, 2-sec hold. Lie face down, lift chest and arms off floor. Activates mid-back and erectors.',ytId:'Mfbv5XEGZJI',type:'activate'},
      {id:'m_wed_wu3',name:'SCAPULAR RETRACTIONS',detail:'15 reps. Arms out, squeeze shoulder blades hard toward spine. Establishes scapular control before rows.',ytId:'akgQbxhrhOc',type:'activate'},
      {id:'m_wed_wu4',name:'DEAD HANG',detail:'20–30 sec. Hang from bar with full weight. Decompresses spine, activates grip, primes lat stretch.',ytId:'VJTZ7cGmkEo',type:'stretch'},
      {id:'m_wed_wu5',name:'HAMMER CURL (light)',detail:'15 reps, very light. Neutral grip. Warms brachialis before supinated curls — prevents bicep tendon strain.',ytId:'0xyZbNqL_U0',type:'activate'}
    ],
    exercises:[
      {id:'m_wed_e1',name:'DB ROW (single arm)',badge:'5×5 STRENGTH',sets:'5×5/side',rest:'2–3 min',phase1:'60%',phase2:'75–85%',phase3:'Max',ytId:'roCP442LA5g',desc:'Hand and knee on bench. Drive elbow back and up, lead with elbow. Squeeze lat at top. Do not rotate.',hotel:'TOWEL-DOOR ROW — loop towel around door handle, row bodyweight'},
      {id:'m_wed_e2',name:'BENT-OVER ROW',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Light',phase2:'Heavy',phase3:'Max',ytId:'FWJR5Ve8bnQ',desc:'Hinge forward, back flat. Row to lower chest, squeeze shoulder blades. Control descent.',hotel:'BED-FRAME ROW — lie under bed edge, grip frame, row chest up'},
      {id:'m_wed_e3',name:'BICEP CURL',badge:'SECONDARY',sets:'3×10',rest:'60 sec',phase1:'Light',phase2:'Progressive',phase3:'Heavy+neg',ytId:'ykJmrZ5v0Oo',desc:'Supinate at top. Lower slowly over 3 sec. Elbows anchored.',hotel:'TOWEL CURL — step on towel ends, curl against resistance'},
      {id:'m_wed_e4',name:'HAMMER CURL',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Light',phase2:'Progressive',phase3:'Heavy',ytId:'0xyZbNqL_U0',desc:'Neutral grip. Targets brachialis — adds thickness and height to arms. Control the descent.',hotel:'SAME with water bottles'},
      {id:'m_wed_e5',name:'REAR DELT RAISE',badge:'SECONDARY',sets:'3×15',rest:'60 sec',phase1:'Very light',phase2:'Progressive',phase3:'Load+tempo',ytId:'Rep-GkxHMKU',desc:'Bent over, raise arms scarecrow-style. Crucial for shoulder health and posture correction.',hotel:'PRONE REAR DELT RAISE — face down on bed edge'},
      {id:'m_wed_e6',name:'ROW BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Full',ytId:'FWJR5Ve8bnQ',desc:'Light rows to failure. 20-sec rest. ×3.',hotel:'BED-FRAME ROW BURNOUT'}
    ],
    cooldown:[
      {id:'m_wed_cd1',name:'DOORWAY LAT STRETCH',detail:'60 sec each side. Hold doorframe, lean away. Full lat and teres major release.',ytId:'lPOOpNe6JM4',type:'stretch'},
      {id:'m_wed_cd2',name:'CHILD\'S POSE',detail:'60 sec. Kneel, arms extended forward, forehead to floor. Decompresses entire back after rows.',ytId:'eqVMAPM00GM',type:'stretch'},
      {id:'m_wed_cd3',name:'BICEP DOORFRAME STRETCH',detail:'30 sec each arm. Arm straight, palm on doorframe behind you, rotate away. Releases bicep and elbow.',ytId:'bJ1JxDL89P0',type:'stretch'},
      {id:'m_wed_cd4',name:'THORACIC ROTATION',detail:'45 sec each side. Seated, hands behind head, rotate from mid-back. Reverses forward-rounded posture.',ytId:'NVFfJlBNJsI',type:'stretch'}
    ]},

  thu:{title:'CORE + HIIT',sub:'Abs · Obliques · Conditioning',
    warmup:[
      {id:'m_thu_wu1',name:'DEAD BUG',detail:'10 reps each side. Press lower back to floor, extend opposite arm and leg. The gold standard core primer.',ytId:'4XLEnwUr1d8',type:'activate'},
      {id:'m_thu_wu2',name:'BIRD DOG',detail:'10 reps each side. On all-fours, extend opposite arm and leg, hold 2 sec. Anti-rotation core activation.',ytId:'wiFNA3sqjCA',type:'activate'},
      {id:'m_thu_wu3',name:'HOLLOW HOLD',detail:'20 sec. Lower back pressed to floor, arms and legs hovering. Full anterior core engagement.',ytId:'LlDNef_Ztsc',type:'activate'},
      {id:'m_thu_wu4',name:'GLUTE BRIDGE',detail:'15 reps. Activates posterior chain before core compression work. Protects lower back.',ytId:'wPM8icPu6H8',type:'activate'},
      {id:'m_thu_wu5',name:'PLANK HOLD',detail:'30 sec. Establish the position before adding movement. Bracing pattern for everything that follows.',ytId:'pSHjTRCQxIw',type:'activate'}
    ],
    exercises:[
      {id:'m_thu_e1',name:'PLANK VARIATIONS',badge:'CORE',sets:'3×45–90 sec',rest:'60 sec',phase1:'Standard',phase2:'RKC plank',phase3:'Weighted',ytId:'pSHjTRCQxIw',desc:'Squeeze everything. No hip sag. Breathe slowly. Add 5 sec per week.',hotel:'SAME'},
      {id:'m_thu_e2',name:'DEAD BUG',badge:'CORE',sets:'3×10/side',rest:'60 sec',phase1:'BW',phase2:'DB reach',phase3:'Heavy DB',ytId:'4XLEnwUr1d8',desc:'Press lower back to floor. Opposite arm+leg toward floor. Anti-extension training.',hotel:'SAME'},
      {id:'m_thu_e3',name:'BICYCLE CRUNCH',badge:'SECONDARY',sets:'3×20',rest:'45 sec',phase1:'Slow',phase2:'Controlled',phase3:'Weighted',ytId:'Iwyvozckjak',desc:'Full thoracic rotation. Slow beats fast. Focus on oblique squeeze.',hotel:'SAME'},
      {id:'m_thu_e4',name:'HANGING LEG RAISE',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Bent knee',phase2:'Straight leg',phase3:'Toes to bar',ytId:'JB2oyawG9KI',desc:'Hang from bar, raise knees to chest controlling the descent. Full lower ab engagement.',hotel:'LYING LEG RAISE — floor version'},
      {id:'m_thu_e5',name:'MOUNTAIN CLIMBERS',badge:'HIIT P2+',sets:'4×30sec on/15 off',rest:'15 sec',phase1:'NOT YET — sub plank',phase2:'Full HIIT',phase3:'Explosive',ytId:'nmwgirgXLYM',desc:'Drive knees alternately, hips level. Heart rate spikes. Phase 2+ only.',hotel:'SAME'},
      {id:'m_thu_e6',name:'BURPEE FINISHER',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'NOT YET',phase2:'Full',phase3:'+ push-up',ytId:'dZgVxmf6jkA',desc:'Full burpees to failure. 20-sec rest. ×3.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'m_thu_cd1',name:'COBRA STRETCH',detail:'60 sec. Lie face down, press up through hands, hips stay down. Full anterior core release after compression work.',ytId:'JohnsonFit9I',type:'stretch'},
      {id:'m_thu_cd2',name:'SUPINE TWIST',detail:'45 sec each side. Lying down, bring knee across body. Releases obliques and lower back.',ytId:'rXi-QI2j8Vk',type:'stretch'},
      {id:'m_thu_cd3',name:'SEATED FORWARD FOLD',detail:'60 sec. Legs extended, reach toward feet. Releases posterior chain tension from core work.',ytId:'FaDzGjrgBpE',type:'stretch'},
      {id:'m_thu_cd4',name:'CAT-COW',detail:'10 slow reps. Spinal flexion and extension. Resets spine after high-intensity core compression.',ytId:'kqnua4rHVVA',type:'stretch'}
    ]},

  fri:{title:'FULL UPPER COMPOUND',sub:'Compound Upper Body Strength',
    warmup:[
      {id:'m_fri_wu1',name:'ARM CIRCLES',detail:'20 reps each direction. Full shoulder warm-up for combined push+pull session.',ytId:'1u9-YNjFm0g',type:'stretch'},
      {id:'m_fri_wu2',name:'BAND PULL-APARTS',detail:'20 reps. Activates rear delts and rhomboids before compound pressing.',ytId:'0kgSBxbG6zo',type:'activate'},
      {id:'m_fri_wu3',name:'PUSH-UP PLUS',detail:'10 reps. Serratus anterior activation — critical for Friday\'s compound work.',ytId:'B5OhsrUaD30',type:'activate'},
      {id:'m_fri_wu4',name:'SCAPULAR RETRACTIONS',detail:'15 reps. Combined push+pull session requires full scapular control primed.',ytId:'akgQbxhrhOc',type:'activate'},
      {id:'m_fri_wu5',name:'SHOULDER ROTATIONS (YTW)',detail:'10 reps each. Lie face down, raise arms in Y, T, W shapes. Full rotator cuff activation before heavy compound day.',ytId:'whbDHDHFHLE',type:'activate'}
    ],
    exercises:[
      {id:'m_fri_e1',name:'FLOOR PRESS',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'60%',phase2:'75–85%',phase3:'85–95%',ytId:'uUGDRwge4F8',desc:'Lie on floor. Upper arms rest between reps, eliminating stretch reflex. Builds lockout strength.',hotel:'SAME — this IS the hotel exercise'},
      {id:'m_fri_e2',name:'ARCHER PUSH-UP',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Standard push-up',phase2:'Archer push-up',phase3:'One-arm progression',ytId:'44DbxOftzgw',desc:'Body shifts side to side. Equivalent to 75%+ bench. Progresses toward one-arm push-up.',hotel:'SAME'},
      {id:'m_fri_e3',name:'RENEGADE ROW',badge:'SECONDARY',sets:'3×8/side',rest:'90 sec',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'Lge5ZPpGQu4',desc:'Push-up position, row one DB while stabilizing. Anti-rotation core + pull strength.',hotel:'Plank to alternating shoulder taps (no DBs)'},
      {id:'m_fri_e4',name:'TRICEP DIPS',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Wide grip',phase2:'Narrow grip',phase3:'Weighted',ytId:'0326dy_-CzM',desc:'Bench edge, fingers forward. 90° elbow, elbows close to body.',hotel:'CHAIR DIPS or BED EDGE'},
      {id:'m_fri_e5',name:'BICEP CURL',badge:'SECONDARY',sets:'3×10',rest:'60 sec',phase1:'Light',phase2:'Progressive',phase3:'Heavy',ytId:'ykJmrZ5v0Oo',desc:'Full range — supinate at top. Lower over 3 sec. Finishes the week\'s arm volume.',hotel:'TOWEL CURL'},
      {id:'m_fri_e6',name:'PUSH-UP BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Hardest variation',ytId:'IODxDxX7oi4',desc:'Full upper burnout to cap Friday.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'m_fri_cd1',name:'DOORWAY CHEST STRETCH',detail:'60 sec each side. Full chest release after combined push session.',ytId:'eTlnJYWv9Y4',type:'stretch'},
      {id:'m_fri_cd2',name:'DOORWAY LAT STRETCH',detail:'60 sec each side. Full back release after combined pull session.',ytId:'lPOOpNe6JM4',type:'stretch'},
      {id:'m_fri_cd3',name:'CROSS-BODY SHOULDER STRETCH',detail:'30 sec each side. Rear deltoid and rotator cuff decompression.',ytId:'KFlSIhgZXOQ',type:'stretch'},
      {id:'m_fri_cd4',name:'WRIST CIRCLES + FOREARM STRETCH',detail:'30 sec each. Reverse prayer position. Releases forearms and wrist after grip-intensive session.',ytId:'Y_xVXsumqo4',type:'stretch'}
    ]},

  sat:{title:'LEGS + CORE + RECOVERY',sub:'Full Legs · Core · Active Recovery',
    warmup:[
      {id:'m_sat_wu1',name:'WORLD\'S GREATEST STRETCH',detail:'5 reps each side. Lunge + thoracic rotation. Opens hip flexors, groin, and thoracic spine simultaneously.',ytId:'lGTq_ABiHuE',type:'stretch'},
      {id:'m_sat_wu2',name:'GLUTE BRIDGE',detail:'20 reps. Lower intensity Saturday still needs glute activation before leg work.',ytId:'wPM8icPu6H8',type:'activate'},
      {id:'m_sat_wu3',name:'LEG SWINGS (side)',detail:'15 swings each leg. Lateral swings for hip abductor activation before lunges.',ytId:'KFZ5hLJbR9o',type:'stretch'},
      {id:'m_sat_wu4',name:'WALKING LUNGE WARM-UP',detail:'10 reps BW. Establishes lunge pattern at low intensity before loading.',ytId:'D7KaRcUTQeE',type:'activate'},
      {id:'m_sat_wu5',name:'ANKLE CIRCLES',detail:'10 reps each direction each ankle. Often skipped, critical for squat and lunge stability.',ytId:'vENbJDVHXoQ',type:'stretch'}
    ],
    exercises:[
      {id:'m_sat_e1',name:'REVERSE LUNGE',badge:'PRIMARY',sets:'4×8/leg',rest:'90 sec',phase1:'BW',phase2:'DB hold',phase3:'Heavy DBs',ytId:'xrjMX9RLuHs',desc:'Step back, lower back knee. Drive front heel. Higher reps, active recovery focus.',hotel:'SAME'},
      {id:'m_sat_e2',name:'WALL SIT',badge:'ISOMETRIC',sets:'3×60 sec',rest:'60 sec',phase1:'30–45 sec',phase2:'60–75 sec',phase3:'90 sec + DB',ytId:'y-wV4Venusw',desc:'Thighs parallel, knees 90°. Isometric quad endurance without spinal load.',hotel:'SAME — just need a wall'},
      {id:'m_sat_e3',name:'SINGLE-LEG DEADLIFT',badge:'PRIMARY',sets:'3×10/leg',rest:'90 sec',phase1:'BW balance',phase2:'Light DB',phase3:'Heavy DB',ytId:'4Kx4Km9XxJk',desc:'Balance on one leg, hinge hip, back flat. Develops unilateral hamstring and glute strength with proprioception.',hotel:'SAME'},
      {id:'m_sat_e4',name:'LEG RAISES',badge:'CORE',sets:'3×15',rest:'60 sec',phase1:'Bent knee',phase2:'Straight leg',phase3:'Weighted',ytId:'JB2oyawG9KI',desc:'Lower abdominal + hip flexor. Slow, controlled.',hotel:'SAME'},
      {id:'m_sat_e5',name:'MOBILITY FLOW',badge:'RECOVERY',sets:'10–15 min',rest:'Flow',phase1:'Beginner',phase2:'Deeper range',phase3:'Advanced',ytId:'4pKly2JojMw',desc:'Thoracic rotations, hip 90/90, pigeon, hamstring floss, shoulder CARs.',hotel:'SAME — floor only'},
      {id:'m_sat_e6',name:'LUNGE BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Jump lunges',ytId:'xrjMX9RLuHs',desc:'Alternating lunges to failure. Saturday\'s lower intensity burnout.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'m_sat_cd1',name:'PIGEON STRETCH',detail:'90 sec each side. Deepest hip opener — Saturday is the perfect day for extended holds.',ytId:'O11Md_bJCfk',type:'stretch'},
      {id:'m_sat_cd2',name:'SEATED HAMSTRING STRETCH',detail:'90 sec each leg. Extended hold after week\'s accumulated hamstring work.',ytId:'Tio35lx0bic',type:'stretch'},
      {id:'m_sat_cd3',name:'HIP FLEXOR LUNGE STRETCH',detail:'90 sec each side. Reverses week of sitting and hip flexor shortening.',ytId:'YQmpR9OO7Zk',type:'stretch'},
      {id:'m_sat_cd4',name:'FULL SPINE FOAM ROLL',detail:'3–5 min. Roll thoracic spine, glutes, IT band. Weekly full-body fascial release.',ytId:'qlF-3ppUCpc',type:'stretch'},
      {id:'m_sat_cd5',name:'CHILD\'S POSE',detail:'90 sec. Final decompression. Lets week\'s spinal load fully release.',ytId:'eqVMAPM00GM',type:'stretch'}
    ]}
};

// Female workout variant — same days, glute/shape focus
const WORKOUTS_FEMALE = {
  mon:{title:'UPPER PUSH + CORE',sub:'Chest · Shoulders · Triceps · Core',
    warmup:[
      {id:'f_mon_wu1',name:'ARM CIRCLES',detail:'30 reps each direction. Opens shoulder joint before pressing.',ytId:'1u9-YNjFm0g',type:'stretch'},
      {id:'f_mon_wu2',name:'SHOULDER ROLLS',detail:'20 reps forward and back. Releases tension carried in traps from desk work.',ytId:'bNPZKPBK3pU',type:'stretch'},
      {id:'f_mon_wu3',name:'PUSH-UP PLUS',detail:'10 reps. Activates serratus anterior — the muscle that gives the sides of the chest definition.',ytId:'B5OhsrUaD30',type:'activate'},
      {id:'f_mon_wu4',name:'DEAD BUG',detail:'8 reps each side. Core activation before combining chest + core day.',ytId:'4XLEnwUr1d8',type:'activate'},
      {id:'f_mon_wu5',name:'BAND PULL-APARTS',detail:'20 reps. Rear delt activation protects shoulder health on push day.',ytId:'0kgSBxbG6zo',type:'activate'}
    ],
    exercises:[
      {id:'f_mon_e1',name:'PUSH-UP VARIATIONS',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Knee push-up → standard',phase2:'Standard → decline',phase3:'Archer push-up',ytId:'IODxDxX7oi4',desc:'Full chest activation. Phase progression makes you genuinely stronger. Keep core tight, squeeze at top.',hotel:'SAME — perfect floor exercise'},
      {id:'f_mon_e2',name:'OVERHEAD PRESS',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Light DB — form',phase2:'Moderate-heavy',phase3:'Heavy progression',ytId:'2yjwXTZbrDM',desc:'Seated or standing. Press directly overhead. Builds shoulder definition that creates hourglass silhouette.',hotel:'WATER BOTTLE PRESS — or pike push-ups'},
      {id:'f_mon_e3',name:'INCLINE DB PRESS',badge:'SECONDARY',sets:'3×12',rest:'90 sec',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'8iPEnn-ltC8',desc:'Upper chest focus. Creates lift and definition. Control the descent — that\'s where the shaping happens.',hotel:'DECLINE PUSH-UP off bed — same angle'},
      {id:'f_mon_e4',name:'LATERAL RAISES',badge:'SECONDARY',sets:'3×15',rest:'60 sec',phase1:'Very light',phase2:'Light-moderate',phase3:'Moderate',ytId:'3VcKaXpzqRo',desc:'Shoulder caps that create the shoulder-to-waist ratio. Light weight, perfect form beats heavy and sloppy.',hotel:'Water bottle lateral raises'},
      {id:'f_mon_e5',name:'TRICEP OVERHEAD EXT.',badge:'SECONDARY',sets:'3×15',rest:'60 sec',phase1:'Very light',phase2:'Light',phase3:'Moderate',ytId:'_gsUck-7f74',desc:'Arm overhead, lower dumbbell behind head. Targets the tricep long head — creates the under-arm definition.',hotel:'DIAMOND PUSH-UP 3×12'},
      {id:'f_mon_e6',name:'PUSH-UP BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Decline version',ytId:'IODxDxX7oi4',desc:'To failure, rest 20 sec, repeat. Metabolic flush — burning fat while shaping.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'f_mon_cd1',name:'DOORWAY CHEST STRETCH',detail:'60 sec each side. Full chest and anterior shoulder release.',ytId:'eTlnJYWv9Y4',type:'stretch'},
      {id:'f_mon_cd2',name:'CROSS-BODY SHOULDER STRETCH',detail:'30 sec each side. Releases rear deltoid after push day.',ytId:'KFlSIhgZXOQ',type:'stretch'},
      {id:'f_mon_cd3',name:'TRICEP OVERHEAD STRETCH',detail:'30 sec each arm. Essential after overhead extension work.',ytId:'YwTbYJhLBY4',type:'stretch'},
      {id:'f_mon_cd4',name:'COBRA STRETCH',detail:'60 sec. Releases core after combined push+core session.',ytId:'JohnsonFit9I',type:'stretch'}
    ]},

  tue:{title:'LOWER BODY — GLUTE FOCUS',sub:'Glutes · Quads · Hamstrings · Inner Thighs',
    warmup:[
      {id:'f_tue_wu1',name:'HIP CIRCLES',detail:'30 reps each direction. Fully warms hip joint before heavy glute work.',ytId:'bVnBdaYn0hY',type:'stretch'},
      {id:'f_tue_wu2',name:'GLUTE BRIDGE',detail:'20 reps, 2-sec hold. The most important activation before any glute day — turns on glute max before squats.',ytId:'wPM8icPu6H8',type:'activate'},
      {id:'f_tue_wu3',name:'CLAMSHELL',detail:'20 reps each side. Activates glute medius — prevents knee valgus (inward cave) during squats.',ytId:'5bNq7KKGV4E',type:'activate'},
      {id:'f_tue_wu4',name:'FIRE HYDRANT',detail:'15 reps each side. Hip abductor activation — warms glute med and min for sumo stance.',ytId:'Vts3KUjHJlY',type:'activate'},
      {id:'f_tue_wu5',name:'BODYWEIGHT SUMO SQUAT',detail:'15 reps, slow. Establishes wide-stance pattern and inner thigh activation before loading.',ytId:'MxsFDhcyFyE',type:'activate'}
    ],
    exercises:[
      {id:'f_tue_e1',name:'SUMO SQUAT',badge:'5×5 STRENGTH',sets:'5×5',rest:'2 min',phase1:'BW → light DB',phase2:'Heavy DB',phase3:'Max DB',ytId:'MxsFDhcyFyE',desc:'Wide stance, toes out 45°. Targets inner thighs AND glutes. Lower until thighs parallel. Drive knees out.',hotel:'BW SUMO SQUAT 5×5 — pulse at bottom for intensity'},
      {id:'f_tue_e2',name:'ROMANIAN DEADLIFT',badge:'5×5 STRENGTH',sets:'5×5',rest:'2 min',phase1:'Light DB',phase2:'Moderate-heavy',phase3:'Heavy',ytId:'JCXUYuzwNrM',desc:'The #1 hamstring and glute builder. Feel hamstring stretch. Drive hips forward hard at top — that\'s the glute squeeze.',hotel:'SINGLE-LEG RDL 5×5 — incredible for balance + glute isolation'},
      {id:'f_tue_e3',name:'HIP THRUST',badge:'SECONDARY',sets:'4×12',rest:'90 sec',phase1:'BW — form',phase2:'DB on hips',phase3:'Heavy DB — pause at top',ytId:'wPM8icPu6H8',desc:'The #1 glute exercise on the planet. Upper back on bench, DB on hips. Drive hips to ceiling, squeeze hard. 1-second hold.',hotel:'FLOOR GLUTE BRIDGE — same movement, same results'},
      {id:'f_tue_e4',name:'DONKEY KICK',badge:'SECONDARY',sets:'3×20/leg',rest:'60 sec',phase1:'BW',phase2:'Ankle weight',phase3:'Band resistance',ytId:'SJ1iYTLBgpI',desc:'On all fours, drive heel toward ceiling, glute squeeze at top. Isolates glute max without loading the spine.',hotel:'SAME'},
      {id:'f_tue_e5',name:'LATERAL BAND WALK',badge:'SECONDARY',sets:'3×15/direction',rest:'60 sec',phase1:'Light band',phase2:'Medium band',phase3:'Heavy band',ytId:'a5G4RJfVi2U',desc:'Band above knees, squat position, step sideways. Glute medius isolation — creates hip-to-waist shape.',hotel:'NO BAND — side lunge instead'},
      {id:'f_tue_e6',name:'SQUAT BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Sumo jump squats',ytId:'aclHkVaku9U',desc:'Sumo squats to failure. 20-sec rest. ×3.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'f_tue_cd1',name:'PIGEON STRETCH',detail:'90 sec each side. Deep glute release after heavy hip thrust and sumo work.',ytId:'O11Md_bJCfk',type:'stretch'},
      {id:'f_tue_cd2',name:'BUTTERFLY STRETCH',detail:'60 sec. Soles of feet together, knees dropped. Releases inner thighs after sumo stance.',ytId:'hBzAbIFocZQ',type:'stretch'},
      {id:'f_tue_cd3',name:'STANDING QUAD STRETCH',detail:'30 sec each leg. Full quad release after squat loading.',ytId:'1f9sDHSIMFc',type:'stretch'},
      {id:'f_tue_cd4',name:'HIP FLEXOR LUNGE STRETCH',detail:'60 sec each side. Reverses hip flexor shortening from heavy lower body day.',ytId:'YQmpR9OO7Zk',type:'stretch'}
    ]},

  wed:{title:'UPPER PULL + WAIST',sub:'Back · Biceps · Rear Delts · Obliques',
    warmup:[
      {id:'f_wed_wu1',name:'BAND PULL-APARTS',detail:'20 reps. Rear delt activation — builds the back definition that creates waist-to-shoulder shape.',ytId:'0kgSBxbG6zo',type:'activate'},
      {id:'f_wed_wu2',name:'PRONE COBRA',detail:'10 reps. Mid-back activation. Most women benefit enormously from back development for posture.',ytId:'Mfbv5XEGZJI',type:'activate'},
      {id:'f_wed_wu3',name:'SCAPULAR RETRACTIONS',detail:'15 reps. Shoulder blade control before rowing — prevents shoulder impingement.',ytId:'akgQbxhrhOc',type:'activate'},
      {id:'f_wed_wu4',name:'DEAD HANG',detail:'20 sec. Decompresses spine, activates grip, stretches lat.',ytId:'VJTZ7cGmkEo',type:'stretch'},
      {id:'f_wed_wu5',name:'HAMMER CURL (light)',detail:'15 reps. Warms brachialis before full bicep work.',ytId:'0xyZbNqL_U0',type:'activate'}
    ],
    exercises:[
      {id:'f_wed_e1',name:'DB ROW (single arm)',badge:'5×5 STRENGTH',sets:'5×5/side',rest:'2–3 min',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'roCP442LA5g',desc:'Drive elbow back. Squeeze lat at top. Back development creates the V-taper that defines waist.',hotel:'TOWEL-DOOR ROW'},
      {id:'f_wed_e2',name:'BENT-OVER ROW',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'FWJR5Ve8bnQ',desc:'Hinge forward. Row to lower chest, squeeze shoulder blades. Mid-back thickness.',hotel:'BED-FRAME ROW'},
      {id:'f_wed_e3',name:'BICEP CURL',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Light',phase2:'Progressive',phase3:'Heavy',ytId:'ykJmrZ5v0Oo',desc:'Full range, supinate at top. Defined arms through controlled movement, not heavy weight.',hotel:'TOWEL CURL'},
      {id:'f_wed_e4',name:'REAR DELT RAISE',badge:'SECONDARY',sets:'3×15',rest:'60 sec',phase1:'Very light',phase2:'Progressive',phase3:'Load+tempo',ytId:'Rep-GkxHMKU',desc:'Bent over, arms out. Builds posterior shoulder definition — the final piece of an hourglass upper body.',hotel:'PRONE REAR DELT RAISE on bed'},
      {id:'f_wed_e5',name:'RUSSIAN TWIST',badge:'WAIST',sets:'3×20',rest:'60 sec',phase1:'BW',phase2:'Light DB',phase3:'Heavy DB',ytId:'JyUqwkVpsi8',desc:'Seated, feet off floor, rotate side to side. Targets obliques — the muscles that define and narrow the waist.',hotel:'SAME'},
      {id:'f_wed_e6',name:'ROW BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Full',ytId:'FWJR5Ve8bnQ',desc:'Light rows to failure. 20-sec rest. ×3.',hotel:'BED-FRAME ROW BURNOUT'}
    ],
    cooldown:[
      {id:'f_wed_cd1',name:'DOORWAY LAT STRETCH',detail:'60 sec each side. Full lat release after rowing.',ytId:'lPOOpNe6JM4',type:'stretch'},
      {id:'f_wed_cd2',name:'CHILD\'S POSE',detail:'60 sec. Complete back decompression.',ytId:'eqVMAPM00GM',type:'stretch'},
      {id:'f_wed_cd3',name:'SUPINE TWIST',detail:'45 sec each side. Releases obliques after waist work.',ytId:'rXi-QI2j8Vk',type:'stretch'},
      {id:'f_wed_cd4',name:'BICEP DOORFRAME STRETCH',detail:'30 sec each arm. Releases bicep and elbow after curl volume.',ytId:'bJ1JxDL89P0',type:'stretch'}
    ]},

  thu:{title:'CORE + HIIT',sub:'Abs · Obliques · Waist · Conditioning',
    warmup:[
      {id:'f_thu_wu1',name:'DEAD BUG',detail:'10 reps each side. Core primer.',ytId:'4XLEnwUr1d8',type:'activate'},
      {id:'f_thu_wu2',name:'BIRD DOG',detail:'10 reps each side. Anti-rotation activation.',ytId:'wiFNA3sqjCA',type:'activate'},
      {id:'f_thu_wu3',name:'HOLLOW HOLD',detail:'20 sec. Full anterior core engagement.',ytId:'LlDNef_Ztsc',type:'activate'},
      {id:'f_thu_wu4',name:'GLUTE BRIDGE',detail:'15 reps. Protects lower back during core compression.',ytId:'wPM8icPu6H8',type:'activate'},
      {id:'f_thu_wu5',name:'PLANK HOLD',detail:'30 sec. Establishes position before adding movement.',ytId:'pSHjTRCQxIw',type:'activate'}
    ],
    exercises:[
      {id:'f_thu_e1',name:'PLANK VARIATIONS',badge:'CORE',sets:'3×45–90 sec',rest:'60 sec',phase1:'Standard',phase2:'Side plank',phase3:'Weighted',ytId:'pSHjTRCQxIw',desc:'Full body tension. No hip sag. Builds flat, tight core — not bulk.',hotel:'SAME'},
      {id:'f_thu_e2',name:'DEAD BUG',badge:'CORE',sets:'3×10/side',rest:'60 sec',phase1:'BW',phase2:'DB reach',phase3:'Heavy DB',ytId:'4XLEnwUr1d8',desc:'Deep core without spinal compression. Best exercise for lower belly.',hotel:'SAME'},
      {id:'f_thu_e3',name:'BICYCLE CRUNCH',badge:'CORE',sets:'3×20',rest:'45 sec',phase1:'Slow',phase2:'Controlled',phase3:'Weighted',ytId:'Iwyvozckjak',desc:'Full thoracic rotation. Obliques pull in the waist. Slow beats fast.',hotel:'SAME'},
      {id:'f_thu_e4',name:'SIDE PLANK HIP DIP',badge:'WAIST',sets:'3×15/side',rest:'60 sec',phase1:'Knee down',phase2:'Full side plank',phase3:'Weighted',ytId:'Bk_VYqG83CQ',desc:'In side plank, dip hip to floor and back up. Targets obliques through full range — defines the waist curve.',hotel:'SAME'},
      {id:'f_thu_e5',name:'MOUNTAIN CLIMBERS',badge:'HIIT P2+',sets:'4×30sec on/15 off',rest:'15 sec',phase1:'NOT YET — sub plank',phase2:'Full HIIT',phase3:'Explosive',ytId:'nmwgirgXLYM',desc:'Cardio blast. Phase 2+ only.',hotel:'SAME'},
      {id:'f_thu_e6',name:'BURPEE FINISHER',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'NOT YET',phase2:'Full',phase3:'+ push-up',ytId:'dZgVxmf6jkA',desc:'To failure, rest 20 sec. ×3.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'f_thu_cd1',name:'COBRA STRETCH',detail:'60 sec. Full anterior core release.',ytId:'JohnsonFit9I',type:'stretch'},
      {id:'f_thu_cd2',name:'SUPINE TWIST',detail:'45 sec each side. Releases obliques.',ytId:'rXi-QI2j8Vk',type:'stretch'},
      {id:'f_thu_cd3',name:'SEATED FORWARD FOLD',detail:'60 sec. Posterior chain release.',ytId:'FaDzGjrgBpE',type:'stretch'},
      {id:'f_thu_cd4',name:'CAT-COW',detail:'10 slow reps. Resets spine after core compression.',ytId:'kqnua4rHVVA',type:'stretch'}
    ]},

  fri:{title:'FULL UPPER COMPOUND',sub:'Compound Upper Body Strength',
    warmup:[
      {id:'f_fri_wu1',name:'ARM CIRCLES',detail:'20 reps each direction.',ytId:'1u9-YNjFm0g',type:'stretch'},
      {id:'f_fri_wu2',name:'BAND PULL-APARTS',detail:'20 reps.',ytId:'0kgSBxbG6zo',type:'activate'},
      {id:'f_fri_wu3',name:'PUSH-UP PLUS',detail:'10 reps.',ytId:'B5OhsrUaD30',type:'activate'},
      {id:'f_fri_wu4',name:'SCAPULAR RETRACTIONS',detail:'15 reps.',ytId:'akgQbxhrhOc',type:'activate'},
      {id:'f_fri_wu5',name:'SHOULDER ROTATIONS (YTW)',detail:'10 reps each. Full rotator cuff primer.',ytId:'whbDHDHFHLE',type:'activate'}
    ],
    exercises:[
      {id:'f_fri_e1',name:'FLOOR PRESS',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'uUGDRwge4F8',desc:'Builds lockout chest and tricep strength. No shoulder impingement risk.',hotel:'SAME'},
      {id:'f_fri_e2',name:'ARCHER PUSH-UP',badge:'5×5 STRENGTH',sets:'5×5',rest:'2–3 min',phase1:'Standard push-up',phase2:'Archer',phase3:'One-arm progression',ytId:'44DbxOftzgw',desc:'Equivalent to 75%+ bench. Serious functional upper body strength.',hotel:'SAME'},
      {id:'f_fri_e3',name:'RENEGADE ROW',badge:'SECONDARY',sets:'3×8/side',rest:'90 sec',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'Lge5ZPpGQu4',desc:'Anti-rotation core + pull strength. One of the most complete exercises.',hotel:'Plank to shoulder taps (no DBs)'},
      {id:'f_fri_e4',name:'TRICEP DIPS',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Wide grip',phase2:'Narrow grip',phase3:'Weighted',ytId:'0326dy_-CzM',desc:'Bench edge. Targets the back of the arm — the area women most want to define.',hotel:'CHAIR DIPS or BED EDGE'},
      {id:'f_fri_e5',name:'HAMMER CURL',badge:'SECONDARY',sets:'3×12',rest:'60 sec',phase1:'Light',phase2:'Moderate',phase3:'Heavy',ytId:'0xyZbNqL_U0',desc:'Neutral grip. Builds arm thickness and definition from the side.',hotel:'SAME with water bottles'},
      {id:'f_fri_e6',name:'PUSH-UP BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Hardest variation',ytId:'IODxDxX7oi4',desc:'Full upper burnout to cap Friday.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'f_fri_cd1',name:'DOORWAY CHEST STRETCH',detail:'60 sec each side.',ytId:'eTlnJYWv9Y4',type:'stretch'},
      {id:'f_fri_cd2',name:'DOORWAY LAT STRETCH',detail:'60 sec each side.',ytId:'lPOOpNe6JM4',type:'stretch'},
      {id:'f_fri_cd3',name:'CROSS-BODY SHOULDER STRETCH',detail:'30 sec each side.',ytId:'KFlSIhgZXOQ',type:'stretch'},
      {id:'f_fri_cd4',name:'WRIST CIRCLES + FOREARM STRETCH',detail:'30 sec each direction.',ytId:'Y_xVXsumqo4',type:'stretch'}
    ]},

  sat:{title:'GLUTES + CORE + RECOVERY',sub:'Glute Shaping · Waist · Mobility',
    warmup:[
      {id:'f_sat_wu1',name:'WORLD\'S GREATEST STRETCH',detail:'5 reps each side. Opens hips, groin, and thoracic spine.',ytId:'lGTq_ABiHuE',type:'stretch'},
      {id:'f_sat_wu2',name:'GLUTE BRIDGE',detail:'20 reps. Glute activation for glute-focused Saturday.',ytId:'wPM8icPu6H8',type:'activate'},
      {id:'f_sat_wu3',name:'FIRE HYDRANT',detail:'15 reps each side. Hip abductor activation.',ytId:'Vts3KUjHJlY',type:'activate'},
      {id:'f_sat_wu4',name:'DONKEY KICK',detail:'10 reps each side. Glute max priming.',ytId:'SJ1iYTLBgpI',type:'activate'},
      {id:'f_sat_wu5',name:'CLAMSHELL',detail:'15 reps each side. Glute medius activation.',ytId:'5bNq7KKGV4E',type:'activate'}
    ],
    exercises:[
      {id:'f_sat_e1',name:'SINGLE-LEG DEADLIFT',badge:'PRIMARY',sets:'3×10/leg',rest:'90 sec',phase1:'BW balance',phase2:'Light DB',phase3:'Heavy DB',ytId:'4Kx4Km9XxJk',desc:'Unilateral hamstring and glute work with balance challenge.',hotel:'SAME'},
      {id:'f_sat_e2',name:'GLUTE KICKBACK',badge:'PRIMARY',sets:'4×15/leg',rest:'60 sec',phase1:'BW',phase2:'Band',phase3:'Cable or ankle weight',ytId:'SJ1iYTLBgpI',desc:'On all fours, drive heel back and up. Pure glute max isolation.',hotel:'SAME'},
      {id:'f_sat_e3',name:'REVERSE LUNGE',badge:'PRIMARY',sets:'3×10/leg',rest:'90 sec',phase1:'BW',phase2:'Light DB',phase3:'Heavy DBs',ytId:'xrjMX9RLuHs',desc:'Lower intensity active recovery lunge. Step back, front shin vertical.',hotel:'SAME'},
      {id:'f_sat_e4',name:'SIDE PLANK HIP DIP',badge:'WAIST',sets:'3×15/side',rest:'60 sec',phase1:'Knee down',phase2:'Full side plank',phase3:'Weighted',ytId:'Bk_VYqG83CQ',desc:'Oblique work to define waist. The week\'s final waist shaping exercise.',hotel:'SAME'},
      {id:'f_sat_e5',name:'MOBILITY FLOW',badge:'RECOVERY',sets:'10–15 min',rest:'Flow',phase1:'Beginner',phase2:'Deeper range',phase3:'Advanced',ytId:'4pKly2JojMw',desc:'Hip 90/90, pigeon, butterfly, hamstring floss.',hotel:'SAME — floor only'},
      {id:'f_sat_e6',name:'LUNGE BURNOUT',badge:'BURNOUT',sets:'Max→20sec→×3',rest:'20 sec',phase1:'Wk 3–4',phase2:'Full',phase3:'Jump lunges',ytId:'xrjMX9RLuHs',desc:'Alternating lunges to failure. Light and active.',hotel:'SAME'}
    ],
    cooldown:[
      {id:'f_sat_cd1',name:'PIGEON STRETCH',detail:'90 sec each side. Deep glute and hip release.',ytId:'O11Md_bJCfk',type:'stretch'},
      {id:'f_sat_cd2',name:'BUTTERFLY STRETCH',detail:'90 sec. Inner thigh release.',ytId:'hBzAbIFocZQ',type:'stretch'},
      {id:'f_sat_cd3',name:'SEATED HAMSTRING STRETCH',detail:'90 sec each leg.',ytId:'Tio35lx0bic',type:'stretch'},
      {id:'f_sat_cd4',name:'FULL SPINE FOAM ROLL',detail:'3–5 min. Weekly full-body fascial release.',ytId:'qlF-3ppUCpc',type:'stretch'},
      {id:'f_sat_cd5',name:'CHILD\'S POSE',detail:'90 sec. Final weekly decompression.',ytId:'eqVMAPM00GM',type:'stretch'}
    ]}
};

const DAY_IDS = ['mon','tue','wed','thu','fri','sat'];
const DAY_NAMES = {mon:'MON',tue:'TUE',wed:'WED',thu:'THU',fri:'FRI',sat:'SAT',sun:'SUN'};

// Track checked items in memory (saved to Firebase)
let workoutChecks   = {}; // { exerciseId: true/false }
let exerciseActuals = {}; // { exerciseId: { sets: [{reps, weight}], notes } }
let exerciseProgressions = {}; // { exId: stepNumber } — user's current progression level

function buildDayTabs() {
  const jsDay = new Date().getDay();
  const map = [6,0,1,2,3,4,5]; // Sun=0 → index 6 (sat)
  const todayIdx = map[jsDay];
  const dayIds = [...DAY_IDS,'sun'];
  document.getElementById('dayTabs').innerHTML = dayIds.map((id,i) => {
    const isToday = (i === todayIdx) || (id==='sun' && jsDay===0);
    return `<div class="stat-box" style="flex:1;min-width:60px;cursor:${id==='sun'?'default':'pointer'};${isToday?'border-bottom:3px solid var(--accent2);':''}" id="daytab-${id}"
      onclick="${id==='sun'?'':` showWorkoutDay('${id}')`}">
      <div style="font-family:var(--font-display);font-size:0.95rem;color:${isToday?'var(--accent2)':'var(--text)'};">${DAY_NAMES[id]}</div>
      <div class="stat-label">${id==='sun'?'REST':''}</div>
    </div>`;
  }).join('');
}

async function showWorkoutDay(dayId) {
  // Use the date picker value (defaults to today)
  const today    = localDateStr();
  const dateEl   = document.getElementById('workout-date');
  if (dateEl && !dateEl.value) dateEl.value = today;
  const workDate = dateEl?.value || today;
  const isToday  = workDate === today;

  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('wkchecks').doc(workDate).get();
    workoutChecks   = doc.exists ? (doc.data().checks  || {}) : {};
    exerciseActuals = doc.exists ? (doc.data().actuals || {}) : {};
  } catch(e) { workoutChecks = {}; exerciseActuals = {}; }

  // Load progression levels (stored separately — user-level, not date-specific)
  try {
    const progDoc = await db.collection('userdata').doc(SESSION.username)
      .collection('progressions').doc('levels').get();
    exerciseProgressions = progDoc.exists ? (progDoc.data() || {}) : {};
  } catch(e) { exerciseProgressions = {}; }

  // Update tab highlights
  DAY_IDS.forEach(id => {
    const el = document.getElementById('daytab-'+id);
    if(el) el.style.borderBottom = id===dayId ? '3px solid var(--accent2)' : 'none';
  });

  const program = await getOrLoadProgram();
  const W = program ? program.days : (SESSION.gender==='female' ? WORKOUTS_FEMALE : WORKOUTS_MALE);
  const w = W[dayId];
  if (!w) return;

  exerciseWeights = {};

  const totalItems  = (w.prevDayStretch||[]).length + (w.preStretch||[]).length + (w.warmup||[]).length + (w.exercises||[]).length + (w.pump||[]).length + (w.cooldown||[]).length;
  const allItems    = [...(w.prevDayStretch||[]), ...(w.preStretch||[]), ...(w.warmup||[]), ...(w.exercises||[]), ...(w.pump||[]), ...(w.cooldown||[])];
  const checkedCount = allItems.filter(i => workoutChecks[i.id]).length;
  const pct = totalItems > 0 ? Math.round(checkedCount / totalItems * 100) : 0;

  // Format date label
  const dObj = new Date(workDate + 'T12:00:00');
  const dateLabel = isToday ? 'TODAY' : dObj.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  const pastNote  = !isToday
    ? `<div style="font-family:var(--font-mono);font-size:0.6rem;color:#ff9800;margin-top:4px;letter-spacing:.08em;">
        📅 LOGGING FOR ${dateLabel.toUpperCase()} — changes save to that date</div>`
    : '';

  document.getElementById('workoutContent').innerHTML = `
    <div class="card" style="margin-bottom:16px;border-left:4px solid ${isToday?'var(--accent2)':'#ff9800'};">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <div class="card-label">${dayId.toUpperCase()} · ${w.title} · ${dateLabel}</div>
          <div style="font-family:var(--font-display);font-size:1.3rem;color:var(--accent2);">${w.sub}</div>
          ${pastNote}
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--font-display);font-size:2rem;color:${pct===100?'#4caf50':'var(--accent2)'};">${pct}%</div>
          <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);">${checkedCount}/${totalItems} DONE</div>
        </div>
      </div>
      <div style="height:4px;background:var(--bg3);border-radius:2px;margin-top:12px;">
        <div style="height:100%;width:${pct}%;background:${pct===100?'#4caf50':'var(--accent2)'};border-radius:2px;transition:width 0.4s;"></div>
      </div>
      ${pct===100?`<div style="font-family:var(--font-mono);font-size:0.7rem;color:#4caf50;margin-top:8px;text-align:center;letter-spacing:.15em;">✓ WORKOUT COMPLETE — OUTSTANDING WORK</div>`:''}
    </div>

    ${renderCalorieBurnCard(dayId, w)}
    ${(w.prevDayStretch||[]).length ? renderWorkoutSection(
      'PREVIOUS WORKOUT STRETCHES', '😌', 'Static holds for yesterday\'s trained muscles — SKIP if not sore',
      w.prevDayStretch, dayId, true) : ''}
    ${renderWorkoutSection('WARM-UP', '🔥', 'Raise heart rate and body temperature before loading', w.preStretch||[], dayId)}
    ${renderWorkoutSection('MUSCLE ACTIVATION', '⚡', 'Prime today\'s target muscles before the core workout', w.warmup||[], dayId)}
    ${renderWorkoutSection('CORE WORKOUT', '💪', 'Main Training Block — heavy compound work', w.exercises||[], dayId)}
    ${(w.pump||[]).length ? renderWorkoutSection('PUMP WORKOUT', '🔁', 'Lighter high-rep finisher — same muscles, more blood flow, metabolic flush', w.pump||[], dayId) : ''}
    ${renderWorkoutSection('STRETCHING TODAY\'S MUSCLES', '❄️', 'Static stretches for today\'s trained muscles — 60–90 sec holds (best post-workout timing)', w.cooldown||[], dayId)}

    <div class="card" style="margin-top:16px;border-left:4px solid var(--border2);">
      <div class="card-label">MANDATORY SESSION END</div>
      <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--accent2);">DECOMPRESSION PROTOCOL</div>
      <div class="mono dim" style="line-height:1.8;margin-top:8px;">10 min · Physiological sigh → 4-7-8 breathing → Body scan<br>
      <span class="orange">Then: 3,000-step post-workout wind-down walk ★ Most important</span></div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <button class="btn btn-s" onclick="nav('decomp')" style="font-size:0.68rem;">OPEN BREATHING GUIDE</button>
        <button class="btn btn-p" onclick="markWorkoutComplete('${dayId}')" style="font-size:0.68rem;">✓ MARK SESSION COMPLETE</button>
      </div>
    </div>`;
}

// ─── Progression ladder system ────────────────────────────
async function saveProgressionLevel(exId, step) {
  const prevStep = exerciseProgressions[exId] || 1;
  exerciseProgressions[exId] = step;
  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('progressions').doc('levels').set(exerciseProgressions);
    const direction = step > prevStep ? '✓ Advanced to step ' + step : '← Stepped back to step ' + step;
    toast(direction);
  } catch(e) { toast('Error saving progression: ' + e.message); }

  // Re-render the ladder in-place without a full page reload
  document.querySelectorAll('[data-prog-id="'+exId+'"]').forEach(ladderEl => {
    const prog = _progCache[exId];
    if (prog) {
      ladderEl.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);
        letter-spacing:.12em;margin-bottom:10px;">📈 PROGRESSION LADDER — TAP ANY STEP TO SWITCH</div>
        ${renderProgressionLadderInner(exId, prog)}`;
    }
  });
}

// Cache of progressions by exId for re-render lookups
const _progCache = {};

function getProgressionsForExId(exId) {
  return _progCache[exId] || null;
}

function renderProgressionLadderInner(exId, progressions) {
  const currentStep = exerciseProgressions[exId] || 1;

  const steps = progressions.map(p => {
    const isCurrent = p.step === currentStep;
    const isDone    = p.step < currentStep;

    const borderColor = isDone ? '#4caf50' : isCurrent ? 'var(--accent2)' : 'var(--border)';
    const bgColor     = isDone ? '#4caf5010' : isCurrent ? 'var(--accent-dim)' : 'var(--bg3)';
    const textColor   = isDone ? '#4caf50' : isCurrent ? 'var(--accent2)' : 'var(--text-dim)';

    const badge = isDone
      ? `<span style="font-family:var(--font-mono);font-size:0.5rem;padding:1px 6px;background:#4caf5022;color:#4caf50;border:1px solid #4caf5044;">✓ DONE</span>`
      : isCurrent
        ? `<span style="font-family:var(--font-mono);font-size:0.5rem;padding:1px 6px;background:var(--accent)22;color:var(--accent2);border:1px solid var(--accent)44;">▶ CURRENT</span>`
        : `<span style="font-family:var(--font-mono);font-size:0.5rem;padding:1px 6px;background:var(--bg2);color:var(--border2);border:1px solid var(--border);">🔒 NEXT</span>`;

    const buttons = isCurrent
      ? `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
          ${p.step > 1
            ? `<button onclick="saveProgressionLevel('${exId}',${p.step-1})" class="btn btn-s"
                style="font-size:0.58rem;padding:3px 8px;">← STEP BACK</button>`
            : ''}
          ${p.step < progressions.length
            ? `<button onclick="saveProgressionLevel('${exId}',${p.step+1})" class="btn btn-p"
                style="font-size:0.58rem;padding:3px 10px;">✓ I GOT THIS → ADVANCE</button>`
            : '<span style="font-family:var(--font-mono);font-size:0.6rem;color:#4caf50;">🏆 MAXIMUM LEVEL</span>'}
        </div>`
      : '';

    // For done/locked steps show a "SWITCH TO THIS" button so user can quickly jump
    const switchBtn = !isCurrent
      ? `<button onclick="saveProgressionLevel('${exId}',${p.step})" 
          style="font-family:var(--font-mono);font-size:0.5rem;padding:1px 8px;cursor:pointer;
          background:none;border:1px solid var(--border);color:var(--border2);margin-left:6px;">
          ${isDone ? '↩ REDO' : '→ JUMP TO'}</button>`
      : '';

    return `<div style="padding:10px 12px;margin-bottom:6px;border:1px solid ${borderColor};background:${bgColor};">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:${(isCurrent&&p.detail)?'6px':'0'};">
        <span style="font-family:var(--font-display);font-size:1rem;color:${textColor};min-width:24px;">${p.step}</span>
        <div style="flex:1;">
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:${textColor};font-weight:${isCurrent?'bold':'normal'};">
            ${p.name}
          </div>
          <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);margin-top:2px;">
            Advance when: ${p.cue}
          </div>
        </div>
        ${badge}${switchBtn}
      </div>
      ${isCurrent && p.detail ? `<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text);
        line-height:1.6;padding:6px 10px;background:var(--bg2);border-left:3px solid var(--accent2);margin-bottom:4px;">
        ${p.detail}</div>` : ''}
      ${buttons}
    </div>`;
  }).join('');

  return `<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);
    letter-spacing:.12em;margin-bottom:10px;">📈 PROGRESSION LADDER — TAP ANY STEP TO SWITCH</div>
  ${steps}`;
}

function renderProgressionLadder(exId, progressions) {
  if (!progressions || progressions.length < 2) return '';
  _progCache[exId] = progressions; // cache for re-render
  return `<div data-prog-id="${exId}" style="margin-top:12px;padding:12px;background:var(--bg2);border:1px solid var(--accent2)22;">
    ${renderProgressionLadderInner(exId, progressions)}
  </div>`;
}

function renderWorkoutSection(title, icon, subtitle, items, dayId, skippable = false) {
  if (!items || items.length === 0) return '';
  const typeColor = {stretch:'#64b5f6', activate:'#ffb74d'};
  const typeLabel = {stretch:'STRETCH', activate:'ACTIVATE'};
  const badgeColor = {'PUMP':'#ce93d8','HYPERTROPHY':'#80cbc4','STRENGTH':'#ef9a9a','TONE':'#a5d6a7','CONDITIONING':'#90caf9'};
  const skipBadge = skippable
    ? `<span style="font-family:var(--font-mono);font-size:0.55rem;color:#ff9800;
        background:rgba(255,152,0,0.1);border:1px solid #ff9800;padding:2px 8px;margin-left:8px;">
        SKIPPABLE — only do if sore</span>`
    : '';

  return `<div style="margin-bottom:16px;">
    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;padding:10px 14px;
      background:var(--bg2);border-left:3px solid ${skippable?'#ff9800':'var(--accent)'};">
      <span style="font-size:1.3rem;">${icon}</span>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;">
          <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--text-bright);letter-spacing:.08em;">${title}</div>
          ${skipBadge}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.15em;">${subtitle}</div>
      </div>
      <div style="margin-left:auto;font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);">
        ${items.filter(i=>workoutChecks[i.id]).length}/${items.length}
      </div>
    </div>
    ${items.map(item => {
      const checked    = !!workoutChecks[item.id];
      const typeC      = item.type ? typeColor[item.type]||'var(--border2)' : badgeColor[item.badge]||'var(--border2)';
      const typeL      = item.type ? typeLabel[item.type]||'' : item.badge||'';
      const isWeighted = WEIGHTED_EXERCISES.has(item.name?.toUpperCase());
      const savedLbs   = exerciseWeights[item.id] || '';
      const itemCals   = getWeightKg() ? calcItemCalories(item, savedLbs) : null;
      const weightKg   = getWeightKg();

      // Determine if ALL sets are done — only then collapse/dim the block
      const savedActual   = exerciseActuals[item.id] || {};
      const savedSets     = savedActual.sets || [];
      let numSetsExpected = 3;
      if (item.sets) {
        const sl = item.sets.toLowerCase();
        if (sl.startsWith('5×5') || sl.startsWith('5x5')) numSetsExpected = 5;
        else if (sl.startsWith('4×') || sl.startsWith('4x')) numSetsExpected = 4;
      }
      const allSetsDone  = item.sets
        ? savedSets.filter(s => s?.done).length >= numSetsExpected
        : !!savedSets[0]?.done;
      const shouldCollapse = checked && allSetsDone;

      return `<div class="ex-block" id="exblock-${item.id}" style="${shouldCollapse ? 'opacity:0.55;border-left:3px solid #4caf50;' : checked ? 'border-left:3px solid #4caf5066;' : ''}">
        <div class="ex-header" style="display:flex;align-items:center;gap:12px;padding:12px 16px;">
          <div onclick="toggleCheck('${item.id}','${dayId}')" style="width:22px;height:22px;border:2px solid ${checked?'#4caf50':'var(--border2)'};
            border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;
            background:${checked?'#4caf5022':'transparent'};flex-shrink:0;transition:all 0.2s;">
            ${checked?'<span style="color:#4caf50;font-size:0.9rem;">✓</span>':''}
          </div>
          <div style="flex:1;cursor:pointer;" onclick="toggleEx(this.closest('.ex-block').querySelector('.ex-body'),'${item.id}')">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <div class="ex-name" style="${shouldCollapse?'text-decoration:line-through;color:var(--text-dim);':checked?'color:#4caf50;':''}">${item.name}</div>
              <span style="font-family:var(--font-mono);font-size:0.55rem;padding:2px 7px;
                background:${typeC}18;color:${typeC};border:1px solid ${typeC}44;">${typeL}</span>
              ${itemCals ? `<span id="cal-badge-${item.id}" style="font-family:var(--font-mono);font-size:0.55rem;padding:2px 7px;
                background:var(--accent)18;color:var(--accent);border:1px solid var(--accent)44;">
                ~${itemCals} kcal</span>` : ''}
            </div>
            <div class="ex-meta" style="margin-top:2px;">${item.sets||item.detail?.slice(0,60)||''}</div>
          </div>
          <span style="color:var(--border2);font-size:0.9rem;">▾</span>
        </div>
        <div class="ex-body"${shouldCollapse ? ' style="display:none;"' : ''}>
          <div class="yt-wrap">
            <div class="yt-ph" onclick="loadYT(this,'${item.name.replace(/'/g,"\\'")}')">
              <div class="yt-play"></div>
              <div class="yt-lbl">▶ CLICK TO WATCH DEMONSTRATION</div>
            </div>
          </div>
          <div class="ex-desc">${item.desc||item.detail||''}</div>
          ${item.sets ? `<table class="tbl mb8">
            <tr><th>PHASE</th><th>LOADING / PROGRESSION</th></tr>
            <tr><td style="color:var(--border2)">PHASE 1</td><td>${item.phase1||'—'}</td></tr>
            <tr><td style="color:var(--border2)">PHASE 2</td><td>${item.phase2||'—'}</td></tr>
            <tr><td style="color:var(--border2)">PHASE 3</td><td>${item.phase3||'—'}</td></tr>
          </table>` : ''}
          ${item.hotel ? `<div class="hotel-alt">🏨 <strong>HOTEL VARIANT:</strong> ${item.hotel}</div>` : ''}
          ${(() => {
            // Progressions: use item.progressions if present (generated exercises),
            // else look up EX_DB by name (static exercises).
            // Always key by the BASE exercise id so progress persists across program regenerations.
            let prog = item.progressions || null;
            let baseId = item.id; // default

            if (!prog) {
              const normalizedName = item.name?.toUpperCase().trim();
              const match = EX_DB.find(e =>
                e.name.toUpperCase() === normalizedName ||
                normalizedName?.includes(e.name.toUpperCase().split(' ')[0])
              );
              if (match?.progressions) {
                prog   = match.progressions;
                baseId = match.id; // use stable EX_DB id
              }
            } else {
              // Generated item: extract base ex id from generated id "gen_day_idx_exId"
              const parts = item.id.split('_');
              // The base id is everything after "gen_day_idx_" — rejoin with underscore
              if (parts[0] === 'gen' && parts.length >= 4) {
                baseId = parts.slice(3).join('_');
              }
            }
            return prog ? renderProgressionLadder(baseId, prog) : '';
          })()}


          <!-- ── SET TRACKER ── -->
          ${(() => {
            const savedActual = exerciseActuals[item.id] || {};
            const savedSets   = savedActual.sets || [];
            const bwPct       = BODYWEIGHT_PCT[item.name?.toUpperCase()];
            const bodyLbs     = SESSION.weight || 0;
            const effectiveBwLbs = bwPct ? Math.round(bodyLbs * bwPct) : 0;

            if (!item.sets) {
              // ── Warmup / cooldown: simple reps-done input ──
              const sv = savedSets[0] || {};
              const calEst = getWeightKg() ? calcActualCalories(item, {sets:[{reps: sv.reps||1}]}) : null;
              return `<div style="background:var(--bg3);border:1px solid var(--border);padding:10px 12px;margin:8px 0;
                display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.1em;">REPS DONE</div>
                <input type="number" id="set-reps-${item.id}-0" value="${sv.reps||''}"
                  placeholder="${item.detail?.match(/×(\d+)|(\d+) reps/)?.[1]||'—'}" min="0" max="999"
                  oninput="saveSetData('${item.id}','${dayId}',0);updateItemCalBadge('${item.id}')"
                  style="width:72px;background:var(--bg2);border:1px solid var(--border);color:var(--text);
                  font-family:var(--font-mono);font-size:0.9rem;padding:6px 8px;outline:none;text-align:center;">
                ${effectiveBwLbs ? `<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);">
                  BW ${Math.round((bwPct||0)*100)}% ≈ ${effectiveBwLbs} lbs</div>` : ''}
                <div id="cal-live-${item.id}" style="margin-left:auto;font-family:var(--font-mono);font-size:0.68rem;color:var(--accent);">
                  ${calEst ? `~${calEst} kcal` : ''}
                </div>
                <div onclick="toggleSetDone('${item.id}','${dayId}',0)"
                  style="width:22px;height:22px;border:2px solid ${savedSets[0]?.done?'#4caf50':'var(--border2)'};
                  border-radius:3px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
                  background:${savedSets[0]?.done?'#4caf5022':'transparent'};transition:all 0.15s;">
                  ${savedSets[0]?.done?'<span style="color:#4caf50;font-size:0.85rem;">✓</span>':''}
                </div>
              </div>`;
            }

            // ── Strength exercise: full set tracker table ──
            let numSets = 3;
            const s = item.sets.toLowerCase();
            if (s.startsWith('5×5') || s.startsWith('5x5')) numSets = 5;
            else if (s.startsWith('4×') || s.startsWith('4x')) numSets = 4;
            else if (s.startsWith('3×') || s.startsWith('3x')) numSets = 3;
            else if (s.includes('max→')) numSets = 3;

            const repMatch  = item.sets.match(/[×x](\d+)/);
            const targetReps = repMatch ? repMatch[1] : '—';
            const setsDoneCount = savedSets.filter(sv=>sv?.done).length;

            // Live calorie estimate from actual sets done
            const actualCalEst = getWeightKg() ? calcActualCalories(item, savedActual) : null;

            return `<div style="background:var(--bg3);border:1px solid var(--border);padding:12px;margin:8px 0;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.12em;">
                  SET TRACKER — ${item.sets}
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                  ${effectiveBwLbs ? `<span style="font-family:var(--font-mono);font-size:0.56rem;color:var(--border2);">
                    BW ${Math.round((bwPct||0)*100)}% ≈ ${effectiveBwLbs} lbs</span>` : ''}
                  <span id="cal-live-${item.id}" style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent);">
                    ${actualCalEst ? `~${actualCalEst} kcal` : ''}
                  </span>
                  <span style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);">
                    ${setsDoneCount}/${numSets} sets ✓
                  </span>
                </div>
              </div>
              <table style="width:100%;border-collapse:collapse;">
                <tr style="border-bottom:1px solid var(--border);">
                  <th style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);text-align:left;padding:4px 6px;width:36px;">SET</th>
                  <th style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);text-align:left;padding:4px 6px;">REPS</th>
                  ${isWeighted ? `<th style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);text-align:left;padding:4px 6px;">LBS</th>` : ''}
                  <th style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);text-align:left;padding:4px 6px;">~KCAL</th>
                  <th style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);text-align:center;padding:4px 6px;width:32px;">✓</th>
                </tr>
                ${Array.from({length:numSets},(_,si) => {
                  const sv      = savedSets[si] || {};
                  const isDone  = !!sv.done;
                  // Per-set calorie estimate
                  const setReps = parseInt(sv.reps) || 0;
                  const setWt   = parseFloat(sv.weight) || parseFloat(savedLbs) || effectiveBwLbs || 0;
                  const setCalEst = (getWeightKg() && setReps)
                    ? Math.round(calcSetCalories(item, setReps, setWt)) : null;

                  return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);${isDone?'opacity:0.7;':''}">
                    <td style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);padding:5px 6px;">${si+1}</td>
                    <td style="padding:4px 5px;">
                      <input type="number" id="set-reps-${item.id}-${si}" value="${sv.reps||''}"
                        placeholder="${targetReps}" min="0" max="999"
                        oninput="saveSetData('${item.id}','${dayId}',${si});updateItemCalBadge('${item.id}')"
                        style="width:62px;background:var(--bg2);border:1px solid ${isDone?'#4caf5044':'var(--border)'};
                        color:var(--text);font-family:var(--font-mono);font-size:0.8rem;
                        padding:4px 6px;outline:none;text-align:center;">
                    </td>
                    ${isWeighted ? `<td style="padding:4px 5px;">
                      <input type="number" id="set-wt-${item.id}-${si}" value="${sv.weight||savedLbs||''}"
                        placeholder="lbs" min="0" max="500" step="2.5"
                        oninput="saveSetData('${item.id}','${dayId}',${si});updateItemCalBadge('${item.id}')"
                        style="width:62px;background:var(--bg2);border:1px solid ${isDone?'#4caf5044':'var(--border)'};
                        color:var(--text);font-family:var(--font-mono);font-size:0.8rem;
                        padding:4px 6px;outline:none;text-align:center;">
                    </td>` : ''}
                    <td style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent);padding:4px 6px;">
                      <span id="set-cal-${item.id}-${si}">${setCalEst ? '~'+setCalEst : '—'}</span>
                    </td>
                    <td style="padding:4px 6px;text-align:center;">
                      <div onclick="toggleSetDone('${item.id}','${dayId}',${si})"
                        style="width:20px;height:20px;border:2px solid ${isDone?'#4caf50':'var(--border2)'};
                        border-radius:3px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
                        background:${isDone?'#4caf5022':'transparent'};transition:all 0.15s;margin:0 auto;">
                        ${isDone?'<span style="color:#4caf50;font-size:0.8rem;">✓</span>':''}
                      </div>
                    </td>
                  </tr>`;
                }).join('')}
              </table>
              ${savedSets.some(s=>s?.reps) ? `
              <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-top:8px;line-height:1.6;">
                ${savedSets.filter(s=>s?.reps).map((sv,i)=>
                  `Set ${i+1}: ${sv.reps} reps${sv.weight?' @ '+sv.weight+'lbs':effectiveBwLbs?' (BW ~'+effectiveBwLbs+'lbs)':''}`
                ).join(' · ')}
              </div>` : ''}
            </div>`;
          })()}

          ${isWeighted && weightKg ? `
          <div style="background:var(--bg3);border:1px solid var(--border);padding:12px;margin:8px 0;">
            <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.12em;margin-bottom:8px;">
              WEIGHT USED — updates calorie estimate
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:6px;">
                <input type="number" id="wt-lbs-${item.id}" value="${savedLbs}"
                  placeholder="lbs" min="0" max="500" step="2.5"
                  oninput="syncWeightInput('${item.id}','lbs')"
                  style="width:72px;background:var(--bg2);border:1px solid var(--border);color:var(--text);
                  font-family:var(--font-mono);font-size:0.85rem;padding:6px 8px;outline:none;text-align:center;">
                <span style="font-family:var(--font-mono);font-size:0.62rem;color:var(--border2);">lbs</span>
              </div>
              <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--border2);">/</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <input type="number" id="wt-kg-${item.id}" value="${savedLbs ? (savedLbs*0.453592).toFixed(1) : ''}"
                  placeholder="kg" min="0" max="250" step="1.25"
                  oninput="syncWeightInput('${item.id}','kg')"
                  style="width:72px;background:var(--bg2);border:1px solid var(--border);color:var(--text);
                  font-family:var(--font-mono);font-size:0.85rem;padding:6px 8px;outline:none;text-align:center;">
                <span style="font-family:var(--font-mono);font-size:0.62rem;color:var(--border2);">kg</span>
              </div>
              <div style="margin-left:auto;font-family:var(--font-mono);font-size:0.7rem;color:var(--accent);">
                ~<span id="cal-live-${item.id}">${itemCals||'—'}</span> kcal
              </div>
            </div>
          </div>` : ''}

          <button onclick="toggleCheck('${item.id}','${dayId}')" style="margin-top:8px;width:100%;padding:8px;
            font-family:var(--font-mono);font-size:0.65rem;letter-spacing:.1em;cursor:pointer;border:none;
            background:${checked?'#4caf5022':'var(--bg3)'};color:${checked?'#4caf50':'var(--text-dim)'};
            border:1px solid ${checked?'#4caf5044':'var(--border)'};">
            ${checked ? '✓ MARKED COMPLETE — CLICK TO UNDO' : '☐ MARK AS COMPLETE'}
          </button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// Calculate calories for a single set given reps and weight
function calcSetCalories(item, reps, weightLbs) {
  const weightKg  = getWeightKg();
  if (!weightKg || !reps) return 0;
  const bodyLbs   = SESSION.weight || 0;
  const name      = item.name?.toUpperCase() || '';
  const met       = EXERCISE_MET[name] || 3.5;
  const secPerRep = SEC_PER_REP[name] || DEFAULT_SEC_PER_REP;
  const setMinutes = (reps * secPerRep) / 60;
  let effectiveLbs = weightLbs || 0;
  if (!effectiveLbs) {
    const bwPct = BODYWEIGHT_PCT[name];
    if (bwPct) effectiveLbs = bodyLbs * bwPct;
  }
  const raw = met * metModifier(effectiveLbs, bodyLbs) * weightKg * setMinutes;
  return Math.min(Math.round(raw), 25); // no single set >25 kcal
}

// Update the calorie badge on the exercise header + all per-set calorie cells
function updateItemCalBadge(itemId) {
  const item = findExerciseById(itemId);
  if (!item) return;

  const actual = exerciseActuals[itemId] || {};
  const sets = actual.sets || [];

  // Update per-set calorie cells
  sets.forEach((sv, si) => {
    const reps   = parseInt(sv?.reps) || 0;
    const wt     = parseFloat(sv?.weight) || parseFloat(exerciseWeights[itemId]) || 0;
    const cals   = reps ? Math.round(calcSetCalories(item, reps, wt)) : null;
    const setCalEl = document.getElementById(`set-cal-${itemId}-${si}`);
    if (setCalEl) setCalEl.textContent = cals ? '~'+cals : '—';
  });

  // Update total kcal badge (sum of all sets)
  const totalCals = calcActualCalories(item, actual);
  const liveEl  = document.getElementById(`cal-live-${itemId}`);
  const badgeEl = document.getElementById(`cal-badge-${itemId}`);
  if (liveEl)  liveEl.textContent  = totalCals ? `~${totalCals} kcal` : '';
  if (badgeEl) badgeEl.textContent = totalCals ? `~${totalCals} kcal` : '';
  updateCalorieBurnDisplay();
}

function syncWeightInput(itemId, fromUnit) {
  const lbsEl = document.getElementById(`wt-lbs-${itemId}`);
  const kgEl  = document.getElementById(`wt-kg-${itemId}`);
  if (!lbsEl || !kgEl) return;

  let lbs;
  if (fromUnit === 'lbs') {
    lbs = parseFloat(lbsEl.value) || 0;
    kgEl.value = lbs ? (lbs * 0.453592).toFixed(1) : '';
  } else {
    const kg = parseFloat(kgEl.value) || 0;
    lbs = kg ? kg * 2.20462 : 0;
    lbsEl.value = lbs ? lbs.toFixed(1) : '';
  }

  exerciseWeights[itemId] = lbs;

  // Update per-item calorie badge
  const item = findExerciseById(itemId);
  if (item) {
    const cals = calcItemCalories(item, lbs);
    const livEl = document.getElementById(`cal-live-${itemId}`);
    const badgeEl = document.getElementById(`cal-badge-${itemId}`);
    if (livEl)   livEl.textContent   = cals || '—';
    if (badgeEl) badgeEl.textContent = cals ? `~${cals} kcal` : '';
  }
  // Update total burn card
  updateCalorieBurnDisplay();
}

function findExerciseById(itemId) {
  const W = getActiveWorkouts();
  for (const day of Object.values(W)) {
    for (const list of [day.prevDayStretch, day.preStretch, day.warmup, day.exercises, day.pump, day.cooldown]) {
      const found = list?.find(i => i.id === itemId);
      if (found) return found;
    }
  }
  return null;
}

// Update section progress counters without full re-render
function updateSectionProgress(dayId) {
  const W = getActiveWorkouts();
  const w = W[dayId];
  if (!w) return;
  const allItems = [...(w.prevDayStretch||[]), ...(w.preStretch||[]), ...(w.warmup||[]), ...(w.exercises||[]), ...(w.pump||[]), ...(w.cooldown||[])];
  const checkedCount = allItems.filter(i => workoutChecks[i.id]).length;
  const pct = Math.round(checkedCount / allItems.length * 100);
  // Update progress bar
  const bar = document.querySelector('#sec-workout .prog-fill, [id^="wk-prog-fill"]');
  // Update % display
  const pctEl = document.querySelector('[id^="wk-pct"]');
  // Simpler: just update elements by content search
  document.querySelectorAll('.ex-block').forEach(block => {
    const id = block.id?.replace('exblock-', '');
    if (!id) return;
    const checked = !!workoutChecks[id];
    const hdrCheck = block.querySelector('[onclick*="toggleCheck"]');
    if (hdrCheck) {
      hdrCheck.style.border = `2px solid ${checked ? '#4caf50' : 'var(--border2)'}`;
      hdrCheck.style.background = checked ? '#4caf5022' : 'transparent';
      hdrCheck.innerHTML = checked ? '<span style="color:#4caf50;font-size:0.9rem;">✓</span>' : '';
    }
  });
}

async function toggleCheck(itemId, dayId) {
  // Toggle the check state
  workoutChecks[itemId] = !workoutChecks[itemId];
  const checked = workoutChecks[itemId];

  // Update DOM in-place — avoid full re-render which resets open/collapsed state
  const block = document.getElementById(`exblock-${itemId}`);
  if (block) {
    // Check if all sets are done (determines whether to collapse)
    const savedSets = exerciseActuals[itemId]?.sets || [];
    const item = findExerciseById(itemId);
    let numSets = item?.sets ? 3 : 1;
    if (item?.sets) {
      const s = item.sets.toLowerCase();
      if (s.startsWith('5×5') || s.startsWith('5x5')) numSets = 5;
      else if (s.startsWith('4×') || s.startsWith('4x')) numSets = 4;
    }
    const allSetsDone = savedSets.filter(s => s?.done).length >= numSets;
    const shouldCollapse = checked && allSetsDone;

    block.style.opacity    = shouldCollapse ? '0.55' : '1';
    block.style.borderLeft = checked ? `3px solid ${shouldCollapse ? '#4caf50' : '#4caf5066'}` : '';
    const body = block.querySelector('.ex-body');
    if (body && shouldCollapse) body.style.display = 'none';
    if (body && !shouldCollapse) body.style.display = '';
    const nameEl = block.querySelector('.ex-name');
    if (nameEl) {
      nameEl.style.textDecoration = shouldCollapse ? 'line-through' : '';
      nameEl.style.color = shouldCollapse ? 'var(--text-dim)' : checked ? '#4caf50' : '';
    }
    // Update the header checkbox
    const hdrCheck = block.querySelector('[onclick*="toggleCheck"]');
    if (hdrCheck) {
      hdrCheck.style.border = `2px solid ${checked ? '#4caf50' : 'var(--border2)'}`;
      hdrCheck.style.background = checked ? '#4caf5022' : 'transparent';
      hdrCheck.innerHTML = checked ? '<span style="color:#4caf50;font-size:0.9rem;">✓</span>' : '';
    }
    // Update the bottom MARK AS COMPLETE button
    const markBtn = block.querySelector('button[onclick*="toggleCheck"]');
    if (markBtn) {
      markBtn.style.background = checked ? '#4caf5022' : 'var(--bg3)';
      markBtn.style.color = checked ? '#4caf50' : 'var(--text-dim)';
      markBtn.textContent = checked ? '✓ MARKED COMPLETE — CLICK TO UNDO' : '☐ MARK AS COMPLETE';
    }
  }

  // Save to Firebase
  const today = getWorkoutDate();
  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('wkchecks').doc(today).set({
        checks: workoutChecks,
        actuals: exerciseActuals,
        dayId,
        updated: new Date().toISOString()
      });
  } catch(e) { console.error('Check save failed:', e); }
}

async function saveSetData(itemId, dayId, setIndex) {
  const repsEl   = document.getElementById(`set-reps-${itemId}-${setIndex}`);
  const weightEl = document.getElementById(`set-wt-${itemId}-${setIndex}`);
  const reps   = repsEl?.value   || '';
  const weight = weightEl?.value || '';

  if (!exerciseActuals[itemId]) exerciseActuals[itemId] = { sets: [] };
  if (!exerciseActuals[itemId].sets[setIndex]) exerciseActuals[itemId].sets[setIndex] = {};
  exerciseActuals[itemId].sets[setIndex].reps   = reps;
  if (weight) exerciseActuals[itemId].sets[setIndex].weight = weight;

  // Keep exerciseWeights in sync for calorie card
  if (weight) {
    exerciseWeights[itemId] = parseFloat(weight) || 0;
    // Sync the summary weight inputs if present
    const lbsEl = document.getElementById(`wt-lbs-${itemId}`);
    const kgEl  = document.getElementById(`wt-kg-${itemId}`);
    if (lbsEl) lbsEl.value = weight;
    if (kgEl)  kgEl.value  = (parseFloat(weight)*0.453592).toFixed(1);
  }

  // Update calorie display immediately
  updateItemCalBadge(itemId);

  // Debounced save to Firebase
  clearTimeout(window._setDataSaveTimer);
  window._setDataSaveTimer = setTimeout(async () => {
    const today = getWorkoutDate();
    try {
      await db.collection('userdata').doc(SESSION.username)
        .collection('wkchecks').doc(today).set({
          checks: workoutChecks,
          actuals: exerciseActuals,
          dayId,
          updated: new Date().toISOString()
        }, { merge: true });
    } catch(e) { console.error('Set save failed:', e); }
  }, 800);
}

async function toggleSetDone(itemId, dayId, setIndex) {
  if (!exerciseActuals[itemId]) exerciseActuals[itemId] = { sets: [] };
  if (!exerciseActuals[itemId].sets[setIndex]) exerciseActuals[itemId].sets[setIndex] = {};

  // Capture current reps/weight from DOM before saving
  const repsEl   = document.getElementById(`set-reps-${itemId}-${setIndex}`);
  const weightEl = document.getElementById(`set-wt-${itemId}-${setIndex}`);
  if (repsEl?.value)   exerciseActuals[itemId].sets[setIndex].reps   = repsEl.value;
  if (weightEl?.value) exerciseActuals[itemId].sets[setIndex].weight = weightEl.value;

  const nowDone = !exerciseActuals[itemId].sets[setIndex].done;
  exerciseActuals[itemId].sets[setIndex].done = nowDone;

  // Update the ✓ checkbox cell in-place (no full re-render)
  const setDoneEl = document.querySelector(`[onclick*="toggleSetDone('${itemId}','${dayId}',${setIndex})"]`);
  if (setDoneEl) {
    setDoneEl.style.border    = `2px solid ${nowDone ? '#4caf50' : 'var(--border2)'}`;
    setDoneEl.style.background = nowDone ? '#4caf5022' : 'transparent';
    setDoneEl.innerHTML       = nowDone ? '<span style="color:#4caf50;font-size:0.85rem;">✓</span>' : '';
    // Dim the row slightly
    const row = setDoneEl.closest('tr');
    if (row) row.style.opacity = nowDone ? '0.65' : '1';
  }

  // Count how many sets are now done
  const setsDone = exerciseActuals[itemId].sets.filter(s => s?.done).length;

  // Only auto-check + collapse when ALL sets are done
  const item = findExerciseById(itemId);
  let numSets = item?.sets ? 3 : 1; // warmup/cooldown = 1 "set"
  if (item?.sets) {
    const s = item.sets.toLowerCase();
    if (s.startsWith('5×5') || s.startsWith('5x5')) numSets = 5;
    else if (s.startsWith('4×') || s.startsWith('4x')) numSets = 4;
    else if (s.startsWith('3×') || s.startsWith('3x')) numSets = 3;
  }

  const allDone = setsDone >= numSets;
  if (allDone) {
    workoutChecks[itemId] = true;
    // Now collapse the block since all sets are done
    const block = document.getElementById(`exblock-${itemId}`);
    if (block) {
      block.style.opacity    = '0.55';
      block.style.borderLeft = '3px solid #4caf50';
      const body = block.querySelector('.ex-body');
      if (body) body.style.display = 'none';
      const nameEl = block.querySelector('.ex-name');
      if (nameEl) { nameEl.style.textDecoration = 'line-through'; nameEl.style.color = 'var(--text-dim)'; }
    }
  }

  // Update calorie badge
  updateItemCalBadge(itemId);

  // Save to Firebase
  const today = getWorkoutDate();
  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('wkchecks').doc(today).set({
        checks: workoutChecks,
        actuals: exerciseActuals,
        dayId,
        updated: new Date().toISOString()
      });
  } catch(e) { console.error('Set done save failed:', e); }

  // Update section progress counter without full re-render
  updateSectionProgress(dayId);
}

async function markWorkoutComplete(dayId) {
  const today = getWorkoutDate();
  const W = getActiveWorkouts();
  const w = W[dayId];

  // Check all items
  [...(w.prevDayStretch||[]), ...(w.preStretch||[]), ...(w.warmup||[]), ...(w.exercises||[]), ...(w.pump||[]), ...(w.cooldown||[])].forEach(item => {
    workoutChecks[item.id] = true;
  });

  // Save to Firebase wkchecks
  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('wkchecks').doc(today).set({
        checks: workoutChecks,
        actuals: exerciseActuals,
        dayId,
        updated: new Date().toISOString()
      });
  } catch(e) {}

  // Build rich exercise summary — warmup, core, pump, cooldown all included
  const weightLbs = SESSION.weight || 0;
  const allItems = [...(w.prevDayStretch||[]), ...(w.preStretch||[]), ...(w.warmup||[]), ...(w.exercises||[]), ...(w.pump||[]), ...(w.cooldown||[])];
  let totalCalsBurned = 0;

  const exerciseLines = allItems.map(item => {
    const actual  = exerciseActuals[item.id] || {};
    const sets    = (actual.sets || []).filter(s => s?.reps);
    const calsBurned = calcActualCalories(item, actual) || 0;
    totalCalsBurned += calsBurned;

    // Determine if bodyweight was used as the load
    const bwPct = BODYWEIGHT_PCT[item.name?.toUpperCase()];
    const usedExtWeight = sets.some(s => s?.weight);
    const bwNote = (!usedExtWeight && bwPct && bwPct > 0)
      ? ` [BW ${Math.round(bwPct*100)}% = ~${Math.round(weightLbs*bwPct)} lbs]`
      : '';

    // Build set detail string
    let setDetail = '';
    if (sets.length) {
      setDetail = ' — ' + sets.map((s, i) => {
        let line = `Set ${i+1}: ${s.reps} reps`;
        if (s.weight) line += ` @ ${s.weight} lbs`;
        return line;
      }).join(' | ');
    } else if (actual.detail) {
      setDetail = ' — ' + actual.detail;
    }

    const calNote = calsBurned > 0 ? ` (~${calsBurned} kcal)` : '';
    return `${item.name}${bwNote}${setDetail}${calNote}`;
  });

  // Section headers — slice in order: prevDayStretch, preStretch, warmup, exercises, pump, cooldown
  const prevStretchCount = (w.prevDayStretch||[]).length;
  const preStretchCount  = (w.preStretch||[]).length;
  const warmupCount      = (w.warmup||[]).length;
  const coreCount        = (w.exercises||[]).length;
  const pumpCount        = (w.pump||[]).length;

  let offset = 0;
  const prevStretchLines = exerciseLines.slice(offset, offset += prevStretchCount);
  const preStretchLines  = exerciseLines.slice(offset, offset += preStretchCount);
  const warmupLines      = exerciseLines.slice(offset, offset += warmupCount);
  const coreLines        = exerciseLines.slice(offset, offset += coreCount);
  const pumpLines        = exerciseLines.slice(offset, offset += pumpCount);
  const cooldownLines    = exerciseLines.slice(offset);

  const exerciseSummary = [
    prevStretchLines.length ? '── PREVIOUS WORKOUT STRETCHES ──' : null,
    ...prevStretchLines,
    preStretchLines.length  ? '── WARM-UP ──' : null,
    ...preStretchLines,
    warmupLines.length      ? '── MUSCLE ACTIVATION ──' : null,
    ...warmupLines,
    '── CORE WORKOUT ──',
    ...coreLines,
    pumpLines.length        ? '── PUMP WORKOUT ──' : null,
    ...pumpLines,
    cooldownLines.length    ? '── STRETCHING TODAY\'S MUSCLES ──' : null,
    ...cooldownLines,
    '',
    `TOTAL CALORIES BURNED: ~${totalCalsBurned} kcal`,
    weightLbs ? `Body weight used: ${weightLbs} lbs` : '',
  ].filter(Boolean).join('\n');

  // Estimate total duration from set counts
  const totalSets = allItems.reduce((sum, item) => {
    const s = (item.sets||'').toLowerCase();
    if (s.startsWith('5×') || s.startsWith('5x')) return sum + 5;
    if (s.startsWith('4×') || s.startsWith('4x')) return sum + 4;
    return sum + 3;
  }, 0);
  const estMinutes = Math.round(totalSets * 2.5 + (w.warmup||[]).length * 3 + (w.pump||[]).length * 4 + (w.cooldown||[]).length * 2);

  // Upsert workout log entry
  const entry = {
    saved: new Date().toISOString(),
    date: getWorkoutDate(),
    day: dayId.toUpperCase() + ' — ' + w.title,
    location: 'Home',
    duration: String(estMinutes),
    energy: '8',
    decomp: 'YES — FULL',
    caloriesBurned: String(totalCalsBurned),
    exercises: exerciseSummary,
    notes: `Session completed via checklist. Est. ${totalCalsBurned} kcal burned.`
  };

  const existing = await encryptedLoad('workout');
  const idx = existing.findIndex(e => e.date === today);
  idx >= 0 ? existing[idx] = entry : existing.unshift(entry);
  await encryptedSave('workout', existing);

  loadStats();
  showWorkoutDay(dayId);
  toast('✓ SESSION COMPLETE — SAVED');
}

function toggleEx(bodyEl, itemId) {
  if (bodyEl) bodyEl.classList.toggle('open');
}

function loadYT(ph, exerciseName) {
  const query = encodeURIComponent(exerciseName + ' exercise tutorial how to');
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
  const wrap = ph.parentElement; // .yt-wrap

  const knownIds = {
    'BENCH PRESS':'vcBig73ojpE','OVERHEAD PRESS':'2yjwXTZbrDM',
    'INCLINE DB PRESS':'8iPEnn-ltC8','LATERAL RAISES':'3VcKaXpzqRo',
    'PUSH-UP BURNOUT':'IODxDxX7oi4','PUSH-UP VARIATIONS':'IODxDxX7oi4',
    'GOBLET SQUAT':'MxsFDhcyFyE','ROMANIAN DEADLIFT':'JCXUYuzwNrM',
    'BULGARIAN SPLIT SQUAT':'2C-uNgbwi_k','HIP THRUST':'wPM8icPu6H8',
    'GLUTE BRIDGE':'wPM8icPu6H8','SQUAT BURNOUT':'aclHkVaku9U',
    'SUMO SQUAT':'MxsFDhcyFyE','DONKEY KICK':'SJ1iYTLBgpI',
    'DB ROW (SINGLE ARM)':'roCP442LA5g','BENT-OVER ROW':'FWJR5Ve8bnQ',
    'BICEP CURL':'ykJmrZ5v0Oo','HAMMER CURL':'0xyZbNqL_U0',
    'REAR DELT RAISE':'Rep-GkxHMKU','ROW BURNOUT':'FWJR5Ve8bnQ',
    'PLANK VARIATIONS':'pSHjTRCQxIw','DEAD BUG':'4XLEnwUr1d8',
    'BICYCLE CRUNCH':'Iwyvozckjak','MOUNTAIN CLIMBERS':'nmwgirgXLYM',
    'BURPEE FINISHER':'dZgVxmf6jkA','FLOOR PRESS':'uUGDRwge4F8',
    'ARCHER PUSH-UP':'44DbxOftzgw','RENEGADE ROW':'Lge5ZPpGQu4',
    'TRICEP DIPS':'0326dy_-CzM','REVERSE LUNGE':'xrjMX9RLuHs',
    'WALL SIT':'y-wV4Venusw','LEG RAISES':'JB2oyawG9KI',
    'SINGLE-LEG DEADLIFT':'JCXUYuzwNrM','WALKING LUNGE':'D7KaRcUTQeE',
    'TRICEP OVERHEAD EXT.':'_gsUck-7f74','HANGING LEG RAISE':'JB2oyawG9KI',
    'SIDE PLANK HIP DIP':'Bk_VYqG83CQ','RUSSIAN TWIST':'JyUqwkVpsi8',
    'GLUTE KICKBACK':'SJ1iYTLBgpI','LATERAL BAND WALK':'a5G4RJfVi2U',
  };

  const videoId = knownIds[exerciseName.toUpperCase()];

  if (videoId) {
    // Keep .yt-wrap as-is (it provides the 56.25% height trick)
    // Replace only the yt-ph div with the iframe
    wrap.style.paddingBottom = '56.25%';
    wrap.style.height = '0';
    wrap.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
        allow="autoplay;encrypted-media" allowfullscreen
        style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;">
      </iframe>
      <a href="${searchUrl}" target="_blank" rel="noopener"
        style="position:absolute;bottom:6px;right:8px;z-index:10;
        font-family:monospace;font-size:0.55rem;color:rgba(255,255,255,0.75);
        background:rgba(0,0,0,0.6);padding:2px 7px;text-decoration:none;border-radius:2px;">
        ↗ more videos
      </a>`;
  } else {
    // No known ID — search button
    wrap.style.paddingBottom = '0';
    wrap.style.height = 'auto';
    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:28px 16px;background:var(--bg2);text-align:center;gap:10px;">
        <div style="font-size:1.5rem;">▶</div>
        <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);letter-spacing:.1em;">${exerciseName}</div>
        <a href="${searchUrl}" target="_blank" rel="noopener"
          style="font-family:var(--font-mono);font-size:0.65rem;padding:8px 20px;
          background:var(--accent);color:var(--bg);text-decoration:none;letter-spacing:.1em;">
          WATCH ON YOUTUBE ↗
        </a>
      </div>`;
  }
}

function ytFallback(name, url) { return ''; } // kept for compat

// Make core functions global
window.loadWorkouts = loadWorkouts;
window.showWorkoutDay = showWorkoutDay;
window.onWorkoutDateChange = onWorkoutDateChange;
window.setWorkoutDate = setWorkoutDate;