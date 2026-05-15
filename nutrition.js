// =============================================
// nutrition.js - Nutrition Tracking
// =============================================

/*async function loadNutrition() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">NUTRI<br><span>TION</span></div>
        <div class="page-sub">// CALORIES • MACROS • MEAL LOGGING //</div>

        <div class="g2">
            <!-- Daily Summary -->
            <div class="card">
                <div class="card-label">TODAY'S TARGETS</div>
                <div style="display:flex;justify-content:space-around;margin:20px 0;">
                    <div style="text-align:center;">
                        <div class="stat-num" style="font-size:2.2rem;" id="cal-target">2400</div>
                        <div class="stat-label">KCAL</div>
                    </div>
                    <div style="text-align:center;">
                        <div class="stat-num" style="font-size:2.2rem;color:#4caf50;" id="prot-target">180</div>
                        <div class="stat-label">PROTEIN g</div>
                    </div>
                </div>
                <button class="btn btn-p" onclick="logMeal()" style="width:100%;">+ LOG MEAL</button>
            </div>

            <!-- Macro Breakdown -->
            <div class="card">
                <div class="card-label">MACRO SPLIT</div>
                <div class="card-title">CURRENT INTAKE</div>
                <div style="height:220px;margin:16px 0;">
                    <canvas id="macroChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Recent Meals -->
        <div class="card">
            <div class="card-label">RECENT MEALS</div>
            <div id="mealLog" style="max-height:420px;overflow-y:auto;"></div>
        </div>
    `;

    renderMacroChart();
    loadRecentMeals();
}

function renderMacroChart() {
    const ctx = document.getElementById('macroChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [180, 220, 80],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function logMeal() {
    const mealName = prompt("Meal name (e.g. Chicken Rice Bowl):");
    if (!mealName) return;

    const calories = prompt("Calories:", "650");
    if (calories === null) return;

    toast(`✅ Logged: ${mealName} — ${calories} kcal`, 2200);
    loadRecentMeals();
}

async function loadRecentMeals() {
    const container = document.getElementById('mealLog');
    if (!container) return;

    // Placeholder data
    container.innerHTML = `
        <div style="padding:12px;border-bottom:1px solid var(--border);">
            <strong>08:45</strong> — Protein Oatmeal <span style="color:#4caf50;float:right;">620 kcal</span>
        </div>
        <div style="padding:12px;border-bottom:1px solid var(--border);">
            <strong>13:20</strong> — Grilled Chicken + Rice <span style="color:#4caf50;float:right;">780 kcal</span>
        </div>
        <div style="padding:12px;">
            <strong>18:10</strong> — Salmon + Sweet Potato <span style="color:#4caf50;float:right;">710 kcal</span>
        </div>
    `;
}*/
// ═══════════════════════════════════════════════════════════
// FASTING SYSTEM
// ═══════════════════════════════════════════════════════════
const FAST_PROTOCOLS = [
  { id:'16-8',  label:'16:8',   hours:16, eatHours:8,  name:'Leangains 16:8',  desc:'16h fast · 8h eating window. Most researched protocol.', color:'#4a9eff' },
  { id:'18-6',  label:'18:6',   hours:18, eatHours:6,  name:'18:6',            desc:'18h fast · 6h eating window. Stronger autophagy than 16:8.', color:'#ff9800' },
  { id:'20-4',  label:'20:4',   hours:20, eatHours:4,  name:'Warrior Diet',    desc:'20h fast · 4h eating window. Aggressive fat loss phase.', color:'#ff7a1a' },
  { id:'omad',  label:'OMAD',   hours:23, eatHours:1,  name:'One Meal A Day',  desc:'One meal per day. Maximum autophagy stimulus.', color:'#e53935' },
  { id:'5-2',   label:'5:2',    hours:0,  eatHours:0,  name:'5:2 Method',      desc:'Normal eating 5 days · 500-600 cal on 2 non-consecutive days.', color:'#9c27b0' },
  { id:'24h',   label:'24H',    hours:24, eatHours:0,  name:'24-Hour Fast',    desc:'Full 24-hour fast. Strong metabolic reset.', color:'#e91e63' },
  { id:'48h',   label:'48H',    hours:48, eatHours:0,  name:'48-Hour Fast',    desc:'Two-day fast. Significant autophagy and growth hormone surge.', color:'#c2185b' },
  { id:'72h',   label:'72H',    hours:72, eatHours:0,  name:'72-Hour Fast',    desc:'Three-day fast. Maximum cellular autophagy and immune reset.', color:'#880e4f' },
  { id:'custom',label:'CUSTOM', hours:0,  eatHours:0,  name:'Custom',          desc:'Set your own fasting window.', color:'var(--border2)' },
];

const FAST_SCIENCE = {
  'focus-fatloss':  { best:'16:8 or 18:6', why:'Daily time-restricted eating reduces body weight 1-8% over 2-3 months (NEJM 2020). Consistent adherence is the key variable.' },
  'focus-visceral': { best:'18:6 or 20:4', why:'Longer fasting windows (18+ hours) increase insulin sensitivity and deplete liver glycogen more completely, forcing visceral fat oxidation. A 2023 study found 18+ hour fasts specifically reduce VFA.' },
  'focus-muscle':   { best:'16:8',         why:'16:8 preserves muscle mass IF protein targets (0.8-1g/lb) are met within the eating window. Longer fasts increase muscle protein breakdown. Eat most protein in the post-workout meal.' },
  'focus-general':  { best:'16:8',         why:'16:8 improves blood pressure, insulin sensitivity, and inflammatory markers in healthy adults even without caloric restriction (JAMA Internal Medicine, 2020).' },
  'focus-recomp':   { best:'16:8',         why:'Body recomposition works in a 16:8 window: the overnight fast allows growth hormone to peak (muscle repair) while fasted state in the morning aids fat oxidation.' },
};

const FAST_MILESTONES = [
  { hours:4,  label:'Blood sugar stabilises',    detail:'Insulin drops, glucagon rises. Body begins burning through liver glycogen stores.' },
  { hours:8,  label:'Glycogen depletion begins', detail:'Liver glycogen running low. Fat oxidation rate increasing.' },
  { hours:12, label:'Ketosis begins',            detail:'Liver glycogen mostly depleted. Ketone production starts. Brain beginning to shift toward fat-derived fuel.' },
  { hours:14, label:'Fat burning peaks',         detail:'Peak fat oxidation. Growth hormone beginning to rise. The metabolic sweet spot of 16:8 fasting.' },
  { hours:16, label:'16:8 target reached',       detail:'Most researched fasting window. Autophagy is active. Insulin at its lowest point in 16 hours.' },
  { hours:18, label:'Autophagy accelerates',     detail:'Cellular cleanup (autophagy) meaningfully elevated. This drives many longevity benefits of fasting.' },
  { hours:20, label:'20:4 target reached',       detail:'Significant ketone production. Mental clarity often peaks. GH surging - muscle preservation active.' },
  { hours:24, label:'24H - Full metabolic reset',detail:'Immune cell regeneration begins. Autophagy at ~300% above fed baseline. Gut rest allows mucosal healing.' },
  { hours:36, label:'Deep ketosis',              detail:'Brain running primarily on ketones. Hunger usually subsides. GH surges up to 5x baseline - protecting muscle.' },
  { hours:48, label:'48H - Immune reset',        detail:'White blood cell regeneration occurring. BDNF elevated - memory and focus enhanced.' },
  { hours:54, label:'Maximum autophagy',         detail:'Autophagy near-peak. Damaged cell components being aggressively cleared.' },
  { hours:72, label:'72H - Full cellular reboot',detail:'Stem cell activation. Immune system regeneration nearly complete. Re-feed carefully: broth then small meals.' },
];

let fastInterval    = null;
let fastState       = { active:false, startTime:null, targetHours:16, protocol:'16-8' };
let fastHistory     = [];
let fastSchedule    = {};
let selectedProtocol= '16-8';

async function loadFastHistory() {
  try {
    const doc = await db.collection('userdata').doc(SESSION.username).collection('fasting').doc('log').get();
    fastHistory = doc.exists ? (doc.data().entries||[]) : [];
    const stateDoc = await db.collection('userdata').doc(SESSION.username).collection('fasting').doc('state').get();
    if (stateDoc.exists) {
      const s = stateDoc.data();
      if (s.active && s.startTime) {
        fastState = { active:true, startTime:new Date(s.startTime), targetHours:s.targetHours||16, protocol:s.protocol||'16-8' };
        selectedProtocol = fastState.protocol;
      }
    }
    const schedDoc = await db.collection('userdata').doc(SESSION.username).collection('fasting').doc('schedule').get();
    if (schedDoc.exists) fastSchedule = schedDoc.data().schedule||{};
  } catch(e) { fastHistory=[]; }
}

async function saveFastState() {
  await db.collection('userdata').doc(SESSION.username).collection('fasting').doc('state').set({
    active: fastState.active,
    startTime: fastState.startTime ? new Date(fastState.startTime).toISOString() : null,
    targetHours: fastState.targetHours,
    protocol: fastState.protocol,
  });
}

async function saveFastHistory() {
  await db.collection('userdata').doc(SESSION.username).collection('fasting').doc('log')
    .set({ entries:fastHistory, updated:new Date().toISOString() });
}

async function saveFastSchedule() {
  const days = ['mon','tue','wed','thu','fri','sat','sun'];
  const sched = {};
  days.forEach(d => {
    const cb  = document.getElementById('fsched-fast-'+d);
    const sel = document.getElementById('fsched-proto-'+d);
    sched[d]  = { fast:cb?.checked||false, protocol:sel?.value||'16-8' };
  });
  fastSchedule = sched;
  await db.collection('userdata').doc(SESSION.username).collection('fasting').doc('schedule')
    .set({ schedule:sched, updated:new Date().toISOString() });
  const msg = document.getElementById('fastScheduleMsg');
  if (msg) { msg.style.color='#4caf50'; msg.textContent='SCHEDULE SAVED'; setTimeout(()=>msg.textContent='',2500); }
}

function initFastingTab() {
  const now = new Date();
  const dateEl = document.getElementById('fastStartDate');
  const timeEl = document.getElementById('fastStartTime');
  if (dateEl && !fastState.active) dateEl.value = localDateStr(now);
  if (timeEl && !fastState.active) timeEl.value = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');

  // Set defaults for the history add form
  const efStart = document.getElementById('editFastStartField');
  const efEnd   = document.getElementById('editFastEndField');
  if (efStart && !efStart.value) efStart.value = localDateStr(new Date(now-86400000))+'T22:00';
  if (efEnd   && !efEnd.value)   efEnd.value   = localDateStr(now)+'T18:00';

  // If active fast, show start fields from state
  if (fastState.active && fastState.startTime) {
    const st = new Date(fastState.startTime);
    if (dateEl) dateEl.value = localDateStr(st);
    if (timeEl) timeEl.value = String(st.getHours()).padStart(2,'0')+':'+String(st.getMinutes()).padStart(2,'0');
  }

  loadFastHistory().then(() => {
    renderFastProtocolBtns();
    renderFastScienceCard();
    renderFastHistory();
    renderFastStats();
    renderFastScheduleGrid();
    updateFastTimer();
    updateFastEndCalc();
    if (fastState.active) startFastInterval();
  });
}

function toggleFastEndRow() {
  const cb     = document.getElementById('fastSetEndTime');
  const endDate= document.getElementById('fastEndDate');
  const endTime= document.getElementById('fastEndTime');
  const logBtn = document.getElementById('fastLogBtn');
  if (!cb) return;
  const enabled = cb.checked;
  if (endDate) { endDate.disabled = !enabled; endDate.style.color = enabled ? 'var(--text)' : 'var(--text-dim)'; }
  if (endTime) { endTime.disabled = !enabled; endTime.style.color = enabled ? 'var(--text)' : 'var(--text-dim)'; }
  // If end time set and not active fast, show LOG button instead of START
  if (logBtn && !fastState.active) {
    logBtn.style.display = enabled ? '' : 'none';
    const startBtn = document.getElementById('fastStartBtn');
    if (startBtn) startBtn.style.display = enabled ? 'none' : '';
  }
  updateFastEndCalc();
}

