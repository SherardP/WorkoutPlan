// ═══════════════════════════════════════════════════════════
// EQUIPMENT CATALOG
// ═══════════════════════════════════════════════════════════
const BARBELL_TYPES = [
  { id:'bar-standard',  label:'Standard Barbell' },
  { id:'bar-olympic',   label:'Olympic Barbell' },
  { id:'bar-ezcurl',    label:'EZ Curl Bar' },
  { id:'bar-trap',      label:'Trap / Hex Bar' },
  { id:'bar-safety',    label:'Safety Squat Bar' },
];

const BENCH_RACK_OPTIONS = [
  { id:'bench-flat',     label:'Flat Bench' },
  { id:'bench-adj',      label:'Adjustable Bench (incline/decline)' },
  { id:'rack-power',     label:'Power Rack / Squat Rack' },
  { id:'rack-half',      label:'Half Rack' },
  { id:'rack-smith',     label:'Smith Machine' },
  { id:'rack-pullup',    label:'Pull-up / Chin-up Bar (stand-alone)' },
  { id:'rack-dip',       label:'Dip Station' },
  { id:'rack-preacher',  label:'Preacher Curl Bench' },
];

const MACHINES = [
  { id:'mach-latpull',    label:'Lat Pulldown Machine',
    exercises:['Lat Pulldown (wide grip)','Lat Pulldown (narrow grip)','Straight-Arm Pulldown','Overhead Tricep Extension (cable)','Cable Face Pull','Seated Row (if low row attachment)','High Cable Bicep Curl'] },
  { id:'mach-cable',      label:'Cable / Functional Trainer',
    exercises:['Cable Fly (chest)','Cable Row','Cable Lat Pulldown','Cable Bicep Curl','Cable Tricep Pressdown','Cable Face Pull','Cable Lateral Raise','Cable Chest Press','Single-Arm Cable Row','Cable Woodchop','Cable Rear Delt Fly','Cable Squat','Cable Pull-Through'] },
  { id:'mach-chestpress', label:'Chest Press Machine',
    exercises:['Machine Chest Press','Machine Incline Press'] },
  { id:'mach-seatedrow',  label:'Seated Row Machine',
    exercises:['Seated Cable Row','Single-Arm Row (cable)'] },
  { id:'mach-legpress',   label:'Leg Press Machine',
    exercises:['Leg Press','Single-Leg Press','High-Foot Leg Press (glute focus)','Calf Press on Leg Press'] },
  { id:'mach-legext',     label:'Leg Extension Machine',
    exercises:['Leg Extension','Single-Leg Extension'] },
  { id:'mach-legcurl',    label:'Leg Curl Machine (seated or lying)',
    exercises:['Lying Leg Curl','Seated Leg Curl','Single-Leg Curl'] },
  { id:'mach-shoulderpr', label:'Shoulder Press Machine',
    exercises:['Machine Shoulder Press','Machine Arnold Press'] },
  { id:'mach-pecdeck',    label:'Pec Deck / Fly Machine',
    exercises:['Pec Deck Fly','Reverse Pec Deck (rear delts)'] },
  { id:'mach-biccurl',    label:'Bicep Curl Machine',
    exercises:['Machine Bicep Curl','Machine Hammer Curl'] },
  { id:'mach-tricext',    label:'Tricep Extension Machine',
    exercises:['Machine Tricep Extension','Machine Tricep Pressdown'] },
  { id:'mach-hipabduct',  label:'Hip Abduction / Adduction Machine',
    exercises:['Hip Abduction (outer thigh)','Hip Adduction (inner thigh)'] },
  { id:'mach-assisted',   label:'Assisted Pull-up / Dip Machine',
    exercises:['Assisted Pull-up','Assisted Chin-up','Assisted Dip'] },
  { id:'mach-calf',       label:'Calf Raise Machine (standing or seated)',
    exercises:['Standing Calf Raise','Seated Calf Raise'] },
  { id:'mach-backext',    label:'Back Extension / Hyperextension Bench',
    exercises:['Back Extension','45° Hyperextension','Reverse Hyperextension'] },
  { id:'mach-smithmach',  label:'Smith Machine',
    exercises:['Smith Machine Squat','Smith Machine Bench Press','Smith Machine Overhead Press','Smith Machine Romanian Deadlift','Smith Machine Bent-Over Row','Smith Machine Calf Raise'] },
];

const CARDIO_OPTIONS = [
  { id:'cardio-treadmill',  label:'Treadmill' },
  { id:'cardio-bike-up',    label:'Stationary Bike (upright)' },
  { id:'cardio-bike-rec',   label:'Stationary Bike (recumbent)' },
  { id:'cardio-airbike',    label:'Air Bike / Assault Bike' },
  { id:'cardio-rower',      label:'Rowing Machine' },
  { id:'cardio-elliptical', label:'Elliptical' },
  { id:'cardio-stairmill',  label:'Stair Climber / StairMill' },
  { id:'cardio-skierg',     label:'SkiErg' },
  { id:'cardio-jumprope',   label:'Jump Rope' },
  { id:'cardio-sled',       label:'Sled / Prowler' },
];

