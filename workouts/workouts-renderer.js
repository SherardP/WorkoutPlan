// =============================================
// workouts-renderer.js - Exercise Rendering & UI
// Supports both:
//   • Built-in static/generated programs
//     (keys: prevDayStretch, preStretch, warmup, exercises, pump, cooldown)
//   • AI-imported programs
//     (keys: prevDayStretch, muscleActivation, coreWorkout, pumpWorkout, stretching)
// =============================================

// ── Key normaliser ───────────────────────────────────────────
// Maps any AI key name → the canonical internal name used by
// renderWorkoutSection so one rendering path handles both formats.
function normaliseDayKeys(day) {
    if (!day) return day;
    const d = { ...day };

    // muscleActivation → warmup  (activation IS the warm-up in new format)
    if (!d.warmup && d.muscleActivation) {
        d.warmup = d.muscleActivation;
        delete d.muscleActivation;
    }

    // coreWorkout → exercises
    if (!d.exercises && d.coreWorkout) {
        d.exercises = d.coreWorkout;
        delete d.coreWorkout;
    }

    // pumpWorkout → pump
    if (!d.pump && d.pumpWorkout) {
        d.pump = d.pumpWorkout;
        delete d.pumpWorkout;
    }

    // stretching → cooldown
    if (!d.cooldown && d.stretching) {
        d.cooldown = d.stretching;
        delete d.stretching;
    }

    // Ensure prevDayStretch always exists (empty array if missing)
    if (!d.prevDayStretch) d.prevDayStretch = [];

    // Ensure preStretch exists (used by old renderer path; empty if not in AI format)
    if (!d.preStretch) d.preStretch = [];

    // Ensure pump and exercises always exist as arrays
    if (!d.pump)      d.pump      = [];
    if (!d.exercises) d.exercises = [];
    if (!d.warmup)    d.warmup    = [];
    if (!d.cooldown)  d.cooldown  = [];

    return d;
}

// ── Main day renderer ────────────────────────────────────────
// Called by the early showWorkoutDay stub in workouts-core.js.
// Normalises keys first, then delegates to the real showWorkoutDay.
async function renderWorkoutDay(dayId) {
    const content = document.getElementById('workoutContent');
    if (!content) return;

    // Get the raw day data (may be built-in or AI-imported)
    const program = await getOrLoadProgram();
    const W = program ? program.days : getActiveWorkouts();
    const rawDay = W ? W[dayId] : null;

    if (!rawDay) {
        content.innerHTML = `<div class="card"><div class="card-title">No workout found for this day.</div></div>`;
        return;
    }

    // Rest day
    if (rawDay.rest) {
        content.innerHTML = `
            <div class="card" style="text-align:center;padding:40px 20px;">
                <div style="font-family:var(--font-display);font-size:2rem;color:var(--text-dim);letter-spacing:.1em;">REST DAY</div>
                <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--border2);margin-top:8px;">Recovery & Mobility</div>
            </div>`;
        return;
    }

    // Normalise so the rest of the renderer always sees the same key names
    const day = normaliseDayKeys(rawDay);

    // Merge normalised day back so showWorkoutDay (in workouts-core.js) also sees it
    if (program && program.days) program.days[dayId] = day;

    // Delegate to the full showWorkoutDay renderer in workouts-core.js
    // which calls renderWorkoutSection for each section.
    // We just ensure the day object is normalised before it gets there.
    if (typeof showWorkoutDay === 'function') {
        await showWorkoutDay(dayId);
    }
}

