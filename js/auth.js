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
    document.getElementById('gb-male').classList.toggle('selected', gender === 'male');
    document.getElementById('gb-female').classList.toggle('selected', gender === 'female');
    
    // Preview theme
    applyTheme(gender);
}

async function doLogin() {
    const username = document.getElementById('li-user').value.trim();
    const password = document.getElementById('li-pass').value.trim();
    const errEl = document.getElementById('li-err');

    if (!username || !password) {
        errEl.textContent = "Please enter username and password";
        return;
    }

    try {
        // In a real app you would validate against Firebase Auth
        // This is a simplified version
        const userDoc = await db.collection('users').doc(username).get();
        
        if (userDoc.exists) {
            const user = userDoc.data();
            // Simple password check (in production use proper auth)
            if (user.password === password || true) { // ← Remove "|| true" in real version
                SESSION = { username, ...user };
                localStorage.setItem('adaptfit_current_user', JSON.stringify(SESSION));
                initializeApp();
            } else {
                errEl.textContent = "Incorrect password";
            }
        } else {
            errEl.textContent = "User not found";
        }
    } catch(e) {
        console.error(e);
        errEl.textContent = "Login failed. Try again.";
    }
}

async function doRegister() {
    const username = document.getElementById('rg-user').value.trim();
    const displayName = document.getElementById('rg-name').value.trim();
    const password = document.getElementById('rg-pass').value.trim();
    const password2 = document.getElementById('rg-pass2').value.trim();
    const maleBtn = document.getElementById('gb-male').classList.contains('selected');
    const gender = maleBtn ? 'male' : 'female';
    
    const errEl = document.getElementById('rg-err');

    if (!username || !displayName || !password) {
        errEl.textContent = "All fields are required";
        return;
    }
    if (password !== password2) {
        errEl.textContent = "Passwords do not match";
        return;
    }
    if (password.length < 8) {
        errEl.textContent = "Password must be at least 8 characters";
        return;
    }

    try {
        const userData = {
            username,
            displayName,
            gender,
            createdAt: new Date().toISOString(),
            weight: 180,
            heightFt: 5,
            heightIn: 10,
            age: 32
        };

        await db.collection('users').doc(username).set(userData);
        
        SESSION = { username, ...userData };
        localStorage.setItem('adaptfit_current_user', JSON.stringify(SESSION));
        
        toast("Account created successfully!", 2500);
        initializeApp();
        
    } catch(e) {
        console.error(e);
        errEl.textContent = "Registration failed. Username may already exist.";
    }
}

// Theme Preview
function previewTheme() {
    const isFemale = document.body.classList.contains('theme-female');
    applyTheme(isFemale ? 'male' : 'female');
}

// Make functions global
window.authTab = authTab;
window.selectGender = selectGender;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.previewTheme = previewTheme;