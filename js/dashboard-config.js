// ═══════════════════════════════════════════════════════════
// DASHBOARD CONFIG — Configurable cards + measurement fields
// ═══════════════════════════════════════════════════════════

var DASH_CONFIG_DEFAULTS = {
  visibleCards: [
    'card-calories-burned','card-calories-eaten','card-net-balance',
    'card-workout','card-steps','card-protein','card-water',
    'card-bmi','card-streak','card-consistency','card-steps-7d',
    'card-weight-delta','card-waist-delta','card-sleep','card-stress',
    'chart-heatmap','chart-steps','chart-weight','chart-waist','chart-sleep','chart-workouts'
  ],
  measurements: ['weight','waist','chest','hips','neck','glutes','thighs','sleep','stress'],
  customMeasurements: []
};

var DASH_CARD_REGISTRY = [
  { id:'card-calories-burned',  group:'Daily Performance', icon:'🔥', label:'Calories Burned',       desc:'Estimated kcal burned from workout + steps' },
  { id:'card-calories-eaten',   group:'Daily Performance', icon:'🍽', label:'Calories Eaten',         desc:'Logged nutrition calories' },
  { id:'card-net-balance',      group:'Daily Performance', icon:'⚖️', label:'Calorie Balance',        desc:'Deficit or surplus for the day' },
  { id:'card-workout',          group:'Daily Performance', icon:'💪', label:'Workout Logged',          desc:'Today\'s workout session summary' },
  { id:'card-steps',            group:'Daily Performance', icon:'👣', label:'Steps Today',             desc:'Today\'s step count vs goal' },
  { id:'card-protein',          group:'Daily Performance', icon:'🥩', label:'Protein',                 desc:'Grams of protein logged today' },
  { id:'card-water',            group:'Daily Performance', icon:'💧', label:'Water Intake',            desc:'Ounces of water logged today' },
  { id:'card-bmi',              group:'Body Metrics',      icon:'⚖️', label:'BMI',                    desc:'Body mass index from profile height/weight' },
  { id:'card-weight-delta',     group:'Body Metrics',      icon:'📉', label:'Weight Change',           desc:'Weight change since first log entry' },
  { id:'card-waist-delta',      group:'Body Metrics',      icon:'📏', label:'Waist Change',            desc:'Waist circumference change since start' },
  { id:'card-chest-delta',      group:'Body Metrics',      icon:'📐', label:'Chest Change',            desc:'Chest circumference change since start' },
  { id:'card-hips-delta',       group:'Body Metrics',      icon:'📐', label:'Hips Change',             desc:'Hips circumference change since start' },
  { id:'card-neck-delta',       group:'Body Metrics',      icon:'📐', label:'Neck Change',             desc:'Neck circumference change since start' },
  { id:'card-glutes-delta',     group:'Body Metrics',      icon:'📐', label:'Glutes Change',           desc:'Glutes change since start' },
  { id:'card-thighs-delta',     group:'Body Metrics',      icon:'📐', label:'Thighs Change',           desc:'Thigh change since start' },
  { id:'card-biceps-delta',     group:'Muscle Size',       icon:'💪', label:'Biceps Change',           desc:'Bicep circumference change since start' },
  { id:'card-triceps-delta',    group:'Muscle Size',       icon:'💪', label:'Triceps Change',          desc:'Tricep circumference change since start' },
  { id:'card-forearms-delta',   group:'Muscle Size',       icon:'💪', label:'Forearms Change',         desc:'Forearm circumference change since start' },
  { id:'card-calves-delta',     group:'Muscle Size',       icon:'💪', label:'Calves Change',           desc:'Calf circumference change since start' },
  { id:'card-shoulders-delta',  group:'Muscle Size',       icon:'💪', label:'Shoulders Change',        desc:'Shoulder circumference change since start' },
  { id:'card-quads-delta',      group:'Muscle Size',       icon:'💪', label:'Quads Change',            desc:'Quad circumference change since start' },
  { id:'card-sleep',            group:'Recovery',          icon:'😴', label:'Avg Sleep',               desc:'14-day average sleep hours' },
  { id:'card-stress',           group:'Recovery',          icon:'🧠', label:'Avg Stress',              desc:'14-day average stress score' },
  { id:'card-streak',           group:'Performance',       icon:'🔥', label:'Workout Streak',          desc:'Consecutive training days' },
  { id:'card-consistency',      group:'Performance',       icon:'✓',  label:'Consistency %',           desc:'Sessions completed vs frequency goal' },
  { id:'card-steps-7d',         group:'Performance',       icon:'📊', label:'7-Day Avg Steps',         desc:'Average daily steps over last 7 days' },
  { id:'card-step-rate',        group:'Performance',       icon:'🎯', label:'Step Goal Hit Rate',      desc:'% of days you hit your step goal' },
  // Charts
  { id:'chart-heatmap',         group:'Charts',            icon:'📅', label:'Workout Heatmap',          desc:'30-day workout consistency grid' },
  { id:'chart-steps',           group:'Charts',            icon:'📊', label:'Daily Steps Chart',        desc:'Bar chart of steps over last 30 days' },
  { id:'chart-weight',          group:'Charts',            icon:'⚖️', label:'Weight Trend Chart',       desc:'Line chart of weight over time' },
  { id:'chart-waist',           group:'Charts',            icon:'📏', label:'Waist Trend Chart',        desc:'Line chart of waist over time' },
  { id:'chart-sleep',           group:'Charts',            icon:'😴', label:'Sleep & Stress Chart',     desc:'Sleep hours and stress score over 14 days' },
  { id:'chart-biceps',          group:'Charts',            icon:'💪', label:'Biceps Trend Chart',       desc:'Line chart of bicep measurement over time' },
  { id:'chart-triceps',         group:'Charts',            icon:'💪', label:'Triceps Trend Chart',      desc:'Line chart of tricep measurement over time' },
  { id:'chart-forearms',        group:'Charts',            icon:'💪', label:'Forearms Trend Chart',     desc:'Line chart of forearm measurement over time' },
  { id:'chart-calves',          group:'Charts',            icon:'💪', label:'Calves Trend Chart',       desc:'Line chart of calf measurement over time' },
  { id:'chart-shoulders',       group:'Charts',            icon:'💪', label:'Shoulders Trend Chart',    desc:'Line chart of shoulder measurement over time' },
  { id:'chart-quads',           group:'Charts',            icon:'💪', label:'Quads Trend Chart',        desc:'Line chart of quad measurement over time' },
  { id:'chart-chest',           group:'Charts',            icon:'📐', label:'Chest Trend Chart',        desc:'Line chart of chest measurement over time' },
  { id:'chart-hips',            group:'Charts',            icon:'📐', label:'Hips Trend Chart',         desc:'Line chart of hips measurement over time' },
  { id:'chart-glutes',          group:'Charts',            icon:'📐', label:'Glutes Trend Chart',       desc:'Line chart of glutes measurement over time' },
  { id:'chart-thighs',          group:'Charts',            icon:'📐', label:'Thighs Trend Chart',       desc:'Line chart of thighs measurement over time' },
  { id:'chart-workouts',        group:'Charts',            icon:'📋', label:'Recent Workouts List',     desc:'Last 7 workout sessions summary' }
];

