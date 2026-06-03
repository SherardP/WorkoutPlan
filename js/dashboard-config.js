// ═══════════════════════════════════════════════════════════
// DASHBOARD CONFIG
// ═══════════════════════════════════════════════════════════

var DASH_CONFIG_DEFAULTS = {
  visibleCards: [
    'card-calories-burned','card-calories-eaten','card-net-balance',
    'card-workout','card-steps','card-protein','card-water',
    'card-bmi','card-streak','card-consistency','card-steps-7d',
    'card-weight-delta','card-waist-delta','card-sleep','card-stress'
  ],
  measurements: ['weight','waist','chest','hips','thighs','sleep','stress'],
  customMeasurements: [],
  // chartOrder: array of chartIds in display order. All registry charts are always present.
  // Checked = visible. Drag to reorder. Any chart not in this list gets appended at end.
  chartOrder: [
    { id:'chart-heatmap',  on:true  },
    { id:'chart-steps',    on:true  },
    { id:'chart-weight',   on:true  },
    { id:'chart-waist',    on:true  },
    { id:'chart-arm',      on:false },
    { id:'chart-forearm',  on:false },
    { id:'chart-chest',    on:true  },
    { id:'chart-hips',     on:true  },
    { id:'chart-glutes',   on:false },
    { id:'chart-thighs',   on:true  },
    { id:'chart-calves',   on:false },
    { id:'chart-neck',     on:false },
    { id:'chart-sleep',    on:true  },
    { id:'chart-workouts', on:true  }
  ]
};

// ── Chart registry — one entry per chart ─────────────────
// bilateral:true = plots _r and _l as separate lines alongside the combined key
var CHART_REGISTRY = [
  { id:'chart-heatmap',  label:'Workout Heatmap',      icon:'📅', desc:'30-day consistency grid. Shows which days you trained.',       keys:[] },
  { id:'chart-steps',    label:'Daily Steps',           icon:'👣', desc:'Bar chart of daily steps vs your goal over last 30 days.',    keys:['steps'] },
  { id:'chart-weight',   label:'Weight',                icon:'⚖️', desc:'Body weight trend over time.',                               keys:['weight'] },
  { id:'chart-waist',    label:'Waist',                 icon:'📏', desc:'Waist circumference trend. Primary fat loss indicator.',      keys:['waist'] },
  { id:'chart-arm',      label:'Arm Size (Upper)',      icon:'💪', desc:'Full upper arm circumference (flexed). Right & left lines when logged separately. This is what tailors call arm size — bicep + tricep in one measurement.', keys:['arm','arm_r','arm_l'], bilateral:true },
  { id:'chart-forearm',  label:'Forearm',               icon:'💪', desc:'Forearm circumference. Right & left lines when logged separately.', keys:['forearm','forearm_r','forearm_l'], bilateral:true },
  { id:'chart-chest',    label:'Chest',                 icon:'📐', desc:'Chest circumference at fullest point.',                      keys:['chest'] },
  { id:'chart-hips',     label:'Hips',                  icon:'📐', desc:'Hip circumference at fullest point.',                        keys:['hips'] },
  { id:'chart-glutes',   label:'Glutes',                icon:'📐', desc:'Glutes circumference at fullest point.',                     keys:['glutes'] },
  { id:'chart-thighs',   label:'Thighs',                icon:'🦵', desc:'Thigh circumference. Right & left lines when logged separately.', keys:['thighs','thigh_r','thigh_l'], bilateral:true },
  { id:'chart-calves',   label:'Calves',                icon:'🦵', desc:'Calf circumference. Right & left lines when logged separately.', keys:['calves','calf_r','calf_l'], bilateral:true },
  { id:'chart-neck',     label:'Neck',                  icon:'📐', desc:'Neck circumference trend.',                                  keys:['neck'] },
  { id:'chart-sleep',    label:'Sleep & Stress',        icon:'😴', desc:'Sleep hours and stress score on dual axes over 14 days.',    keys:['sleep','stress'] },
  { id:'chart-workouts', label:'Recent Workouts',       icon:'📋', desc:'Last 7 workout sessions — day, duration, energy.',          keys:[] },
];

