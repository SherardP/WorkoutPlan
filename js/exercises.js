// =============================================
// exercises.js - Exercise Library
// =============================================

// ═══════════════════════════════════════════════════════════
// EXERCISE LIBRARY
// ═══════════════════════════════════════════════════════════

// Equipment group labels for display
const EQ_GROUPS = [
  { label:'BODYWEIGHT',          ids:[],                                         icon:'🤸' },
  { label:'DUMBBELLS',           ids:['db'],                                      icon:'🏋️' },
  { label:'KETTLEBELL',          ids:['acc-kb'],                                  icon:'🔔' },
  { label:'BARBELL',             ids:['bar-olympic','bar-standard','bar-trap','bar-ezcurl','bar-safety'], icon:'⚡' },
  { label:'BENCH',               ids:['bench-flat','bench-adj'],                  icon:'🪑' },
  { label:'POWER RACK / SQUAT',  ids:['rack-power','rack-half','rack-pullup','rack-dip'], icon:'🏗️' },
  { label:'LAT PULLDOWN',        ids:['mach-latpull'],                            icon:'🔧' },
  { label:'CABLE MACHINE',       ids:['mach-cable'],                              icon:'🔧' },
  { label:'CHEST PRESS MACHINE', ids:['mach-chestpress'],                        icon:'🔧' },
  { label:'SEATED ROW MACHINE',  ids:['mach-seatedrow'],                         icon:'🔧' },
  { label:'LEG PRESS MACHINE',   ids:['mach-legpress'],                          icon:'🔧' },
  { label:'LEG EXT / CURL',      ids:['mach-legext','mach-legcurl'],             icon:'🔧' },
  { label:'SHOULDER PRESS MACH.',ids:['mach-shoulderpr'],                        icon:'🔧' },
  { label:'PEC DECK / FLY',      ids:['mach-pecdeck'],                           icon:'🔧' },
  { label:'BICEP CURL MACHINE',  ids:['mach-biccurl'],                           icon:'🔧' },
  { label:'TRICEP MACHINE',      ids:['mach-tricext'],                           icon:'🔧' },
  { label:'HIP ABDUCTION MACH.', ids:['mach-hipabduct'],                         icon:'🔧' },
  { label:'BACK EXT. BENCH',     ids:['mach-backext'],                           icon:'🔧' },
  { label:'CALF MACHINE',        ids:['mach-calf'],                              icon:'🔧' },
  { label:'ASSISTED PULL-UP',    ids:['mach-assisted'],                          icon:'🔧' },
  { label:'RESISTANCE BANDS',    ids:['acc-bands'],                               icon:'🔁' },
  { label:'TRX / SUSPENSION',    ids:['acc-trx'],                                 icon:'🔁' },
  { label:'AB ROLLER',           ids:['acc-abroll'],                              icon:'⚙️' },
  { label:'PULL-UP BAR',         ids:['acc-pullbar'],                             icon:'🔩' },
  { label:'DIP BARS',            ids:['acc-dipbar'],                              icon:'🔩' },
  { label:'PREACHER BENCH',      ids:['rack-preacher'],                           icon:'🪑' },
  { label:'CARDIO EQUIPMENT',    ids:['cardio-treadmill','cardio-bike-up','cardio-bike-rec','cardio-airbike','cardio-rower','cardio-elliptical','cardio-stairmill','acc-jumprope'], icon:'🫀' },
  { label:'YOGA (bodyweight)',        ids:['__yoga__'],           icon:'🧘' },
  { label:'PILATES (mat)',            ids:['__pilates__'],         icon:'🌀' },
  { label:'CALISTHENICS',            ids:['__calisthenics__'],    icon:'💯' },
  { label:'MILITARY / TACTICAL',     ids:['__military__'],        icon:'🎖️' },
];

const GOAL_BADGE_COLOR = {
  size:'#ff7a1a', strength:'#4caf50', tone:'#4a9eff',
  fat:'#cc44aa', endurance:'#64b5f6', posture:'#ffc107',
  lowimpact:'#80cbc4', recomp:'#ff9800', general:'var(--border2)', beginner:'#a5d6a7',
};

function exMatchesGroup(ex, group) {
  if (group.ids.includes('__yoga__'))         return ex.goals.includes('yoga');
  if (group.ids.includes('__pilates__'))      return ex.goals.includes('pilates');
  if (group.ids.includes('__calisthenics__')) return ex.goals.includes('calisthenics');
  if (group.ids.includes('__military__'))     return ex.goals.includes('military');
  if (group.ids.length === 0) return ex.eq.length === 0
    && !ex.goals.includes('yoga') && !ex.goals.includes('pilates')
    && !ex.goals.includes('calisthenics') && !ex.goals.includes('military');
  return ex.eq.some(r => group.ids.includes(r));
}

