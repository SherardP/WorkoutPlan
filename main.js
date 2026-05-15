// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('li-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  document.getElementById('rg-pass2').addEventListener('keydown', e => { if(e.key==='Enter') doRegister(); });
  // Check for remember-me token on load
  await tryAutoLogin();
});

// =============================================
// main.js - App Core & Navigation (FINAL)
// =============================================


let currentPage = 'dashboard';

function navigateTo(page) {
    currentPage = page;
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', 
            btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${page}'`));
    });

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="mono dim" style="padding:40px;text-align:center;">Loading...</div>';

    switch(page) {
        case 'dashboard': loadDashboard(); break;
        case 'workout':   loadWorkouts(); break;
        case 'log':       loadLogData(); break;
        case 'exlib':     loadExercises(); break;
        case 'food':      loadNutrition(); break;
        case 'admin':     loadAdmin(); break;
        default:
            mainContent.innerHTML = `<div class="card"><div class="card-title">Page Not Found</div></div>`;
    }
}

// Initialize App after login
async function initializeApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';

    document.getElementById('headerUser').textContent = SESSION.displayName || SESSION.username || SESSION.username;

    if (SESSION.gender) applyTheme(SESSION.gender);

    navigateTo('dashboard');

    if (SESSION.isAdmin) {
        document.getElementById('adminNavBtn').style.display = 'block';
    }

    console.log("%c✅ AdaptFit AI Fully Initialized", "color:#ff7a1a; font-size:1.2rem;");
}


// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════
async function loadStats() {
  const workouts = await encryptedLoad('workout');
  const steps = await encryptedLoad('steps');
  const stWorkoutsEl = document.getElementById('st-workouts');
  if (stWorkoutsEl) stWorkoutsEl.textContent = workouts.length;
  const today = new Date(); today.setHours(0,0,0,0);
  const dates = [...new Set(workouts.map(w => { const d=new Date(w.date); d.setHours(0,0,0,0); return d.getTime(); }))].sort((a,b)=>b-a);
  let streak = 0;
  for (let i=0;i<dates.length;i++) { const exp=new Date(today); exp.setDate(exp.getDate()-i); if(dates[i]===exp.getTime()) streak++; else break; }
  const stStreakEl = document.getElementById('st-streak');
  if (stStreakEl) stStreakEl.textContent = streak;
  if (workouts.length > 0) {
    const first = new Date(workouts[workouts.length-1].date);
    const stWeeksEl = document.getElementById('st-weeks');
    if (stWeeksEl) stWeeksEl.textContent = Math.max(1, Math.ceil((new Date()-first)/(7*24*60*60*1000)));
  }
  const avgSteps = steps.length ? Math.round(steps.slice(0,7).reduce((a,s)=>a+(+s.total||0),0)/Math.min(steps.length,7)) : 0;
  const stStepsEl = document.getElementById('st-steps');
  if (stStepsEl) stStepsEl.textContent = avgSteps > 999 ? (avgSteps/1000).toFixed(1)+'k' : avgSteps;
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
function nav(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('sec-'+id);
  if (s) s.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.textContent.toLowerCase().replace(/[^a-z]/g,'').includes(id.replace(/[^a-z]/g,'').slice(0,5))) b.classList.add('active');
  });
  if (id === 'dashboard') {
    renderLogSummary();
  }
  if (id === 'workout')  setTimeout(() => {
    const dateEl = document.getElementById('workout-date');
    if (dateEl && !dateEl.value) dateEl.value = localDateStr();
    const day = todayDayId();
    showWorkoutDay(day === 'sun' ? 'mon' : day);
  }, 50);
  if (id === 'profile')  setTimeout(loadProfilePage, 50);
  if (id === 'goals') {
    // Goals live inside the Profile section — redirect there and open goals subtab
    nav('profile');
    setTimeout(() => { if (typeof profileSubTab === 'function') profileSubTab('goals'); }, 150);
    return;
  }
  if (id === 'admin')   { /* manual load only */ }
  if (id === 'log')     { setTimeout(() => logTab('workout'), 50); loadWaterToday(); }
  if (id === 'exlib')   setTimeout(renderExLib, 50);
  if (id === 'food') {
    foodTab('recipes');
    if (!communityRecipes.length) loadFoodDatabase().then(renderRecipeViewer);
    else renderRecipeViewer();
  }
  window.scrollTo(0,0);
}

function logTab(t) {
  ['workout','steps','body','nutrition','history'].forEach(x => {
    const el = document.getElementById('log-'+x);
    if (el) el.style.display = x===t?'block':'none';
    const b = document.getElementById('lt-'+x);
    if(b) { b.className = x===t?'btn btn-p':'btn btn-s'; }
  });
  if (t==='workout') {
    // Sync date from workout page if a date was selected there
    const wkDate = document.getElementById('workout-date')?.value;
    const lDate  = document.getElementById('l-date');
    if (lDate && wkDate) lDate.value = wkDate;
    autoPopulateWorkoutLog();
  }
  if (t==='summary')   renderLogSummary();
  if (t==='history')   showHist('workout');
  if (t==='steps')     initLogStepsPanel();
  if (t==='body')      autoPopulateBodyLog();
  if (t==='nutrition') autoPopulateNutritionLog();
}