// ── KPI card registry ─────────────────────────────────────
var DASH_CARD_REGISTRY = [
  { id:'card-calories-burned', group:'Daily Performance', icon:'🔥', label:'Calories Burned',    desc:'Estimated kcal burned from workout + steps' },
  { id:'card-calories-eaten',  group:'Daily Performance', icon:'🍽', label:'Calories Eaten',      desc:'Logged nutrition calories' },
  { id:'card-net-balance',     group:'Daily Performance', icon:'⚖️', label:'Calorie Balance',     desc:'Deficit or surplus for the day' },
  { id:'card-workout',         group:'Daily Performance', icon:'💪', label:'Workout Logged',       desc:'Today\'s workout session summary' },
  { id:'card-steps',           group:'Daily Performance', icon:'👣', label:'Steps Today',          desc:'Today\'s step count vs goal' },
  { id:'card-protein',         group:'Daily Performance', icon:'🥩', label:'Protein',              desc:'Grams of protein logged today' },
  { id:'card-water',           group:'Daily Performance', icon:'💧', label:'Water Intake',         desc:'Ounces of water logged today' },
  { id:'card-bmi',             group:'Body Metrics',      icon:'⚖️', label:'BMI',                 desc:'Body mass index from profile height/weight' },
  { id:'card-weight-delta',    group:'Body Metrics',      icon:'📉', label:'Weight Change',        desc:'Weight change since first log entry' },
  { id:'card-waist-delta',     group:'Body Metrics',      icon:'📏', label:'Waist Change',         desc:'Waist change since first log entry' },
  { id:'card-chest-delta',     group:'Body Metrics',      icon:'📐', label:'Chest Change',         desc:'Chest change since first log entry' },
  { id:'card-hips-delta',      group:'Body Metrics',      icon:'📐', label:'Hips Change',          desc:'Hips change since first log entry' },
  { id:'card-glutes-delta',    group:'Body Metrics',      icon:'📐', label:'Glutes Change',        desc:'Glutes change since first log entry' },
  { id:'card-thighs-delta',    group:'Body Metrics',      icon:'🦵', label:'Thighs Change',        desc:'Thigh change since first log entry' },
  { id:'card-calves-delta',    group:'Body Metrics',      icon:'🦵', label:'Calves Change',        desc:'Calf change since first log entry' },
  { id:'card-arm-delta',       group:'Body Metrics',      icon:'💪', label:'Arm Size Change',      desc:'Arm circumference change since first log entry' },
  { id:'card-forearm-delta',   group:'Body Metrics',      icon:'💪', label:'Forearm Change',       desc:'Forearm change since first log entry' },
  { id:'card-neck-delta',      group:'Body Metrics',      icon:'📐', label:'Neck Change',          desc:'Neck change since first log entry' },
  { id:'card-sleep',           group:'Recovery',          icon:'😴', label:'Avg Sleep',            desc:'14-day average sleep hours' },
  { id:'card-stress',          group:'Recovery',          icon:'🧠', label:'Avg Stress',           desc:'14-day average stress score' },
  { id:'card-streak',          group:'Performance',       icon:'🔥', label:'Workout Streak',       desc:'Consecutive training days' },
  { id:'card-consistency',     group:'Performance',       icon:'✓',  label:'Consistency %',        desc:'Sessions completed vs frequency goal' },
  { id:'card-steps-7d',        group:'Performance',       icon:'📊', label:'7-Day Avg Steps',      desc:'Average daily steps over last 7 days' },
  { id:'card-step-rate',       group:'Performance',       icon:'🎯', label:'Step Goal Hit Rate',   desc:'% of days you hit your step goal' },
];

// ── Measurement registry — tailor-style circumferences ────
var MEASUREMENT_REGISTRY = [
  { id:'weight',    group:'Weight',  icon:'⚖️', label:'Body Weight',          unit:'lbs', defaultOn:true,
    tip:'Same time each morning, before eating or drinking' },
  { id:'chest',     group:'Torso',   icon:'📐', label:'Chest',                unit:'in',  defaultOn:true,
    tip:'Fullest part of chest, arms relaxed at sides, normal breath' },
  { id:'waist',     group:'Torso',   icon:'📏', label:'Waist',                unit:'in',  defaultOn:true,
    tip:'Narrowest point of torso, usually 1 inch above navel, exhale naturally' },
  { id:'hips',      group:'Torso',   icon:'📐', label:'Hips',                 unit:'in',  defaultOn:true,
    tip:'Fullest part of hips and seat, feet together' },
  { id:'glutes',    group:'Torso',   icon:'📐', label:'Glutes',               unit:'in',  defaultOn:false,
    tip:'Fullest part of the buttocks' },
  { id:'neck',      group:'Torso',   icon:'📐', label:'Neck',                 unit:'in',  defaultOn:false,
    tip:'Narrowest point of neck, just below the Adam\'s apple' },
  { id:'arm',       group:'Arms',    icon:'💪', label:'Arm (both, flexed)',   unit:'in',  defaultOn:false,
    tip:'Flex bicep, tape around fullest point of upper arm. This IS your arm size — bicep + tricep together. How shirt sleeves are sized.' },
  { id:'arm_r',     group:'Arms',    icon:'💪', label:'Arm Right (flexed)',   unit:'in',  defaultOn:false,
    tip:'Right arm flexed, tape around fullest point of upper arm' },
  { id:'arm_l',     group:'Arms',    icon:'💪', label:'Arm Left (flexed)',    unit:'in',  defaultOn:false,
    tip:'Left arm flexed, tape around fullest point of upper arm' },
  { id:'forearm',   group:'Arms',    icon:'💪', label:'Forearm (both)',       unit:'in',  defaultOn:false,
    tip:'Fullest part of forearm, fist clenched' },
  { id:'forearm_r', group:'Arms',    icon:'💪', label:'Forearm Right',        unit:'in',  defaultOn:false },
  { id:'forearm_l', group:'Arms',    icon:'💪', label:'Forearm Left',         unit:'in',  defaultOn:false },
  { id:'wrist',     group:'Arms',    icon:'📐', label:'Wrist',                unit:'in',  defaultOn:false,
    tip:'Narrowest point of wrist' },
  { id:'thighs',    group:'Legs',    icon:'🦵', label:'Thigh (both)',         unit:'in',  defaultOn:true,
    tip:'Fullest part of upper thigh, standing relaxed, feet slightly apart' },
  { id:'thigh_r',   group:'Legs',    icon:'🦵', label:'Thigh Right',          unit:'in',  defaultOn:false },
  { id:'thigh_l',   group:'Legs',    icon:'🦵', label:'Thigh Left',           unit:'in',  defaultOn:false },
  { id:'calves',    group:'Legs',    icon:'🦵', label:'Calf (both)',          unit:'in',  defaultOn:false,
    tip:'Fullest part of calf, standing with weight evenly distributed' },
  { id:'calf_r',    group:'Legs',    icon:'🦵', label:'Calf Right',           unit:'in',  defaultOn:false },
  { id:'calf_l',    group:'Legs',    icon:'🦵', label:'Calf Left',            unit:'in',  defaultOn:false },
  { id:'sleep',     group:'Wellness',icon:'😴', label:'Sleep',                unit:'hrs', defaultOn:true  },
  { id:'stress',    group:'Wellness',icon:'🧠', label:'Stress',               unit:'/10', defaultOn:true  },
  { id:'energy',    group:'Wellness',icon:'⚡', label:'Energy Level',         unit:'/10', defaultOn:false },
  { id:'mood',      group:'Wellness',icon:'🧘', label:'Mood',                 unit:'/10', defaultOn:false },
  { id:'soreness',  group:'Wellness',icon:'💢', label:'Soreness',             unit:'/10', defaultOn:false },
  { id:'hrv',       group:'Wellness',icon:'❤️', label:'HRV',                  unit:'ms',  defaultOn:false },
  { id:'rhr',       group:'Wellness',icon:'❤️', label:'Resting Heart Rate',   unit:'bpm', defaultOn:false },
];