function setFastEndNow() {
  const now = new Date();
  const cb     = document.getElementById('fastSetEndTime');
  const endDate= document.getElementById('fastEndDate');
  const endTime= document.getElementById('fastEndTime');
  if (cb)      cb.checked = true;
  if (endDate) { endDate.value = localDateStr(now); endDate.disabled = false; endDate.style.color = 'var(--text)'; }
  if (endTime) { endTime.value = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'); endTime.disabled = false; endTime.style.color = 'var(--text)'; }
  const logBtn  = document.getElementById('fastLogBtn');
  const startBtn= document.getElementById('fastStartBtn');
  if (logBtn && !fastState.active) logBtn.style.display = '';
  if (startBtn && !fastState.active) startBtn.style.display = 'none';
  updateFastEndCalc();
}

function fastTab(tab) {
  ['timer','schedule','log','science'].forEach(t => {
    const p = document.getElementById('fpanel-'+t);
    const b = document.getElementById('ftab-'+t);
    if (p) p.style.display = t===tab?'block':'none';
    if (b) b.className    = t===tab?'btn btn-p':'btn btn-s';
  });
  if (tab==='log')      { renderFastHistory(); renderFastStats(); }
  if (tab==='schedule') { renderFastScheduleGrid(); renderExtendedFastGuide(); }
  if (tab==='science')  renderFastScienceCard();
}

function renderFastProtocolBtns() {
  const el = document.getElementById('fastProtocolBtns');
  if (!el) return;
  el.innerHTML = FAST_PROTOCOLS.map(p => {
    const active = selectedProtocol === p.id;
    return '<button onclick="selectProtocol(\''+p.id+'\')" type="button" style="font-family:var(--font-mono);font-size:0.62rem;padding:5px 10px;cursor:pointer;background:'+(active?'var(--accent-dim)':'var(--bg3)')+';border:1px solid '+(active?p.color:'var(--border)')+';color:'+(active?p.color:'var(--text-dim)')+';">'+p.label+'</button>';
  }).join('');
  const proto = FAST_PROTOCOLS.find(p=>p.id===selectedProtocol)||FAST_PROTOCOLS[0];
  const customRow = document.getElementById('fastCustomRow');
  if (customRow) customRow.style.display = proto.id==='custom'?'block':'none';
  const eatEl = document.getElementById('fastEatingWindow');
  if (eatEl) {
    if (proto.eatHours > 0) {
      const timeEl = document.getElementById('fastStartTime');
      const startH = timeEl ? parseInt(timeEl.value.split(':')[0]) : 22;
      const eatStartH = (startH + proto.hours) % 24;
      const eatEndH   = (eatStartH + proto.eatHours) % 24;
      const fmt = h => (h%12||12)+':00 '+(h>=12?'PM':'AM');
      eatEl.innerHTML = '<span style="color:var(--accent2);">'+proto.name+':</span> '+proto.desc+'<br>Eating window: <strong style="color:var(--accent2);">'+fmt(eatStartH)+' – '+fmt(eatEndH)+'</strong>';
    } else {
      eatEl.innerHTML = proto.desc ? '<span style="color:var(--text-dim);">'+proto.desc+'</span>' : '';
    }
  }
  updateFastEndCalc();
}

function updateFastEndCalc() {
  const el = document.getElementById('fastEndCalc');
  if (!el) return;
  const dateEl = document.getElementById('fastStartDate');
  const timeEl = document.getElementById('fastStartTime');
  if (!dateEl?.value||!timeEl?.value) { el.textContent=''; return; }
  const hours = getProtocolHours();
  if (!hours) { el.textContent=''; return; }
  const start = parseDateTimeLocal(dateEl.value, timeEl.value);
  if (!start) { el.textContent=''; return; }
  const end   = new Date(start.getTime()+hours*3600000);
  const endStr = end.toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const nowDiff = (new Date()-start)/3600000;
  const already = nowDiff>0 ? ' ('+nowDiff.toFixed(1)+'h elapsed)' : '';
  el.innerHTML = '<span style="color:var(--accent2);">Target end: '+endStr+'</span><span style="color:var(--text-dim);">'+already+'</span>';
}

function setFastStartNow() {
  const now = new Date();
  const dateEl = document.getElementById('fastStartDate');
  const timeEl = document.getElementById('fastStartTime');
  if (dateEl) dateEl.value = localDateStr(now);
  if (timeEl) timeEl.value = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  updateFastEndCalc(); renderFastProtocolBtns();
}

function setFastStartYesterday() {
  const dateEl = document.getElementById('fastStartDate');
  const timeEl = document.getElementById('fastStartTime');
  if (dateEl) dateEl.value = localDateStr(new Date(Date.now()-86400000));
  if (timeEl) timeEl.value = '22:00';
  updateFastEndCalc(); renderFastProtocolBtns();
}

function selectProtocol(id) { selectedProtocol=id; renderFastProtocolBtns(); }

function getProtocolHours() {
  if (selectedProtocol==='custom') return parseFloat(document.getElementById('fastCustomHours')?.value)||16;
  return FAST_PROTOCOLS.find(p=>p.id===selectedProtocol)?.hours||16;
}

async function startFast() {
  if (fastState.active) return;
  const hours   = getProtocolHours();
  const dateEl  = document.getElementById('fastStartDate');
  const timeEl  = document.getElementById('fastStartTime');
  // Use parseDateTimeLocal to avoid UTC bug — overnight fasts span two calendar dates
  const startDT = parseDateTimeLocal(dateEl?.value, timeEl?.value) || new Date();
  fastState = { active:true, startTime:startDT, targetHours:hours, protocol:selectedProtocol };
  await saveFastState();
  updateFastTimer();
  startFastInterval();
  const isToday = startDT.toDateString() === new Date().toDateString();
  const started = !isToday
    ? ' (from '+startDT.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+')'
    : '';
  const msg = document.getElementById('fastMsg');
  if (msg) { msg.style.color='#4caf50'; msg.textContent='Fast started'+started+' — '+hours+'h target'; setTimeout(()=>msg.textContent='',5000); }
}

async function stopFast() {
  if (!fastState.active) return;
  const startTime = new Date(fastState.startTime);

  // Use the end-time fields if explicitly set, otherwise use now
  const cb      = document.getElementById('fastSetEndTime');
  const endDateEl = document.getElementById('fastEndDate');
  const endTimeEl = document.getElementById('fastEndTime');
  let end;
  if (cb?.checked && endDateEl?.value && endTimeEl?.value) {
    end = parseDateTimeLocal(endDateEl.value, endTimeEl.value);
    if (!end || end <= startTime) end = new Date(); // fallback if invalid
  } else {
    end = new Date();
  }

  const elapsedH  = (end-startTime)/3600000;
  const completed = elapsedH >= fastState.targetHours;
  const entry = {
    id:'fast_'+Date.now(), protocol:fastState.protocol,
    startTime:startTime.toISOString(), endTime:end.toISOString(),
    targetHours:fastState.targetHours, actualHours:parseFloat(elapsedH.toFixed(2)),
    completed, date:localDateStr(startTime),
  };
  fastHistory.unshift(entry);
  if (fastHistory.length>180) fastHistory=fastHistory.slice(0,180);
  const proto = selectedProtocol;
  fastState = { active:false, startTime:null, targetHours:16, protocol:proto };
  clearInterval(fastInterval); fastInterval=null;

  // Reset end-time checkbox
  if (cb) cb.checked = false;
  toggleFastEndRow();

  await saveFastState(); await saveFastHistory();
  updateFastTimer(); renderFastHistory(); renderFastStats();
  const msg = document.getElementById('fastMsg');
  if (msg) {
    msg.style.color = completed?'#4caf50':'#ff9800';
    msg.textContent = completed
      ? 'Fast complete — '+elapsedH.toFixed(1)+'h. Excellent work.'
      : 'Fast ended at '+elapsedH.toFixed(1)+'h of '+entry.targetHours+'h target.';
    setTimeout(()=>msg.textContent='',6000);
  }
}

// Log a complete fast using the start+end fields (no active state needed)
async function logFastWithTimes() {
  const dateEl  = document.getElementById('fastStartDate');
  const timeEl  = document.getElementById('fastStartTime');
  const endDateEl = document.getElementById('fastEndDate');
  const endTimeEl = document.getElementById('fastEndTime');
  const msg = document.getElementById('fastMsg');

  if (!dateEl?.value || !timeEl?.value) {
    if (msg) { msg.style.color='var(--danger)'; msg.textContent='SET A START DATE AND TIME FIRST'; }
    return;
  }
  if (!endDateEl?.value || !endTimeEl?.value) {
    if (msg) { msg.style.color='var(--danger)'; msg.textContent='SET AN END DATE AND TIME'; }
    return;
  }

  const start   = parseDateTimeLocal(dateEl?.value, timeEl?.value);
  const end     = parseDateTimeLocal(endDateEl?.value, endTimeEl?.value);
  if (!start || !end) {
    if (msg) { msg.style.color='var(--danger)'; msg.textContent='INVALID DATE OR TIME'; }
    return;
  }
  if (end <= start) {
    if (msg) { msg.style.color='var(--danger)'; msg.textContent='END TIME MUST BE AFTER START TIME — check the date too (overnight = end date is tomorrow)'; }
    return;
  }
  const elapsedH = (end-start)/3600000;
  const targetH  = getProtocolHours();
  const entry = {
    id: 'fast_'+Date.now(), protocol: selectedProtocol,
    startTime: start.toISOString(), endTime: end.toISOString(),
    targetHours: targetH, actualHours: parseFloat(elapsedH.toFixed(2)),
    completed: elapsedH >= targetH, date: localDateStr(start), retroactive: true,
  };
  fastHistory.unshift(entry);
  fastHistory.sort((a,b)=>new Date(b.startTime)-new Date(a.startTime));
  if (fastHistory.length>180) fastHistory=fastHistory.slice(0,180);
  await saveFastHistory();
  renderFastHistory(); renderFastStats();

  // Reset end fields
  const cb = document.getElementById('fastSetEndTime');
  if (cb) cb.checked = false;
  toggleFastEndRow();

  if (msg) {
    msg.style.color='#4caf50';
    msg.textContent='Fast logged — '+elapsedH.toFixed(1)+'h ('+start.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' to '+end.toLocaleString('en-US',{hour:'numeric',minute:'2-digit'})+')';
    setTimeout(()=>msg.textContent='',5000);
  }
}

let fastEditIdx = -1;

function editFastEntry(idx) {
  fastEditIdx = idx;
  const f = fastHistory[idx];
  if (!f) return;
  const startD = new Date(f.startTime);
  const endD   = new Date(f.endTime);

  const startEl = document.getElementById('editFastStartField');
  const endEl   = document.getElementById('editFastEndField');
  const protoEl = document.getElementById('editFastProtocol');
  const labelEl = document.getElementById('fastFormLabel');
  const cancelBtn = document.getElementById('fastHistoryCancelBtn');

  if (startEl) startEl.value = localDateTimeStr(startD);
  if (endEl)   endEl.value   = localDateTimeStr(endD);
  if (protoEl) protoEl.value = f.protocol;

  const proto = FAST_PROTOCOLS.find(p=>p.id===f.protocol);
  if (labelEl) labelEl.textContent = 'EDITING: ' + (proto?.name||f.protocol) + ' · ' + f.actualHours.toFixed(1) + 'h';
  if (labelEl) labelEl.style.color = '#ff9800';
  if (cancelBtn) cancelBtn.style.display = '';

  // Scroll the form into view
  document.getElementById('editFastStartField')?.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

async function saveHistoryEntry() {
  const startEl = document.getElementById('editFastStartField');
  const endEl   = document.getElementById('editFastEndField');
  const protoEl = document.getElementById('editFastProtocol');
  const msgEl   = document.getElementById('fastHistoryFormMsg');

  if (!startEl?.value) { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='START DATE/TIME REQUIRED';} return; }
  if (!endEl?.value)   { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='END DATE/TIME REQUIRED';}   return; }

  const start   = parseDateTimeLocalInput(startEl.value);
  const end     = parseDateTimeLocalInput(endEl.value);
  if (!start) { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='INVALID START DATE/TIME';} return; }
  if (!end)   { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='INVALID END DATE/TIME';}   return; }
  if (end <= start) { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='END MUST BE AFTER START — for overnight fasts set END DATE to the next day';} return; }

  const proto    = protoEl?.value || '16-8';
  const elapsedH = (end-start)/3600000;
  const targetH  = FAST_PROTOCOLS.find(p=>p.id===proto)?.hours || elapsedH;

  const isEditing = fastEditIdx >= 0; // capture BEFORE cancelHistoryEdit resets it
  const entry = {
    id: isEditing ? fastHistory[fastEditIdx].id : 'fast_'+Date.now(),
    protocol: proto,
    startTime: start.toISOString(), endTime: end.toISOString(),
    targetHours: targetH, actualHours: parseFloat(elapsedH.toFixed(2)),
    completed: elapsedH >= targetH, date: localDateStr(start), retroactive: true,
  };

  if (isEditing) {
    fastHistory[fastEditIdx] = entry;
  } else {
    fastHistory.unshift(entry);
  }
  fastHistory.sort((a,b)=>new Date(b.startTime)-new Date(a.startTime));
  if (fastHistory.length>180) fastHistory=fastHistory.slice(0,180);

  await saveFastHistory();
  cancelHistoryEdit();
  renderFastHistory(); renderFastStats();

  if (msgEl) {
    msgEl.style.color='#4caf50';
    msgEl.textContent = (isEditing ? 'Updated' : 'Added') + ' — ' + elapsedH.toFixed(1) + 'h fast on ' + localDateStr(start);
    setTimeout(()=>msgEl.textContent='',3000);
  }
}

function cancelHistoryEdit() {
  fastEditIdx = -1;
  const labelEl = document.getElementById('fastFormLabel');
  const cancelBtn = document.getElementById('fastHistoryCancelBtn');
  if (labelEl) { labelEl.textContent='+ ADD A FAST'; labelEl.style.color='var(--accent2)'; }
  if (cancelBtn) cancelBtn.style.display = 'none';
  // Clear fields
  const startEl = document.getElementById('editFastStartField');
  const endEl   = document.getElementById('editFastEndField');
  const now = new Date();
  if (startEl) startEl.value = localDateStr(new Date(now-86400000))+'T22:00';
  if (endEl)   endEl.value   = localDateStr(now)+'T18:00';
  const protoEl = document.getElementById('editFastProtocol');
  if (protoEl) protoEl.value = '16-8';
}

async function logPastFast() {
  const startEl = document.getElementById('pastFastStart');
  const endEl   = document.getElementById('pastFastEnd');
  const protoEl = document.getElementById('pastFastProtocol');
  const msgEl   = document.getElementById('pastFastMsg');
  if (!startEl?.value||!endEl?.value) {
    if (msgEl) { msgEl.style.color='var(--danger)'; msgEl.textContent='START AND END TIME REQUIRED'; } return;
  }
  const start   = parseDateTimeLocalInput(startEl.value);
  const end     = parseDateTimeLocalInput(endEl.value);
  if (!start||!end) { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='INVALID DATE/TIME';} return; }
  if (end<=start) { if(msgEl){msgEl.style.color='var(--danger)';msgEl.textContent='END MUST BE AFTER START — for overnight fasts set END to the next day';} return; }
  const elapsedH= (end-start)/3600000;
  const proto   = protoEl?.value||'custom';
  const targetH = FAST_PROTOCOLS.find(p=>p.id===proto)?.hours||elapsedH;
  const entry   = {
    id:'fast_'+Date.now(), protocol:proto,
    startTime:start.toISOString(), endTime:end.toISOString(),
    targetHours:targetH, actualHours:parseFloat(elapsedH.toFixed(2)),
    completed:elapsedH>=targetH, date:localDateStr(start), retroactive:true,
  };
  fastHistory.unshift(entry);
  fastHistory.sort((a,b)=>new Date(b.startTime)-new Date(a.startTime));
  if (fastHistory.length>180) fastHistory=fastHistory.slice(0,180);
  await saveFastHistory();
  renderFastHistory(); renderFastStats();
  if (msgEl) { msgEl.style.color='#4caf50'; msgEl.textContent='Past fast logged — '+elapsedH.toFixed(1)+'h on '+localDateStr(start); setTimeout(()=>msgEl.textContent='',3000); }
}

async function clearFastHistory() {
  if (!confirm('Clear all fasting history? This cannot be undone.')) return;
  fastHistory=[];
  await saveFastHistory();
  renderFastHistory(); renderFastStats();
}

async function deleteFastEntry(idx) {
  fastHistory.splice(idx,1);
  await saveFastHistory();
  renderFastHistory(); renderFastStats();
}

function startFastInterval() { clearInterval(fastInterval); fastInterval=setInterval(updateFastTimer,1000); }

function updateFastTimer() {
  const timerEl=document.getElementById('fastTimerDisplay'), subEl=document.getElementById('fastTimerSub');
  const statusEl=document.getElementById('fastStatusLabel'), pctEl=document.getElementById('fastPctDisplay');
  const milestoneEl=document.getElementById('fastMilestoneDisplay'), ring=document.getElementById('fastRingFill');
  const startBtn=document.getElementById('fastStartBtn'), stopBtn=document.getElementById('fastStopBtn');
  if (!timerEl) return;
  if (!fastState.active) {
    timerEl.textContent='0:00:00'; timerEl.style.color='var(--text-dim)';
    if(subEl) subEl.textContent='NOT FASTING';
    if(statusEl) statusEl.textContent='NO ACTIVE FAST';
    if(pctEl) pctEl.textContent='';
    if(milestoneEl) milestoneEl.textContent='';
    if(ring){ring.style.strokeDashoffset='364.4';ring.style.stroke='var(--border2)';}
    if(startBtn) startBtn.style.display=''; if(stopBtn) stopBtn.style.display='none'; return;
  }
  if(startBtn) startBtn.style.display='none'; if(stopBtn) stopBtn.style.display='';
  const now=new Date(), startTime=new Date(fastState.startTime);
  const elapsedMs=now-startTime, elapsedH=elapsedMs/3600000;
  const targetH=fastState.targetHours, pct=Math.min(1,elapsedH/targetH);
  const remaining=Math.max(0,targetH-elapsedH);
  const ts=Math.floor(Math.abs(elapsedMs)/1000);
  timerEl.textContent=Math.floor(ts/3600)+':'+String(Math.floor((ts%3600)/60)).padStart(2,'0')+':'+String(ts%60).padStart(2,'0');
  timerEl.style.color=pct>=1?'#4caf50':'var(--accent2)';
  if(subEl) subEl.textContent=pct>=1?'GOAL REACHED':'ELAPSED';
  if(statusEl) {
    if(pct>=1) statusEl.textContent='FAST COMPLETE — TAP END FAST TO LOG';
    else { const rH=Math.floor(remaining),rM=Math.round((remaining-rH)*60); statusEl.textContent='FASTING — '+rH+'h '+rM+'m remaining'; }
  }
  if(pctEl) pctEl.textContent=Math.round(pct*100)+'% of '+targetH+'h goal';
  if(milestoneEl) {
    const last=[...FAST_MILESTONES].reverse().find(ms=>ms.hours<=elapsedH);
    const next=FAST_MILESTONES.find(ms=>ms.hours>elapsedH);
    let txt='';
    if(last) txt='<span style="color:#4caf50;">'+last.label+'</span>';
    if(next) { const d=next.hours-elapsedH; const dh=Math.floor(d),dm=Math.round((d-dh)*60); txt+=(last?' · ':'')+'Next: <span style="color:var(--accent2);">'+next.label+'</span> in '+dh+'h '+dm+'m'; }
    milestoneEl.innerHTML=txt;
  }
  if(ring){const c=364.4;ring.style.strokeDashoffset=String(c*(1-pct));ring.style.stroke=pct>=1?'#4caf50':'var(--accent2)';}
}