function renderExLib() {
  const el = document.getElementById('exlib-output');
  if (!el) return;

  const search   = (document.getElementById('exlib-search')?.value || '').toLowerCase();
  const muscle   = document.getElementById('exlib-muscle')?.value  || '';
  const goal     = document.getElementById('exlib-goal')?.value    || '';
  const mineOnly = document.getElementById('exlib-mine')?.checked  || false;
  const userEq   = SESSION?.equipment || {};

  let filtered = EX_DB.filter(ex => {
    if (search && !ex.name.toLowerCase().includes(search) && !ex.muscles.join(' ').includes(search)) return false;
    if (muscle && !ex.muscles.includes(muscle)) return false;
    if (goal   && !ex.goals.includes(goal))     return false;
    if (mineOnly && !userHasEquipment(ex.eq, userEq)) return false;
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);
      padding:20px;text-align:center;">No exercises match your filters.</div>`;
    return;
  }

  // Group by equipment
  const groups = EQ_GROUPS.map(grp => ({
    ...grp,
    exercises: filtered.filter(ex => exMatchesGroup(ex, grp)),
  })).filter(grp => grp.exercises.length > 0);

  el.innerHTML = groups.map(grp => {
    const userHas = grp.ids.includes('__yoga__') || grp.ids.includes('__pilates__')
      || grp.ids.includes('__calisthenics__') || grp.ids.includes('__military__')
      || grp.ids.length === 0
      ? true
      : grp.ids.some(id => userEq[id] || (id === 'db' && (userEq.dumbbells||[]).length > 0));
    const hasTag = userHas
      ? `<span style="font-family:var(--font-mono);font-size:0.55rem;color:#4caf50;
          background:rgba(76,175,80,0.15);border:1px solid #4caf50;padding:2px 7px;margin-left:8px;">✓ YOU HAVE THIS</span>`
      : `<span style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);
          background:var(--bg3);border:1px solid var(--border);padding:2px 7px;margin-left:8px;">NOT IN YOUR GYM</span>`;

    const rows = grp.exercises.map(ex => {
      const goalBadges = ex.goals.map(g =>
        `<span style="font-family:var(--font-mono);font-size:0.52rem;padding:1px 6px;
          border:1px solid ${GOAL_BADGE_COLOR[g]||'var(--border)'};
          color:${GOAL_BADGE_COLOR[g]||'var(--text-dim)'};">${g.toUpperCase()}</span>`
      ).join(' ');
      const muscleStr = ex.muscles.map(m => m.replace('-',' ')).join(', ');
      const setsStr = ex.sets_h;
      const impactDot = ex.impact === 'high'
        ? `<span style="color:#f44336;font-size:0.6rem;" title="High impact">⬆</span>`
        : `<span style="color:#4caf50;font-size:0.6rem;" title="Low impact">✓</span>`;

      return `<div style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:10px;
        padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04);
        ${!userHasEquipment(ex.eq, userEq) ? 'opacity:0.45;' : ''}">
        <div style="flex:1;min-width:180px;">
          <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text);
            letter-spacing:.06em;margin-bottom:3px;">
            ${impactDot} ${ex.name.toUpperCase()}
          </div>
          <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);">
            ${muscleStr}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center;flex-shrink:0;">
          ${goalBadges}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--accent2);
          white-space:nowrap;flex-shrink:0;">${setsStr}</div>
        ${ex.ytId ? `<a href="https://www.youtube.com/watch?v=${ex.ytId}" target="_blank"
          style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);
          text-decoration:none;white-space:nowrap;flex-shrink:0;">▶ VIDEO</a>` : ''}
      </div>`;
    }).join('');

    return `<div class="card mb16">
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
        <span style="font-size:1.1rem;">${grp.icon}</span>
        <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--accent2);
          letter-spacing:.08em;">${grp.label}</div>
        ${hasTag}
        <div style="margin-left:auto;font-family:var(--font-mono);font-size:0.58rem;
          color:var(--text-dim);">${grp.exercises.length} exercise${grp.exercises.length!==1?'s':''}</div>
      </div>
      <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);
        display:flex;gap:10px;padding:0 14px 8px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span>EXERCISE</span><span style="margin-left:auto;">GOALS</span>
        <span style="width:70px;text-align:right;">DEFAULT SETS</span>
      </div>
      ${rows}
    </div>`;
  }).join('');
}

// Make functions global
//window.showExerciseDetail = showExerciseDetail;