// ── In-memory config ──────────────────────────────────────
var dashConfig = null;

// ── Helpers to normalise chartOrder ──────────────────────
// chartOrder is stored as [{id,on},...]. This fn ensures every registry
// chart is present, adding new ones at the end (on:false by default).
function normaliseChartOrder(order) {
  order = order || [];
  CHART_REGISTRY.forEach(function(c) {
    var existing = order.find(function(o){ return o.id === c.id; });
    if (!existing) order.push({ id: c.id, on: false });
  });
  // Remove any ids no longer in registry
  return order.filter(function(o){
    return CHART_REGISTRY.some(function(c){ return c.id === o.id; });
  });
}

// ── Firebase load/save ────────────────────────────────────
async function loadDashConfig() {
  if (!SESSION) { dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS)); return dashConfig; }
  try {
    var doc = await db.collection('userdata').doc(SESSION.username)
      .collection('dashconfig').doc('settings').get();
    if (doc.exists) {
      dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS, doc.data());
    } else {
      dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
    }
  } catch(e) {
    console.warn('loadDashConfig error:', e);
    dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
  }
  // Always normalise chartOrder — handles old saves and new charts
  dashConfig.chartOrder = normaliseChartOrder(dashConfig.chartOrder);
  return dashConfig;
}

async function saveDashConfig(cfg) {
  cfg.chartOrder = normaliseChartOrder(cfg.chartOrder);
  dashConfig = cfg;
  if (!SESSION) return;
  await db.collection('userdata').doc(SESSION.username)
    .collection('dashconfig').doc('settings').set(cfg);
}

async function getDashConfig() {
  if (!dashConfig) await loadDashConfig();
  return dashConfig || JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
}

function isDashCardVisible(cardId) {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  return (cfg.visibleCards || []).indexOf(cardId) >= 0;
}

// Returns chartOrder array [{id,on},...] in user's drag order
function getChartOrder() {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  return normaliseChartOrder(cfg.chartOrder ? cfg.chartOrder.slice() : null);
}

function isMeasurementEnabled(measurementId) {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  var all = (cfg.measurements || []).concat(
    (cfg.customMeasurements || []).map(function(c){ return c.id; })
  );
  return all.indexOf(measurementId) >= 0;
}

function getEnabledMeasurements() {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  var enabledIds = cfg.measurements || [];
  var builtin = MEASUREMENT_REGISTRY.filter(function(m){ return enabledIds.indexOf(m.id) >= 0; });
  var custom = (cfg.customMeasurements || []).map(function(c){
    return Object.assign({}, c, { group:'Custom', icon:'📐', defaultOn:true, _isCustom:true });
  });
  return builtin.concat(custom);
}

// ═══════════════════════════════════════════════════════════
// CONFIGURATOR MODAL
// ═══════════════════════════════════════════════════════════
function openDashConfigurator() {
  var fn = function() {
    var modal = document.getElementById('dash-config-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dash-config-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9000;overflow-y:auto;padding:20px;box-sizing:border-box;';
      document.body.appendChild(modal);
    }
    modal.style.display = 'block';
    renderDashConfigModal(modal);
  };
  if (!dashConfig) { loadDashConfig().then(fn); } else { fn(); }
}

function closeDashConfigurator() {
  var modal = document.getElementById('dash-config-modal');
  if (modal) modal.style.display = 'none';
}