function renderFastHistory() {
  const el=document.getElementById('fastHistoryList'); if(!el) return;
  renderFastStreak();
  if(!fastHistory.length){el.innerHTML='<div style="color:var(--text-dim);padding:8px 0;">No fasts logged yet. Start your first fast on the TIMER tab.</div>';return;}
  el.innerHTML=fastHistory.slice(0,60).map((f,i)=>{
    const proto=FAST_PROTOCOLS.find(p=>p.id===f.protocol);
    const sD=new Date(f.startTime), eD=new Date(f.endTime);
    const sStr=sD.toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    const eStr=eD.toLocaleString('en-US',{hour:'numeric',minute:'2-digit'});
    const icon = f.completed ? '✅' : '⚪';
    const retro = f.retroactive ? `<span style="font-size:0.55rem;color:var(--border2);"> (edited)</span>` : '';
    return `<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 0;
      border-bottom:1px solid rgba(255,255,255,0.05);">
      <div style="font-size:1rem;flex-shrink:0;margin-top:1px;">${icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:var(--font-mono);font-size:0.65rem;
          color:${f.completed?'var(--accent2)':'var(--text)'};">
          ${proto?.name||f.protocol} · ${f.actualHours.toFixed(1)}h${retro}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-top:2px;">
          ${sStr} → ${eStr}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.57rem;margin-top:2px;
          color:${f.completed?'#4caf50':'#ff9800'};">
          ${f.completed?'Completed ✓':'Partial — '+f.actualHours.toFixed(1)+'/'+f.targetHours+'h'}
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        <button onclick="editFastEntry(${i})"
          title="Edit this fast"
          style="font-family:var(--font-mono);font-size:0.6rem;background:var(--bg3);
          border:1px solid var(--border);color:var(--accent2);cursor:pointer;padding:3px 8px;">✎ EDIT</button>
        <button onclick="deleteFastEntry(${i})"
          style="font-family:var(--font-mono);font-size:0.6rem;background:none;
          border:none;color:var(--border2);cursor:pointer;padding:3px 5px;">✕</button>
      </div>
    </div>`;
  }).join('');
}

function renderFastStreak() {
  const numEl=document.getElementById('fastStreakNum'), detailEl=document.getElementById('fastStreakDetail');
  const completedDates=[...new Set(fastHistory.filter(f=>f.completed).map(f=>f.date))].sort().reverse();
  let streak=0;
  const today=localDateStr(), yest=localDateStr(new Date(Date.now()-86400000));
  if(completedDates.length&&(completedDates[0]===today||completedDates[0]===yest)){
    streak=1;
    for(let i=1;i<completedDates.length;i++){
      if(completedDates[i]===localDateStr(new Date(new Date(completedDates[i-1]).getTime()-86400000))) streak++;
      else break;
    }
  }
  if(numEl) numEl.textContent=streak;
  if(detailEl) detailEl.textContent=streak>0?streak+' consecutive day'+(streak!==1?'s':'')+' with a completed fast':'Complete a fast to start your streak';
}

function renderFastStats() {
  const el=document.getElementById('fastStatsGrid'); if(!el) return;
  if(!fastHistory.length){el.innerHTML='<div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);">No fasts yet.</div>';return;}
  const completed=fastHistory.filter(f=>f.completed);
  const totalH=fastHistory.reduce((s,f)=>s+f.actualHours,0);
  const avgH=totalH/fastHistory.length;
  const longest=fastHistory.reduce((b,f)=>f.actualHours>b.actualHours?f:b,fastHistory[0]);
  const compRate=Math.round(completed.length/fastHistory.length*100);
  const thisWeek=fastHistory.filter(f=>(new Date()-new Date(f.startTime))<7*86400000).length;
  const stats=[
    {label:'TOTAL FASTS',val:fastHistory.length},
    {label:'COMPLETED',val:completed.length+' ('+compRate+'%)'},
    {label:'TOTAL HOURS',val:totalH.toFixed(1)+'h'},
    {label:'AVG DURATION',val:avgH.toFixed(1)+'h'},
    {label:'LONGEST',val:longest.actualHours.toFixed(1)+'h'},
    {label:'THIS WEEK',val:thisWeek+' fast'+(thisWeek!==1?'s':'')},
  ];
  el.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'+stats.map(s=>'<div style="text-align:center;padding:10px;background:var(--bg3);border:1px solid var(--border);"><div style="font-family:var(--font-mono);font-size:0.52rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">'+s.label+'</div><div style="font-family:var(--font-display);font-size:1.2rem;color:var(--accent2);">'+s.val+'</div></div>').join('')+'</div>';
}

function renderFastScheduleGrid() {
  const el=document.getElementById('fastScheduleGrid'); if(!el) return;
  const days=[{id:'mon',label:'Monday'},{id:'tue',label:'Tuesday'},{id:'wed',label:'Wednesday'},{id:'thu',label:'Thursday'},{id:'fri',label:'Friday'},{id:'sat',label:'Saturday'},{id:'sun',label:'Sunday'}];
  const protoOpts=FAST_PROTOCOLS.filter(p=>p.id!=='custom').map(p=>'<option value="'+p.id+'">'+p.label+' - '+p.name+'</option>').join('');
  el.innerHTML=days.map(d=>{
    const sched=fastSchedule[d.id]||{};
    const isFast=sched.fast||false, proto=sched.protocol||'16-8';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);flex-wrap:wrap;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-family:var(--font-mono);font-size:0.65rem;color:var(--text);width:90px;flex-shrink:0;"><input type="checkbox" id="fsched-fast-'+d.id+'" '+(isFast?'checked':'')+' style="accent-color:var(--accent);" onchange="renderFastScheduleRow(\''+d.id+'\')">'+d.label+'</label><select id="fsched-proto-'+d.id+'" style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);font-size:0.6rem;padding:5px 7px;outline:none;display:'+(isFast?'block':'none')+';">'+protoOpts+'</select></div>';
  }).join('');
  days.forEach(d=>{const sel=document.getElementById('fsched-proto-'+d.id);if(sel)sel.value=fastSchedule[d.id]?.protocol||'16-8';});
}

function renderFastScheduleRow(dayId) {
  const cb=document.getElementById('fsched-fast-'+dayId), sel=document.getElementById('fsched-proto-'+dayId);
  if(sel) sel.style.display=cb?.checked?'block':'none';
}

function renderExtendedFastGuide() {
  const el=document.getElementById('extendedFastGuide'); if(!el) return;
  const guides=[
    { label:'24-Hour Fast', phases:[
      {time:'0-8h',color:'#4a9eff',what:'Blood sugar drops, glycogen depleting. Fat oxidation begins.'},
      {time:'8-16h',color:'#ff9800',what:'Ketosis begins. Fat burning increases. Hunger may peak then subside as ghrelin adapts.'},
      {time:'16-24h',color:'#ff7a1a',what:'Full ketosis. Autophagy active. Many report mental clarity and reduced hunger past the 20h mark.'},
    ], tips:['Break fast with bone broth, eggs, or light protein — not a large meal.','Electrolytes (sodium, potassium, magnesium) prevent headaches.','Avoid intense training — light walking only.'],
    expect:'Most find 20-24h surprisingly manageable. Hunger paradoxically decreases past 16-18h as ghrelin drops.' },
    { label:'48-Hour Fast', phases:[
      {time:'24-36h',color:'#e91e63',what:'Deep ketosis. Growth hormone surging (up to 5x baseline). Muscle protected by GH even without food.'},
      {time:'36-48h',color:'#c2185b',what:'Autophagy near-peak. BDNF elevated — cognitive enhancement. Immune cell regeneration beginning.'},
    ], tips:['Sleep through as much of day 2 as possible.','Sparkling water with electrolytes are your allies.','Monitor for dizziness — rest if needed.','Re-feed: bone broth first, small protein meal after 2h, then normal eating.'],
    expect:'Day 2 morning is often hardest. After 36h, most feel surprisingly energetic. Re-feeding protocol is critical — do not eat a large meal.' },
    { label:'72-Hour Fast', phases:[
      {time:'48-60h',color:'#880e4f',what:'Stem cell activation. Maximum autophagy window. Significant immune system regeneration.'},
      {time:'60-72h',color:'#4a148c',what:'Full cellular reboot. Gut mucosal healing. Insulin sensitivity dramatically improved.'},
    ], tips:['Only attempt after successful 24-48h fasts.','Medical supervision recommended with any health conditions.','Re-feed carefully over 24h: broth, then soft foods, then normal meals.','Take electrolytes every 4-6 hours.','No exercise on day 3.'],
    expect:'72h fasts are a serious intervention. Immune reset comes from IGF-1 suppression and stem cell-driven regeneration (Valter Longo research). Use at most once per quarter.' },
  ];
  el.innerHTML=guides.map(g=>'<div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.06);"><div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent2);font-weight:bold;margin-bottom:10px;">'+g.label+'</div>'+g.phases.map(ph=>'<div style="display:flex;gap:10px;margin-bottom:6px;"><span style="font-family:var(--font-mono);font-size:0.58rem;color:'+ph.color+';white-space:nowrap;width:60px;flex-shrink:0;">'+ph.time+'</span><span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text);line-height:1.5;">'+ph.what+'</span></div>').join('')+'<div style="margin-top:8px;padding:8px 10px;background:var(--bg3);border-left:3px solid var(--accent2);margin-bottom:8px;"><div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);letter-spacing:.1em;margin-bottom:4px;">WHAT TO EXPECT</div><div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);line-height:1.6;">'+g.expect+'</div></div>'+g.tips.map(t=>'<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);line-height:1.6;">&#9658; '+t+'</div>').join('')+'</div>').join('');
}

function renderFastScienceCard() {
  const el=document.getElementById('fastScienceCard'); if(!el) return;
  const priority=userGoals?.focusPriority||[];
  let scienceEntry=null;
  for(const fid of priority){if(FAST_SCIENCE[fid]){scienceEntry={...FAST_SCIENCE[fid],goal:GOAL_ACTIONS?.[fid]?.label||fid};break;}}
  const rows=[
    {proto:'16:8',best:'Fat loss, general health, muscle retention, beginners',science:'Most studied TRF protocol. Meta-analyses show consistent improvements in BMI, blood pressure, and insulin sensitivity.'},
    {proto:'18:6',best:'Fat loss, visceral fat, metabolic health',science:'Stronger autophagy signal. Associated with greater insulin sensitivity improvements and visceral fat reduction.'},
    {proto:'20:4 (Warrior)',best:'Aggressive fat loss, mental clarity',science:'Significant metabolic effect but difficult to meet protein targets. Best for short-term fat loss phases.'},
    {proto:'OMAD',best:'Maximum autophagy, advanced practitioners',science:'Not recommended for muscle-building goals. Risk of nutrient deficiency. Very effective for fat loss when managed carefully.'},
    {proto:'5:2',best:'Those who struggle with daily restriction',science:'Research shows equivalent fat loss to daily restriction with significantly better long-term adherence.'},
    {proto:'24H / 48H / 72H',best:'Periodic deep fasts for metabolic reset',science:'Longer fasts produce exponentially greater autophagy, immune regeneration, and growth hormone elevation. Not for weekly use.'},
  ];
  el.innerHTML=(scienceEntry?'<div style="padding:10px 12px;background:var(--accent-dim);border:1px solid var(--accent2);font-family:var(--font-mono);font-size:0.62rem;color:var(--text);line-height:1.7;margin-bottom:12px;"><div style="color:var(--accent2);font-weight:bold;margin-bottom:4px;">FOR YOUR GOAL: '+scienceEntry.goal.toUpperCase()+'</div><div><strong style="color:var(--accent2);">Best protocol:</strong> '+scienceEntry.best+'</div><div style="margin-top:4px;color:var(--text-dim);">'+scienceEntry.why+'</div></div>':'')+rows.map(r=>'<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent2);margin-bottom:2px;">'+r.proto+'</div><div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text);margin-bottom:2px;">Best for: '+r.best+'</div><div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);line-height:1.5;">'+r.science+'</div></div>').join('');
}

// ═══════════════════════════════════════════════════════════
// RESTAURANT MEALS
// ═══════════════════════════════════════════════════════════
let restaurantDb = []; // [{restaurant, meal, calories, protein, carbs, fat, fiber, sodium, addedAt}]

// ─── Water / Hydration ─────────────────────────────────────
let waterOzToday = 0;

function updateWaterDisplay() {
  const goal = userGoals?.waterGoal || 96;
  const pct  = Math.min(100, Math.round(waterOzToday / goal * 100));
  const total  = document.getElementById('water-total-display');
  const goalEl = document.getElementById('water-goal-display');
  const goalLbl= document.getElementById('water-goal-label');
  const bar    = document.getElementById('water-progress-bar');
  if (total)   total.textContent   = waterOzToday;
  if (goalEl)  goalEl.textContent  = goal;
  if (goalLbl) goalLbl.textContent = `${goal} oz (${(goal * 0.02957).toFixed(1)} L)`;
  if (bar)     bar.style.width     = pct + '%';
  if (bar)     bar.style.background = pct >= 100 ? '#4caf50' : '#64b5f6';
}

async function addWater(oz) {
  waterOzToday += oz;
  updateWaterDisplay();
  await saveWaterToday();
  toast(`+${oz}oz water — ${waterOzToday}oz total`);
}

async function addWaterCustom() {
  const el = document.getElementById('water-custom-oz');
  const oz = parseFloat(el?.value) || 0;
  if (!oz || oz <= 0) { toast('Enter a valid amount'); return; }
  waterOzToday += oz;
  if (el) el.value = '';
  updateWaterDisplay();
  await saveWaterToday();
  toast(`+${oz}oz water — ${waterOzToday}oz total`);
}

async function resetWater() {
  if (!confirm('Reset today\'s water intake to 0?')) return;
  waterOzToday = 0;
  updateWaterDisplay();
  await saveWaterToday();
  toast('Water reset');
}

async function saveWaterToday() {
  const today = localDateStr();
  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('waterlog').doc(today)
      .set({ oz: waterOzToday, date: today, updated: new Date().toISOString() });
  } catch(e) { console.error('Water save error:', e); }
}

async function loadWaterToday() {
  const today = localDateStr();
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('waterlog').doc(today).get();
    waterOzToday = doc.exists ? (doc.data().oz || 0) : 0;
  } catch(e) { waterOzToday = 0; }
  updateWaterDisplay();
}

async function loadRestaurantDb() {
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('restaurant').doc('meals').get();
    restaurantDb = doc.exists ? (doc.data().meals || []) : [];
  } catch(e) { restaurantDb = []; }
}

async function saveRestaurantDb() {
  await db.collection('userdata').doc(SESSION.username)
    .collection('restaurant').doc('meals').set({ meals: restaurantDb, updated: new Date().toISOString() });
}

function filterRestaurantSuggestions() {
  const q = (document.getElementById('rest-name')?.value || '').toLowerCase();
  const box = document.getElementById('rest-name-suggestions');
  if (!box) return;
  if (!q || q.length < 1) { box.style.display = 'none'; return; }
  const names = [...new Set(restaurantDb.map(r => r.restaurant).filter(n => n.toLowerCase().includes(q)))].slice(0, 6);
  if (!names.length) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  box.innerHTML = names.map(n =>
    `<div onclick="selectRestaurant('${n.replace(/'/g,"\\'")}'); this.parentElement.style.display='none';"
      style="padding:7px 12px;font-family:var(--font-mono);font-size:0.68rem;color:var(--text);
      cursor:pointer;border-bottom:1px solid var(--border);"
      onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">${n}</div>`
  ).join('');
}

function selectRestaurant(name) {
  const el = document.getElementById('rest-name');
  if (el) el.value = name;
  filterMealSuggestions();
}