var MEASUREMENT_REGISTRY = [
  { id:'weight',     group:'Body Composition', icon:'⚖️', label:'Weight',           unit:'lbs', defaultOn:true  },
  { id:'waist',      group:'Body Composition', icon:'📏', label:'Waist',            unit:'in',  defaultOn:true  },
  { id:'chest',      group:'Body Composition', icon:'📐', label:'Chest',            unit:'in',  defaultOn:true  },
  { id:'hips',       group:'Body Composition', icon:'📐', label:'Hips',             unit:'in',  defaultOn:true  },
  { id:'neck',       group:'Body Composition', icon:'📐', label:'Neck',             unit:'in',  defaultOn:true  },
  { id:'glutes',     group:'Body Composition', icon:'📐', label:'Glutes',           unit:'in',  defaultOn:true  },
  { id:'thighs',     group:'Body Composition', icon:'📐', label:'Thighs',           unit:'in',  defaultOn:true  },
  { id:'biceps',     group:'Muscle Size',      icon:'💪', label:'Biceps',           unit:'in',  defaultOn:false },
  { id:'biceps_r',   group:'Muscle Size',      icon:'💪', label:'Biceps (Right)',   unit:'in',  defaultOn:false },
  { id:'biceps_l',   group:'Muscle Size',      icon:'💪', label:'Biceps (Left)',    unit:'in',  defaultOn:false },
  { id:'triceps',    group:'Muscle Size',      icon:'💪', label:'Triceps',          unit:'in',  defaultOn:false },
  { id:'forearms',   group:'Muscle Size',      icon:'💪', label:'Forearms',         unit:'in',  defaultOn:false },
  { id:'forearms_r', group:'Muscle Size',      icon:'💪', label:'Forearms (Right)', unit:'in',  defaultOn:false },
  { id:'forearms_l', group:'Muscle Size',      icon:'💪', label:'Forearms (Left)',  unit:'in',  defaultOn:false },
  { id:'shoulders',  group:'Muscle Size',      icon:'💪', label:'Shoulders',        unit:'in',  defaultOn:false },
  { id:'calves',     group:'Muscle Size',      icon:'💪', label:'Calves',           unit:'in',  defaultOn:false },
  { id:'calves_r',   group:'Muscle Size',      icon:'💪', label:'Calves (Right)',   unit:'in',  defaultOn:false },
  { id:'calves_l',   group:'Muscle Size',      icon:'💪', label:'Calves (Left)',    unit:'in',  defaultOn:false },
  { id:'quads',      group:'Muscle Size',      icon:'💪', label:'Quads',            unit:'in',  defaultOn:false },
  { id:'chest_flex', group:'Muscle Size',      icon:'💪', label:'Chest (Flexed)',   unit:'in',  defaultOn:false },
  { id:'lats',       group:'Muscle Size',      icon:'💪', label:'Lats',             unit:'in',  defaultOn:false },
  { id:'sleep',      group:'Wellness',         icon:'😴', label:'Sleep',            unit:'hrs', defaultOn:true  },
  { id:'stress',     group:'Wellness',         icon:'🧠', label:'Stress',           unit:'/10', defaultOn:true  },
  { id:'hrv',        group:'Wellness',         icon:'❤️', label:'HRV',              unit:'ms',  defaultOn:false },
  { id:'rhr',        group:'Wellness',         icon:'❤️', label:'Resting HR',       unit:'bpm', defaultOn:false },
  { id:'energy',     group:'Wellness',         icon:'⚡', label:'Energy Level',     unit:'/10', defaultOn:false },
  { id:'mood',       group:'Wellness',         icon:'🧘', label:'Mood',             unit:'/10', defaultOn:false },
  { id:'soreness',   group:'Wellness',         icon:'💢', label:'Soreness',         unit:'/10', defaultOn:false },
  { id:'bodyfat',    group:'Performance',      icon:'📊', label:'Body Fat %',       unit:'%',   defaultOn:false },
  { id:'grip_r',     group:'Performance',      icon:'✊', label:'Grip Strength (R)', unit:'lbs', defaultOn:false },
  { id:'grip_l',     group:'Performance',      icon:'✊', label:'Grip Strength (L)', unit:'lbs', defaultOn:false }
];