function renderDashConfigModal(modal) {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  var visibleCards  = cfg.visibleCards || [];
  var measurements  = cfg.measurements || [];
  var customMeasure = cfg.customMeasurements || [];
  var chartOrder    = normaliseChartOrder(cfg.chartOrder ? cfg.chartOrder.slice() : null);

  // Group KPI cards
  var cardGroups = {};
  DASH_CARD_REGISTRY.forEach(function(c) {
    if (!cardGroups[c.group]) cardGroups[c.group] = [];
    cardGroups[c.group].push(c);
  });

  // Group measurements
  var measureGroups = {};
  MEASUREMENT_REGISTRY.forEach(function(m) {
    if (!measureGroups[m.group]) measureGroups[m.group] = [];
    measureGroups[m.group].push(m);
  });

  // ── KPI CARDS TAB ─────────────────────────────────────
  var cardTabHTML = '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:14px;line-height:1.6;">Toggle which metric cards appear in your dashboard snapshots.</div>';
  cardTabHTML += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">'
    + '<button onclick="dcSelectAllCards(true)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">SELECT ALL</button>'
    + '<button onclick="dcSelectAllCards(false)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">DESELECT ALL</button>'
    + '</div>';
  Object.keys(cardGroups).forEach(function(group) {
    cardTabHTML += '<div style="margin-bottom:16px;">'
      + '<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;padding:5px 10px;background:var(--bg3);border-left:3px solid var(--accent2);margin-bottom:8px;">' + group.toUpperCase() + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;">';
    cardGroups[group].forEach(function(c) {
      var on = visibleCards.indexOf(c.id) >= 0;
      cardTabHTML += '<label id="dcc-label-' + c.id + '" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:' + (on?'var(--accent-dim)':'var(--bg3)') + ';border:1px solid ' + (on?'var(--accent2)':'var(--border)') + ';cursor:pointer;">'
        + '<input type="checkbox"' + (on?' checked':'') + ' onchange="dcToggleCard(\'' + c.id + '\',this.checked)" style="accent-color:var(--accent);width:14px;height:14px;flex-shrink:0;">'
        + '<span style="font-size:0.9rem;flex-shrink:0;">' + c.icon + '</span>'
        + '<div><div style="font-family:var(--font-mono);font-size:0.62rem;color:' + (on?'var(--accent2)':'var(--text)') + ';letter-spacing:.06em;">' + c.label + '</div>'
        + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);line-height:1.3;">' + c.desc + '</div></div></label>';
    });
    cardTabHTML += '</div></div>';
  });

  // ── CHARTS TAB — drag to reorder ─────────────────────
  var chartTabHTML = '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:6px;line-height:1.6;">'
    + 'Drag <span style="color:var(--accent2);">&#8942;&#8942;</span> to reorder charts on your dashboard. Check to show, uncheck to hide. Charts without enough data show a placeholder.</div>'
    + '<div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--border2);margin-bottom:14px;padding:6px 10px;background:var(--bg3);">'
    + 'Always shown (not configurable): Motivator &nbsp;&#183;&nbsp; Today Snapshot &nbsp;&#183;&nbsp; Previous Day Review</div>';
  chartTabHTML += '<div id="dc-chart-order-list" style="display:flex;flex-direction:column;gap:5px;">';
  chartOrder.forEach(function(item) {
    var def = CHART_REGISTRY.find(function(c){ return c.id === item.id; });
    if (!def) return;
    chartTabHTML += buildChartRow(def, item.on);
  });
  chartTabHTML += '</div>';

  // ── LOG FIELDS TAB ────────────────────────────────────
  var measureTabHTML = '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:10px;line-height:1.6;">'
    + 'Choose which fields appear in your body log. Use tailor-style soft tape for all circumference measurements.</div>';
  measureTabHTML += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">'
    + '<button onclick="dcSelectAllMeasures(true)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">SELECT ALL</button>'
    + '<button onclick="dcSelectAllMeasures(false)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">DEFAULTS ONLY</button>'
    + '</div>';
  Object.keys(measureGroups).forEach(function(group) {
    measureTabHTML += '<div style="margin-bottom:14px;">'
      + '<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;padding:5px 10px;background:var(--bg3);border-left:3px solid var(--accent2);margin-bottom:8px;">' + group.toUpperCase() + '</div>';
    measureGroups[group].forEach(function(m) {
      var on = measurements.indexOf(m.id) >= 0;
      measureTabHTML += '<label id="dcm-label-' + m.id + '" style="display:flex;align-items:flex-start;gap:10px;padding:9px 12px;background:' + (on?'var(--accent-dim)':'var(--bg3)') + ';border:1px solid ' + (on?'var(--accent2)':'var(--border)') + ';cursor:pointer;margin-bottom:4px;">'
        + '<input type="checkbox"' + (on?' checked':'') + ' onchange="dcToggleMeasure(\'' + m.id + '\',this.checked)" style="accent-color:var(--accent);width:14px;height:14px;flex-shrink:0;margin-top:2px;">'
        + '<span style="font-size:1rem;flex-shrink:0;">' + m.icon + '</span>'
        + '<div style="flex:1;">'
        + '<div style="font-family:var(--font-mono);font-size:0.65rem;color:' + (on?'var(--accent2)':'var(--text)') + ';">' + m.label + ' <span style="color:var(--text-dim);font-size:0.52rem;">(' + m.unit + ')</span></div>'
        + (m.tip ? '<div style="font-family:var(--font-mono);font-size:0.53rem;color:var(--text-dim);line-height:1.5;margin-top:2px;">' + m.tip + '</div>' : '')
        + '</div></label>';
    });
    measureTabHTML += '</div>';
  });
  // Custom measurements
  measureTabHTML += '<div style="margin-bottom:14px;">'
    + '<div style="font-family:var(--font-mono);font-size:0.6rem;color:#9c27b0;letter-spacing:.15em;padding:5px 10px;background:var(--bg3);border-left:3px solid #9c27b0;margin-bottom:8px;">CUSTOM MEASUREMENTS</div>'
    + '<div id="dc-custom-list" style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px;">';
  customMeasure.forEach(function(c,i){ measureTabHTML += renderCustomMeasureRow(c,i); });
  measureTabHTML += '</div>'
    + '<div style="background:var(--bg3);border:1px dashed var(--border2);padding:12px;">'
    + '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.1em;margin-bottom:8px;">+ ADD CUSTOM MEASUREMENT</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">'
    + '<div style="flex:2;min-width:130px;"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);margin-bottom:3px;">NAME</div>'
    + '<input type="text" id="dc-custom-name" placeholder="e.g. Ankle, Shoulder width..." style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.72rem;padding:7px 9px;outline:none;box-sizing:border-box;"></div>'
    + '<div style="flex:1;min-width:80px;"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);margin-bottom:3px;">UNIT</div>'
    + '<select id="dc-custom-unit" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.72rem;padding:7px 8px;outline:none;">'
    + '<option value="in">in</option><option value="cm">cm</option><option value="lbs">lbs</option><option value="kg">kg</option><option value="%">%</option><option value="bpm">bpm</option><option value="/10">/10</option><option value="hrs">hrs</option><option value="">none</option>'
    + '</select></div>'
    + '<button onclick="dcAddCustomMeasure()" class="btn btn-p" style="font-size:0.62rem;padding:7px 14px;white-space:nowrap;">+ ADD</button></div>'
    + '<div id="dc-custom-msg" style="font-family:var(--font-mono);font-size:0.6rem;min-height:14px;margin-top:6px;"></div>'
    + '</div></div>';

  // ── Assemble modal ─────────────────────────────────────
  var html = '<div style="max-width:700px;margin:0 auto;background:var(--bg2);border:2px solid var(--accent2);padding:28px;">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;">'
    + '<div><div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;margin-bottom:4px;">DASHBOARD SETTINGS</div>'
    + '<div style="font-family:var(--font-display);font-size:1.6rem;color:var(--text-bright);line-height:1;">CONFIGURE YOUR DASHBOARD</div></div>'
    + '<button onclick="closeDashConfigurator()" style="background:none;border:none;color:var(--text-dim);font-size:1.8rem;cursor:pointer;padding:4px;line-height:1;">&#x2715;</button>'
    + '</div>'
    + '<div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:6px;">'
    + '<button id="dctab-cards" onclick="dcSwitchTab(\'cards\')" style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:.1em;padding:9px 16px;background:none;border:none;border-bottom:3px solid var(--accent2);color:var(--accent2);cursor:pointer;">KPI CARDS</button>'
    + '<button id="dctab-charts" onclick="dcSwitchTab(\'charts\')" style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:.1em;padding:9px 16px;background:none;border:none;border-bottom:3px solid transparent;color:var(--text-dim);cursor:pointer;">CHARTS &amp; ORDER</button>'
    + '<button id="dctab-measurements" onclick="dcSwitchTab(\'measurements\')" style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:.1em;padding:9px 16px;background:none;border:none;border-bottom:3px solid transparent;color:var(--text-dim);cursor:pointer;">LOG FIELDS</button>'
    + '</div>'
    + '<div id="dcpanel-cards">' + cardTabHTML + '</div>'
    + '<div id="dcpanel-charts" style="display:none;">' + chartTabHTML + '</div>'
    + '<div id="dcpanel-measurements" style="display:none;">' + measureTabHTML + '</div>'
    + '<div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">'
    + '<button onclick="dcSave()" class="btn btn-p" style="flex:1;font-size:0.72rem;padding:12px;">&#x2713; SAVE CONFIGURATION</button>'
    + '<button onclick="closeDashConfigurator()" class="btn btn-s" style="font-size:0.68rem;padding:12px;white-space:nowrap;">CANCEL</button>'
    + '</div>'
    + '<div id="dc-save-msg" style="font-family:var(--font-mono);font-size:0.65rem;text-align:center;margin-top:8px;min-height:16px;"></div>'
    + '</div>';

  modal.innerHTML = html;
  setTimeout(function(){ initChartDragSort(); }, 50);
}