function filterMealSuggestions() {
  const restName = (document.getElementById('rest-name')?.value || '').toLowerCase();
  const q        = (document.getElementById('rest-meal')?.value  || '').toLowerCase();
  const box      = document.getElementById('rest-meal-suggestions');
  if (!box) return;
  if (!q || q.length < 1) { box.style.display = 'none'; return; }
  const matches = restaurantDb
    .filter(r => (!restName || r.restaurant.toLowerCase().includes(restName)) && r.meal.toLowerCase().includes(q))
    .slice(0, 6);
  if (!matches.length) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  box.innerHTML = matches.map(m =>
    `<div onclick="fillRestaurantForm(${JSON.stringify(m).replace(/"/g,'&quot;')}); this.parentElement.style.display='none';"
      style="padding:7px 12px;font-family:var(--font-mono);font-size:0.68rem;color:var(--text);
      cursor:pointer;border-bottom:1px solid var(--border);"
      onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
      <span style="color:var(--accent2);">${m.restaurant}</span> — ${m.meal}
      <span style="color:var(--text-dim);font-size:0.58rem;"> · ${m.calories} cal</span>
    </div>`
  ).join('');
}

function fillRestaurantForm(entry) {
  document.getElementById('rest-name').value    = entry.restaurant || '';
  document.getElementById('rest-meal').value    = entry.meal       || '';
  document.getElementById('rest-cal').value     = entry.calories   || '';
  document.getElementById('rest-protein').value = entry.protein    || '';
  document.getElementById('rest-carbs').value   = entry.carbs      || '';
  document.getElementById('rest-fat').value     = entry.fat        || '';
  document.getElementById('rest-fiber').value   = entry.fiber      || '';
  document.getElementById('rest-sodium').value  = entry.sodium     || '';
}

function clearRestaurantForm() {
  ['rest-name','rest-meal','rest-cal','rest-protein','rest-carbs','rest-fat','rest-fiber','rest-sodium']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('rest-msg').textContent = '';
}

async function logRestaurantMeal() {
  const msg = document.getElementById('rest-msg');
  const restaurant = document.getElementById('rest-name')?.value.trim();
  const meal       = document.getElementById('rest-meal')?.value.trim();
  const calories   = parseFloat(document.getElementById('rest-cal')?.value)     || 0;
  const protein    = parseFloat(document.getElementById('rest-protein')?.value) || 0;
  const carbs      = parseFloat(document.getElementById('rest-carbs')?.value)   || 0;
  const fat        = parseFloat(document.getElementById('rest-fat')?.value)     || 0;
  const fiber      = parseFloat(document.getElementById('rest-fiber')?.value)   || 0;
  const sodium     = parseFloat(document.getElementById('rest-sodium')?.value)  || 0;
  const mealtype   = document.getElementById('rest-mealtype')?.value || 'lunch';
  const cuisine    = document.getElementById('rest-cuisine')?.value  || '';
  const saveToDb   = document.getElementById('rest-save-db')?.checked;

  if (!restaurant) { msg.style.color='var(--danger)'; msg.textContent='RESTAURANT NAME REQUIRED'; return; }
  if (!meal)       { msg.style.color='var(--danger)'; msg.textContent='MEAL NAME REQUIRED'; return; }
  if (!calories)   { msg.style.color='var(--danger)'; msg.textContent='CALORIES REQUIRED'; return; }

  msg.style.color = 'var(--accent2)'; msg.textContent = 'SAVING...';

  try {
    const dateStr = document.getElementById('n-date')?.value || localDateStr();
    const entry = { restaurant, meal, calories, protein, carbs, fat, fiber, sodium, mealtype, cuisine,
      source: 'restaurant', saved: new Date().toISOString() };

    // Log as a nutrition entry for the day
    const existing = await encryptedLoad('nutrition');
    const dayEntries = existing.filter(e => e.date === dateStr);
    const newEntry   = { ...entry, date: dateStr, id: 'rest_' + Date.now() };
    await encryptedSave('nutrition', [...existing, newEntry]);

    // Save to personal restaurant DB
    if (saveToDb) {
      if (!restaurantDb) restaurantDb = [];
      // Update existing or add new
      const existIdx = restaurantDb.findIndex(r =>
        r.restaurant.toLowerCase() === restaurant.toLowerCase() && r.meal.toLowerCase() === meal.toLowerCase()
      );
      const dbEntry = { restaurant, meal, calories, protein, carbs, fat, fiber, sodium, addedAt: new Date().toISOString() };
      if (existIdx >= 0) restaurantDb[existIdx] = dbEntry;
      else restaurantDb.unshift(dbEntry);
      // Keep max 200 entries
      if (restaurantDb.length > 200) restaurantDb = restaurantDb.slice(0, 200);
      await saveRestaurantDb();
      renderRestaurantDb();
    }

    msg.style.color = '#4caf50';
    msg.textContent = `✓ LOGGED — ${calories} cal · ${protein}g protein`;
    setTimeout(() => { msg.textContent = ''; clearRestaurantForm(); }, 2500);
    renderRestaurantTodaySummary(dateStr);
  } catch(e) {
    msg.style.color = 'var(--danger)'; msg.textContent = 'ERROR: ' + e.message;
  }
}

function renderRestaurantDb() {
  const el = document.getElementById('rest-db-list');
  if (!el) return;
  const q       = (document.getElementById('rest-db-search')?.value || '').toLowerCase();
  const cuisine = (document.getElementById('rest-db-cuisine')?.value || '');
  const items   = restaurantDb.filter(r =>
    (!q || r.restaurant.toLowerCase().includes(q) || r.meal.toLowerCase().includes(q)) &&
    (!cuisine || (r.cuisine||'') === cuisine)
  );
  if (!items.length) {
    el.innerHTML = `<div style="color:var(--text-dim);padding:8px 0;">No saved meals${cuisine||q?' matching filters':' yet. Log a restaurant meal above and check "Save to database".'}</div>`;
    return;
  }
  const CUISINE_EMOJI = {
    american:'🇺🇸',mexican:'🌮',italian:'🍝',mediterranean:'🫒',asian:'🥢',
    japanese:'🍜',chinese:'🥟',indian:'🍛',thai:'🌶',greek:'🫙',
    french:'🥖',middle_eastern:'🧆',korean:'🍱',bbq:'🔥',other_cuisine:'🌍'
  };
  el.innerHTML = items.map((r, i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;
      border-bottom:1px solid rgba(255,255,255,0.05);flex-wrap:wrap;">
      <div style="flex:1;min-width:160px;">
        <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent2);">
          ${r.restaurant}${r.cuisine?` <span style="font-size:0.5rem;color:var(--text-dim);">${CUISINE_EMOJI[r.cuisine]||'🌍'} ${r.cuisine}</span>`:''}
        </div>
        <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text);">${r.meal}</div>
        <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);">
          ${r.calories} cal · P:${r.protein||0}g · C:${r.carbs||0}g · F:${r.fat||0}g
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button onclick="fillRestaurantForm(${JSON.stringify(r).replace(/"/g,'&quot;')})"
          class="btn btn-s" style="font-size:0.58rem;padding:3px 8px;">FILL FORM</button>
        <button onclick="deleteRestaurantEntry(${i})"
          style="font-family:var(--font-mono);font-size:0.68rem;background:none;border:none;
          color:var(--danger);cursor:pointer;padding:2px 4px;">✕</button>
      </div>
    </div>`).join('');
}

async function deleteRestaurantEntry(idx) {
  if (!confirm('Remove this meal from your database?')) return;
  restaurantDb.splice(idx, 1);
  await saveRestaurantDb();
  renderRestaurantDb();
}

async function renderRestaurantTodaySummary(dateStr) {
  const card = document.getElementById('rest-today-card');
  const el   = document.getElementById('rest-today-summary');
  if (!card || !el) return;
  try {
    const entries = await encryptedLoad('nutrition');
    const restToday = entries.filter(e => e.date === dateStr && e.source === 'restaurant');
    if (!restToday.length) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    const totCal  = restToday.reduce((s,e) => s + (e.calories||0), 0);
    const totProt = restToday.reduce((s,e) => s + (e.protein||0),  0);
    const totCarb = restToday.reduce((s,e) => s + (e.carbs||0),    0);
    const totFat  = restToday.reduce((s,e) => s + (e.fat||0),      0);
    el.innerHTML = `
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:10px;">
        <div><div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--border2);">CALORIES</div>
          <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--accent2);">${totCal}</div></div>
        <div><div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--border2);">PROTEIN</div>
          <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text);">${totProt.toFixed(1)}g</div></div>
        <div><div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--border2);">CARBS</div>
          <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text);">${totCarb.toFixed(1)}g</div></div>
        <div><div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--border2);">FAT</div>
          <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text);">${totFat.toFixed(1)}g</div></div>
      </div>
      ${restToday.map(e => `
        <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);
          font-size:0.6rem;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
          <span style="color:var(--accent2);">${e.restaurant}</span>
          <span style="color:var(--text);">${e.meal}</span>
          <span style="color:var(--text-dim);">${e.calories} cal</span>
        </div>`).join('')}`;
  } catch(e) { card.style.display = 'none'; }
}

// ═══════════════════════════════════════════════════════════
// FOOD DATABASE — GitHub XLSX + custom entries
// ═══════════════════════════════════════════════════════════
let foodDatabase      = []; // [{name, serving, calories, protein, carbs, fat, fiber, sodium, keto, source}]
let activeMealTarget  = null;
let recipeIngredients = [];
let savedRecipes      = []; // personal — userdata/{u}/fooddb/recipes
let communityRecipes  = []; // shared   — fooddb/Recipes
let foodDbFilter = { search:'', keto:false, source:'all', category:'', cuisine:'' };

// ── Keto classification ──
// Keto = ≤10% of calories from carbs, and has some fat content
function isKeto(food) {
  const carbs = parseFloat(food.carbs)    || 0;
  const fat   = parseFloat(food.fat)      || 0;
  const cals  = parseFloat(food.calories) || 0;
  if (!cals) return false;
  return ((carbs * 4) / cals) <= 0.10 && fat > 0;
}

// ═══════════════════════════════════════════════════════════
// UNIT CONVERSION SYSTEM
// All values convert to grams for per-100g nutrition scaling.
// "piece" is intentionally kept separate — no volume conversion.
// ═══════════════════════════════════════════════════════════

// Base conversions: unit → grams
// Liquid volumes assume water density (1g/ml) as default.
// Foods that deviate (oil, honey, flour) use their own density multiplier.
const UNIT_TO_ML = {
  ml: 1, l: 1000,
  floz: 29.5735, cup: 236.588, tbsp: 14.7868, tsp: 4.92892,
  pint: 473.176, quart: 946.353,
};
const UNIT_TO_G_SOLID = {
  g: 1, kg: 1000,
  oz: 28.3495, lb: 453.592,
  mg: 0.001,
};

// Density table (g/ml) for common ingredients — used when converting volume → grams
// Everything not listed defaults to 1.0 (water density)
const FOOD_DENSITY = {
  // Oils & fats
  'olive oil': 0.91, 'vegetable oil': 0.92, 'coconut oil': 0.92,
  'butter': 0.91, 'ghee': 0.91,
  // Sweeteners
  'honey': 1.42, 'maple syrup': 1.37, 'sugar': 0.85, 'brown sugar': 0.93,
  'powdered sugar': 0.56,
  // Flours & powders
  'flour': 0.53, 'all-purpose flour': 0.53, 'whole wheat flour': 0.52,
  'almond flour': 0.43, 'protein powder': 0.50, 'cocoa powder': 0.35,
  'baking powder': 0.90, 'salt': 1.22,
  // Dairy
  'milk': 1.03, 'heavy cream': 1.0, 'yogurt': 1.04,
  'cream cheese': 1.0, 'sour cream': 1.0,
  // Grains & nuts (dry volume)
  'rice': 0.75, 'oats': 0.37, 'quinoa': 0.72,
  'almonds': 0.54, 'walnuts': 0.44, 'peanuts': 0.53,
  'peanut butter': 1.08,
  // default for anything not listed
  'default': 1.0,
};

// All units the system recognizes, with display labels
const ALL_UNITS = [
  // Weight
  { value:'g',    label:'g (grams)',          type:'weight' },
  { value:'kg',   label:'kg (kilograms)',      type:'weight' },
  { value:'oz',   label:'oz (ounces)',         type:'weight' },
  { value:'lb',   label:'lb (pounds)',         type:'weight' },
  { value:'mg',   label:'mg (milligrams)',     type:'weight' },
  // Volume
  { value:'ml',   label:'ml (milliliters)',    type:'volume' },
  { value:'l',    label:'L (liters)',          type:'volume' },
  { value:'floz', label:'fl oz',              type:'volume' },
  { value:'cup',  label:'cup',                type:'volume' },
  { value:'tbsp', label:'tbsp (tablespoon)',   type:'volume' },
  { value:'tsp',  label:'tsp (teaspoon)',      type:'volume' },
  { value:'pint', label:'pint',               type:'volume' },
  // Count — no conversion possible
  { value:'piece',label:'piece / whole',      type:'count' },
  { value:'slice',label:'slice',              type:'count' },
  { value:'scoop',label:'scoop',              type:'count' },
  { value:'serving',label:'serving',         type:'count' },
];

// Convert qty+unit → grams, given a food name for density lookup
function convertToGrams(qty, unit, foodName) {
  const q = parseFloat(qty) || 0;
  if (!q) return 0;
  const u = (unit||'g').toLowerCase();

  // Weight — direct conversion
  if (UNIT_TO_G_SOLID[u] !== undefined) return q * UNIT_TO_G_SOLID[u];

  // Volume — needs density
  if (UNIT_TO_ML[u] !== undefined) {
    const ml = q * UNIT_TO_ML[u];
    // Look up density by food name (partial match)
    const name = (foodName||'').toLowerCase();
    let density = FOOD_DENSITY.default;
    for (const [key, d] of Object.entries(FOOD_DENSITY)) {
      if (key !== 'default' && name.includes(key)) { density = d; break; }
    }
    return ml * density;
  }

  // Count units — use the food's own serving size if possible (fallback: treat as 1 serving = 100g)
  // piece/slice/scoop/serving are returned as a multiplier flag
  return null; // signals "use as serving multiplier, not grams"
}

// Check if a unit is a count type (no gram conversion)
function isCountUnit(unit) {
  return ['piece','slice','scoop','serving'].includes((unit||'').toLowerCase());
}

// Build unit options HTML
function unitOptionsHtml(selectedVal) {
  const groups = [
    { label:'── WEIGHT ──',  units: ALL_UNITS.filter(u=>u.type==='weight') },
    { label:'── VOLUME ──',  units: ALL_UNITS.filter(u=>u.type==='volume') },
    { label:'── COUNT ──',   units: ALL_UNITS.filter(u=>u.type==='count')  },
  ];
  return groups.map(g =>
    `<optgroup label="${g.label}">${
      g.units.map(u => `<option value="${u.value}"${u.value===selectedVal?' selected':''}>${u.label}</option>`).join('')
    }</optgroup>`
  ).join('');
}

// Scale nutrition from a food's base serving to the user's qty+unit
function scaleNutrition(food, qty, unit) {
  const grams = convertToGrams(qty, unit, food.name);

  if (grams === null) {
    // Count unit — treat as N × one serving
    const n = parseFloat(qty) || 1;
    return {
      cals:  Math.round(food.calories * n),
      prot:  +((food.protein * n).toFixed(1)),
      carb:  +((food.carbs   * n).toFixed(1)),
      fat:   +((food.fat     * n).toFixed(1)),
      fiber: +((food.fiber   * n).toFixed(1)),
      grams: null,
      note:  `${n} × ${food.serving}`
    };
  }

  // Parse the food's base serving to grams — prefer structured fields
  const baseG = parseServingToGrams(food.serving, food.name, food);
  const scale = baseG > 0 ? grams / baseG : grams / 100;

  return {
    cals:  Math.round(food.calories * scale),
    prot:  +((food.protein * scale).toFixed(1)),
    carb:  +((food.carbs   * scale).toFixed(1)),
    fat:   +((food.fat     * scale).toFixed(1)),
    fiber: +((food.fiber   * scale).toFixed(1)),
    grams: Math.round(grams),
    note:  `${qty}${unit} ≈ ${Math.round(grams)}g`
  };
}

// Parse legacy serving string → numeric qty  e.g. "100g" → 100, "1 cup" → 1
function parseServingQty(servingStr) {
  if (!servingStr) return 100;
  const m = String(servingStr).match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : 100;
}

// Parse legacy serving string → unit  e.g. "100g" → "g", "1 cup" → "cup"
function parseServingUnit(servingStr) {
  if (!servingStr) return 'g';
  const s = String(servingStr).trim().toLowerCase();
  const m = s.match(/^[\d.]+\s*([a-z]+)/);
  if (!m) return 'g';
  // normalise common variants
  const u = m[1];
  if (u === 'ml' || u === 'mls') return 'ml';
  if (u === 'fl' || u === 'floz') return 'floz';
  if (u === 'tsp' || u === 'teaspoon') return 'tsp';
  if (u === 'tbsp' || u === 'tablespoon') return 'tbsp';
  return u;
}

// Parse a serving string OR structured fields → grams
function parseServingToGrams(servingStr, foodName, food) {
  // Prefer structured fields if available
  const qty  = food?.servingQty  || parseServingQty(servingStr);
  const unit = food?.servingUnit || parseServingUnit(servingStr);
  const g = convertToGrams(qty, unit, foodName || food?.name || '');
  return g !== null ? g : qty * 100; // count units: treat as qty × 100g fallback
}

async function loadFoodDatabase() {
  const statusEl = document.getElementById('food-db-status');
  if (statusEl) statusEl.textContent = 'Loading...';

  // Show add/edit buttons only for admins
  const addBtn = document.getElementById('add-ingredient-btn');
  if (addBtn) addBtn.style.display = SESSION.isAdmin ? '' : 'none';

  // ── Primary: shared Ingredients in Firestore ──
  let firestoreFoods = [];
  try {
    const doc = await db.collection('fooddb').doc('Ingredients').get();
    firestoreFoods = doc.exists ? (doc.data().foods||[]) : [];
  } catch(e) { console.warn('Ingredients load failed:', e.message); }

  // ── Personal foods ──
  let userCustom = [];
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('fooddb').doc('Ingredients').get();
    userCustom = doc.exists ? (doc.data().foods||[]) : [];
  } catch(e) {}

  // Merge: shared Firestore + personal
  foodDatabase = [
    ...firestoreFoods.map(f => ({...f, source: f.source||'community'})),
    ...userCustom.map(f => ({...f, source:'personal'})),
  ].filter(f => f.name);

  // Tag keto
  foodDatabase = foodDatabase.map(f => ({...f, keto: isKeto(f)}));

  if (statusEl) {
    const ketoCount = foodDatabase.filter(f=>f.keto).length;
    statusEl.textContent = `✓ ${foodDatabase.length} ingredients · ${ketoCount} keto-friendly`;
  }

  // Load recipes
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection('fooddb').doc('recipes').get();
    savedRecipes = doc.exists ? (doc.data().recipes||[]) : [];
  } catch(e) {}
  try {
    const doc = await db.collection('fooddb').doc('Recipes').get();
    communityRecipes = doc.exists ? (doc.data().recipes||[]) : [];
  } catch(e) {}

  renderFoodTable();
  renderSavedRecipes();
  renderCommunityRecipes();
  updateUnitSelectors();
}

// Populate all unit selector dropdowns with the full unit list
function updateUnitSelectors() {
  ['recipe-unit', 'popup-unit'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value || 'g';
    el.innerHTML = unitOptionsHtml(cur);
  });
}

// Show/hide conversion note when count unit selected in popup
function onPopupUnitChange() {
  const unit = document.getElementById('popup-unit')?.value;
  const noteEl = document.getElementById('popup-unit-note');
  if (!noteEl) return;
  if (isCountUnit(unit)) {
    noteEl.textContent = `ℹ ${unit} = 1 full serving of the food (no gram conversion possible)`;
    noteEl.style.display = 'block';
  } else {
    noteEl.style.display = 'none';
  }
}

function onRecipeUnitChange() {
  const unit = document.getElementById('recipe-unit')?.value;
  const noteEl = document.getElementById('recipe-unit-note');
  if (!noteEl) return;
  if (isCountUnit(unit)) {
    noteEl.textContent = `ℹ ${unit} = 1 full serving (no volume/weight conversion)`;
    noteEl.style.display = 'block';
  } else {
    noteEl.style.display = 'none';
  }
}

function searchFoodDb(inputId, resultsId) {
  const q       = (document.getElementById(inputId)?.value || '').toLowerCase().trim();
  const el      = document.getElementById(resultsId);
  if (!el) return;

  // Read filters — only active when using the popup
  const sourceFilter  = document.getElementById('popup-source-filter')?.value  || 'all';
  const cuisineFilter = document.getElementById('popup-cuisine-filter')?.value || '';

  const showIngredients = sourceFilter === 'all' || sourceFilter === 'ingredient';
  const showRestaurant  = sourceFilter === 'all' || sourceFilter === 'restaurant';
  const showRecipes     = sourceFilter === 'all' || sourceFilter === 'recipe';

  if (!q || q.length < 2) {
    // With no query but filters set, show hint
    if (sourceFilter !== 'all' || cuisineFilter) {
      el.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);padding:8px 10px;">
        Type to search${sourceFilter!=='all'?' ('+sourceFilter+' only)':''}${cuisineFilter?' — '+cuisineFilter+' cuisine':''}</div>`;
    } else {
      el.innerHTML = '';
    }
    return;
  }

  const results = [];

  // 1. Ingredients
  if (showIngredients) {
    foodDatabase.filter(f => {
      if (!f.name.toLowerCase().includes(q) && !(f.brand||'').toLowerCase().includes(q)) return false;
      if (cuisineFilter && (f.cuisine||'') !== cuisineFilter) return false;
      return true;
    }).slice(0, 8).forEach(f => results.push({
      type: 'ingredient',
      label: f.name + (f.brand ? ` — ${f.brand}` : ''),
      sub: `${f.serving || '100g'} · ${f.calories} kcal · ${f.protein}g P · ${f.carbs}g C · ${f.fat}g F`,
      data: f, idx: foodDatabase.indexOf(f),
    }));
  }

  // 2. Restaurant meals
  if (showRestaurant) {
    (restaurantDb || []).filter(r => {
      if (!r.restaurant.toLowerCase().includes(q) && !r.meal.toLowerCase().includes(q)) return false;
      if (cuisineFilter && (r.cuisine||'') !== cuisineFilter) return false;
      return true;
    }).slice(0, 5).forEach(r => results.push({
      type: 'restaurant',
      label: `${r.meal} @ ${r.restaurant}`,
      sub: `${r.calories} kcal · ${r.protein||0}g P · ${r.carbs||0}g C · ${r.fat||0}g F${r.cuisine?' · '+r.cuisine:''}`,
      data: r, idx: null,
    }));
  }

  // 3. Community recipes
  if (showRecipes) {
    (communityRecipes || []).filter(r => {
      if (!r.name.toLowerCase().includes(q) && !(r.tags||[]).some(t => t.includes(q))) return false;
      if (cuisineFilter && (r.cuisine||'') !== cuisineFilter) return false;
      return true;
    }).slice(0, 5).forEach(r => {
      const totCal  = r.totalCalories || (r.ingredients||[]).reduce((s,i)=>s+(i.cals||0),0);
      const totProt = r.totalProtein  || (r.ingredients||[]).reduce((s,i)=>s+(i.prot||0),0);
      const totCarb = (r.ingredients||[]).reduce((s,i)=>s+(i.carb||0),0);
      const totFat  = (r.ingredients||[]).reduce((s,i)=>s+(i.fat||0),0);
      results.push({
        type: 'recipe',
        label: r.name,
        sub: `${Math.round(totCal)} kcal total · ${totProt.toFixed(0)}g P · ${r.servings||1} serving recipe${r.cuisine?' · '+r.cuisine:''}`,
        data: r, idx: null,
        totals: { cal: totCal, prot: totProt, carb: totCarb, fat: totFat },
        servings: r.servings || 1,
      });
    });
  }

  if (!results.length) {
    el.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);padding:8px 10px;">
      No matches${cuisineFilter?' for '+cuisineFilter+' cuisine':''}. Try broadening filters.</div>`;
    return;
  }

  const groups = [
    { key:'ingredient', title:'🥦 INGREDIENTS', color:'#4caf50' },
    { key:'restaurant', title:'🏪 RESTAURANT MEALS', color:'var(--accent2)' },
    { key:'recipe',     title:'📖 RECIPES', color:'#9c27b0' },
  ];

  el.innerHTML = groups
    .filter(g => results.some(r => r.type === g.key))
    .map(g => {
      const items = results.filter(r => r.type === g.key);
      return `<div style="font-family:var(--font-mono);font-size:0.52rem;color:${g.color};
        letter-spacing:.12em;padding:5px 10px 3px;background:var(--bg2);">${g.title}</div>` +
        items.map(item => {
          const safeJson = encodeURIComponent(JSON.stringify({
            type:      item.type,
            name:      item.data.name || item.data.meal || '',
            restaurant:item.data.restaurant || '',
            calories:  item.data.calories || item.data.totalCalories || item.totals?.cal || 0,
            protein:   item.data.protein  || item.data.totalProtein  || item.totals?.prot || 0,
            carbs:     item.data.carbs    || item.totals?.carb || 0,
            fat:       item.data.fat      || item.totals?.fat  || 0,
            serving:   item.data.serving  || '1 serving',
            servings:  item.servings      || 1,
            cuisine:   item.data.cuisine  || '',
          }));
          return `<div onclick="selectFoodUnified('${item.type}',${item.idx !== null ? item.idx : -1},'popup-search-input','popup-search-results','${safeJson}')"
            style="padding:8px 10px;cursor:pointer;border-bottom:1px solid var(--border);
            font-family:var(--font-mono);font-size:0.68rem;background:var(--bg3);"
            onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background='var(--bg3)'">
            <div style="color:var(--text);">${item.label}</div>
            <div style="color:var(--text-dim);font-size:0.57rem;margin-top:1px;">${item.sub}</div>
          </div>`;
        }).join('');
    }).join('');
}