var dashConfig = null;

// ── Firebase load/save ────────────────────────────────────
async function loadDashConfig() {
  if (!SESSION) { dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS); return dashConfig; }
  try {
    var doc = await db.collection('userdata').doc(SESSION.username)
      .collection('dashconfig').doc('settings').get();
    if (doc.exists) {
      dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS, doc.data());
    } else {
      dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
    }
  } catch(e) {
    console.warn('loadDashConfig error:', e);
    dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
  }
  return dashConfig;
}

async function saveDashConfig(cfg) {
  dashConfig = cfg;
  if (!SESSION) return;
  await db.collection('userdata').doc(SESSION.username)
    .collection('dashconfig').doc('settings').set(cfg);
}

async function getDashConfig() {
  if (!dashConfig) await loadDashConfig();
  return dashConfig || Object.assign({}, DASH_CONFIG_DEFAULTS);
}

function isDashCardVisible(cardId) {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  return (cfg.visibleCards || []).indexOf(cardId) >= 0;
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
// CONFIGURATOR MODAL — built with DOM, no nested backticks
// ═══════════════════════════════════════════════════════════
function openDashConfigurator() {
  // Ensure config is loaded before opening
  var openFn = function() {
    var modal = document.getElementById('dash-config-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dash-config-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9000;overflow-y:auto;padding:20px;box-sizing:border-box;display:none;';
      document.body.appendChild(modal);
    }
    modal.style.display = 'block';
    renderDashConfigModal(modal);
  };

  if (!dashConfig) {
    loadDashConfig().then(openFn);
  } else {
    openFn();
  }
}

function closeDashConfigurator() {
  var modal = document.getElementById('dash-config-modal');
  if (modal) modal.style.display = 'none';
}

function renderDashConfigModal(modal) {
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  var visibleCards = cfg.visibleCards || [];
  var measurements = cfg.measurements || [];
  var customMeasure = cfg.customMeasurements || [];

  // Build group maps
  var cardGroups = {};
  DASH_CARD_REGISTRY.forEach(function(c) {
    if (!cardGroups[c.group]) cardGroups[c.group] = [];
    cardGroups[c.group].push(c);
  });
  var measureGroups = {};
  MEASUREMENT_REGISTRY.forEach(function(m) {
    if (!measureGroups[m.group]) measureGroups[m.group] = [];
    measureGroups[m.group].push(m);
  });

  // Build card tab HTML using string concat — no nested backticks
  var cardTabHTML = '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:14px;line-height:1.6;">Toggle which cards appear on your dashboard. Changes save immediately.</div>';
  cardTabHTML += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">';
  cardTabHTML += '<button onclick="dcSelectAllCards(true)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">SELECT ALL</button>';
  cardTabHTML += '<button onclick="dcSelectAllCards(false)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">DESELECT ALL</button>';
  cardTabHTML += '</div>';

  Object.keys(cardGroups).forEach(function(group) {
    cardTabHTML += '<div style="margin-bottom:16px;">';
    cardTabHTML += '<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;padding:5px 10px;background:var(--bg3);border-left:3px solid var(--accent2);margin-bottom:8px;">' + group.toUpperCase() + '</div>';
    cardTabHTML += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;">';
    cardGroups[group].forEach(function(c) {
      var on = visibleCards.indexOf(c.id) >= 0;
      var bg = on ? 'var(--accent-dim)' : 'var(--bg3)';
      var bc = on ? 'var(--accent2)' : 'var(--border)';
      var tc = on ? 'var(--accent2)' : 'var(--text)';
      cardTabHTML += '<label id="dcc-label-' + c.id + '" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:' + bg + ';border:1px solid ' + bc + ';cursor:pointer;transition:all .15s;">';
      cardTabHTML += '<input type="checkbox"' + (on ? ' checked' : '') + ' onchange="dcToggleCard(\'' + c.id + '\',this.checked)" style="accent-color:var(--accent);width:14px;height:14px;flex-shrink:0;">';
      cardTabHTML += '<span style="font-size:0.9rem;flex-shrink:0;">' + c.icon + '</span>';
      cardTabHTML += '<div>';
      cardTabHTML += '<div style="font-family:var(--font-mono);font-size:0.62rem;color:' + tc + ';letter-spacing:.06em;">' + c.label + '</div>';
      cardTabHTML += '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);line-height:1.3;">' + c.desc + '</div>';
      cardTabHTML += '</div></label>';
    });
    cardTabHTML += '</div></div>';
  });

  // Build measurements tab HTML
  var measureTabHTML = '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:14px;line-height:1.6;">Enable measurements you want to log. They appear in your body log and as delta cards on the dashboard.</div>';
  measureTabHTML += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">';
  measureTabHTML += '<button onclick="dcSelectAllMeasures(true)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">SELECT ALL</button>';
  measureTabHTML += '<button onclick="dcSelectAllMeasures(false)" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">DEFAULTS ONLY</button>';
  measureTabHTML += '</div>';

  Object.keys(measureGroups).forEach(function(group) {
    measureTabHTML += '<div style="margin-bottom:16px;">';
    measureTabHTML += '<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;padding:5px 10px;background:var(--bg3);border-left:3px solid var(--accent2);margin-bottom:8px;">' + group.toUpperCase() + '</div>';
    measureTabHTML += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;">';
    measureGroups[group].forEach(function(m) {
      var on = measurements.indexOf(m.id) >= 0;
      var bg = on ? 'var(--accent-dim)' : 'var(--bg3)';
      var bc = on ? 'var(--accent2)' : 'var(--border)';
      var tc = on ? 'var(--accent2)' : 'var(--text)';
      measureTabHTML += '<label id="dcm-label-' + m.id + '" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:' + bg + ';border:1px solid ' + bc + ';cursor:pointer;transition:all .15s;">';
      measureTabHTML += '<input type="checkbox"' + (on ? ' checked' : '') + ' onchange="dcToggleMeasure(\'' + m.id + '\',this.checked)" style="accent-color:var(--accent);width:14px;height:14px;flex-shrink:0;">';
      measureTabHTML += '<span style="font-size:0.9rem;flex-shrink:0;">' + m.icon + '</span>';
      measureTabHTML += '<div>';
      measureTabHTML += '<div style="font-family:var(--font-mono);font-size:0.62rem;color:' + tc + ';letter-spacing:.06em;">' + m.label + '</div>';
      measureTabHTML += '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);">' + m.unit + '</div>';
      measureTabHTML += '</div></label>';
    });
    measureTabHTML += '</div></div>';
  });

  // Custom measurements section
  measureTabHTML += '<div style="margin-bottom:16px;">';
  measureTabHTML += '<div style="font-family:var(--font-mono);font-size:0.6rem;color:#9c27b0;letter-spacing:.15em;padding:5px 10px;background:var(--bg3);border-left:3px solid #9c27b0;margin-bottom:8px;">CUSTOM MEASUREMENTS</div>';
  measureTabHTML += '<div id="dc-custom-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">';
  customMeasure.forEach(function(c, i) {
    measureTabHTML += renderCustomMeasureRow(c, i);
  });
  measureTabHTML += '</div>';
  measureTabHTML += '<div style="background:var(--bg3);border:1px dashed var(--border2);padding:12px;">';
  measureTabHTML += '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.12em;margin-bottom:8px;">+ ADD CUSTOM MEASUREMENT</div>';
  measureTabHTML += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">';
  measureTabHTML += '<div style="flex:2;min-width:130px;"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);margin-bottom:3px;">NAME</div>';
  measureTabHTML += '<input type="text" id="dc-custom-name" placeholder="e.g. Left Bicep, Inner Thigh..." style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.72rem;padding:7px 9px;outline:none;box-sizing:border-box;"></div>';
  measureTabHTML += '<div style="flex:1;min-width:80px;"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);margin-bottom:3px;">UNIT</div>';
  measureTabHTML += '<select id="dc-custom-unit" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.72rem;padding:7px 8px;outline:none;">';
  measureTabHTML += '<option value="in">in (inches)</option><option value="cm">cm</option><option value="lbs">lbs</option><option value="kg">kg</option><option value="%">%</option><option value="bpm">bpm</option><option value="/10">/10</option><option value="hrs">hrs</option><option value="">no unit</option>';
  measureTabHTML += '</select></div>';
  measureTabHTML += '<button onclick="dcAddCustomMeasure()" class="btn btn-p" style="font-size:0.62rem;padding:7px 14px;white-space:nowrap;">+ ADD</button>';
  measureTabHTML += '</div>';
  measureTabHTML += '<div id="dc-custom-msg" style="font-family:var(--font-mono);font-size:0.6rem;min-height:14px;margin-top:6px;"></div>';
  measureTabHTML += '</div></div>';

  // Assemble full modal
  var html = '<div style="max-width:680px;margin:0 auto;background:var(--bg2);border:2px solid var(--accent2);padding:28px;position:relative;">';
  // Header
  html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;">';
  html += '<div>';
  html += '<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);letter-spacing:.15em;margin-bottom:4px;">DASHBOARD SETTINGS</div>';
  html += '<div style="font-family:var(--font-display);font-size:1.6rem;color:var(--text-bright);line-height:1;">CONFIGURE YOUR DASHBOARD</div>';
  html += '<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-top:4px;line-height:1.6;">Choose which cards show on your dashboard and which measurements to track in your body log</div>';
  html += '</div>';
  html += '<button onclick="closeDashConfigurator()" style="background:none;border:none;color:var(--text-dim);font-size:1.8rem;cursor:pointer;padding:4px;flex-shrink:0;line-height:1;">x</button>';
  html += '</div>';
  // Tabs
  html += '<div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:20px;">';
  html += '<button id="dctab-cards" onclick="dcSwitchTab(\'cards\')" style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:.1em;padding:9px 18px;background:none;border:none;border-bottom:3px solid var(--accent2);color:var(--accent2);cursor:pointer;">DASHBOARD CARDS</button>';
  html += '<button id="dctab-measurements" onclick="dcSwitchTab(\'measurements\')" style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:.1em;padding:9px 18px;background:none;border:none;border-bottom:3px solid transparent;color:var(--text-dim);cursor:pointer;">BODY MEASUREMENTS</button>';
  html += '</div>';
  // Panels
  html += '<div id="dcpanel-cards">' + cardTabHTML + '</div>';
  html += '<div id="dcpanel-measurements" style="display:none;">' + measureTabHTML + '</div>';
  // Save row
  html += '<div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">';
  html += '<button onclick="dcSave()" class="btn btn-p" style="flex:1;font-size:0.72rem;padding:12px;">SAVE CONFIGURATION</button>';
  html += '<button onclick="closeDashConfigurator()" class="btn btn-s" style="font-size:0.68rem;padding:12px;white-space:nowrap;">CANCEL</button>';
  html += '</div>';
  html += '<div id="dc-save-msg" style="font-family:var(--font-mono);font-size:0.65rem;text-align:center;margin-top:8px;min-height:16px;"></div>';
  html += '</div>';

  modal.innerHTML = html;
}

function renderCustomMeasureRow(c, i) {
  return '<div id="dc-custom-row-' + i + '" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--accent-dim);border:1px solid var(--accent2);">'
    + '<span style="font-size:0.9rem;">📐</span>'
    + '<div style="flex:1;"><div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent2);">' + c.label + '</div>'
    + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--text-dim);">' + c.unit + '</div></div>'
    + '<button onclick="dcRemoveCustom(' + i + ')" style="background:none;border:1px solid var(--danger);color:var(--danger);font-family:var(--font-mono);font-size:0.58rem;padding:3px 8px;cursor:pointer;">X</button>'
    + '</div>';
}

