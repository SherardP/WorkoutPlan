// =============================================
// auth.js - Authentication & Theme Logic
// =============================================

let currentAuthTab = 'login';

function authTab(tab) {
    currentAuthTab = tab;
    
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('onclick').includes(`'${tab}'`));
    });
    
    document.getElementById('panel-login').classList.toggle('active', tab === 'login');
    document.getElementById('panel-register').classList.toggle('active', tab === 'register');
}

function selectGender(gender) {
    regGender = g;
	document.getElementById('gb-male').classList.toggle('selected', g === 'male');
	document.getElementById('gb-female').classList.toggle('selected', g === 'female');
	applyTheme(g);
	updateLogos(g);
	document.getElementById('authTagline').textContent = g === 'female'
    ? '✦ ADAPTIVE · STRONG · RADIANT ✦'
    : '// ADAPTIVE · INTELLIGENT · RESULTS //';
}
async function doLogin() {
	const username = document.getElementById('li-user').value.trim().toLowerCase();
	const pass = document.getElementById('li-pass').value;
	const remember = document.getElementById('li-remember').checked;
	const err = document.getElementById('li-err');

	if (!db) return err.textContent = 'DATABASE NOT CONNECTED — check console (F12)';
	if (!username || !pass) return err.textContent = 'ENTER USERNAME AND PASSWORD';
	err.style.color = 'var(--danger)';
	err.textContent = 'CONNECTING TO DATABASE...';

	try {
		const user = await getUser(username);
		if (!user) return err.textContent = 'USER NOT FOUND — have you registered yet?';
		const salt = username;
		const hash = await sha256hex(pass + salt + '_verify');
		if (hash !== user.passHash) return err.textContent = 'INCORRECT PASSWORD';
		err.textContent = 'AUTHENTICATING...';
		const dek = await deriveKey(pass, salt + '_dek');
		SESSION = { username, displayName: user.displayName, gender: user.gender, dek, isAdmin: user.isAdmin,
		  email: user.email||'', heightFt: user.heightFt||null, heightIn: user.heightIn||0,
		  weight: user.weight||null, age: user.age||null, equipment: user.equipment||{} };
		if (remember) await saveRememberToken(username, user.passHash);
		else clearRememberToken();
		err.textContent = '';
		launchApp();
	} catch(e) {
		err.textContent = `ERROR: ${e.message}`;
	}
}

function doLogout() {
	SESSION = null;
	clearRememberToken();
	document.getElementById('appScreen').classList.remove('visible');
	document.getElementById('appScreen').style.display = '';
	document.getElementById('authScreen').style.display = 'flex';
	document.getElementById('li-user').value = '';
	document.getElementById('li-pass').value = '';
	document.getElementById('li-err').textContent = '';
	applyTheme('male');
}

async function doRegister() {
    const username = document.getElementById('rg-user').value.trim().toLowerCase();
	const displayName = document.getElementById('rg-name').value.trim();
	const pass = document.getElementById('rg-pass').value;
	const pass2 = document.getElementById('rg-pass2').value;
	const err = document.getElementById('rg-err');

	if (!db) return err.textContent = 'FIREBASE NOT CONNECTED — check console (F12)';
	if (!username || !displayName) return err.textContent = 'USERNAME AND NAME REQUIRED';
	if (username.length < 3) return err.textContent = 'USERNAME MIN 3 CHARACTERS';
	if (pass.length < 8) return err.textContent = 'PASSWORD MIN 8 CHARACTERS';
	if (pass !== pass2) return err.textContent = 'PASSWORDS DO NOT MATCH';

	err.textContent = 'CHECKING USERNAME...';
	const existing = await getUser(username);
	if (existing) return err.textContent = 'USERNAME ALREADY TAKEN';

	err.textContent = 'CREATING ACCOUNT...';
	const salt = username;
	const dek = await deriveKey(pass, salt + '_dek');
	const dekRaw = await exportKeyRaw(dek);
	const passHash = await sha256hex(pass + salt + '_verify');

	// Count existing users to determine if first (admin)
	const allUsers = await getUsers();
	const isAdmin = Object.keys(allUsers).length === 0;

	await saveUser(username, {
		displayName, gender: regGender, passHash,
		dekHint: dekRaw, joinDate: new Date().toISOString(), isAdmin
	});

	err.style.color = 'var(--success)';
	err.textContent = 'ACCOUNT SAVED TO FIREBASE ✓ — SIGNING IN...';
	setTimeout(() => {
		document.getElementById('li-user').value = username;
		document.getElementById('li-pass').value = pass;
		authTab('login');
		doLogin();
	}, 900);
}