function selectFoodUnified(type, idx, inputId, resultsId, encodedData) {
  const el = document.getElementById(resultsId);
  if (el) el.innerHTML = '';
  const inpEl = document.getElementById(inputId);

  if (type === 'ingredient' && idx >= 0) {
    // Standard ingredient — use existing path
    if (inpEl) inpEl.value = foodDatabase[idx]?.name || '';
    // Show ingredient qty row, hide recipe row
    setPopupMode('ingredient');
    selectFood(idx, inputId, resultsId);
    return;
  }

  let d;
  try { d = JSON.parse(decodeURIComponent(encodedData)); } catch(e) { return; }

  const displayName = type === 'restaurant'
    ? `${d.name} @ ${d.restaurant}`
    : d.name;
  if (inpEl) inpEl.value = displayName;

  if (type === 'recipe') {
    // Show recipe serving calculator
    setPopupMode('recipe');
    window._selectedFoodCustom = d;
    // Pre-fill total servings from recipe's own servings count
    const totalEl = document.getElementById('popup-total-servings');
    const eatEl   = document.getElementById('popup-eat-servings');
    if (totalEl) totalEl.value = d.servings || 1;
    if (eatEl)   eatEl.value   = 1;
    updateRecipeServingCalc();
    // Show ADD button in results area
    if (el) el.innerHTML = `
      <button onclick="confirmAddCustomFoodToMeal()" class="btn btn-p"
        style="width:100%;font-size:0.68rem;padding:10px;margin-top:6px;">
        ✓ ADD TO MEAL
      </button>`;
  } else {
    // Restaurant meal
    setPopupMode('restaurant');
    window._selectedFoodIdx   = null;
    window._selectedFoodCustom = d;
    if (el) el.innerHTML = `
      <div style="padding:10px;background:var(--bg3);border:1px solid #4caf5044;margin-top:4px;">
        <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);margin-bottom:4px;">${displayName}</div>
        <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:10px;">
          ${d.calories} kcal · ${d.protein}g P · ${d.carbs}g C · ${d.fat}g F · per ${d.serving}
          ${d.cuisine ? ' · 🌍 ' + d.cuisine : ''}
        </div>
        <button onclick="confirmAddCustomFoodToMeal()" class="btn btn-p" style="width:100%;font-size:0.65rem;">ADD TO MEAL</button>
      </div>`;
  }
}

// Set which popup row is visible: 'ingredient' | 'recipe' | 'restaurant'
function setPopupMode(mode) {
  const ingRow    = document.getElementById('popup-ingredient-row');
  const recipeRow = document.getElementById('popup-recipe-serving-row');
  if (ingRow)    ingRow.style.display    = mode === 'ingredient' ? 'flex'  : 'none';
  if (recipeRow) recipeRow.style.display = mode === 'recipe'     ? 'block' : 'none';
}