// ── Light exercise block (used as fallback / standalone) ─────
function createExerciseBlock(item, dayId) {
    const checked = (typeof workoutChecks !== 'undefined' && workoutChecks[item.id]) || false;
    const meta    = [item.sets, item.rest ? item.rest + ' rest' : '', item.notes || item.detail || '']
                      .filter(Boolean).join(' — ');
    const swappable = isSwappableItem(item);

    return `
        <div class="ex-block" id="exblock-${item.id}">
            <div class="ex-header" style="display:flex;align-items:center;gap:12px;padding:12px 16px;">
                <div onclick="event.stopPropagation();if(typeof toggleCheck==='function')toggleCheck('${item.id}','${dayId}');"
                     style="width:22px;height:22px;border:2px solid ${checked ? '#4caf50' : 'var(--border2)'};
                     border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;
                     background:${checked ? '#4caf5022' : 'transparent'};flex-shrink:0;">
                    ${checked ? '<span style="color:#4caf50;font-size:0.9rem;">✓</span>' : ''}
                </div>
                <div style="flex:1;cursor:pointer;"
                     onclick="toggleExerciseBody('${item.id}')">
                    <div class="ex-name">${item.name || ''}</div>
                    <div class="ex-meta">${meta}</div>
                </div>
                ${swappable ? `<button data-swap-btn="1"
                    onclick="event.stopPropagation();if(typeof openSwapModal==='function')openSwapModal('${item.id}','${dayId}')"
                    title="Swap for an alternative exercise"
                    style="font-family:var(--font-mono);font-size:0.52rem;padding:4px 8px;cursor:pointer;
                    background:var(--bg3);border:1px solid var(--border2);color:var(--border2);
                    letter-spacing:.08em;white-space:nowrap;flex-shrink:0;transition:all 0.2s;"
                    onmouseenter="this.style.borderColor='var(--accent2)';this.style.color='var(--accent2)'"
                    onmouseleave="this.style.borderColor='var(--border2)';this.style.color='var(--border2)'">
                    ⇄ SWAP
                </button>` : ''}
                <span style="color:var(--border2);font-size:0.9rem;">▾</span>
            </div>
            <div class="ex-body" id="body-${item.id}" style="display:none;padding:12px 16px;">
                ${item.notes  ? `<div class="ex-desc">${item.notes}</div>`  : ''}
                ${item.detail ? `<div class="ex-desc">${item.detail}</div>` : ''}
                ${(item.equipment && item.equipment.length)
                    ? `<div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--border2);margin-top:6px;">
                         Equipment: ${item.equipment.join(', ')}</div>` : ''}
                ${swappable ? `
                <div data-swap-cta="1" style="margin:8px 0;padding:8px 10px;background:var(--bg2);
                    border:1px solid var(--border);border-left:3px solid var(--border2);">
                    <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--border2);
                        letter-spacing:.1em;margin-bottom:5px;">DON'T LIKE THIS EXERCISE?</div>
                    <button onclick="if(typeof openSwapModal==='function')openSwapModal('${item.id}','${dayId}')"
                        style="font-family:var(--font-mono);font-size:0.62rem;padding:6px 14px;cursor:pointer;
                        background:var(--bg3);border:1px solid var(--accent2);color:var(--accent2);
                        letter-spacing:.08em;width:100%;transition:all 0.2s;"
                        onmouseenter="this.style.background='var(--accent-dim)'"
                        onmouseleave="this.style.background='var(--bg3)'">
                        ⇄ FIND ALTERNATIVE EXERCISE
                    </button>
                </div>` : ''}
                <button onclick="if(typeof toggleCheck==='function')toggleCheck('${item.id}','${dayId}')"
                    style="margin-top:10px;width:100%;padding:8px;font-family:var(--font-mono);
                    font-size:0.65rem;letter-spacing:.1em;cursor:pointer;border:none;
                    background:${checked ? '#4caf5022' : 'var(--bg3)'};
                    color:${checked ? '#4caf50' : 'var(--text-dim)'};
                    border:1px solid ${checked ? '#4caf5044' : 'var(--border)'};">
                    ${checked ? '✓ MARKED COMPLETE — CLICK TO UNDO' : '☐ MARK AS COMPLETE'}
                </button>
            </div>
        </div>`;
}

