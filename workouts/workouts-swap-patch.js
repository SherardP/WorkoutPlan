// =============================================
// workouts-swap-patch.js
// Wires swap buttons into every workout render
// by wrapping window.showWorkoutDay after all
// deferred scripts have loaded.
//
// Load LAST in index.html, after all other scripts:
//   <script src="js/workouts/workouts-swap.js" defer></script>
//   <script src="js/workouts/workouts-swap-patch.js" defer></script>
// =============================================

(function applySwapPatch() {

  function patch() {
    // window.showWorkoutDay is exported at the bottom of workouts-core.js.
    // Deferred scripts run in order, so by the time this script runs
    // window.showWorkoutDay is already the real async function.
    if (typeof window.showWorkoutDay !== 'function') {
      setTimeout(patch, 200);
      return;
    }
    // Don't double-patch
    if (window.showWorkoutDay._swapPatched) return;

    const _real = window.showWorkoutDay;

    window.showWorkoutDay = async function patchedShowWorkoutDay(dayId) {
      await _real.call(this, dayId);
      // Give the DOM 100ms to fully settle before injecting buttons
      setTimeout(function() {
        if (typeof injectSwapButtons === 'function') {
          injectSwapButtons(dayId);
        }
      }, 100);
    };

    window.showWorkoutDay._swapPatched = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }

})();