// ── Tab switcher ──────────────────────────────────────────
function dcSwitchTab(tab) {
  ['cards','measurements'].forEach(function(t) {
    var panel = document.getElementById('dcpanel-'+t);
    var btn   = document.getElementById('dctab-'+t);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.style.borderBottomColor = t === tab ? 'var(--accent2)' : 'transparent';
      btn.style.color = t === tab ? 'var(--accent2)' : 'var(--text-dim)';
    }
  });
}

// ── Toggle card visibility ────────────────────────────────
function dcToggleCard(cardId, checked) {
  if (!dashConfig) dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
  var arr = dashConfig.visibleCards || [];
  var idx = arr.indexOf(cardId);
  if (checked && idx < 0) arr.push(cardId);
  if (!checked && idx >= 0) arr.splice(idx, 1);
  dashConfig.visibleCards = arr;
  var label = document.getElementById('dcc-label-'+cardId);
  if (label) {
    label.style.background  = checked ? 'var(--accent-dim)' : 'var(--bg3)';
    label.style.borderColor = checked ? 'var(--accent2)'    : 'var(--border)';
  }
}

// ── Toggle measurement ────────────────────────────────────
function dcToggleMeasure(measureId, checked) {
  if (!dashConfig) dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
  var arr = dashConfig.measurements || [];
  var idx = arr.indexOf(measureId);
  if (checked && idx < 0) arr.push(measureId);
  if (!checked && idx >= 0) arr.splice(idx, 1);
  dashConfig.measurements = arr;
  var label = document.getElementById('dcm-label-'+measureId);
  if (label) {
    label.style.background  = checked ? 'var(--accent-dim)' : 'var(--bg3)';
    label.style.borderColor = checked ? 'var(--accent2)'    : 'var(--border)';
  }
}