function buildChartRow(def, on) {
  return '<div class="dc-chart-row" data-chart-id="' + def.id + '" id="dcrow-' + def.id + '" '
    + 'style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:' + (on?'var(--accent-dim)':'var(--bg3)') + ';border:1px solid ' + (on?'var(--accent2)':'var(--border)') + ';user-select:none;">'
    + '<span class="dc-drag-handle" style="cursor:grab;color:var(--border2);font-size:1.1rem;flex-shrink:0;padding:0 4px;" title="Drag to reorder">&#8942;&#8942;</span>'
    + '<input type="checkbox"' + (on?' checked':'') + ' onchange="dcToggleChart(\'' + def.id + '\',this.checked)" style="accent-color:var(--accent);width:14px;height:14px;flex-shrink:0;">'
    + '<span style="font-size:1rem;flex-shrink:0;">' + def.icon + '</span>'
    + '<div style="flex:1;">'
    + '<div style="font-family:var(--font-mono);font-size:0.65rem;color:' + (on?'var(--accent2)':'var(--text)') + ';">' + def.label + '</div>'
    + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);line-height:1.4;">' + def.desc + '</div>'
    + '</div></div>';
}

// ── Drag-to-reorder ───────────────────────────────────────
function initChartDragSort() {
  var list = document.getElementById('dc-chart-order-list');
  if (!list) return;
  var dragging = null;

  list.querySelectorAll('.dc-drag-handle').forEach(function(handle) {
    handle.addEventListener('mousedown', function(e) {
      dragging = handle.closest('.dc-chart-row');
      if (dragging) { dragging.style.opacity = '0.5'; dragging.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)'; }
      e.preventDefault();
    });
    handle.addEventListener('touchstart', function(e) {
      dragging = handle.closest('.dc-chart-row');
      if (dragging) dragging.style.opacity = '0.5';
      e.preventDefault();
    }, { passive:false });
  });

  list.addEventListener('mouseover', function(e) {
    if (!dragging) return;
    var target = e.target.closest('.dc-chart-row');
    if (target && target !== dragging) _reorderRow(list, dragging, target);
  });

  list.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var target = el ? el.closest('.dc-chart-row') : null;
    if (target && target !== dragging) _reorderRow(list, dragging, target);
    e.preventDefault();
  }, { passive:false });

  var endFn = function() {
    if (!dragging) return;
    dragging.style.opacity = '';
    dragging.style.boxShadow = '';
    dragging = null;
    dcSyncChartOrder();
  };
  document.addEventListener('mouseup', endFn);
  document.addEventListener('touchend', endFn);
}

function _reorderRow(list, dragging, target) {
  var rows = Array.from(list.querySelectorAll('.dc-chart-row'));
  var di = rows.indexOf(dragging), ti = rows.indexOf(target);
  if (di < ti) list.insertBefore(dragging, target.nextSibling);
  else list.insertBefore(dragging, target);
}

// Read current DOM order + checkbox state into dashConfig.chartOrder
function dcSyncChartOrder() {
  var list = document.getElementById('dc-chart-order-list');
  if (!list || !dashConfig) return;
  var newOrder = [];
  list.querySelectorAll('.dc-chart-row').forEach(function(row) {
    var id = row.getAttribute('data-chart-id');
    var cb = row.querySelector('input[type=checkbox]');
    newOrder.push({ id: id, on: !!(cb && cb.checked) });
  });
  dashConfig.chartOrder = newOrder;
}

// ── Tab switcher ──────────────────────────────────────────
function dcSwitchTab(tab) {
  ['cards','charts','measurements'].forEach(function(t) {
    var panel = document.getElementById('dcpanel-'+t);
    var btn   = document.getElementById('dctab-'+t);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.style.borderBottomColor = t === tab ? 'var(--accent2)' : 'transparent';
      btn.style.color = t === tab ? 'var(--accent2)' : 'var(--text-dim)';
    }
  });
  if (tab === 'charts') setTimeout(initChartDragSort, 50);
}