const ACCESSORY_OPTIONS = [
  { id:'acc-kb',        label:'Kettlebells' },
  { id:'acc-trx',       label:'TRX / Suspension Trainer' },
  { id:'acc-bands',     label:'Resistance Bands' },
  { id:'acc-abroll',    label:'Ab Roller' },
  { id:'acc-medball',   label:'Medicine Ball' },
  { id:'acc-plyobox',   label:'Plyometric Box' },
  { id:'acc-foam',      label:'Foam Roller' },
  { id:'acc-rings',     label:'Gymnastics Rings' },
  { id:'acc-mat',       label:'Exercise / Yoga Mat' },
  { id:'acc-pullbar',   label:'Doorframe Pull-up Bar' },
  { id:'acc-dipbar',    label:'Portable Dip Bars' },
  { id:'acc-anklestrap',label:'Ankle Straps / Cuffs' },
  { id:'acc-landmine',  label:'Landmine Attachment' },
];

const PLATE_SIZES = [2.5, 5, 10, 25, 35, 45, 55];

// ── Equipment checkbox helper ─────────────────────────────
function eqCheckHtml(id, label, checked = false) {
  const chk = checked ? 'checked' : '';
  return `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;
    font-family:var(--font-mono);font-size:0.62rem;color:var(--text);
    background:var(--bg3);border:1px solid var(--border);padding:4px 8px;
    white-space:nowrap;user-select:none;">
    <input type="checkbox" id="${id}" ${chk} style="accent-color:var(--accent);"> ${label}
  </label>`;
}

function buildEquipmentUI(eq = {}) {
  // Barbells
  document.getElementById('barbell-checks').innerHTML =
    BARBELL_TYPES.map(b => eqCheckHtml(b.id, b.label, eq[b.id])).join('');

  // Plates
  const platesChecked = eq['eq-plates'];
  document.getElementById('eq-plates').checked = platesChecked;
  document.getElementById('eq-plates-range').style.display = platesChecked ? 'block' : 'none';
  document.getElementById('plate-checks').innerHTML =
    PLATE_SIZES.map(s => eqCheckHtml('plate-'+s, s+'lb', eq['plate-'+s])).join('');
  document.getElementById('eq-plates').onchange = function() {
    document.getElementById('eq-plates-range').style.display = this.checked ? 'block' : 'none';
  };

  // Benches & Racks
  document.getElementById('bench-rack-checks').innerHTML =
    BENCH_RACK_OPTIONS.map(b => eqCheckHtml(b.id, b.label, eq[b.id])).join('');

  // Machines — each with expandable exercise list
  document.getElementById('machine-checks').innerHTML = MACHINES.map(m => {
    const chk = eq[m.id] ? 'checked' : '';
    const exList = m.exercises.map(e => `<span style="font-family:var(--font-mono);font-size:0.58rem;
      color:var(--text-dim);background:var(--bg);border:1px solid var(--border);padding:2px 6px;">${e}</span>`).join('');
    return `<div style="background:var(--bg3);border:1px solid var(--border);padding:6px 10px;">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
        <input type="checkbox" id="${m.id}" ${chk} style="accent-color:var(--accent);"
          onchange="document.getElementById('exlist-${m.id}').style.display=this.checked?'flex':'none'">
        <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text);letter-spacing:.06em;">${m.label}</span>
      </label>
      <div id="exlist-${m.id}" style="display:${eq[m.id]?'flex':'none'};flex-wrap:wrap;gap:4px;margin-top:6px;">${exList}</div>
    </div>`;
  }).join('');

  // Cardio
  document.getElementById('cardio-checks').innerHTML =
    CARDIO_OPTIONS.map(c => eqCheckHtml(c.id, c.label, eq[c.id])).join('');

  // Accessories
  eq['acc-kb'] = (eq.kettlebellWeights || []).length > 0; // Ensure kettlebell checkbox is checked if weights exist
  document.getElementById('accessory-checks').innerHTML =
    ACCESSORY_OPTIONS.map(a => eqCheckHtml(a.id, a.label, eq[a.id])).join('');

  // Dumbbell rows
  const dbRows = eq.dumbbells || [];
  document.getElementById('dumbbell-rows').innerHTML = '';
  dbRows.forEach(d => addDumbbellRow(d));
  if (dbRows.length === 0) addDumbbellRow(); // always show at least one

  // Kettlebell rows
  const kbRows = eq.kettlebellWeights || [];
  document.getElementById('kettlebell-rows').innerHTML = '';
  kbRows.forEach(k => addKettlebellRow(k));
}