// ── Select all / reset ────────────────────────────────────
function dcSelectAllCards(selectAll) {
  if (!dashConfig) dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
  dashConfig.visibleCards = selectAll ? DASH_CARD_REGISTRY.map(function(c){ return c.id; }) : [];
  var modal = document.getElementById('dash-config-modal');
  if (modal) renderDashConfigModal(modal);
}

function dcSelectAllMeasures(selectAll) {
  if (!dashConfig) dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
  dashConfig.measurements = selectAll
    ? MEASUREMENT_REGISTRY.map(function(m){ return m.id; })
    : MEASUREMENT_REGISTRY.filter(function(m){ return m.defaultOn; }).map(function(m){ return m.id; });
  var modal = document.getElementById('dash-config-modal');
  if (modal) renderDashConfigModal(modal);
}

// ── Add / remove custom measurement ──────────────────────
function dcAddCustomMeasure() {
  var nameEl = document.getElementById('dc-custom-name');
  var unitEl = document.getElementById('dc-custom-unit');
  var msgEl  = document.getElementById('dc-custom-msg');
  var name   = nameEl ? nameEl.value.trim() : '';
  var unit   = unitEl ? unitEl.value : 'in';
  if (!name) { if (msgEl) msgEl.textContent = 'Enter a name'; return; }
  if (!dashConfig) dashConfig = Object.assign({}, DASH_CONFIG_DEFAULTS);
  if (!dashConfig.customMeasurements) dashConfig.customMeasurements = [];
  var id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,30) + '_' + Date.now();
  dashConfig.customMeasurements.push({ id: id, label: name, unit: unit });
  if (nameEl) nameEl.value = '';
  if (msgEl) { msgEl.style.color = '#4caf50'; msgEl.textContent = 'Added: ' + name; setTimeout(function(){ msgEl.textContent = ''; }, 2000); }
  var listEl = document.getElementById('dc-custom-list');
  if (listEl) {
    listEl.innerHTML = dashConfig.customMeasurements.map(function(c,i){ return renderCustomMeasureRow(c,i); }).join('');
  }
}

function dcRemoveCustom(idx) {
  if (!dashConfig || !dashConfig.customMeasurements) return;
  dashConfig.customMeasurements.splice(idx, 1);
  var listEl = document.getElementById('dc-custom-list');
  if (listEl) {
    listEl.innerHTML = dashConfig.customMeasurements.map(function(c,i){ return renderCustomMeasureRow(c,i); }).join('');
  }
}