// ── Toggle helpers ────────────────────────────────────────
function dcToggleCard(cardId, checked) {
  if (!dashConfig) dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
  var arr = dashConfig.visibleCards || []; var idx = arr.indexOf(cardId);
  if (checked && idx < 0) arr.push(cardId);
  if (!checked && idx >= 0) arr.splice(idx, 1);
  dashConfig.visibleCards = arr;
  var label = document.getElementById('dcc-label-'+cardId);
  if (label) { label.style.background = checked?'var(--accent-dim)':'var(--bg3)'; label.style.borderColor = checked?'var(--accent2)':'var(--border)'; }
}

function dcToggleChart(chartId, checked) {
  dcSyncChartOrder(); // sync DOM first
  if (!dashConfig || !dashConfig.chartOrder) return;
  var item = dashConfig.chartOrder.find(function(o){ return o.id === chartId; });
  if (item) item.on = checked;
  var row = document.getElementById('dcrow-'+chartId);
  if (row) { row.style.background = checked?'var(--accent-dim)':'var(--bg3)'; row.style.borderColor = checked?'var(--accent2)':'var(--border)'; }
}

function dcToggleMeasure(measureId, checked) {
  if (!dashConfig) dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
  var arr = dashConfig.measurements || []; var idx = arr.indexOf(measureId);
  if (checked && idx < 0) arr.push(measureId);
  if (!checked && idx >= 0) arr.splice(idx, 1);
  dashConfig.measurements = arr;
  var label = document.getElementById('dcm-label-'+measureId);
  if (label) { label.style.background = checked?'var(--accent-dim)':'var(--bg3)'; label.style.borderColor = checked?'var(--accent2)':'var(--border)'; }
}

function dcSelectAllCards(selectAll) {
  if (!dashConfig) dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
  dashConfig.visibleCards = selectAll ? DASH_CARD_REGISTRY.map(function(c){ return c.id; }) : [];
  var modal = document.getElementById('dash-config-modal'); if (modal) renderDashConfigModal(modal);
}

function dcSelectAllMeasures(selectAll) {
  if (!dashConfig) dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
  dashConfig.measurements = selectAll ? MEASUREMENT_REGISTRY.map(function(m){ return m.id; })
    : MEASUREMENT_REGISTRY.filter(function(m){ return m.defaultOn; }).map(function(m){ return m.id; });
  var modal = document.getElementById('dash-config-modal'); if (modal) renderDashConfigModal(modal);
}

function dcAddCustomMeasure() {
  var nameEl = document.getElementById('dc-custom-name');
  var unitEl = document.getElementById('dc-custom-unit');
  var msgEl  = document.getElementById('dc-custom-msg');
  var name = nameEl ? nameEl.value.trim() : '';
  var unit = unitEl ? unitEl.value : 'in';
  if (!name) { if (msgEl) msgEl.textContent='Enter a name'; return; }
  if (!dashConfig) dashConfig = JSON.parse(JSON.stringify(DASH_CONFIG_DEFAULTS));
  if (!dashConfig.customMeasurements) dashConfig.customMeasurements = [];
  var id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,30) + '_' + Date.now();
  dashConfig.customMeasurements.push({ id:id, label:name, unit:unit });
  if (nameEl) nameEl.value = '';
  if (msgEl) { msgEl.style.color='#4caf50'; msgEl.textContent='Added: '+name; setTimeout(function(){ msgEl.textContent=''; },2000); }
  var listEl = document.getElementById('dc-custom-list');
  if (listEl) listEl.innerHTML = dashConfig.customMeasurements.map(function(c,i){ return renderCustomMeasureRow(c,i); }).join('');
}

function dcRemoveCustom(idx) {
  if (!dashConfig || !dashConfig.customMeasurements) return;
  dashConfig.customMeasurements.splice(idx,1);
  var listEl = document.getElementById('dc-custom-list');
  if (listEl) listEl.innerHTML = dashConfig.customMeasurements.map(function(c,i){ return renderCustomMeasureRow(c,i); }).join('');
}

function renderCustomMeasureRow(c, i) {
  return '<div id="dc-custom-row-'+i+'" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--accent-dim);border:1px solid var(--accent2);">'
    +'<span style="font-size:0.9rem;">📐</span>'
    +'<div style="flex:1;"><div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent2);">'+c.label+'</div>'
    +'<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);">'+c.unit+'</div></div>'
    +'<button onclick="dcRemoveCustom('+i+')" style="background:none;border:1px solid var(--danger);color:var(--danger);font-family:var(--font-mono);font-size:0.58rem;padding:3px 8px;cursor:pointer;">&#x2715;</button>'
    +'</div>';
}

async function dcSave() {
  var msgEl = document.getElementById('dc-save-msg');
  if (msgEl) { msgEl.style.color='var(--accent2)'; msgEl.textContent='SAVING...'; }
  dcSyncChartOrder();
  try {
    await saveDashConfig(dashConfig);
    if (msgEl) { msgEl.style.color='#4caf50'; msgEl.textContent='SAVED'; }
    setTimeout(function(){
      closeDashConfigurator();
      if (typeof renderLogSummary === 'function') renderLogSummary();
    }, 500);
  } catch(e) {
    if (msgEl) { msgEl.style.color='var(--danger)'; msgEl.textContent='ERROR: '+e.message; }
  }
}

