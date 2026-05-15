// =============================================
// data.js - Data Layer & Firebase
// =============================================

/*let db;
let SESSION = null;
let userGoals = {};
let currentFreqGoal = 4;
let selectedDays = new Set(['mon','tue','thu','fri']);
let currentDurationGoal = 60;*/

// ═══════════════════════════════════════════════════════════
// FIREBASE INIT — with error handling
// ═══════════════════════════════════════════════════════════
// ── Local date helper — always use device local time, never UTC ──
// Initialize Firebase
/*function initFirebase() {
    if (!firebase.apps.length) {
        // Replace with your own Firebase config if needed
        const firebaseConfig = {
            apiKey: "AIzaSyDUMMY-KEY-CHANGE-ME",
            authDomain: "adaptfit-ai.firebaseapp.com",
            projectId: "adaptfit-ai",
            storageBucket: "adaptfit-ai.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef123456"
        };
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("✅ Firebase initialized");
}*/

function localDateStr(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns "YYYY-MM-DDTHH:MM" in LOCAL time — safe for datetime-local inputs
function localDateTimeStr(date) {
  const d = date || new Date();
  return localDateStr(d) + 'T' +
    String(d.getHours()).padStart(2,'0') + ':' +
    String(d.getMinutes()).padStart(2,'0');
}

// Parse a date+time string from separate date ("YYYY-MM-DD") and time ("HH:MM")
// inputs as LOCAL time — avoids UTC interpretation bug
function parseDateTimeLocal(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y,mo,dy] = dateStr.split('-').map(Number);
  const [h,mi]    = timeStr.split(':').map(Number);
  return new Date(y, mo-1, dy, h, mi, 0, 0); // local time constructor
}

// Parse a datetime-local input value ("YYYY-MM-DDTHH:MM") as LOCAL time
function parseDateTimeLocalInput(val) {
  if (!val) return null;
  const [datePart, timePart] = val.split('T');
  return parseDateTimeLocal(datePart, timePart);
}

const firebaseConfig = {
  apiKey: "AIzaSyBbFkivfcy6McwvmrGkUQt03oe84Wvr5l0",
  authDomain: "operatorfit-9d323.firebaseapp.com",
  projectId: "operatorfit-9d323",
  storageBucket: "operatorfit-9d323.firebasestorage.app",
  messagingSenderId: "270542613965",
  appId: "1:270542613965:web:c029ec9760a738124a6884"
};

let db;
function showFatalError(msg) {
  document.getElementById('authScreen').innerHTML = `
    <div style="text-align:center;padding:40px 20px;max-width:460px;">
      <div style="font-family:'Courier New',monospace;font-size:2rem;color:#ff7a1a;margin-bottom:16px;">OPERATORFIT</div>
      <div style="background:#1c1c17;border:1px solid #cc2200;border-left:4px solid #cc2200;padding:20px;text-align:left;">
        <div style="font-family:'Courier New',monospace;font-size:0.7rem;color:#cc2200;letter-spacing:.15em;margin-bottom:8px;">CONNECTION ERROR</div>
        <div style="font-family:'Courier New',monospace;font-size:0.85rem;color:#e8e0c8;line-height:1.7;">${msg}</div>
      </div>
      <div style="margin-top:16px;font-family:'Courier New',monospace;font-size:0.65rem;color:#6b6b3a;line-height:1.8;">
        Check browser console (F12) for details.<br>
        Try a hard refresh: <strong style="color:#ff7a1a;">Ctrl+Shift+R</strong> (Windows) or <strong style="color:#ff7a1a;">Cmd+Shift+R</strong> (Mac)
      </div>
    </div>`;
}

try {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK did not load. Check your internet connection or try a hard refresh (Ctrl+Shift+R).');
  }
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  // Quick connectivity test — will throw if Firestore unreachable
  db.collection('_ping').limit(1).get().catch(() => {}); // silent — just warms connection
} catch(e) {
  showFatalError(e.message);
}

// Simple encryption for client-side storage (not secure, but deters casual viewing)
/*function encrypt(data) {
    return btoa(JSON.stringify(data));
}
function decrypt(str) {
    try {
        return JSON.parse(atob(str));
    } catch(e) {
        return [];
    }
}*/

// ═══════════════════════════════════════════════════════════
// CRYPTO ENGINE — AES-256-GCM + PBKDF2
// ═══════════════════════════════════════════════════════════
const ITER = 100000;

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt:enc.encode(salt), iterations:ITER, hash:'SHA-256' },
    keyMat, { name:'AES-GCM', length:256 }, true, ['encrypt','decrypt']
  );
}
async function exportKeyRaw(key) {
  const raw = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}
async function encryptStr(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv, 0); combined.set(new Uint8Array(ct), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}
async function decryptStr(key, b64) {
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ct = combined.slice(12);
  const pt = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}
