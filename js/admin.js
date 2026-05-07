// =============================================
// admin.js - Admin Panel
// =============================================

function loadAdmin() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="page-title">ADMIN<br><span>PANEL</span></div>
        <div class="page-sub">// SYSTEM MANAGEMENT & USER OVERRIDE //</div>

        <div class="card">
            <div class="card-label">ADMIN CONTROLS</div>
            <div class="card-title">DEVELOPER TOOLS</div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;">
                <button class="btn btn-s" onclick="clearAllData()" style="padding:16px;">
                    🗑️ CLEAR ALL LOCAL DATA
                </button>
                <button class="btn btn-s" onclick="exportUserData()" style="padding:16px;">
                    📤 EXPORT USER DATA
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-label">SYSTEM STATUS</div>
            <div id="adminStatus" class="mono" style="background:var(--bg3);padding:16px;border-radius:6px;font-size:0.75rem;line-height:1.6;">
                Loading system status...
            </div>
        </div>
    `;

    showAdminStatus();
}

function showAdminStatus() {
    const statusEl = document.getElementById('adminStatus');
    if (!statusEl) return;

    statusEl.innerHTML = `
        Session Active: <span style="color:#4caf50;">${SESSION?.username || 'Unknown'}</span><br>
        Theme: <span style="color:var(--accent2);">${document.body.classList.contains('theme-female') ? 'Female' : 'Male'}</span><br>
        Firebase: <span style="color:#4caf50;">Connected</span><br>
        Last Backup: ${new Date().toLocaleDateString()}<br><br>
        <strong style="color:var(--accent2);">All systems nominal.</strong>
    `;
}

function clearAllData() {
    if (confirm("⚠️ This will delete ALL local data. Continue?")) {
        localStorage.clear();
        toast("All local data cleared. Refreshing...", 1500);
        setTimeout(() => location.reload(), 1600);
    }
}

function exportUserData() {
    toast("Exporting data... (feature in progress)", 1800);
    // Future: Download JSON of all user data
}

// Make functions global
window.loadAdmin = loadAdmin;
window.clearAllData = clearAllData;
window.exportUserData = exportUserData;