// Theme Preview
function previewTheme() {
	const current = document.body.classList.contains('theme-female');
	const next = current ? 'male' : 'female';
	applyTheme(next);
	updateLogos(next);
	document.getElementById('themePreviewLabel').textContent = next === 'female' ? 'Male ⚡' : 'Female ✦';
}

function applyTheme(gender) {
  if (gender === 'female') document.body.classList.add('theme-female');
  else document.body.classList.remove('theme-female');
}

function authTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', (i===0&&tab==='login')||(i===1&&tab==='register')));
  document.getElementById('panel-login').classList.toggle('active', tab==='login');
  document.getElementById('panel-register').classList.toggle('active', tab==='register');
}

function launchApp() {
	const dateField = document.getElementById('workout-date');

	if (!dateField) {
        console.warn("workout-date field not found! Retrying in 100ms...");
        // If it's not found, wait a tiny bit and try again (useful for dynamic templates)
        setTimeout(launchApp, 100);
        return;
    }

	try {
		const authScreen = document.getElementById('authScreen');
		if (!authScreen) { console.error('authScreen not found'); return; }
		const appScreen = document.getElementById('appScreen');
		if (!appScreen) { console.error('appScreen not found'); return; }
		authScreen.style.display = 'none';
		appScreen.classList.add('visible');
		
		if (SESSION) {
		  applyTheme(SESSION.gender);
		  const headerUser = document.getElementById('headerUser');
		  if (!headerUser) { console.error('headerUser not found'); return; }
		  headerUser.textContent = SESSION.displayName.toUpperCase();
		  updateLogos(SESSION.gender);
		  
		  const adminNavBtn = document.getElementById('adminNavBtn');
		  if (adminNavBtn && SESSION.isAdmin) {
			adminNavBtn.style.display = '';
		  }
		}
		
		setTodayCard();
		buildWeekGrid();
		buildDayTabs();
		
		// Load program from Firebase, then show today's workout
		loadGeneratedProgram().then(program => {
			const workoutSub = document.getElementById('workoutSub');
			if (!workoutSub) { console.error('workoutSub not found'); return; }
			if (program) {
				workoutSub.textContent = `// ${program.splitLabel.toUpperCase()} — GENERATED PROGRAM //`;
				const genEl = document.getElementById('programGeneratedAt');
				if (genEl) {
				  const d = new Date(program.generatedAt);
				  genEl.textContent = `Generated ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
				}
			} else {
				const isF = SESSION && SESSION.gender === 'female';
				workoutSub.textContent = isF
				  ? '// 6-DAY SPLIT · GLUTE & CORE FOCUS //'
				  : '// 6-DAY SPLIT · UPPER/LOWER/CORE //';
			}
			showWorkoutDay(todayDayId() === 'sun' ? 'mon' : todayDayId());
		}).catch(e => console.error('loadGeneratedProgram error:', e));
		
		showPhase(1);
		buildTimeBudget();
		loadStats();
		setDefaultDates();
		// Replace nav('dashboard'); with this:
		if (typeof nav === 'function') {
			nav('dashboard');
		} else if (typeof navigateTo === 'function') {
			navigateTo('dashboard'); // Check if you named it navigateTo instead
		} else {
			console.error("Navigation function not found!");
		}
		
		
		setTimeout(() => {
			const wkDateEl = document.getElementById('workout-date');
			if (wkDateEl) {
				wkDateEl.value = localDateStr();
			} else {
				console.warn('workout-date field not found on current page');
			}
		}, 100);
		
		// Replace updateUnitSelectors(); with:
		if (typeof updateUnitSelectors === 'function') {
			updateUnitSelectors();
		} else {
			console.warn('updateUnitSelectors not found; skipping unit initialization.');
		}
		
		// Load goals in background safely
		if (typeof loadGoals === 'function') {
			loadGoals().catch(e => console.error('Failed to load goals:', e));
		} else {
			console.warn('loadGoals function not found; skipping goals initialization.');
		}
		renderLogSummary();
	} catch(e) {
		console.error('launchApp error:', e);
		alert('Error launching app: ' + e.message);
	}
}

// Make functions global
window.doLogout = doLogout;
window.authTab = authTab;
window.selectGender = selectGender;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.previewTheme = previewTheme;