// Live macro calculator for recipe servings
function updateRecipeServingCalc() {
  const d = window._selectedFoodCustom;
  if (!d || d.type !== 'recipe') return;
  const eat   = parseFloat(document.getElementById('popup-eat-servings')?.value)   || 1;
  const total = parseFloat(document.getElementById('popup-total-servings')?.value) || 1;
  const ratio = eat / total;

  const cal  = Math.round((d.calories || 0) * ratio);
  const prot = ((d.protein || 0) * ratio).toFixed(1);
  const carb = ((d.carbs   || 0) * ratio).toFixed(1);
  const fat  = ((d.fat     || 0) * ratio).toFixed(1);

  const preview = document.getElementById('popup-recipe-macro-preview');
  if (preview) {
    preview.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:4px;">
        ${eat} ÷ ${total} servings = ${(ratio*100).toFixed(1)}% of recipe
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <span><strong style="color:var(--accent2);font-size:0.85rem;">${cal}</strong> <span style="color:var(--text-dim);font-size:0.5rem;">KCAL</span></span>
        <span><strong style="color:var(--text);font-size:0.85rem;">${prot}g</strong> <span style="color:var(--text-dim);font-size:0.5rem;">PROTEIN</span></span>
        <span><strong style="color:var(--text);font-size:0.85rem;">${carb}g</strong> <span style="color:var(--text-dim);font-size:0.5rem;">CARBS</span></span>
        <span><strong style="color:var(--text);font-size:0.85rem;">${fat}g</strong> <span style="color:var(--text-dim);font-size:0.5rem;">FAT</span></span>
      </div>`;
  }
}

function confirmAddCustomFoodToMeal() {
  const d = window._selectedFoodCustom;
  if (!d || !activeMealTarget) { closeFoodSearch(); return; }

  let scale = 1;
  let servingNote = '';

  if (d.type === 'recipe') {
    // Use serving calculator ratio
    const eat   = parseFloat(document.getElementById('popup-eat-servings')?.value)   || 1;
    const total = parseFloat(document.getElementById('popup-total-servings')?.value) || 1;
    scale = eat / total;
    servingNote = `${eat} of ${total} servings`;
  } else {
    // Restaurant: qty from the popup (defaults to 1 serving)
    const qty = parseFloat(document.getElementById('popup-qty')?.value) || 1;
    scale = qty;
    servingNote = `${qty} serving${qty !== 1 ? 's' : ''}`;
  }

  const displayName = d.type === 'restaurant'
    ? `${d.name} @ ${d.restaurant}`
    : d.name;

  const item = {
    name:     displayName,
    qty:      scale,
    unit:     'serving',
    calories: Math.round((d.calories || 0) * scale),
    protein:  parseFloat(((d.protein  || 0) * scale).toFixed(1)),
    carbs:    parseFloat(((d.carbs    || 0) * scale).toFixed(1)),
    fat:      parseFloat(((d.fat      || 0) * scale).toFixed(1)),
    note:     servingNote,
  };

  const target = activeMealTarget;
  const calEl  = document.getElementById(`n-${target}-cal`);
  const protEl = document.getElementById(`n-${target}-prot`);
  const carbEl = document.getElementById(`n-${target}-carb`);
  const fatEl  = document.getElementById(`n-${target}-fat`);

  if (calEl)  calEl.value  = (parseFloat(calEl.value)  || 0) + item.calories;
  if (protEl) protEl.value = ((parseFloat(protEl.value) || 0) + item.protein).toFixed(1);
  if (carbEl) carbEl.value = ((parseFloat(carbEl.value) || 0) + item.carbs).toFixed(1);
  if (fatEl)  fatEl.value  = ((parseFloat(fatEl.value)  || 0) + item.fat).toFixed(1);

  const ingList = document.getElementById(`${target}-ingredients`);
  if (ingList) {
    const tag = document.createElement('div');
    tag.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);padding:2px 0;';
    tag.textContent = `+ ${item.name} (${servingNote} · ${item.calories} kcal)`;
    ingList.appendChild(tag);
  }

  updateNutritionTotals();
  closeFoodSearch();
  toast(`✓ Added ${item.calories} kcal to ${target}`);
  window._selectedFoodCustom = null;
}

function selectFood(foodIdx, inputId, resultsId) {
  const f = foodDatabase[foodIdx];
  if (!f) return;

  // Clear search
  const inputEl = document.getElementById(inputId);
  if (inputEl) inputEl.value = f.name;
  const resEl = document.getElementById(resultsId);
  if (resEl) resEl.innerHTML = '';

  if (inputId === 'recipe-search') {
    // Add to recipe
    addIngredientToRecipe(foodIdx);
  } else if (inputId === 'popup-search-input') {
    window._selectedFoodIdx = foodIdx;
    // Pre-fill qty/unit with the food's own serving
    const qtyEl  = document.getElementById('popup-qty');
    const unitEl = document.getElementById('popup-unit');
    const defQty  = f.servingQty  || parseServingQty(f.serving)  || 100;
    const defUnit = f.servingUnit || parseServingUnit(f.serving) || 'g';
    if (qtyEl)  qtyEl.value  = defQty;
    if (unitEl) unitEl.value = defUnit;
    const resContainer = document.getElementById(resultsId);
    if (resContainer) {
      const sLabel = `${defQty} ${defUnit}`;
      resContainer.innerHTML = `
        <div style="padding:10px;background:var(--bg3);border:1px solid #4caf5044;margin-top:4px;">
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);margin-bottom:4px;">${f.name}${f.brand?' <span style="color:var(--text-dim);font-size:0.58rem;">— '+f.brand+'</span>':''}</div>
          <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-dim);margin-bottom:10px;">
            Per ${sLabel}: ${f.calories} kcal · ${f.protein}g P · ${f.carbs}g C · ${f.fat}g F
          </div>
          <button onclick="confirmAddFoodToMeal()" class="btn btn-p" style="width:100%;font-size:0.65rem;">ADD TO MEAL</button>
        </div>`;
    }
  }
}

function confirmAddFoodToMeal() {
  const idx  = window._selectedFoodIdx;
  const f    = foodDatabase[idx];
  if (!f || !activeMealTarget) { closeFoodSearch(); return; }

  const qty  = document.getElementById('popup-qty')?.value  || '100';
  const unit = document.getElementById('popup-unit')?.value || 'g';

  if (isCountUnit(unit)) {
    // Count units: validate the food has a known serving size
    const n = parseFloat(qty) || 1;
    if (!f.calories) { toast(`No nutrition data for ${f.name}`); return; }
  }

  const scaled = scaleNutrition(f, qty, unit);

  // Warn if piece conversion is ambiguous
  if (isCountUnit(unit)) {
    toast(`Using ${scaled.note} as 1 serving of "${f.name}"`);
  }

  // Add ingredient chip to the meal section
  const ingEl = document.getElementById(`${activeMealTarget}-ingredients`);
  if (ingEl) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:var(--bg2);border:1px solid var(--border);margin-bottom:4px;border-radius:2px;';
    div.innerHTML = `
      <div>
        <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);">${f.name} — ${qty} ${unit}${scaled.grams ? ' (≈'+scaled.grams+'g)' : ''}</div>
        <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);">${scaled.cals} kcal · ${scaled.prot}g P · ${scaled.carb}g C · ${scaled.fat}g F</div>
      </div>
      <button onclick="this.parentElement.remove();recalcMealTotals('${activeMealTarget}')"
        style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1rem;padding:0 4px;">✕</button>`;
    ingEl.appendChild(div);
  }

  // Add to macro totals
  const addNum = (id, val) => { const el=document.getElementById(id); if(el) el.value=+(+(+el.value||0)+val).toFixed(1); };
  addNum(`n-${activeMealTarget}-cal`,  scaled.cals);
  addNum(`n-${activeMealTarget}-prot`, scaled.prot);
  addNum(`n-${activeMealTarget}-carb`, scaled.carb);
  addNum(`n-${activeMealTarget}-fat`,  scaled.fat);
  updateNutritionTotals();
  closeFoodSearch();
}

function recalcMealTotals(mealId) {
  // Recalc from remaining ingredient rows (not perfect but avoids full state tracking)
  updateNutritionTotals();
}

function openFoodSearch(mealTarget) {
  activeMealTarget = mealTarget;
  window._selectedFoodCustom = null;
  window._selectedFoodIdx    = null;
  const popup = document.getElementById('food-search-popup');
  if (!popup) return;
  popup.style.display = 'block';

  // Reset filters
  const sourceEl  = document.getElementById('popup-source-filter');
  const cuisineEl = document.getElementById('popup-cuisine-filter');
  if (sourceEl)  sourceEl.value  = 'all';
  if (cuisineEl) cuisineEl.value = '';

  // Reset to ingredient mode (default)
  setPopupMode('ingredient');

  // Reset qty and unit for ingredient mode
  const qtyEl  = document.getElementById('popup-qty');
  const unitEl = document.getElementById('popup-unit');
  if (qtyEl)  qtyEl.value  = '100';
  if (unitEl) unitEl.value = 'g';

  // Reset serving inputs
  const eatEl   = document.getElementById('popup-eat-servings');
  const totalEl = document.getElementById('popup-total-servings');
  if (eatEl)   eatEl.value   = '1';
  if (totalEl) totalEl.value = '4';

  // Reset search
  const inp = document.getElementById('popup-search-input');
  if (inp) { inp.value = ''; inp.focus(); }
  const res = document.getElementById('popup-search-results');
  if (res) res.innerHTML = '';
}

function closeFoodSearch() {
  const popup = document.getElementById('food-search-popup');
  if (popup) popup.style.display = 'none';
  activeMealTarget = null;
  window._selectedFoodIdx    = null;
  window._selectedFoodCustom = null;
  setPopupMode('ingredient');
  const inp = document.getElementById('popup-search-input');
  if (inp) inp.value = '';
  const res = document.getElementById('popup-search-results');
  if (res) res.innerHTML = '';
}

function renderFoodTable() {
  const el = document.getElementById('food-db-table');
  if (!el) return;

  const q        = (foodDbFilter.search||'').toLowerCase();
  const ketoOn   = foodDbFilter.keto   || false;
  const cat      = foodDbFilter.category || '';
  const cuisine  = foodDbFilter.cuisine  || '';

  let foods = foodDatabase.filter(f => {
    if (q && !f.name.toLowerCase().includes(q) &&
        !(f.brand||'').toLowerCase().includes(q)) return false;
    if (ketoOn && !f.keto) return false;
    if (cat && (f.category||'') !== cat) return false;
    if (cuisine && (f.cuisine||'') !== cuisine) return false;
    return true;
  });

  const ketoLabel = f => f.keto
    ? `<span style="font-size:0.45rem;padding:1px 4px;background:#4caf5022;color:#4caf50;border:1px solid #4caf5044;">KETO</span>`
    : '';

  const CUISINE_EMOJI = {
    american:'🇺🇸', mexican:'🌮', italian:'🍝', mediterranean:'🫒', asian:'🥢',
    japanese:'🍜', chinese:'🥟', indian:'🍛', thai:'🌶', greek:'🫙',
    french:'🥖', middle_eastern:'🧆', korean:'🍱', bbq:'🔥', other_cuisine:'🌍'
  };
  const cuisineBadge = f => f.cuisine
    ? `<span style="font-size:0.45rem;padding:1px 5px;background:var(--bg3);
        color:var(--text-dim);border:1px solid var(--border);">${CUISINE_EMOJI[f.cuisine]||'🌍'} ${f.cuisine}</span>`
    : '';

  const catColor = {
    protein:'#ef9a9a', grain:'#ffe082', vegetable:'#a5d6a7', fruit:'#f48fb1',
    dairy:'#b3e5fc', oil_fat:'#ffcc80', nut_seed:'#bcaaa4', legume:'#c5e1a5',
    condiment:'#e6ee9c', spice:'#ffab91', supplement:'#ce93d8', snack:'#80cbc4',
    beverage:'#90caf9', sweetener:'#fff9c4'
  };
  const catBadge = f => f.category
    ? `<span style="font-size:0.45rem;padding:1px 5px;background:${catColor[f.category]||'var(--bg3)'}22;
        color:${catColor[f.category]||'var(--border2)'};border:1px solid ${catColor[f.category]||'var(--border)'}44;">${f.category}</span>`
    : '';

  if (!foods.length) {
    el.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);padding:12px;">
      No ingredients match the current filters.
      ${!foodDatabase.length ? '<br><br>Run <strong>Admin → Import GitHub → Ingredients</strong> to populate the database.' : ''}</div>`;
    return;
  }

  const isAdmin = SESSION.isAdmin;

  const sourceBadge = f => {
    if (f.source === 'personal')
      return `<span style="font-size:0.43rem;padding:1px 4px;background:var(--accent2)22;color:var(--accent2);border:1px solid var(--accent2)44;">MINE</span>`;
    return '';
  };

  el.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);margin-bottom:6px;">
      ${foods.length} of ${foodDatabase.length} ingredients
      </div>
    <table class="tbl" style="width:100%;font-size:0.6rem;">
      <tr>
        <th style="text-align:left;min-width:120px;">INGREDIENT</th>
        <th style="text-align:left;">BRAND</th>
        <th>SERVING</th>
        <th>UNIT</th>
        <th>KCAL</th><th>PROT</th><th>CARBS</th><th>FAT</th>
        <th></th>
      </tr>
      ${foods.slice(0,200).map(f => {
        const idx   = foodDatabase.indexOf(f);
        const sQty  = f.servingQty  || parseServingQty(f.serving);
        const sUnit = f.servingUnit || parseServingUnit(f.serving);
        return `<tr>
          <td style="max-width:160px;line-height:1.6;">
            ${f.name} ${ketoLabel(f)} ${catBadge(f)} ${cuisineBadge(f)} ${sourceBadge(f)}
          </td>
          <td style="color:var(--text-dim);font-size:0.55rem;">${f.brand||'—'}</td>
          <td style="text-align:center;">${sQty}</td>
          <td style="text-align:center;">${sUnit}</td>
          <td style="text-align:center;">${f.calories}</td>
          <td style="text-align:center;">${f.protein}g</td>
          <td style="text-align:center;">${f.carbs}g</td>
          <td style="text-align:center;">${f.fat}g</td>
          <td style="text-align:right;white-space:nowrap;">
            <span onclick="openFoodSearchWithIdx(${idx})" title="Add to meal"
              style="cursor:pointer;color:var(--accent2);padding:2px 6px;font-size:0.9rem;">+</span>
            ${isAdmin ? `
              <span onclick="editFood(${idx})" title="Edit"
                style="cursor:pointer;color:var(--text-dim);padding:2px 5px;font-size:0.75rem;">✎</span>
              <span onclick="deleteFood(${idx})" title="Delete"
                style="cursor:pointer;color:var(--danger);padding:2px 5px;font-size:0.75rem;">✕</span>` : ''}
          </td>
        </tr>`;
      }).join('')}
      ${foods.length > 200 ? `<tr><td colspan="9" style="text-align:center;color:var(--text-dim);padding:8px;">
        Showing 200 of ${foods.length} — search to narrow</td></tr>` : ''}
    </table>`;
}

function openFoodSearchWithIdx(foodIdx) {
  window._selectedFoodIdx = foodIdx;
  const f = foodDatabase[foodIdx];
  if (!f) return;
  const target = prompt(`Add "${f.name}" to which meal?\n1 = Breakfast\n2 = Lunch\n3 = Dinner\n4 = Snack\n(Enter 1-4)`);
  const map = {'1':'bk','2':'ln','3':'dn','4':'sn'};
  activeMealTarget = map[target?.trim()] || 'ln';
  // Pre-fill popup with the food's own serving size
  const qtyEl  = document.getElementById('popup-qty');
  const unitEl = document.getElementById('popup-unit');
  if (qtyEl)  qtyEl.value  = f.servingQty  || parseServingQty(f.serving)  || 100;
  if (unitEl) unitEl.value = f.servingUnit || parseServingUnit(f.serving) || 'g';
  confirmAddFoodToMeal();
}

function openAddFoodModal() { openAddFoodPanel(); }

function openAddFoodPanel(editIdx) {
  const panel = document.getElementById('add-food-panel');
  const titleEl = document.getElementById('nf-panel-title');
  const idxEl = document.getElementById('nf-edit-idx');
  if (!panel) return;

  // Clear fields
  ['nf-name','nf-brand','nf-serving-qty','nf-cal','nf-prot','nf-carb','nf-fat',
   'nf-fiber','nf-sodium','nf-sugar','nf-satfat'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const catEl     = document.getElementById('nf-category');
  const cuisineEl = document.getElementById('nf-cuisine');
  if (catEl)     catEl.value     = '';
  if (cuisineEl) cuisineEl.value = '';
  if (idxEl) idxEl.value = '';

  if (editIdx !== undefined) {
    // Pre-fill for edit
    const f = foodDatabase[editIdx];
    if (!f) return;
    if (titleEl) titleEl.textContent = 'EDIT INGREDIENT';
    if (idxEl)   idxEl.value = editIdx;
    const set = (id, val) => { const el=document.getElementById(id); if(el) el.value=val||''; };
    set('nf-name',    f.name);
    set('nf-brand',   f.brand);
    set('nf-serving-qty',  f.servingQty  || parseServingQty(f.serving)  || 100);
    const unitEl = document.getElementById('nf-serving-unit');
    if (unitEl) unitEl.value = f.servingUnit || parseServingUnit(f.serving) || 'g';
    set('nf-cal',     f.calories);
    set('nf-prot',    f.protein);
    set('nf-carb',    f.carbs);
    set('nf-fat',     f.fat);
    set('nf-fiber',   f.fiber);
    set('nf-sodium',  f.sodium);
    set('nf-sugar',   f.sugar);
    set('nf-satfat',  f.satfat);
    const catEl     = document.getElementById('nf-category');
    const cuisineEl = document.getElementById('nf-cuisine');
    if (catEl)     catEl.value     = f.category || '';
    if (cuisineEl) cuisineEl.value = f.cuisine  || '';
  } else {
    if (titleEl) titleEl.textContent = 'ADD INGREDIENT';
  }

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior:'smooth', block:'start' });
}

function closeAddFoodPanel() {
  const panel = document.getElementById('add-food-panel');
  if (panel) panel.style.display = 'none';
}

function editFood(idx) {
  if (!SESSION.isAdmin) { toast('Admin access required'); return; }
  openAddFoodPanel(idx);
}

async function deleteFood(idx) {
  if (!SESSION.isAdmin) { toast('Admin access required'); return; }
  const f = foodDatabase[idx];
  if (!f) return;
  if (!confirm(`Delete "${f.name}"${f.brand?' ('+f.brand+')':''}?\n\nThis removes it from the shared database.`)) return;

  try {
    const doc  = await db.collection('fooddb').doc('Ingredients').get();
    let foods  = doc.exists ? (doc.data().foods||[]) : [];
    const before = foods.length;
    foods = foods.filter(fd => fd.name.toLowerCase() !== f.name.toLowerCase());
    await db.collection('fooddb').doc('Ingredients').set({ foods });
    toast(`✓ "${f.name}" deleted (${before - foods.length} removed)`);
    await loadFoodDatabase();
  } catch(e) { toast('Delete failed: ' + e.message); }
}