// ═══════════════════════════════════════════════════════════
// SYS CHECK
// ═══════════════════════════════════════════════════════════
async function runSysCheck() {
  const out = document.getElementById('syscheckOutput');
  if (!out) return;

  const setCard = (id, val, color) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = val; if (color) el.style.color = color; }
  };
  const setDot = (color, glow) => {
    const dot = document.getElementById('sc-db-dot');
    if (dot) { dot.style.background = color; dot.style.boxShadow = glow ? `0 0 8px ${color}` : 'none'; }
  };

  // Show loading immediately
  setDot('#ffaa00', true);
  setCard('sc-db-status', 'CHECKING...', '#ffaa00');
  setCard('sc-users', '…', '#ffaa00');
  setCard('sc-session', SESSION ? `@${SESSION.username}` : 'NONE', SESSION ? '#4caf50' : '#f44336');

  out.innerHTML = `<div style="padding:24px;text-align:center;font-family:var(--font-mono);font-size:0.72rem;color:var(--accent2);letter-spacing:.12em;">
    RUNNING DIAGNOSTICS…
  </div>`;

  const rows = [];
  const ok   = (label, detail) => rows.push({label, status:'ok',   color:'#4caf50', icon:'✓', detail});
  const fail = (label, detail) => rows.push({label, status:'err',  color:'#f44336', icon:'✗', detail});
  const warn = (label, detail) => rows.push({label, status:'warn', color:'#ff9800', icon:'⚠', detail});
  const info = (label, detail) => rows.push({label, status:'info', color:'#90a4ae', icon:'ℹ', detail});

  // ── 1. Firebase connection ──
  try {
    await db.collection('users').limit(1).get();
    setDot('#4caf50', true);
    setCard('sc-db-status', 'CONNECTED', '#4caf50');
    ok('Firebase connection', 'Firestore reachable — reads working');
  } catch(e) {
    setDot('#f44336', true);
    setCard('sc-db-status', 'FAILED', '#f44336');
    fail('Firebase connection', e.message);
  }

  // ── 2. Session ──
  if (SESSION) {
    ok('Active session', `@${SESSION.username} · ${SESSION.gender} · ${SESSION.isAdmin ? '★ ADMIN' : 'user'}`);
    ok('Encryption key', 'Session key in memory — data is protected');
    if (SESSION.email) info('Email on file', SESSION.email);
  } else {
    fail('Active session', 'No user logged in');
  }

  // ── 3. Remember me ──
  const tok = localStorage.getItem('op_session_token');
  if (tok) {
    try {
      const t = JSON.parse(tok);
      const days = Math.ceil((t.expires - Date.now()) / 86400000);
      days > 0 ? ok('Remember me token', `Active — expires in ${days} day${days!==1?'s':''}`) : warn('Remember me token', 'Expired — will be cleared on next login');
    } catch { warn('Remember me token', 'Stored but malformed'); }
  } else {
    info('Remember me token', 'Not set — "Remember me" was not checked at login');
  }

  // ── 4. User registry ──
  try {
    const users = await getUsers();
    const list = Object.entries(users);
    setCard('sc-users', list.length, '#4caf50');
    ok('User registry', `${list.length} user${list.length!==1?'s':''} registered in Firebase`);
    list.forEach(([uname, u]) => {
      ok(`  @${uname}`, `${u.displayName} · ${u.gender||'?'} · joined ${u.joinDate?u.joinDate.slice(0,10):'?'} · ${u.isAdmin?'★ ADMIN':'user'}${u.email?' · '+u.email:''}`);
    });
  } catch(e) {
    setCard('sc-users', 'ERR', '#f44336');
    fail('User registry', `Read failed: ${e.message}`);
  }

  // ── 5. Encrypted data ──
  if (SESSION) {
    let totalEntries = 0;
    for (const type of ['workout','steps','body','nutrition']) {
      try {
        const doc = await db.collection('userdata').doc(SESSION.username).collection(type).doc('entries').get();
        if (doc.exists) {
          const entries = await encryptedLoad(type);
          totalEntries += entries.length;
          ok(`Data · ${type}`, `${entries.length} entr${entries.length!==1?'ies':'y'} saved in Firebase`);
        } else {
          info(`Data · ${type}`, 'No entries yet');
        }
      } catch(e) {
        fail(`Data · ${type}`, `Error: ${e.message}`);
      }
    }
    // Workout checklist checks
    try {
      const today = localDateStr();
      const doc = await db.collection('userdata').doc(SESSION.username).collection('wkchecks').doc(today).get();
      doc.exists ? ok('Today\'s checklist', `Saved — day: ${doc.data().dayId||'?'}`) : info('Today\'s checklist', 'No workout started today');
    } catch(e) { warn('Today\'s checklist', `Read error: ${e.message}`); }
  }

  // ── Render ──
  const passed = rows.filter(r=>r.status==='ok').length;
  const failed = rows.filter(r=>r.status==='err').length;
  const summaryColor = failed > 0 ? '#f44336' : '#4caf50';
  const summaryText  = failed > 0 ? `${failed} ISSUE${failed>1?'S':''} DETECTED` : 'ALL SYSTEMS OPERATIONAL';

  out.innerHTML = `
    <div style="background:var(--bg2);border-left:4px solid ${summaryColor};padding:14px 18px;margin-bottom:16px;">
      <div style="font-family:var(--font-display);font-size:1.3rem;color:${summaryColor};letter-spacing:.06em;">${summaryText}</div>
      <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);margin-top:4px;">
        ${passed} passed · ${failed} failed · ${rows.length} checks · ${new Date().toLocaleTimeString()}
      </div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);">
      ${rows.map(r => `
        <div style="display:grid;grid-template-columns:16px 1fr;gap:12px;align-items:start;
          padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04);">
          <span style="color:${r.color};font-size:0.8rem;margin-top:1px;">${r.icon}</span>
          <div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:${r.status==='ok'?'var(--text)':r.color};margin-bottom:2px;">${r.label}</div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);line-height:1.5;">${r.detail}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

// Make everything globally available
window.navigateTo = navigateTo;
window.initializeApp = initializeApp;