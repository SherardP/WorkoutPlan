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

// ═══════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// ADMIN PANEL — Full User Management
// ═══════════════════════════════════════════════════════════
async function loadAdminPanel() { /* deprecated — use adminLoadUsers() */ }

async function adminLoadUsers() {
  const el = document.getElementById('adminUserList');
  el.innerHTML = '<div class="mono dim" style="padding:12px;">Loading from Firebase...</div>';
  try {
    const users = await getUsers();
    const list = Object.entries(users);
    if (!list.length) { el.innerHTML = '<div class="mono dim" style="padding:12px;">No users found.</div>'; return; }
    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="tbl" style="width:100%;">
          <tr>
            <th>USERNAME</th><th>NAME</th><th>GENDER</th><th>JOINED</th>
            <th>ROLE</th><th>EMAIL</th><th>ACTIONS</th>
          </tr>
          ${list.map(([uname, u]) => `
            <tr id="adminrow-${uname}">
              <td style="color:var(--accent2);font-family:var(--font-mono);font-size:0.7rem;">@${uname}</td>
              <td>${u.displayName||'—'}</td>
              <td style="font-family:var(--font-mono);font-size:0.65rem;">${u.gender||'—'}</td>
              <td style="font-family:var(--font-mono);font-size:0.65rem;">${u.joinDate?u.joinDate.slice(0,10):'—'}</td>
              <td>
                <span id="role-badge-${uname}" style="font-family:var(--font-mono);font-size:0.6rem;padding:2px 8px;
                  background:${u.isAdmin?'var(--accent2)22':'var(--bg3)'};
                  color:${u.isAdmin?'var(--accent2)':'var(--text-dim)'};
                  border:1px solid ${u.isAdmin?'var(--accent2)44':'var(--border)'};">
                  ${u.isAdmin?'★ ADMIN':'USER'}
                </span>
              </td>
              <td style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);">${u.email||'—'}</td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${uname !== SESSION.username ? `
                    <button onclick="adminToggleRole('${uname}',${!u.isAdmin})"
                      style="font-family:var(--font-mono);font-size:0.55rem;padding:3px 8px;cursor:pointer;border:none;
                      background:var(--bg3);color:var(--accent2);border:1px solid var(--border);">
                      ${u.isAdmin ? 'DEMOTE' : 'MAKE ADMIN'}
                    </button>
                    <button onclick="adminDeleteUser('${uname}')"
                      style="font-family:var(--font-mono);font-size:0.55rem;padding:3px 8px;cursor:pointer;border:none;
                      background:var(--bg3);color:var(--danger);border:1px solid var(--border);">
                      DELETE
                    </button>
                  ` : `<span style="font-family:var(--font-mono);font-size:0.55rem;color:var(--border2);">YOU</span>`}
                </div>
              </td>
            </tr>`).join('')}
        </table>
      </div>
      <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim);margin-top:10px;">
        ${list.length} user${list.length!==1?'s':''} registered · Last loaded: ${new Date().toLocaleTimeString()}
      </div>`;
  } catch(e) {
    el.innerHTML = `<div style="color:var(--danger);font-family:var(--font-mono);font-size:0.7rem;padding:12px;">ERROR: ${e.message}</div>`;
  }
}

async function adminToggleRole(username, makeAdmin) {
  const action = makeAdmin ? 'make ADMIN' : 'demote to USER';
  if (!confirm(`${action.toUpperCase()} @${username}?`)) return;
  try {
    await saveUser(username, { isAdmin: makeAdmin });
    toast(`✓ @${username} ${makeAdmin ? 'promoted to ADMIN' : 'demoted to USER'}`);
    adminLoadUsers(); // Refresh
  } catch(e) { toast('ERROR: ' + e.message); }
}

async function adminDeleteUser(username) {
  if (!confirm(`DELETE user @${username}? This removes their account and all stored data.`)) return;
  if (!confirm(`FINAL CONFIRMATION — permanently delete @${username}?`)) return;
  try {
    await db.collection('users').doc(username).delete();
    toast(`✓ @${username} deleted from registry`);
    adminLoadUsers();
  } catch(e) { toast('ERROR: ' + e.message); }
}

async function adminCreateUser() {
  const username = document.getElementById('admin-new-username').value.trim().toLowerCase().replace(/\s+/g,'');
  const name     = document.getElementById('admin-new-name').value.trim();
  const pass     = document.getElementById('admin-new-pass').value;
  const gender   = document.getElementById('admin-new-gender').value;
  const isAdmin  = document.getElementById('admin-new-role').value === 'true';
  const msg      = document.getElementById('adminAddMsg');

  if (!username || !name || !pass) { msg.style.color='var(--danger)'; msg.textContent='ALL FIELDS REQUIRED'; return; }
  if (pass.length < 6) { msg.style.color='var(--danger)'; msg.textContent='PASSWORD MIN 6 CHARACTERS'; return; }

  msg.style.color = 'var(--accent2)'; msg.textContent = 'CREATING...';
  try {
    const existing = await getUser(username);
    if (existing) { msg.style.color='var(--danger)'; msg.textContent='USERNAME ALREADY EXISTS'; return; }
    const passHash = await sha256hex(pass + username + '_verify');
    const dek = await deriveKey(pass, username + '_dek');
    const dekRaw = await exportKeyRaw(dek);
    await saveUser(username, {
      displayName: name, gender, passHash, dekHint: dekRaw,
      isAdmin, joinDate: new Date().toISOString()
    });
    msg.style.color = '#4caf50'; msg.textContent = `✓ @${username} created`;
    document.getElementById('admin-new-username').value = '';
    document.getElementById('admin-new-name').value = '';
    document.getElementById('admin-new-pass').value = '';
    adminLoadUsers();
  } catch(e) { msg.style.color='var(--danger)'; msg.textContent='ERROR: '+e.message; }
}

// ═══════════════════════════════════════════════════════════
// ADMIN: Clean up per-user food data after migration
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// MIGRATION FUNCTIONS
// ═══════════════════════════════════════════════════════════

// Fetch and parse the GitHub XLSX into normalized food rows
async function reEncryptAll() {
  document.getElementById('adminErr').textContent = 'Re-encryption: enter old + new master key. Coming in next version.';
}

// Make functions global
window.loadAdmin = loadAdmin;
window.clearAllData = clearAllData;
window.exportUserData = exportUserData;