async function saveCustomFood() {
  if (!SESSION.isAdmin) { toast('Admin access required to modify ingredients'); return; }
  const name = document.getElementById('nf-name')?.value?.trim();
  if (!name) { toast('Enter an ingredient name'); return; }

  const servingQty  = parseFloat(document.getElementById('nf-serving-qty')?.value)  || 100;
  const servingUnit = document.getElementById('nf-serving-unit')?.value || 'g';

  const food = {
    name,
    brand:       document.getElementById('nf-brand')?.value?.trim()   || '',
    category:    document.getElementById('nf-category')?.value        || '',
    cuisine:     document.getElementById('nf-cuisine')?.value         || '',
    servingQty,
    servingUnit,
    serving:     `${servingQty} ${servingUnit}`,  // keep legacy string for display
    calories:    parseFloat(document.getElementById('nf-cal')?.value)    || 0,
    protein:     parseFloat(document.getElementById('nf-prot')?.value)   || 0,
    carbs:       parseFloat(document.getElementById('nf-carb')?.value)   || 0,
    fat:         parseFloat(document.getElementById('nf-fat')?.value)    || 0,
    fiber:       parseFloat(document.getElementById('nf-fiber')?.value)  || 0,
    sodium:      parseFloat(document.getElementById('nf-sodium')?.value) || 0,
    sugar:       parseFloat(document.getElementById('nf-sugar')?.value)  || 0,
    satfat:      parseFloat(document.getElementById('nf-satfat')?.value) || 0,
    source:      'community',
    custom:      true,
    addedBy:     SESSION.username,
    updated:     new Date().toISOString(),
  };

  try {
    const doc   = await db.collection('fooddb').doc('Ingredients').get();
    let foods   = doc.exists ? (doc.data().foods||[]) : [];
    const editIdx = document.getElementById('nf-edit-idx')?.value;

    if (editIdx !== '') {
      // Edit: find by name (original name before edit might differ — use idx)
      const origFood = foodDatabase[parseInt(editIdx)];
      if (origFood) {
        const pos = foods.findIndex(fd => fd.name.toLowerCase() === origFood.name.toLowerCase());
        if (pos >= 0) { foods[pos] = food; }
        else foods.push(food);
      } else { foods.push(food); }
      toast(`✓ "${name}" updated`);
    } else {
      // New: check for duplicate
      if (foods.some(fd => fd.name.toLowerCase() === name.toLowerCase())) {
        if (!confirm(`"${name}" already exists. Replace it?`)) return;
        foods = foods.filter(fd => fd.name.toLowerCase() !== name.toLowerCase());
      }
      foods.push(food);
      toast(`✓ "${name}" added to Ingredients`);
    }

    await db.collection('fooddb').doc('Ingredients').set({ foods });
    closeAddFoodPanel();
    await loadFoodDatabase();
  } catch(e) { toast('Save failed: ' + e.message); }
}

// ── Recipe maker ──
function addIngredientToRecipe(foodIdx) {
  const f    = foodDatabase[foodIdx];
  if (!f) return;
  const qty  = document.getElementById('recipe-qty')?.value  || '100';
  const unit = document.getElementById('recipe-unit')?.value || 'g';

  const scaled = scaleNutrition(f, qty, unit);

  const ing = {
    name:  f.name,
    qty, unit,
    grams: scaled.grams,
    note:  scaled.note,
    cals:  scaled.cals,
    prot:  scaled.prot,
    carb:  scaled.carb,
    fat:   scaled.fat,
    fiber: scaled.fiber,
  };
  recipeIngredients.push(ing);
  renderRecipeIngredients();

  // Clear search
  const si = document.getElementById('recipe-search'); if (si) si.value = '';
  const sr = document.getElementById('recipe-results'); if (sr) sr.innerHTML = '';
  // Reset qty to 100g default
  const qi = document.getElementById('recipe-qty'); if (qi) qi.value = '100';
}

function renderRecipeIngredients() {
  const el = document.getElementById('recipe-ingredients');
  if (!el) return;
  if (!recipeIngredients.length) { el.innerHTML = ''; updateRecipeTotals(); return; }

  el.innerHTML = recipeIngredients.map((ing, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;
      background:var(--bg3);border:1px solid var(--border);margin-bottom:4px;">
      <div>
        <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text);">${ing.name} — ${ing.qty}${ing.unit}</div>
        <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);">
          ${ing.cals} kcal · ${ing.prot}g P · ${ing.carb}g C · ${ing.fat}g F</div>
      </div>
      <button onclick="recipeIngredients.splice(${i},1);renderRecipeIngredients()"
        style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1rem;padding:4px;">✕</button>
    </div>`).join('');
  updateRecipeTotals();
}

function updateRecipeTotals() {
  const el = document.getElementById('recipe-totals');
  if (!el) return;
  if (!recipeIngredients.length) { el.innerHTML = ''; updateRecipePortionPreview(); return; }
  const tot = recipeIngredients.reduce((a,b) => ({
    cals: a.cals+b.cals, prot: a.prot+b.prot, carb: a.carb+b.carb, fat: a.fat+b.fat
  }), {cals:0,prot:0,carb:0,fat:0});
  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px;">
    ${[['CALORIES',tot.cals,'kcal','var(--accent2)'],['PROTEIN',tot.prot,'g','#4caf50'],
       ['CARBS',tot.carb,'g','#ff9800'],['FAT',tot.fat,'g','#7986cb']].map(([l,v,u,c])=>`
    <div style="background:var(--bg3);padding:8px;text-align:center;border:1px solid var(--border);">
      <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);">${l}</div>
      <div style="font-family:var(--font-display);font-size:1.2rem;color:${c};">${typeof v==='number'?v.toFixed(v<10?1:0):v}</div>
      <div style="font-family:var(--font-mono);font-size:0.48rem;color:var(--text-dim);">${u}</div>
    </div>`).join('')}
  </div>`;
  updateRecipePortionPreview();
}

function updateRecipePortionPreview() {
  const el      = document.getElementById('recipe-portion-preview');
  const portion = parseFloat(document.getElementById('recipe-portion')?.value) || 1;
  const total   = parseFloat(document.getElementById('recipe-total-servings')?.value) || 1;
  if (!el || !recipeIngredients.length) { if(el) el.textContent=''; return; }
  const ratio = portion / total;
  const tots  = recipeIngredients.reduce((a,b)=>({cals:a.cals+b.cals,prot:a.prot+b.prot,carb:a.carb+b.carb,fat:a.fat+b.fat}),{cals:0,prot:0,carb:0,fat:0});
  el.textContent = `Your portion: ${Math.round(tots.cals*ratio)} kcal · ${(tots.prot*ratio).toFixed(1)}g protein · ${(tots.carb*ratio).toFixed(1)}g carbs · ${(tots.fat*ratio).toFixed(1)}g fat`;
}

function addRecipeToMeal() {
  const portion = parseFloat(document.getElementById('recipe-portion')?.value) || 1;
  const total   = parseFloat(document.getElementById('recipe-total-servings')?.value) || 1;
  const target  = document.getElementById('recipe-meal-target')?.value || 'ln';
  if (!recipeIngredients.length) { toast('Add ingredients first'); return; }

  const ratio = portion / total;
  const tots  = recipeIngredients.reduce((a,b)=>({cals:a.cals+b.cals,prot:a.prot+b.prot,carb:a.carb+b.carb,fat:a.fat+b.fat}),{cals:0,prot:0,carb:0,fat:0});
  const name  = document.getElementById('recipe-name')?.value || 'Recipe';

  // Add to the actual meal target
  const realTarget = target === 'sn' ? null : target;
  if (realTarget) {
    const addNum = (id, val) => { const el=document.getElementById(id); if(el) el.value=(+el.value||0)+val; };
    addNum(`n-${realTarget}-cal`,  Math.round(tots.cals*ratio));
    addNum(`n-${realTarget}-prot`, +((tots.prot*ratio).toFixed(1)));
    addNum(`n-${realTarget}-carb`, +((tots.carb*ratio).toFixed(1)));
    addNum(`n-${realTarget}-fat`,  +((tots.fat*ratio).toFixed(1)));
    const foodNote = document.getElementById(`n-${realTarget}-food`);
    if (foodNote) foodNote.value = (foodNote.value ? foodNote.value+', ' : '') + name;
    // Show in ingredients area
    const ingEl = document.getElementById(`${realTarget}-ingredients`);
    if (ingEl) {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:var(--bg2);border:1px solid var(--border);margin-bottom:4px;';
      div.innerHTML = `<div><div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--accent2);">${name} (${portion}/${total} serving)</div>
        <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);">${Math.round(tots.cals*ratio)} kcal · ${(tots.prot*ratio).toFixed(1)}g P</div></div>
        <button onclick="this.parentElement.remove();updateNutritionTotals()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;">✕</button>`;
      ingEl.appendChild(div);
    }
    updateNutritionTotals();
  } else {
    // Snack
    addSnack();
    const sn = snackCount;
    const el = document.getElementById(`n-sk${sn}-cal`); if(el) el.value = Math.round(tots.cals*ratio);
    const ep = document.getElementById(`n-sk${sn}-prot`); if(ep) ep.value = (tots.prot*ratio).toFixed(1);
    const ec = document.getElementById(`n-sk${sn}-carb`); if(ec) ec.value = (tots.carb*ratio).toFixed(1);
    const ef = document.getElementById(`n-sk${sn}-fat`);  if(ef) ef.value = (tots.fat*ratio).toFixed(1);
    const ef2= document.getElementById(`n-sk${sn}-food`); if(ef2) ef2.value = name;
    updateNutritionTotals();
  }

  toast(`✓ ${name} added to ${target === 'sn' ? 'snack' : ['breakfast','lunch','dinner'][['bk','ln','dn'].indexOf(target)]}`);
  nutTab('meals'); // Switch back to meals view
}

async function saveRecipe() {
  const name = document.getElementById('recipe-name')?.value?.trim();
  if (!name || !recipeIngredients.length) { toast('Name your recipe and add ingredients'); return; }
  const recipe = {
    name,
    servings: parseFloat(document.getElementById('recipe-servings')?.value) || 1,
    ingredients: [...recipeIngredients],
    saved: new Date().toISOString()
  };
  savedRecipes.push(recipe);
  try {
    await db.collection('userdata').doc(SESSION.username)
      .collection('fooddb').doc('recipes').set({ recipes: savedRecipes });
    renderSavedRecipes();
    toast(`✓ Recipe "${name}" saved`);
  } catch(e) { toast('Save failed: ' + e.message); }
}

