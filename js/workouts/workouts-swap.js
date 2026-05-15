// =============================================
// workouts-swap.js — Exercise Swap System
// =============================================

function ensureSwapModal() {
  if (document.getElementById('exercise-swap-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'exercise-swap-modal';
  modal.style.cssText =
    'display:none;position:fixed;top:0;left:0;width:100%;height:100%;' +
    'background:rgba(0,0,0,0.92);z-index:9500;overflow-y:auto;padding:16px;box-sizing:border-box;';
  modal.innerHTML = `
    <div style="max-width:600px;margin:0 auto;background:var(--bg2);border:2px solid var(--accent2);">
      <div style="padding:18px 20px 14px;border-bottom:1px solid var(--border);
        display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div style="min-width:0;">
          <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--accent2);
            letter-spacing:.18em;margin-bottom:4px;">⇄ SWAP EXERCISE</div>
          <div id="swap-replacing-label" style="font-family:var(--font-display);font-size:1.1rem;
            color:var(--text-bright);letter-spacing:.06em;line-height:1.2;word-break:break-word;"></div>
          <div id="swap-muscle-label" style="font-family:var(--font-mono);font-size:0.58rem;
            color:var(--border2);margin-top:4px;"></div>
        </div>
        <button onclick="closeSwapModal()"
          style="background:none;border:none;color:var(--text-dim);font-size:1.6rem;
          cursor:pointer;line-height:1;padding:0 4px;flex-shrink:0;">✕</button>
      </div>
      <div style="padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg3);
        display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <input id="swap-search" type="text" placeholder="Search exercises..."
          oninput="renderSwapList()"
          style="flex:1;min-width:120px;background:var(--bg2);border:1px solid var(--border);
          color:var(--text);font-family:var(--font-mono);font-size:0.72rem;
          padding:7px 10px;outline:none;box-sizing:border-box;">
        <label style="display:flex;align-items:center;gap:5px;font-family:var(--font-mono);
          font-size:0.6rem;color:var(--text-dim);cursor:pointer;white-space:nowrap;">
          <input type="checkbox" id="swap-same-muscle" checked onchange="renderSwapList()"
            style="accent-color:var(--accent);">SAME MUSCLE
        </label>
        <label style="display:flex;align-items:center;gap:5px;font-family:var(--font-mono);
          font-size:0.6rem;color:var(--text-dim);cursor:pointer;white-space:nowrap;">
          <input type="checkbox" id="swap-my-eq" checked onchange="renderSwapList()"
            style="accent-color:var(--accent);">MY EQUIPMENT
        </label>
      </div>
      <div id="swap-video-wrap" style="display:none;padding:12px 14px 0;">
        <div style="position:relative;padding-bottom:56.25%;height:0;border:1px solid var(--border);overflow:hidden;">
          <iframe id="swap-video-iframe" src="" allow="autoplay;encrypted-media" allowfullscreen
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe>
        </div>
        <div id="swap-video-label" style="font-family:var(--font-mono);font-size:0.58rem;
          color:var(--text-dim);padding:5px 2px;letter-spacing:.06em;"></div>
      </div>
      <div id="swap-list" style="max-height:52vh;overflow-y:auto;padding:8px 12px 12px;"></div>
      <div style="padding:8px 14px 12px;border-top:1px solid var(--border);">
        <div style="font-family:var(--font-mono);font-size:0.54rem;color:var(--text-dim);line-height:1.6;">
          Swap replaces this exercise for this session only. Your programme is not permanently changed.
        </div>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) closeSwapModal(); });
  document.body.appendChild(modal);
}

// ── State ─────────────────────────────────────────────────────
var _swapCtx = null;

// ── Open ──────────────────────────────────────────────────────
function openSwapModal(itemId, dayId) {
  ensureSwapModal();
  var W   = (typeof getActiveWorkouts === 'function') ? getActiveWorkouts() : {};
  var day = W[dayId];
  if (!day) return;
  var allItems = [].concat(
    day.prevDayStretch || [], day.preStretch || [], day.warmup || [],
    day.exercises || [], day.pump || [], day.cooldown || []
  );
  var item = allItems.filter(function(i){ return i.id === itemId; })[0];
  if (!item) return;
  var baseId = _swapGetBaseId(item);
  var srcEntry = (typeof EX_DB !== 'undefined')
    ? EX_DB.filter(function(e){ return e.id === baseId || e.name.toUpperCase() === (item.name||'').toUpperCase(); })[0]
    : null;
  _swapCtx = { itemId: itemId, dayId: dayId, item: item, srcEntry: srcEntry };
  document.getElementById('swap-replacing-label').textContent = item.name || '';
  document.getElementById('swap-muscle-label').textContent = srcEntry
    ? 'Targets: ' + (srcEntry.muscles||[]).slice(0,3).map(function(m){ return m.replace('-',' '); }).join(', ').toUpperCase()
    : '';
  document.getElementById('swap-search').value = '';
  document.getElementById('swap-same-muscle').checked = true;
  document.getElementById('swap-my-eq').checked = true;
  _swapHideVideo();
  var modal = document.getElementById('exercise-swap-modal');
  modal.style.display = 'block';
  modal.scrollTop = 0;
  renderSwapList();
}

// ── Close ─────────────────────────────────────────────────────
function closeSwapModal() {
  var modal = document.getElementById('exercise-swap-modal');
  if (modal) modal.style.display = 'none';
  _swapHideVideo();
  _swapCtx = null;
}

// ── Render list ───────────────────────────────────────────────
function renderSwapList() {
  var listEl = document.getElementById('swap-list');
  if (!listEl || !_swapCtx) return;
  if (typeof EX_DB === 'undefined') {
    listEl.innerHTML = '<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);padding:20px;text-align:center;">Exercise database not loaded.</div>';
    return;
  }
  var search     = (document.getElementById('swap-search').value || '').toLowerCase().trim();
  var sameMuscle = document.getElementById('swap-same-muscle').checked;
  var myEqOnly   = document.getElementById('swap-my-eq').checked;
  var userEq     = (typeof SESSION !== 'undefined' && SESSION && SESSION.equipment) ? SESSION.equipment : {};
  var srcEntry   = _swapCtx.srcEntry;
  var baseId     = _swapGetBaseId(_swapCtx.item);
  var srcMuscles = srcEntry ? (srcEntry.muscles || []) : [];
  var srcGoals   = srcEntry ? (srcEntry.goals   || []) : [];
  var itemName   = (_swapCtx.item.name || '').toUpperCase();

  var candidates = EX_DB.filter(function(ex) {
    if (ex.id === baseId) return false;
    if (ex.name.toUpperCase() === itemName) return false;
    if (myEqOnly && typeof userHasEquipment === 'function') {
      if (!userHasEquipment(ex.eq, userEq)) return false;
    }
    if (sameMuscle && srcMuscles.length > 0) {
      if (!ex.muscles.some(function(m){ return srcMuscles.indexOf(m) !== -1; })) return false;
    }
    if (search) {
      var hay = (ex.name + ' ' + ex.muscles.join(' ') + ' ' + ex.goals.join(' ')).toLowerCase();
      if (hay.indexOf(search) === -1) return false;
    }
    return true;
  }).map(function(ex) {
    var score = 0;
    if (ex.muscles[0] === srcMuscles[0]) score += 10;
    else if (ex.muscles.some(function(m){ return srcMuscles.indexOf(m) !== -1; })) score += 5;
    ex.goals.forEach(function(g){ if (srcGoals.indexOf(g) !== -1) score += 2; });
    if (srcEntry && srcEntry.impact === 'low' && ex.impact === 'low') score += 1;
    return { ex: ex, score: score };
  }).sort(function(a,b){ return b.score - a.score; }).slice(0, 40);

  if (!candidates.length) {
    listEl.innerHTML = '<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-dim);padding:24px;text-align:center;">No matching exercises found.<br><span style="font-size:0.6rem;color:var(--border2);">Try unchecking a filter above.</span></div>';
    return;
  }

  var GOAL_COLOR = { size:'#ff7a1a', strength:'#4caf50', tone:'#4a9eff', fat:'#cc44aa',
    endurance:'#64b5f6', posture:'#ffc107', lowimpact:'#80cbc4', recomp:'#ff9800',
    general:'var(--border2)', beginner:'#a5d6a7', yoga:'#ce93d8', pilates:'#f48fb1',
    calisthenics:'#80cbc4', military:'#ef9a9a' };

  listEl.innerHTML = candidates.map(function(c) {
    var ex = c.ex;
    var muscStr = (ex.muscles||[]).slice(0,3).map(function(m){ return m.replace('-',' '); }).join(', ');
    var goalBadges = (ex.goals||[]).slice(0,3).map(function(g) {
      var col = GOAL_COLOR[g] || 'var(--border)';
      return '<span style="font-family:var(--font-mono);font-size:0.5rem;padding:1px 5px;border:1px solid '+col+';color:'+col+';">'+g.toUpperCase()+'</span>';
    }).join(' ');
    var sameTag = (ex.muscles[0] === srcMuscles[0])
      ? '<span style="font-family:var(--font-mono);font-size:0.48rem;color:#4caf50;border:1px solid #4caf5044;padding:1px 4px;margin-left:4px;">SAME MUSCLE</span>' : '';
    var impactTag = (ex.impact === 'high')
      ? '<span style="font-family:var(--font-mono);font-size:0.48rem;color:#f44336;border:1px solid #f4433644;padding:1px 4px;margin-left:4px;">HIGH IMPACT</span>' : '';
    var safeName = (ex.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    var watchBtn = ex.ytId
      ? '<button onclick="previewSwapVideo(\''+ex.ytId+'\',\''+safeName+'\',this)" style="font-family:var(--font-mono);font-size:0.55rem;padding:4px 8px;cursor:pointer;background:var(--bg2);border:1px solid var(--border);color:var(--text-dim);white-space:nowrap;transition:all 0.15s;" onmouseenter="this.style.borderColor=\'var(--accent2)\';this.style.color=\'var(--accent2)\'" onmouseleave="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-dim)\'">▶ WATCH</button>'
      : '';
    return '<div style="padding:10px 12px;margin-bottom:6px;background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--border2);transition:border-left-color 0.15s;" onmouseenter="this.style.borderLeftColor=\'var(--accent2)\'" onmouseleave="this.style.borderLeftColor=\'var(--border2)\'">'
      + '<div style="display:flex;align-items:flex-start;gap:10px;">'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text);letter-spacing:.05em;margin-bottom:3px;">'+ex.name.toUpperCase()+sameTag+impactTag+'</div>'
      + '<div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--text-dim);margin-bottom:4px;">'+muscStr+'</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center;">'+goalBadges+'<span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--accent2);margin-left:4px;">'+(ex.sets_h||'')+'</span></div>'
      + '</div>'
      + '<div style="display:flex;gap:5px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;align-items:center;">'
      + watchBtn
      + '<button onclick="confirmSwap(\''+ex.id+'\')" style="font-family:var(--font-mono);font-size:0.58rem;padding:5px 12px;cursor:pointer;background:var(--accent);color:var(--bg);border:none;letter-spacing:.08em;white-space:nowrap;transition:background 0.15s;" onmouseenter="this.style.background=\'var(--accent2)\'" onmouseleave="this.style.background=\'var(--accent)\'">⇄ SWAP</button>'
      + '</div></div></div>';
  }).join('');
}

// ── Video preview ──────────────────────────────────────────────
function previewSwapVideo(ytId, name, btnEl) {
  var wrap   = document.getElementById('swap-video-wrap');
  var iframe = document.getElementById('swap-video-iframe');
  var label  = document.getElementById('swap-video-label');
  if (!wrap || !iframe) return;
  var newSrc = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
  if (wrap.style.display !== 'none' && iframe.src === newSrc) {
    _swapHideVideo();
    if (btnEl) btnEl.textContent = '▶ WATCH';
    return;
  }
  document.querySelectorAll('#swap-list button').forEach(function(b){
    if (b.textContent.trim().indexOf('▶') === 0) b.textContent = '▶ WATCH';
  });
  iframe.src = newSrc;
  label.textContent = name.toUpperCase();
  wrap.style.display = 'block';
  if (btnEl) btnEl.textContent = '▶ HIDE';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function _swapHideVideo() {
  var wrap   = document.getElementById('swap-video-wrap');
  var iframe = document.getElementById('swap-video-iframe');
  if (wrap)   wrap.style.display = 'none';
  if (iframe) iframe.src = '';
}

// ── Confirm swap ───────────────────────────────────────────────
function confirmSwap(newExId) {
  if (!_swapCtx || typeof EX_DB === 'undefined') return;
  var itemId   = _swapCtx.itemId;
  var dayId    = _swapCtx.dayId;
  var newEntry = EX_DB.filter(function(e){ return e.id === newExId; })[0];
  if (!newEntry) return;

  var isStrength = (window.userGoals && (window.userGoals.trainingFocus||[]).indexOf('focus-strength') !== -1);
  var rawSets = isStrength ? newEntry.sets_s : newEntry.sets_h;
  var rest    = isStrength ? newEntry.rest_s  : newEntry.rest_h;
  var restStr = rest >= 120 ? Math.round(rest/60)+' min' : rest > 0 ? rest+' sec' : '';
  var badge   = isStrength ? 'STRENGTH'
    : newEntry.goals.indexOf('size')  !== -1 ? 'HYPERTROPHY'
    : newEntry.goals.indexOf('tone')  !== -1 ? 'TONE' : 'CONDITIONING';

  var newItem = {
    id:          'swapped_'+dayId+'_'+newExId+'_'+Date.now(),
    name:        newEntry.name.toUpperCase(),
    badge:       badge,
    sets:        rawSets,
    rest:        restStr,
    ytId:        newEntry.ytId || '',
    desc:        'Targets: '+newEntry.muscles.join(', ')+'. '+rawSets+(restStr?' · '+restStr+' rest':'')+'.',
    generated:   true,
    swapped:     true,
    originalId:  itemId,
    progressions: newEntry.progressions || null
  };

  var program = (typeof SESSION !== 'undefined' && SESSION) ? SESSION._program : null;
  var W = program ? program.days
        : (typeof getActiveWorkouts === 'function' ? getActiveWorkouts() : null);
  if (!W || !W[dayId]) {
    if (typeof toast === 'function') toast('Could not locate workout day.');
    return;
  }
  var day      = W[dayId];
  var sections = ['prevDayStretch','preStretch','warmup','exercises','pump','cooldown'];
  var swapped  = false;
  for (var s = 0; s < sections.length; s++) {
    var arr = day[sections[s]];
    if (!Array.isArray(arr)) continue;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === itemId) { arr[i] = newItem; swapped = true; break; }
    }
    if (swapped) break;
  }
  if (!swapped) {
    if (typeof toast === 'function') toast('Exercise not found — could not swap.');
    return;
  }
  if (program) SESSION._program = program;
  closeSwapModal();
  if (typeof showWorkoutDay === 'function') showWorkoutDay(dayId);
  if (typeof toast === 'function') toast('⇄ SWAPPED TO: ' + newEntry.name.toUpperCase());
}

// ── Helper ─────────────────────────────────────────────────────
function _swapGetBaseId(item) {
  if (!item) return '';
  var parts = (item.id || '').split('_');
  if (parts[0] === 'gen' && parts.length >= 4) return parts.slice(3).join('_');
  if (parts[0] === 'swapped' && item.originalId) return _swapGetBaseId({ id: item.originalId });
  return item.id || '';
}

// ── Expose globals ─────────────────────────────────────────────
window.openSwapModal    = openSwapModal;
window.closeSwapModal   = closeSwapModal;
window.renderSwapList   = renderSwapList;
window.previewSwapVideo = previewSwapVideo;
window.confirmSwap      = confirmSwap;