function addDumbbellRow(data = {}) {
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';
  const qty = data.qty ?? 2;
  div.innerHTML = `
    <select class="db-qty" style="font-family:var(--font-mono);font-size:0.6rem;background:var(--bg);
      border:1px solid var(--border);color:var(--text);padding:4px 6px;">
      <option value="1" ${qty===1?'selected':''}>1 dumbbell</option>
      <option value="2" ${qty===2?'selected':''}>2 dumbbells (pair)</option>
    </select>
    <input type="number" placeholder="Min lbs" min="1" max="500" step="1" value="${data.minLbs||''}"
      style="width:68px;font-family:var(--font-mono);font-size:0.65rem;background:var(--bg);
      border:1px solid var(--border);color:var(--text);padding:4px 6px;" class="db-min">
    <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);">–</span>
    <input type="number" placeholder="Max lbs" min="1" max="500" step="1" value="${data.maxLbs||''}"
      style="width:68px;font-family:var(--font-mono);font-size:0.65rem;background:var(--bg);
      border:1px solid var(--border);color:var(--text);padding:4px 6px;" class="db-max">
    <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);">lbs</span>
    <select class="db-type" style="font-family:var(--font-mono);font-size:0.6rem;background:var(--bg);
      border:1px solid var(--border);color:var(--text);padding:4px 6px;">
      <option value="fixed" ${(data.type||'fixed')==='fixed'?'selected':''}>Fixed</option>
      <option value="adjustable" ${data.type==='adjustable'?'selected':''}>Adjustable</option>
    </select>
    <button type="button" onclick="this.parentElement.remove()"
      style="font-family:var(--font-mono);font-size:0.7rem;background:none;border:none;
      color:var(--danger);cursor:pointer;padding:2px 4px;">✕</button>`;
  document.getElementById('dumbbell-rows').appendChild(div);
}

function addKettlebellRow(weightLbs = null) {
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:center;';
  div.innerHTML = `
    <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);">Weight:</span>
    <input type="number" placeholder="lbs" min="4" max="300" step="1" value="${weightLbs||''}"
      style="width:80px;font-family:var(--font-mono);font-size:0.65rem;background:var(--bg);
      border:1px solid var(--border);color:var(--text);padding:4px 6px;" class="kb-weight">
    <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);">lbs</span>
    <button type="button" onclick="this.parentElement.remove()"
      style="font-family:var(--font-mono);font-size:0.7rem;background:none;border:none;
      color:var(--danger);cursor:pointer;padding:2px 4px;">✕</button>`;
  document.getElementById('kettlebell-rows').appendChild(div);
}

function collectEquipment() {
  const eq = {};
  // All checkboxes
  const allIds = [
    ...BARBELL_TYPES.map(b=>b.id),
    'eq-plates',
    ...PLATE_SIZES.map(s=>'plate-'+s),
    ...BENCH_RACK_OPTIONS.map(b=>b.id),
    ...MACHINES.map(m=>m.id),
    ...CARDIO_OPTIONS.map(c=>c.id),
    ...ACCESSORY_OPTIONS.map(a=>a.id),
  ];
  allIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) eq[id] = el.checked;
  });
  // Dumbbell pairs
  eq.dumbbells = [];
  document.querySelectorAll('#dumbbell-rows > div').forEach(row => {
    const minEl = row.querySelector('.db-min');
    const maxEl = row.querySelector('.db-max');
    const typeEl = row.querySelector('.db-type');
    const minLbs = parseFloat(minEl?.value);
    const maxLbs = parseFloat(maxEl?.value);
    const qty = parseInt(row.querySelector('.db-qty')?.value) || 2;
    if (minLbs || maxLbs) eq.dumbbells.push({ qty, minLbs: minLbs||null, maxLbs: maxLbs||null, type: typeEl?.value||'fixed' });
  });
  // Kettlebell weights
  eq.kettlebellWeights = [];
  document.querySelectorAll('#kettlebell-rows > div').forEach(row => {
    const w = parseFloat(row.querySelector('.kb-weight')?.value);
    if (w) eq.kettlebellWeights.push(w);
  });
  eq['acc-kb'] = eq.kettlebellWeights.length > 0;
  return eq;
}

// Return a human-readable summary of equipment for display
function equipmentSummary(eq) {
  if (!eq) return 'No equipment set';
  const lines = [];
  if (eq.dumbbells?.length) {
    lines.push('Dumbbells: ' + eq.dumbbells.map(d=>`${d.qty||2}× ${d.minLbs||'?'}–${d.maxLbs||'?'} lbs (${d.type})`).join(', '));
  }
  if (eq.kettlebellWeights?.length) lines.push('Kettlebells: ' + eq.kettlebellWeights.join(', ') + ' lbs');
  const bars = BARBELL_TYPES.filter(b=>eq[b.id]).map(b=>b.label);
  if (bars.length) lines.push('Bars: ' + bars.join(', '));
  const benches = BENCH_RACK_OPTIONS.filter(b=>eq[b.id]).map(b=>b.label);
  if (benches.length) lines.push('Benches/Racks: ' + benches.join(', '));
  const machs = MACHINES.filter(m=>eq[m.id]).map(m=>m.label);
  if (machs.length) lines.push('Machines: ' + machs.join(', '));
  const cardio = CARDIO_OPTIONS.filter(c=>eq[c.id]).map(c=>c.label);
  if (cardio.length) lines.push('Cardio: ' + cardio.join(', '));
  const acc = ACCESSORY_OPTIONS.filter(a=>eq[a.id]).map(a=>a.label);
  if (acc.length) lines.push('Accessories: ' + acc.join(', '));
  return lines.length ? lines.join('\n') : 'No equipment selected';
}