function renderSavedRecipes() {
  const el = document.getElementById('saved-recipes-list');
  if (!el) return;
  if (!savedRecipes.length) { el.innerHTML = '<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);">No saved recipes yet.</div>'; return; }
  el.innerHTML = savedRecipes.map((r,i) => {
    const tots = r.ingredients.reduce((a,b)=>({cals:a.cals+b.cals,prot:a.prot+b.prot}),{cals:0,prot:0});
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;
      background:var(--bg3);border:1px solid var(--border);margin-bottom:6px;">
      <div>
        <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text);">${r.name}</div>
        <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);">
          ${r.ingredients.length} ingredients · ${Math.round(tots.cals)} kcal · ${tots.prot.toFixed(1)}g protein total</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button onclick="loadRecipeIntoMaker(${i})" class="btn btn-s" style="font-size:0.55rem;padding:3px 8px;">EDIT</button>
        <button onclick="deleteSavedRecipe(${i})" style="background:none;border:none;color:var(--text-dim);cursor:pointer;">✕</button>
      </div>
    </div>`;
  }).join('');
}

function loadRecipeIntoMaker(idx) {
  const r = savedRecipes[idx];
  if (!r) return;
  recipeIngredients = [...r.ingredients];
  document.getElementById('recipe-name').value = r.name;
  renderRecipeIngredients();
  nutTab('recipe');
}

async function deleteSavedRecipe(idx) {
  if (!confirm('Delete this recipe?')) return;
  savedRecipes.splice(idx, 1);
  await db.collection('userdata').doc(SESSION.username)
    .collection('fooddb').doc('recipes').set({ recipes: savedRecipes });
  renderSavedRecipes();
}

function nutTab(tab) {
  ['meals','fasting'].forEach(t => {
    const panel = document.getElementById(`npanel-${t}`);
    const btn   = document.getElementById(`ntab-${t}`);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (btn)   btn.className = t === tab ? 'btn btn-p' : 'btn btn-s';
  });
  if (tab === 'fasting') initFastingTab();
  if (tab === 'meals')   loadWaterToday();
}

function foodTab(tab) {
  ['recipes','restaurant','ingredients','maker'].forEach(t => {
    const panel = document.getElementById(`fpanel-food-${t}`);
    const btn   = document.getElementById(`ftab-food-${t}`);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (btn)   btn.className = t === tab ? 'btn btn-p' : 'btn btn-s';
  });
  if (tab === 'recipes')     { loadFoodDatabase().then(renderRecipeViewer); }
  if (tab === 'restaurant')  { renderFoodTabRestaurant(); }
  if (tab === 'ingredients') { renderFoodTabIngredients(); }
  if (tab === 'maker')       { renderFoodTabMaker(); }
}

function renderFoodTabRestaurant() {
  const el = document.getElementById('food-restaurant-panel');
  if (!el || el.dataset.loaded) return;
  // Clone the existing restaurant panel content into Food tab
  const src = document.getElementById('npanel-restaurant');
  if (src) {
    el.innerHTML = src.innerHTML;
    el.dataset.loaded = '1';
  }
  loadRestaurantDb().then(renderRestaurantDb);
}

function renderFoodTabIngredients() {
  const el = document.getElementById('food-ingredients-panel');
  if (!el || el.dataset.loaded) return;
  const src = document.getElementById('npanel-foods');
  if (src) {
    el.innerHTML = src.innerHTML;
    el.dataset.loaded = '1';
  }
  if (!foodDatabase.length) loadFoodDatabase();
}

function renderFoodTabMaker() {
  const el = document.getElementById('food-maker-panel');
  if (!el || el.dataset.loaded) return;
  const src = document.getElementById('npanel-recipe');
  if (src) {
    el.innerHTML = src.innerHTML;
    el.dataset.loaded = '1';
  }
  if (!foodDatabase.length) loadFoodDatabase();
}

// ═══════════════════════════════════════════════════════════
// COMMUNITY RECIPES — shared at fooddb/Recipes
// ═══════════════════════════════════════════════════════════

function renderRecipeViewer() {
  const el = document.getElementById('recipe-viewer-grid');
  if (!el) return;

  const q        = (document.getElementById('rv-search')?.value    || '').toLowerCase();
  const cuisine  = (document.getElementById('rv-cuisine')?.value   || '');
  const ketoOnly = document.getElementById('rv-keto')?.checked     || false;
  const highProt = document.getElementById('rv-highprot')?.checked || false;
  const sort     = document.getElementById('rv-sort')?.value       || 'rating';

  let recipes = communityRecipes.filter(r => {
    if (q && !r.name.toLowerCase().includes(q) &&
        !(r.tags||[]).some(t => t.toLowerCase().includes(q)) &&
        !(r.ingredients||[]).some(i => (i.name||'').toLowerCase().includes(q))) return false;
    if (ketoOnly && !r.keto) return false;
    if (highProt && (r.totalProtein || 0) < 30) return false;
    if (cuisine && (r.cuisine||'') !== cuisine) return false;
    return true;
  });

  if (sort === 'rating')   recipes.sort((a,b) => (b.avgRating||0) - (a.avgRating||0));
  else if (sort === 'newest')  recipes.sort((a,b) => new Date(b.published||0) - new Date(a.published||0));
  else if (sort === 'protein') recipes.sort((a,b) => (b.totalProtein||0) - (a.totalProtein||0));
  else if (sort === 'calories') recipes.sort((a,b) => (a.totalCalories||9999) - (b.totalCalories||9999));
  else recipes.sort((a,b) => a.name.localeCompare(b.name));

  const statsEl = document.getElementById('rv-stats');
  if (statsEl) statsEl.textContent = `${recipes.length} of ${communityRecipes.length} recipes`;

  const CUISINE_EMOJI = {
    american:'🇺🇸',mexican:'🌮',italian:'🍝',mediterranean:'🫒',asian:'🥢',
    japanese:'🍜',chinese:'🥟',indian:'🍛',thai:'🌶',greek:'🫙',
    french:'🥖',middle_eastern:'🧆',korean:'🍱',bbq:'🔥',other_cuisine:'🌍'
  };

  if (!recipes.length) {
    el.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);padding:12px;">
      No recipes match the current filters. ${!communityRecipes.length ? '<br>Be the first to share one via the Recipe Maker tab.' : ''}</div>`;
    return;
  }

  el.innerHTML = recipes.map((r) => {
    const origIdx = communityRecipes.indexOf(r);
    const totCal  = r.totalCalories || (r.ingredients||[]).reduce((s,i)=>s+(i.cals||0),0);
    const totProt = r.totalProtein  || (r.ingredients||[]).reduce((s,i)=>s+(i.prot||0),0);
    const stars   = [1,2,3,4,5].map(n =>
      `<span onclick="rateRecipe(${origIdx},${n})" style="cursor:pointer;font-size:1rem;
        color:${n<=(r.userRating||r.avgRating||0)?'#ffd700':'var(--border2)'};">★</span>`
    ).join('');
    const ketoTag    = r.keto ? `<span style="font-size:0.45rem;padding:1px 4px;background:#4caf5022;color:#4caf50;border:1px solid #4caf5044;margin-left:4px;">KETO</span>` : '';
    const cuisineTag = r.cuisine ? `<span style="font-size:0.45rem;padding:1px 5px;background:var(--bg3);color:var(--text-dim);border:1px solid var(--border);margin-left:4px;">${CUISINE_EMOJI[r.cuisine]||'🌍'} ${r.cuisine}</span>` : '';
    const tags = (r.tags||[]).map(t =>
      `<span style="font-size:0.45rem;padding:1px 5px;background:var(--bg3);color:var(--border2);border:1px solid var(--border);margin-right:3px;">${t}</span>`
    ).join('');
    return `<div style="padding:14px;background:var(--bg3);border:1px solid var(--border);margin-bottom:10px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        <div>
          <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text);font-weight:bold;">
            ${r.name}${ketoTag}${cuisineTag}
          </div>
          <div style="margin-top:4px;">${tags}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div>${stars}</div>
          <div style="font-family:var(--font-mono);font-size:0.55rem;color:var(--text-dim);">
            ${r.ratingCount||0} rating${(r.ratingCount||0)!==1?'s':''}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap;">
        <div style="text-align:center;">
          <div style="font-family:var(--font-display);font-size:1.3rem;color:var(--accent2);">${Math.round(totCal)}</div>
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);">KCAL</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:var(--font-display);font-size:1.3rem;color:var(--text);">${totProt.toFixed(0)}g</div>
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);">PROTEIN</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);padding-top:6px;">${(r.ingredients||[]).length} ingredients</div>
        </div>
      </div>
      ${r.description ? `<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);margin-bottom:8px;line-height:1.5;">${r.description}</div>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="openRvModal(${origIdx})" class="btn btn-s" style="font-size:0.6rem;">📖 VIEW RECIPE</button>
        <button onclick="importRecipeToMaker(${origIdx})" class="btn btn-s" style="font-size:0.6rem;">↓ IMPORT</button>
        ${SESSION.username === r.author ? `<button onclick="deleteRecipe(${origIdx})" style="background:none;border:none;color:var(--danger);font-family:var(--font-mono);font-size:0.6rem;cursor:pointer;">✕ DELETE</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function renderCommunityRecipes() {
  const el = document.getElementById('community-recipes-list');
  if (!el) return;

  const q        = (document.getElementById('cr-search')?.value || '').toLowerCase();
  const ketoOnly = document.getElementById('cr-filter-keto')?.checked || false;
  const sort     = document.getElementById('cr-sort')?.value || 'rating';

  let recipes = communityRecipes.filter(r => {
    if (q && !r.name.toLowerCase().includes(q) &&
        !(r.tags||[]).some(t => t.toLowerCase().includes(q))) return false;
    if (ketoOnly && !r.keto) return false;
    return true;
  });

  // Sort
  if (sort === 'rating') recipes.sort((a,b) => (b.avgRating||0) - (a.avgRating||0));
  else if (sort === 'newest') recipes.sort((a,b) => new Date(b.published||0) - new Date(a.published||0));
  else recipes.sort((a,b) => a.name.localeCompare(b.name));

  if (!recipes.length) {
    el.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);padding:12px;">
      No community recipes yet. Be the first to share one via the Recipe Maker tab.</div>`;
    return;
  }

  el.innerHTML = recipes.map((r, idx) => {
    const origIdx = communityRecipes.indexOf(r);
    const tots = (r.ingredients||[]).reduce((a,b)=>({cals:a.cals+b.cals,prot:a.prot+b.prot}),{cals:0,prot:0});
    const stars = [1,2,3,4,5].map(n =>
      `<span onclick="rateRecipe(${origIdx},${n})" style="cursor:pointer;font-size:1rem;color:${n<=(r.userRating||r.avgRating||0)?'#ffd700':'var(--border2)'};">★</span>`
    ).join('');
    const ketoTag = r.keto ? `<span style="font-size:0.48rem;padding:1px 5px;background:#4caf5022;color:#4caf50;border:1px solid #4caf5044;margin-left:4px;">KETO</span>` : '';
    const tags = (r.tags||[]).map(t =>
      `<span style="font-size:0.48rem;padding:1px 6px;background:var(--bg3);color:var(--border2);border:1px solid var(--border);margin-right:3px;">${t}</span>`
    ).join('');

    return `<div style="padding:14px;background:var(--bg3);border:1px solid var(--border);margin-bottom:10px;border-radius:2px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        <div>
          <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text);font-weight:bold;">
            ${r.name}${ketoTag}
          </div>
          <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);margin-top:2px;">
            by @${r.author||'anonymous'} · ${r.ingredients?.length||0} ingredients · ${Math.round(tots.cals)} kcal · ${tots.prot.toFixed(1)}g protein
          </div>
          <div style="margin-top:4px;">${tags}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div>${stars}</div>
          <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);">
            ${r.avgRating ? r.avgRating.toFixed(1)+' avg' : 'No ratings'} · ${r.ratingCount||0} vote${r.ratingCount!==1?'s':''}
          </div>
        </div>
      </div>

      ${r.instructions ? `<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);
        line-height:1.7;margin-bottom:8px;padding:8px 10px;background:var(--bg2);border-left:3px solid var(--border);">
        ${r.instructions.replace(/\n/g,'<br>')}</div>` : ''}

      <!-- Ingredients -->
      <details style="margin-bottom:8px;">
        <summary style="font-family:var(--font-mono);font-size:0.6rem;color:var(--accent2);cursor:pointer;letter-spacing:.08em;">
          VIEW INGREDIENTS (${r.ingredients?.length||0})
        </summary>
        <div style="margin-top:6px;">
          ${(r.ingredients||[]).map(ing =>
            `<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              ${ing.name} — ${ing.qty}${ing.unit} · ${ing.cals} kcal · ${ing.prot}g P</div>`
          ).join('')}
        </div>
      </details>

      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="importCommunityRecipe(${origIdx})" class="btn btn-s" style="font-size:0.58rem;padding:4px 10px;">
          ↓ IMPORT TO MY RECIPES
        </button>
        <button onclick="addCommunityRecipeToMeal(${origIdx})" class="btn btn-p" style="font-size:0.58rem;padding:4px 10px;">
          + ADD TO MEAL
        </button>
        ${r.author === SESSION.username ? `
          <button onclick="deleteCommunityRecipe(${origIdx})" style="font-family:var(--font-mono);font-size:0.55rem;padding:4px 8px;
            background:none;border:1px solid var(--border);color:var(--danger);cursor:pointer;">DELETE</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function openRvModal(recipeIdx) {
  const r   = communityRecipes[recipeIdx];
  const el  = document.getElementById('rv-modal');
  const cnt = document.getElementById('rv-modal-content');
  if (!r || !el || !cnt) return;

  const CUISINE_EMOJI = {
    american:'🇺🇸',mexican:'🌮',italian:'🍝',mediterranean:'🫒',asian:'🥢',
    japanese:'🍜',chinese:'🥟',indian:'🍛',thai:'🌶',greek:'🫙',
    french:'🥖',middle_eastern:'🧆',korean:'🍱',bbq:'🔥',other_cuisine:'🌍'
  };
  const totCal  = r.totalCalories || (r.ingredients||[]).reduce((s,i)=>s+(i.cals||0),0);
  const totProt = r.totalProtein  || (r.ingredients||[]).reduce((s,i)=>s+(i.prot||0),0);
  const totCarb = (r.ingredients||[]).reduce((s,i)=>s+(i.carb||0),0);
  const totFat  = (r.ingredients||[]).reduce((s,i)=>s+(i.fat||0),0);

  cnt.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.12em;margin-bottom:6px;">
      ${r.cuisine ? (CUISINE_EMOJI[r.cuisine]||'🌍')+' '+r.cuisine+' · ' : ''}BY ${(r.author||'').toUpperCase()}
    </div>
    <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--accent2);margin-bottom:10px;">${r.name}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
      ${[['KCAL',Math.round(totCal)],['PROTEIN',totProt.toFixed(1)+'g'],['CARBS',totCarb.toFixed(1)+'g'],['FAT',totFat.toFixed(1)+'g']].map(([l,v])=>`
        <div style="text-align:center;padding:8px;background:var(--bg3);border:1px solid var(--border);">
          <div style="font-family:var(--font-display);font-size:1.2rem;color:var(--accent2);">${v}</div>
          <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--border2);">${l}</div>
        </div>`).join('')}
    </div>
    ${(r.ingredients||[]).length ? `
    <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--border2);letter-spacing:.1em;margin-bottom:8px;">INGREDIENTS (${r.servings||1} serving${(r.servings||1)!==1?'s':''})</div>
    ${(r.ingredients).map(i=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-family:var(--font-mono);font-size:0.62rem;">
      <span style="color:var(--text);">${i.name}</span>
      <span style="color:var(--text-dim);">${i.qty||''} ${i.unit||''} · ${i.cals||0} kcal</span>
    </div>`).join('')}` : ''}
    ${r.instructions ? `<div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--border2);letter-spacing:.1em;margin:14px 0 8px;">INSTRUCTIONS</div>
    <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);line-height:1.7;">${r.instructions.replace(/\n/g,'<br>')}</div>` : ''}
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
      <button onclick="importRecipeToMaker(${recipeIdx});closeRvModal()" class="btn btn-s" style="font-size:0.6rem;">↓ IMPORT TO MAKER</button>
      <button onclick="closeRvModal()" class="btn btn-s" style="font-size:0.6rem;">CLOSE</button>
    </div>`;
  el.style.display = 'block';
}

function closeRvModal() {
  const el = document.getElementById('rv-modal');
  if (el) el.style.display = 'none';
}

async function deleteRecipe(recipeIdx) {
  const r = communityRecipes[recipeIdx];
  if (!r) return;
  if (r.author !== SESSION.username && !SESSION.isAdmin) { toast('Can only delete your own recipes'); return; }
  if (!confirm(`Delete "${r.name}"?`)) return;
  communityRecipes.splice(recipeIdx, 1);
  await db.collection('fooddb').doc('Recipes').set({ recipes: communityRecipes });
  renderRecipeViewer();
  toast('Recipe deleted');
}

async function publishRecipe() {
  const name = document.getElementById('recipe-name')?.value?.trim();
  if (!name || !recipeIngredients.length) { toast('Name your recipe and add ingredients first'); return; }
  if (!confirm(`Share "${name}" with the community? Everyone can see and use it.`)) return;

  const tags = (document.getElementById('recipe-tags')?.value || '')
    .split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const instructions = document.getElementById('recipe-instructions')?.value?.trim() || '';

  // Determine keto status from ingredients
  const tots = recipeIngredients.reduce((a,b)=>({cals:a.cals+b.cals,carb:a.carb+b.carb}),{cals:0,carb:0});
  const recipeKeto = tots.cals > 0 && ((tots.carb*4)/tots.cals) <= 0.10;

  const recipe = {
    name,
    author:       SESSION.username,
    published:    new Date().toISOString(),
    servings:     parseFloat(document.getElementById('recipe-servings')?.value) || 1,
    cuisine:      document.getElementById('recipe-cuisine')?.value || '',
    ingredients:  [...recipeIngredients],
    instructions,
    tags:         recipeKeto && !tags.includes('keto') ? [...tags,'keto'] : tags,
    keto:         recipeKeto,
    totalCalories: tots.cals,
    totalProtein:  tots.carb ? undefined : recipeIngredients.reduce((s,i)=>s+(i.prot||0),0),
    avgRating:    0,
    ratingCount:  0,
    ratings:      {},
  };

  try {
    communityRecipes.push(recipe);
    await db.collection('fooddb').doc('Recipes').set({ recipes: communityRecipes });
    toast(`✓ "${name}" shared with the community!`);
    nav('food');
    setTimeout(() => renderRecipeViewer(), 300);
  } catch(e) { toast('Publish failed: ' + e.message); communityRecipes.pop(); }
}

async function rateRecipe(recipeIdx, stars) {
  const r = communityRecipes[recipeIdx];
  if (!r) return;

  // Store this user's rating
  if (!r.ratings) r.ratings = {};
  r.ratings[SESSION.username] = stars;
  r.userRating = stars;

  // Recalc average
  const allRatings = Object.values(r.ratings);
  r.avgRating  = allRatings.reduce((a,b)=>a+b,0) / allRatings.length;
  r.ratingCount = allRatings.length;

  try {
    await db.collection('fooddb').doc('Recipes').set({ recipes: communityRecipes });
    renderCommunityRecipes();
  } catch(e) { toast('Rating save failed'); }
}

function importCommunityRecipe(recipeIdx) {
  const r = communityRecipes[recipeIdx];
  if (!r) return;
  // Load into recipe maker
  recipeIngredients = [...(r.ingredients||[])];
  document.getElementById('recipe-name').value         = r.name + ' (copy)';
  document.getElementById('recipe-instructions').value = r.instructions || '';
  document.getElementById('recipe-tags').value         = (r.tags||[]).join(', ');
  const cuisineEl = document.getElementById('recipe-cuisine');
  if (cuisineEl) cuisineEl.value = r.cuisine || '';
  renderRecipeIngredients();
  nav('food');
  setTimeout(() => foodTab('maker'), 100);
  toast(`Imported "${r.name}" — save to keep your own copy`);
}

function addCommunityRecipeToMeal(recipeIdx) {
  const r = communityRecipes[recipeIdx];
  if (!r || !r.ingredients?.length) return;
  // Load into maker and trigger add-to-meal flow
  recipeIngredients = [...r.ingredients];
  document.getElementById('recipe-name').value = r.name;
  updateRecipeTotals();
  nutTab('recipe');
  toast(`"${r.name}" loaded — select portion and click + ADD TO MEAL`);
}

async function deleteCommunityRecipe(recipeIdx) {
  const r = communityRecipes[recipeIdx];
  if (!r || r.author !== SESSION.username) return;
  if (!confirm(`Delete "${r.name}" from the community?`)) return;
  communityRecipes.splice(recipeIdx, 1);
  await db.collection('fooddb').doc('Recipes').set({ recipes: communityRecipes });
  renderCommunityRecipes();
  toast('Recipe deleted from community');
}

// Make functions global
//window.loadNutrition = loadNutrition;
//window.logMeal = logMeal;
window.updateUnitSelectors = updateUnitSelectors;