async function sha256hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}


// Load data from Firebase + local fallback
/*async function encryptedLoad(collection) {
    if (!SESSION?.username) return [];
    try {
        const doc = await db.collection('userdata').doc(SESSION.username).collection(collection).doc('data').get();
        if (doc.exists) {
            return decrypt(doc.data().payload) || [];
        }
    } catch(e) {
        console.warn("Firebase load failed, using localStorage fallback");
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(`adaptfit_${SESSION.username}_${collection}`);
    return saved ? decrypt(saved) : [];
}*/

// Save data
/*async function encryptedSave(collection, data) {
    if (!SESSION?.username) return;
    const payload = encrypt(data);
    
    try {
        await db.collection('userdata').doc(SESSION.username).collection(collection).doc('data').set({
            payload: payload,
            updated: new Date().toISOString()
        });
    } catch(e) {
        console.warn("Firebase save failed, saving to localStorage");
    }
    
    localStorage.setItem(`adaptfit_${SESSION.username}_${collection}`, payload);
}*/

// Get current user
/*async function getUser(username) {
    try {
        const doc = await db.collection('users').doc(username).get();
        return doc.exists ? doc.data() : null;
    } catch(e) {
        console.error("Error fetching user:", e);
        return null;
    }
}*/
// ═══════════════════════════════════════════════════════════
// FIREBASE DATA LAYER — replaces localStorage
// ═══════════════════════════════════════════════════════════

// Users collection: /users/{username}
async function getUsers() {
  if (!db) throw new Error('Firebase not connected');
  const snap = await db.collection('users').get();
  const users = {};
  snap.forEach(doc => { users[doc.id] = doc.data(); });
  return users;
}
async function getUser(username) {
  if (!db) throw new Error('Firebase not connected');
  const doc = await db.collection('users').doc(username).get();
  return doc.exists ? doc.data() : null;
}
async function saveUser(username, data) {
  if (!db) throw new Error('Firebase not connected');
  await db.collection('users').doc(username).set(data, { merge: true });
}

// User data: /userdata/{username}/{type}/entries (single doc per type)
async function encryptedSave(type, entries) {
  const json = JSON.stringify(entries);
  const enc = await encryptStr(SESSION.dek, json);
  await db.collection('userdata').doc(SESSION.username)
    .collection(type).doc('entries').set({ data: enc, updated: new Date().toISOString() });
}
async function encryptedLoad(type) {
  try {
    const doc = await db.collection('userdata').doc(SESSION.username)
      .collection(type).doc('entries').get();
    if (!doc.exists) return [];
    const dec = await decryptStr(SESSION.dek, doc.data().data);
    return JSON.parse(dec);
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════
// REMEMBER ME — localStorage token only (no sensitive data)
// ═══════════════════════════════════════════════════════════
const SESSION_KEY = 'op_session_token';
const SESSION_DAYS = 30;

async function saveRememberToken(username, passHash) {
  const token = { username, passHash, expires: Date.now() + SESSION_DAYS * 86400000 };
  localStorage.setItem(SESSION_KEY, JSON.stringify(token));
}
function clearRememberToken() {
  localStorage.removeItem(SESSION_KEY);
}
async function tryAutoLogin() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const token = JSON.parse(raw);
    if (Date.now() > token.expires) { clearRememberToken(); return false; }
    const user = await getUser(token.username);
    if (!user || user.passHash !== token.passHash) { clearRememberToken(); return false; }
    // Re-derive DEK — we stored passHash which was sha256(pass+salt+'_verify')
    // We cannot re-derive DEK without the original password
    // So auto-login shows the login screen pre-filled instead
    document.getElementById('li-user').value = token.username;
    document.getElementById('li-remember').checked = true;
    showAutoLoginHint(token.username, user.displayName);
    return false; // Still need password for DEK derivation
  } catch { clearRememberToken(); return false; }
}
function showAutoLoginHint(username, displayName) {
  const err = document.getElementById('li-err');
  err.style.color = 'var(--accent2)';
  err.textContent = `WELCOME BACK ${displayName.toUpperCase()} — ENTER YOUR PASSWORD`;
}



// Save workout progress
async function saveWorkoutProgress(dayId) {
    if (!SESSION) return;
    const today = getWorkoutDate();
    try {
        await db.collection('userdata').doc(SESSION.username)
            .collection('wkchecks').doc(today).set({
                checks: workoutChecks,
                actuals: exerciseActuals,
                dayId: dayId,
                updated: new Date().toISOString()
            });
    } catch(e) {
        console.error("Failed to save workout progress", e);
    }
}

function getWorkoutDate() {
    const dateInput = document.getElementById('workout-date');
    return dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
}

// Initialize
//initFirebase();