// ── Save ──────────────────────────────────────────────────
async function dcSave() {
  var msgEl = document.getElementById('dc-save-msg');
  if (msgEl) { msgEl.style.color = 'var(--accent2)'; msgEl.textContent = 'SAVING...'; }
  try {
    await saveDashConfig(dashConfig);
    if (msgEl) { msgEl.style.color = '#4caf50'; msgEl.textContent = 'SAVED'; }
    setTimeout(function() {
      closeDashConfigurator();
      if (typeof renderLogSummary === 'function') renderLogSummary();
    }, 800);
  } catch(e) {
    if (msgEl) { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'ERROR: ' + e.message; }
  }
}

// ═══════════════════════════════════════════════════════════
// BODY LOG — dynamic fields from config
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
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--accent2);letter-spacing:.15em;margin-bottom:8px;padding:3px 8px;background:var(--bg3);border-left:2px solid var(--accent2);">' + group.toUpperCase() + '</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    groups[group].forEach(function(m) {
      var fieldId = 'b-' + m.id;
      var isScore = (m.unit === '/10');
      var isHrs   = (m.unit === 'hrs');
      var step    = m.id === 'weight' ? '0.1' : '0.25';
      var min     = isScore ? '1' : isHrs ? '0' : '';
      var max     = isScore ? '10' : isHrs ? '14' : '';
      html += '<div class="lf">';
      html += '<label>' + m.label.toUpperCase() + ' (' + m.unit + ')</label>';
      html += '<input type="number" id="' + fieldId + '" placeholder="—" step="' + step + '"'
        + (min ? ' min="' + min + '"' : '')
        + (max ? ' max="' + max + '"' : '') + '>';
      html += '<div id="' + fieldId + '-prev" style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);margin-top:3px;"></div>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
}

function collectBodyLogValues() {
  var enabled = getEnabledMeasurements();
  var values = {};
  enabled.forEach(function(m) {
    var el = document.getElementById('b-' + m.id);
    if (el && el.value !== '' && el.value !== null) {
      var v = parseFloat(el.value);
      if (!isNaN(v)) values[m.id] = v;
    }
  });
  return values;
}

function populateBodyLogFromEntry(entry) {
  var enabled = getEnabledMeasurements();
  enabled.forEach(function(m) {
    var el   = document.getElementById('b-' + m.id);
    var prev = document.getElementById('b-' + m.id + '-prev');
    if (!el) return;
    el.value = entry[m.id] !== undefined ? entry[m.id] : '';
    if (prev) prev.textContent = '';
  });
}