// ═══════════════════════════════════════════════════════════
// BODY LOG FIELDS — dynamic from config
// ═══════════════════════════════════════════════════════════
function renderBodyLogFields() {
  var container = document.getElementById('body-log-fields');
  if (!container) return;
  var enabled = getEnabledMeasurements();
  var groups = {};
  enabled.forEach(function(m) {
    var g = m.group || 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(m);
  });
  var html = '';
  Object.keys(groups).forEach(function(group) {
    html += '<div style="margin-bottom:10px;">'
      + '<div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--accent2);letter-spacing:.15em;margin-bottom:8px;padding:3px 8px;background:var(--bg3);border-left:2px solid var(--accent2);">' + group.toUpperCase() + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    groups[group].forEach(function(m) {
      var fid = 'b-'+m.id;
      var isScore=(m.unit==='/10'), isHrs=(m.unit==='hrs');
      var step=m.id==='weight'?'0.1':'0.25';
      html += '<div class="lf"><label>'+m.label.toUpperCase()+' ('+m.unit+')</label>';
      if (m.tip) html += '<div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);margin-bottom:3px;line-height:1.4;">'+m.tip+'</div>';
      html += '<input type="number" id="'+fid+'" placeholder="—" step="'+step+'"'
        +(isScore?' min="1" max="10"':isHrs?' min="0" max="14"':'')+' >'
        +'<div id="'+fid+'-prev" style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);margin-top:3px;"></div>'
        +'</div>';
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
}

function collectBodyLogValues() {
  var enabled = getEnabledMeasurements(), values = {};
  enabled.forEach(function(m) {
    var el = document.getElementById('b-'+m.id);
    if (el && el.value !== '') { var v=parseFloat(el.value); if (!isNaN(v)) values[m.id]=v; }
  });
  return values;
}

function populateBodyLogFromEntry(entry) {
  var enabled = getEnabledMeasurements();
  enabled.forEach(function(m) {
    var el=document.getElementById('b-'+m.id), prev=document.getElementById('b-'+m.id+'-prev');
    if (!el) return;
    el.value = entry[m.id]!==undefined ? entry[m.id] : '';
    if (prev) prev.textContent='';
  });
}

function prefillBodyLogFromPrev(prevEntry) {
  var enabled = getEnabledMeasurements();
  enabled.forEach(function(m) {
    var el=document.getElementById('b-'+m.id), prev=document.getElementById('b-'+m.id+'-prev');
    if (!el||prevEntry[m.id]===undefined) return;
    el.value=prevEntry[m.id]; el.style.color='var(--text-dim)';
    if (prev) prev.textContent='Last: '+prevEntry[m.id];
    el.oninput=function(){ el.style.color='var(--text)'; if(prev) prev.textContent=''; };
  });
}

// ═══════════════════════════════════════════════════════════
// KPI CARD BUILDER
// ═══════════════════════════════════════════════════════════
function buildConfiguredKpiCards(p) {
  var html = '';
  function vis(id){ return isDashCardVisible(id); }
  function card(label, value, color, sub) {
    return '<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">'
      +'<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">'+label+'</div>'
      +'<div style="font-family:var(--font-display);font-size:1.3rem;color:'+color+';line-height:1;">'+value+'</div>'
      +'<div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);margin-top:2px;">'+sub+'</div>'
      +'</div>';
  }
  function deltaCard(label, body, key, lowerIsGood) {
    var wd=(p.body||[]).filter(function(b){return b[key]!==undefined&&!isNaN(+b[key]);});
    if(wd.length<2) return '';
    var delta=+(+wd[0][key]-+wd[wd.length-1][key]).toFixed(2);
    var good=(delta<0)===lowerIsGood;
    return card(label,(delta>0?'+':'')+delta+'"',good?'#4caf50':'#ff9800','since start \u00b7 '+wd[0][key]+'" now');
  }

  if(vis('card-calories-burned')&&p.todayCalsBurned) html+=card('🔥 CALORIES BURNED',p.todayCalsBurned.toLocaleString(),'var(--accent2)',p.todayWorkout&&p.todaySteps?'workout + steps':p.todayWorkout?'workout est.':'steps only');
  if(vis('card-calories-eaten')&&p.todayCalsEaten) html+=card('🍽 CALORIES EATEN',p.todayCalsEaten.toLocaleString(),'#ff9800','nutrition logged');
  if(vis('card-net-balance')&&p.todayCalDeficit!=null) html+=card('⚖️ NET BALANCE',(p.todayCalDeficit>0?'−':'+')+Math.abs(p.todayCalDeficit).toLocaleString(),p.todayCalDeficit>0?'#4caf50':'#f44336',p.todayCalDeficit>0?'calorie deficit':'calorie surplus');
  if(vis('card-workout')) {
    if(p.todayWorkout) html+=card('✓ WORKOUT',(p.todayWorkout.day||'Session').split('—')[0].trim(),'#4caf50',(p.todayWorkout.duration||'—')+' min · E:'+(p.todayWorkout.energy||'—')+'/10');
    else html+='<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">💪 WORKOUT</div><div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">Not logged</div><div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent);cursor:pointer;" onclick="nav(\'workout\')">→ Go log it</div></div>';
  }
  if(vis('card-steps')) {
    var sg=(typeof userGoals!=='undefined'&&userGoals.stepGoal)?userGoals.stepGoal:10000;
    if(p.todaySteps){var st=+p.todaySteps.total||0,hit=st>=sg;html+=card('👣 STEPS TODAY',st.toLocaleString(),hit?'#4caf50':'var(--accent2)',hit?'✓ goal hit':'of '+sg.toLocaleString());}
    else html+='<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">👣 STEPS</div><div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">Not logged</div><div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent);cursor:pointer;" onclick="nav(\'log\');setTimeout(function(){logTab(\'steps\');},100);">→ Go log it</div></div>';
  }
  if(vis('card-protein')&&p.todayNutrition) html+=card('🥩 PROTEIN',(p.todayNutrition.protein||'—')+'g',+p.todayNutrition.protein>=150?'#4caf50':'#ff9800','carbs:'+(p.todayNutrition.carbs||'—')+'g fat:'+(p.todayNutrition.fat||'—')+'g');
  if(vis('card-water')&&p.todayNutrition&&p.todayNutrition.water) html+=card('💧 WATER',(p.todayNutrition.water||'—')+' oz',+p.todayNutrition.water>=96?'#64b5f6':'#ff9800',+p.todayNutrition.water>=96?'✓ hydrated':'goal: 96 oz');
  if(vis('card-bmi')&&p.bmi) html+=card('⚖️ BMI',p.bmi.toFixed(1),p.bmi<25?'#4caf50':p.bmi<30?'#ff9800':'#f44336',(p.bmi<25?'Normal':p.bmi<30?'Overweight':'Obese')+((typeof SESSION!=='undefined'&&SESSION.weight)?' · '+SESSION.weight+' lbs':''));
  // Weight delta (lbs, lower is good for fat loss)
  if(vis('card-weight-delta')){var wd=(p.body||[]).filter(function(b){return b.weight!==undefined&&!isNaN(+b.weight);});if(wd.length>=2){var wdelta=+(+wd[0].weight-+wd[wd.length-1].weight).toFixed(1);html+=card('WEIGHT Δ',(wdelta>0?'+':'')+wdelta+' lbs',wdelta<0?'#4caf50':wdelta>0?'#ff9800':'var(--text)','since start · '+wd[0].weight+' lbs now');}}
  // Circumference deltas — lower is good for fat-loss measurements, higher for muscle
  if(vis('card-waist-delta'))  html+=deltaCard('📏 WAIST Δ', p.body,'waist',true);
  if(vis('card-chest-delta'))  html+=deltaCard('📐 CHEST Δ', p.body,'chest',true);
  if(vis('card-hips-delta'))   html+=deltaCard('📐 HIPS Δ',  p.body,'hips', true);
  if(vis('card-glutes-delta')) html+=deltaCard('📐 GLUTES Δ',p.body,'glutes',true);
  if(vis('card-thighs-delta')) html+=deltaCard('🦵 THIGHS Δ',p.body,'thighs',true);
  if(vis('card-calves-delta')) html+=deltaCard('🦵 CALVES Δ',p.body,'calves',false);  // muscle — higher is good
  if(vis('card-arm-delta'))    html+=deltaCard('💪 ARM Δ',   p.body,'arm',  false);   // muscle — higher is good
  if(vis('card-forearm-delta'))html+=deltaCard('💪 FOREARM Δ',p.body,'forearm',false);
  if(vis('card-neck-delta'))   html+=deltaCard('📐 NECK Δ',  p.body,'neck', true);
  if(vis('card-sleep')&&p.avgSleep) html+=card('😴 AVG SLEEP',p.avgSleep+'h',+p.avgSleep>=7?'#4caf50':+p.avgSleep>=6?'#ff9800':'#f44336','14-day avg');
  if(vis('card-stress')&&p.avgStress) html+=card('🧠 AVG STRESS',p.avgStress+'/10',+p.avgStress<=4?'#4caf50':+p.avgStress<=6?'#ff9800':'#f44336','14-day avg');
  if(vis('card-streak')&&p.streak>0) html+=card('🔥 STREAK',p.streak+' '+(p.streak===1?'day':'days'),p.streak>=14?'#ffd700':p.streak>=7?'#4caf50':p.streak>=3?'#ff9800':'var(--accent2)',p.streak>=14?'Elite 🏆':p.streak>=7?'Keep going':p.streak>=3?'Building':'Day '+p.streak);
  if(vis('card-consistency')&&p.consistencyPct>0) html+=card('✓ CONSISTENCY',p.consistencyPct+'%',p.consistencyPct>=80?'#4caf50':p.consistencyPct>=60?'#ff9800':'#f44336',p.totalSessions+' sessions · '+p.weeksTraining+' wks');
  if(vis('card-steps-7d')&&p.avgSteps7d>0){var sg2=(typeof userGoals!=='undefined'&&userGoals.stepGoal)?userGoals.stepGoal:10000;html+=card('📊 7-DAY AVG',p.avgSteps7d>=1000?(p.avgSteps7d/1000).toFixed(1)+'k':p.avgSteps7d,p.avgSteps7d>=sg2?'#4caf50':'#ff9800','steps/day avg');}
  if(vis('card-step-rate')&&p.stepHitPct>0) html+=card('🎯 STEP RATE',p.stepHitPct+'%',p.stepHitPct>=70?'#4caf50':'#ff9800','goal hit days');
  return html;
}

// ═══════════════════════════════════════════════════════════
// EXPOSE GLOBALS
// ═══════════════════════════════════════════════════════════
window.loadDashConfig         = loadDashConfig;
window.saveDashConfig         = saveDashConfig;
window.getDashConfig          = getDashConfig;
window.isDashCardVisible      = isDashCardVisible;
window.getChartOrder          = getChartOrder;
window.isMeasurementEnabled   = isMeasurementEnabled;
window.getEnabledMeasurements = getEnabledMeasurements;
window.openDashConfigurator   = openDashConfigurator;
window.closeDashConfigurator  = closeDashConfigurator;
window.dcSwitchTab            = dcSwitchTab;
window.dcToggleCard           = dcToggleCard;
window.dcToggleChart          = dcToggleChart;
window.dcSelectAllCards       = dcSelectAllCards;
window.dcSelectAllMeasures    = dcSelectAllMeasures;
window.dcAddCustomMeasure     = dcAddCustomMeasure;
window.dcRemoveCustom         = dcRemoveCustom;
window.dcSave                 = dcSave;
window.renderBodyLogFields        = renderBodyLogFields;
window.collectBodyLogValues       = collectBodyLogValues;
window.populateBodyLogFromEntry   = populateBodyLogFromEntry;
window.prefillBodyLogFromPrev     = prefillBodyLogFromPrev;
window.buildConfiguredKpiCards    = buildConfiguredKpiCards;
window.dashConfig                 = dashConfig;
window.DASH_CONFIG_DEFAULTS       = DASH_CONFIG_DEFAULTS;
window.DASH_CARD_REGISTRY         = DASH_CARD_REGISTRY;
window.MEASUREMENT_REGISTRY       = MEASUREMENT_REGISTRY;
window.CHART_REGISTRY             = CHART_REGISTRY;