function toggleExerciseBody(itemId) {
    const body = document.getElementById(`body-${itemId}`);
    if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

// ── Post-render swap button injection ─────────────────────────
// Called by workouts-swap-patch.js after showWorkoutDay() finishes.
// Adds ⇄ SWAP buttons to exercise blocks rendered by workouts-core.js.
function injectSwapButtons(dayId) {
    const W = (typeof getActiveWorkouts === 'function') ? getActiveWorkouts() : {};
    const day = W[dayId];
    if (!day) return;

    const allItems = [
        ...(day.prevDayStretch || []),
        ...(day.preStretch     || []),
        ...(day.warmup         || []),
        ...(day.exercises      || []),
        ...(day.pump           || []),
        ...(day.cooldown       || []),
    ];

    allItems.forEach(item => {
        if (!isSwappableItem(item)) return;
        const block = document.getElementById('exblock-' + item.id);
        if (!block) return;

        // Header swap button — only add if not already present
        if (!block.querySelector('[data-swap-btn]')) {
            const header = block.querySelector('.ex-header');
            if (header) {
                const btn = document.createElement('button');
                btn.setAttribute('data-swap-btn', '1');
                btn.textContent = '⇄ SWAP';
                btn.title = 'Swap for an alternative exercise';
                btn.style.cssText =
                    'font-family:var(--font-mono);font-size:0.52rem;padding:4px 8px;cursor:pointer;' +
                    'background:var(--bg3);border:1px solid var(--border2);color:var(--border2);' +
                    'letter-spacing:.08em;white-space:nowrap;flex-shrink:0;transition:all 0.2s;';
                btn.addEventListener('mouseenter', () => {
                    btn.style.borderColor = 'var(--accent2)';
                    btn.style.color = 'var(--accent2)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.borderColor = 'var(--border2)';
                    btn.style.color = 'var(--border2)';
                });
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    if (typeof openSwapModal === 'function') openSwapModal(item.id, dayId);
                });
                // Insert before the ▾ chevron (last child of .ex-header)
                const chevron = header.lastElementChild;
                if (chevron) header.insertBefore(btn, chevron);
                else header.appendChild(btn);
            }
        }

        // Body "Find Alternative" CTA — only add if not already present
        const body = block.querySelector('.ex-body');
        if (body && !body.querySelector('[data-swap-cta]')) {
            const cta = document.createElement('div');
            cta.setAttribute('data-swap-cta', '1');
            cta.style.cssText =
                'margin:8px 0;padding:8px 10px;background:var(--bg2);' +
                'border:1px solid var(--border);border-left:3px solid var(--border2);';
            cta.innerHTML = `
                <div style="font-family:var(--font-mono);font-size:0.56rem;color:var(--border2);
                    letter-spacing:.1em;margin-bottom:5px;">DON'T LIKE THIS EXERCISE?</div>
                <button style="font-family:var(--font-mono);font-size:0.62rem;padding:6px 14px;
                    cursor:pointer;background:var(--bg3);border:1px solid var(--accent2);
                    color:var(--accent2);letter-spacing:.08em;width:100%;transition:all 0.2s;"
                    onmouseenter="this.style.background='var(--accent-dim)'"
                    onmouseleave="this.style.background='var(--bg3)'">
                    ⇄ FIND ALTERNATIVE EXERCISE
                </button>`;
            cta.querySelector('button').addEventListener('click', () => {
                if (typeof openSwapModal === 'function') openSwapModal(item.id, dayId);
            });
            // Insert before MARK AS COMPLETE button
            const markBtn = body.querySelector('button[onclick*="toggleCheck"]');
            if (markBtn) body.insertBefore(cta, markBtn);
            else body.appendChild(cta);
        }
    });
}

// ── Helper: is this item swappable (i.e. not a stretch/activation)? ──
function isSwappableItem(item) {
    if (!item) return false;
    if (item.type === 'stretch' || item.type === 'activate') return false;
    if (!item.sets && !item.badge) return false;
    return true;
}

// ── Expose globally ──────────────────────────────────────────
window.renderWorkoutDay    = renderWorkoutDay;
window.normaliseDayKeys    = normaliseDayKeys;
window.createExerciseBlock = createExerciseBlock;
window.toggleExerciseBody  = toggleExerciseBody;
window.injectSwapButtons   = injectSwapButtons;
window.isSwappableItem     = isSwappableItem;