function prefillBodyLogFromPrev(prevEntry) {
  var enabled = getEnabledMeasurements();
  enabled.forEach(function(m) {
    var el   = document.getElementById('b-' + m.id);
    var prev = document.getElementById('b-' + m.id + '-prev');
    if (!el || prevEntry[m.id] === undefined) return;
    el.value = prevEntry[m.id];
    el.style.color = 'var(--text-dim)';
    if (prev) prev.textContent = 'Last: ' + prevEntry[m.id];
    el.oninput = function() { el.style.color = 'var(--text)'; if (prev) prev.textContent = ''; };
  });
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD DELTA CARD HELPER
// ═══════════════════════════════════════════════════════════
function buildMeasurementDeltaCard(measureId, body) {
  if (!isDashCardVisible('card-' + measureId + '-delta')) return '';
  var def = MEASUREMENT_REGISTRY.find(function(m){ return m.id === measureId; });
  if (!def) {
    var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
    def = (cfg.customMeasurements || []).find(function(m){ return m.id === measureId; });
  }
  if (!def) return '';
  var withData = body.filter(function(b){ return b[measureId] !== undefined && !isNaN(+b[measureId]); });
  var latest = withData[0];
  var first  = withData[withData.length - 1];
  if (!latest || !first || latest === first) return '';
  var delta = +(+latest[measureId] - +first[measureId]).toFixed(2);
  var isMuscle = ['biceps','triceps','forearms','calves','quads','shoulders','chest_flex','lats','traps',
    'biceps_r','biceps_l','forearms_r','forearms_l','calves_r','calves_l'].indexOf(measureId) >= 0 || def._isCustom;
  var positiveIsGood = isMuscle;
  var color = delta === 0 ? 'var(--text)' : ((delta > 0) === positiveIsGood ? '#4caf50' : '#ff9800');
  return '<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">'
    + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">'
    + (def.icon || '📐') + ' ' + def.label.toUpperCase() + ' \u0394</div>'
    + '<div style="font-family:var(--font-display);font-size:1.3rem;color:' + color + ';">' + (delta > 0 ? '+' : '') + delta + ' ' + def.unit + '</div>'
    + '<div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);">since start \u00B7 ' + latest[measureId] + ' ' + def.unit + ' now</div>'
    + '</div>';
}

// ═══════════════════════════════════════════════════════════
// buildConfiguredKpiCards — called from dashboard.js
// Returns HTML string of all visible metric cards
// ═══════════════════════════════════════════════════════════
function buildConfiguredKpiCards(p) {
  var html = '';
  var vis = isDashCardVisible;

  // Helper: small metric card
  function card(label, value, color, sub) {
    return '<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">'
      + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">' + label + '</div>'
      + '<div style="font-family:var(--font-display);font-size:1.3rem;color:' + color + ';line-height:1;">' + value + '</div>'
      + '<div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--text-dim);margin-top:2px;">' + sub + '</div>'
      + '</div>';
  }

  // ── Daily Performance ──
  if (vis('card-calories-burned') && p.todayCalsBurned) {
    var burnSub = p.todayWorkout && p.todaySteps ? 'workout + steps' : p.todayWorkout ? 'workout est.' : 'steps only';
    html += card('🔥 CALORIES BURNED', p.todayCalsBurned.toLocaleString(), 'var(--accent2)', burnSub);
  }
  if (vis('card-calories-eaten') && p.todayCalsEaten) {
    html += card('🍽 CALORIES EATEN', p.todayCalsEaten.toLocaleString(), '#ff9800', 'nutrition logged');
  }
  if (vis('card-net-balance') && p.todayCalDeficit !== null && p.todayCalDeficit !== undefined) {
    var defColor = p.todayCalDeficit > 0 ? '#4caf50' : '#f44336';
    var defVal = (p.todayCalDeficit > 0 ? '−' : '+') + Math.abs(p.todayCalDeficit).toLocaleString();
    var defSub = p.todayCalDeficit > 0 ? 'calorie deficit' : 'calorie surplus';
    html += card('⚖️ NET BALANCE', defVal, defColor, defSub);
  }
  if (vis('card-workout')) {
    if (p.todayWorkout) {
      html += card('✓ WORKOUT', (p.todayWorkout.day || 'Session').split('—')[0].trim(),
        '#4caf50', (p.todayWorkout.duration || '—') + ' min · E:' + (p.todayWorkout.energy || '—') + '/10');
    } else {
      html += '<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">'
        + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">💪 WORKOUT</div>'
        + '<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">Not logged</div>'
        + '<div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent);cursor:pointer;" onclick="nav(\'workout\')">→ Go log it</div>'
        + '</div>';
    }
  }
  if (vis('card-steps')) {
    var stepGoal = (typeof userGoals !== 'undefined' && userGoals.stepGoal) ? userGoals.stepGoal : 10000;
    if (p.todaySteps) {
      var stepsTotal = +p.todaySteps.total || 0;
      var stepsHit = stepsTotal >= stepGoal;
      html += card('👣 STEPS TODAY', stepsTotal.toLocaleString(),
        stepsHit ? '#4caf50' : 'var(--accent2)',
        stepsHit ? '✓ goal hit' : 'of ' + stepGoal.toLocaleString());
    } else {
      html += '<div style="background:var(--bg3);padding:10px;border:1px solid var(--border);">'
        + '<div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:3px;">👣 STEPS</div>'
        + '<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">Not logged</div>'
        + '<div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent);cursor:pointer;" onclick="nav(\'log\');setTimeout(function(){logTab(\'steps\');},100);">→ Go log it</div>'
        + '</div>';
    }
  }
  if (vis('card-protein') && p.todayNutrition) {
    var protColor = +p.todayNutrition.protein >= 150 ? '#4caf50' : '#ff9800';
    html += card('🥩 PROTEIN', (p.todayNutrition.protein || '—') + 'g', protColor,
      'carbs: ' + (p.todayNutrition.carbs || '—') + 'g · fat: ' + (p.todayNutrition.fat || '—') + 'g');
  }
  if (vis('card-water') && p.todayNutrition && p.todayNutrition.water) {
    var waterColor = +p.todayNutrition.water >= 96 ? '#64b5f6' : '#ff9800';
    html += card('💧 WATER', (p.todayNutrition.water || '—') + ' oz', waterColor,
      +p.todayNutrition.water >= 96 ? '✓ hydrated' : 'goal: 96 oz');
  }

  // ── Body Metrics ──
  if (vis('card-bmi') && p.bmi) {
    var bmiColor = p.bmi < 25 ? '#4caf50' : p.bmi < 30 ? '#ff9800' : '#f44336';
    var bmiCat   = p.bmi < 25 ? 'Normal' : p.bmi < 30 ? 'Overweight' : 'Obese';
    var wt = (typeof SESSION !== 'undefined' && SESSION.weight) ? SESSION.weight + ' lbs' : '';
    html += card('⚖️ BMI', p.bmi.toFixed(1), bmiColor, bmiCat + (wt ? ' · ' + wt : ''));
  }
  if (vis('card-weight-delta') && p.wtChange !== null && p.wtChange !== undefined) {
    var wtColor = p.wtChange < 0 ? '#4caf50' : p.wtChange > 0 ? '#ff9800' : 'var(--text)';
    html += card('WEIGHT Δ', (p.wtChange > 0 ? '+' : '') + p.wtChange + ' lbs', wtColor,
      'since start · ' + ((p.latestWeight && p.latestWeight.weight) ? p.latestWeight.weight : '?') + ' lbs now');
  }
  if (vis('card-waist-delta') && p.waistChange !== null && p.waistChange !== undefined) {
    var waistColor = p.waistChange < 0 ? '#4caf50' : p.waistChange > 0 ? '#ff9800' : 'var(--text)';
    html += card('📏 WAIST Δ', (p.waistChange > 0 ? '+' : '') + p.waistChange + '"', waistColor,
      'since start · ' + ((p.latestWaist && p.latestWaist.waist) ? p.latestWaist.waist : '?') + '" now');
  }

  // ── Body measurement deltas (chest, hips, neck, glutes, thighs) ──
  var bodyDeltas = ['chest','hips','neck','glutes','thighs'];
  bodyDeltas.forEach(function(m) {
    if (!vis('card-' + m + '-delta')) return;
    var withData = (p.body || []).filter(function(b){ return b[m] !== undefined && !isNaN(+b[m]); });
    if (withData.length < 2) return;
    var latest = withData[0]; var first = withData[withData.length-1];
    var delta = +(+latest[m] - +first[m]).toFixed(2);
    var color = delta < 0 ? '#4caf50' : delta > 0 ? '#ff9800' : 'var(--text)';
    html += card('📐 ' + m.toUpperCase() + ' Δ', (delta > 0 ? '+' : '') + delta + '"', color,
      'since start · ' + latest[m] + '" now');
  });

  // ── Muscle size deltas ──
  var muscleMeasures = ['biceps','triceps','forearms','calves','shoulders','quads','chest_flex',
    'biceps_r','biceps_l','forearms_r','forearms_l','calves_r','calves_l'];
  muscleMeasures.forEach(function(m) {
    html += buildMeasurementDeltaCard(m, p.body || []);
  });

  // ── Custom measurement deltas ──
  var cfg = dashConfig || DASH_CONFIG_DEFAULTS;
  (cfg.customMeasurements || []).forEach(function(c) {
    html += buildMeasurementDeltaCard(c.id, p.body || []);
  });

  // ── Recovery ──
  if (vis('card-sleep') && p.avgSleep) {
    var sleepColor = +p.avgSleep >= 7 ? '#4caf50' : +p.avgSleep >= 6 ? '#ff9800' : '#f44336';
    html += card('😴 AVG SLEEP', p.avgSleep + 'h', sleepColor, '14-day avg');
  }
  if (vis('card-stress') && p.avgStress) {
    var stressColor = +p.avgStress <= 4 ? '#4caf50' : +p.avgStress <= 6 ? '#ff9800' : '#f44336';
    html += card('🧠 AVG STRESS', p.avgStress + '/10', stressColor, '14-day avg');
  }

  // ── Performance ──
  if (vis('card-streak') && p.streak > 0) {
    var strColor = p.streak >= 14 ? '#ffd700' : p.streak >= 7 ? '#4caf50' : p.streak >= 3 ? '#ff9800' : 'var(--accent2)';
    var strSub   = p.streak >= 14 ? 'Elite 🏆' : p.streak >= 7 ? 'Keep going' : p.streak >= 3 ? 'Building' : 'Day ' + p.streak;
    html += card('🔥 STREAK', p.streak + ' ' + (p.streak === 1 ? 'day' : 'days'), strColor, strSub);
  }
  if (vis('card-consistency') && p.consistencyPct > 0) {
    var conColor = p.consistencyPct >= 80 ? '#4caf50' : p.consistencyPct >= 60 ? '#ff9800' : '#f44336';
    html += card('✓ CONSISTENCY', p.consistencyPct + '%', conColor,
      p.totalSessions + ' sessions · ' + p.weeksTraining + ' wks');
  }
  if (vis('card-steps-7d') && p.avgSteps7d > 0) {
    var stepGoal2 = (typeof userGoals !== 'undefined' && userGoals.stepGoal) ? userGoals.stepGoal : 10000;
    var s7color = p.avgSteps7d >= stepGoal2 ? '#4caf50' : '#ff9800';
    var s7val   = p.avgSteps7d >= 1000 ? (p.avgSteps7d / 1000).toFixed(1) + 'k' : p.avgSteps7d;
    html += card('📊 7-DAY AVG', s7val, s7color, 'steps/day avg');
  }
  if (vis('card-step-rate') && p.stepHitPct > 0) {
    var srColor = p.stepHitPct >= 70 ? '#4caf50' : '#ff9800';
    html += card('🎯 STEP RATE', p.stepHitPct + '%', srColor, 'goal hit days');
  }

  return html;
}

// ═══════════════════════════════════════════════════════════
// EXPOSE GLOBALS
// ═══════════════════════════════════════════════════════════
window.loadDashConfig         = loadDashConfig;
window.saveDashConfig         = saveDashConfig;
window.getDashConfig          = getDashConfig;
window.isDashCardVisible      = isDashCardVisible;
window.isMeasurementEnabled   = isMeasurementEnabled;
window.getEnabledMeasurements = getEnabledMeasurements;
window.openDashConfigurator   = openDashConfigurator;
window.closeDashConfigurator  = closeDashConfigurator;
window.dcSwitchTab            = dcSwitchTab;
window.dcToggleCard           = dcToggleCard;
window.dcToggleMeasure        = dcToggleMeasure;
window.dcSelectAllCards       = dcSelectAllCards;
window.dcSelectAllMeasures    = dcSelectAllMeasures;
window.dcAddCustomMeasure     = dcAddCustomMeasure;
window.dcRemoveCustom         = dcRemoveCustom;
window.dcSave                 = dcSave;
window.renderBodyLogFields        = renderBodyLogFields;
window.collectBodyLogValues       = collectBodyLogValues;
window.populateBodyLogFromEntry   = populateBodyLogFromEntry;
window.prefillBodyLogFromPrev     = prefillBodyLogFromPrev;
window.buildMeasurementDeltaCard  = buildMeasurementDeltaCard;
window.buildConfiguredKpiCards    = buildConfiguredKpiCards;
window.dashConfig                 = dashConfig;
window.DASH_CONFIG_DEFAULTS       = DASH_CONFIG_DEFAULTS;
window.DASH_CARD_REGISTRY         = DASH_CARD_REGISTRY;
window.MEASUREMENT_REGISTRY       = MEASUREMENT_REGISTRY;
