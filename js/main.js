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

// Make everything globally available
window.navigateTo = navigateTo;
window.initializeApp = initializeApp;
window.doLogout = doLogout;
window.openProfile = openProfile;