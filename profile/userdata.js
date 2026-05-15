// ═══════════════════════════════════════════════════════════
// PROFILE EDITOR
// ═══════════════════════════════════════════════════════════
let profGender = 'male';

// Save equipment from profile subtab
async function saveEquipment() {
  const err = document.getElementById('equipmentErr');
  if (!err) return;
  
  const showErr = (msg) => { err.style.color = 'var(--danger)'; err.textContent = msg; };
  const showInfo = (msg) => { err.style.color = 'var(--accent2)'; err.textContent = msg; };
  
  showInfo('SAVING EQUIPMENT...');
  
  try {
    const newEquipment = collectEquipment();
    
    // Update Firebase
    await saveUser(SESSION.username, { equipment: newEquipment });
    
    // Update session
    SESSION.equipment = newEquipment;
    
    showInfo('✓ EQUIPMENT SAVED');
    setTimeout(() => { err.textContent = ''; }, 3000);
  } catch(e) {
    showErr('ERROR: ' + e.message);
  }
}

function openProfile() {
  if (!SESSION) return;
  nav('profile');
  // Switch to info subtab by default
  setTimeout(() => profileSubTab('info'), 100);
}

function profileSubTab(tab) {
  // Show/hide panels
  ['info','goals','equipment'].forEach(t => {
    const panel = document.getElementById('pprofile-' + t);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    const btn = document.getElementById('ptab-' + t);
    if (btn) btn.className = t === tab ? 'btn btn-p' : 'btn btn-s';
    // Fix font size — buttons use inline style
    if (btn) btn.style.fontSize = '0.65rem';
  });

  // Load goals data when switching to goals tab
  if (tab === 'goals' && typeof loadGoalsPage === 'function') {
    setTimeout(loadGoalsPage, 50);
  }

  // Load equipment when switching to equipment tab
  if (tab === 'equipment' && typeof loadEquipmentTab === 'function') {
    setTimeout(loadEquipmentTab, 50);
  }
}

function updateBMIPreview() {
  const ft  = parseFloat(document.getElementById('prof-height-ft')?.value) || 0;
  const ins = parseFloat(document.getElementById('prof-height-in')?.value) || 0;
  const lbs = parseFloat(document.getElementById('prof-weight')?.value) || 0;
  const preview = document.getElementById('prof-bmi-preview');
  if (!preview) return;
  if (!ft || !lbs) { preview.style.display = 'none'; return; }
  const totalInches = (ft * 12) + ins;
  const bmi = (lbs / (totalInches * totalInches)) * 703;
  let cat = '', color = '';
  if      (bmi < 18.5) { cat = 'UNDERWEIGHT'; color = '#64b5f6'; }
  else if (bmi < 25)   { cat = 'NORMAL WEIGHT'; color = '#4caf50'; }
  else if (bmi < 30)   { cat = 'OVERWEIGHT'; color = '#ff9800'; }
  else if (bmi < 35)   { cat = 'OBESE CLASS I'; color = '#f44336'; }
  else if (bmi < 40)   { cat = 'OBESE CLASS II'; color = '#e53935'; }
  else                 { cat = 'OBESE CLASS III'; color = '#b71c1c'; }
  document.getElementById('prof-bmi-val').textContent = bmi.toFixed(1);
  document.getElementById('prof-bmi-val').style.color = color;
  document.getElementById('prof-bmi-cat').textContent = cat;
  document.getElementById('prof-bmi-cat').style.color = color;
  preview.style.display = 'block';
}

// Helper: compute BMI from SESSION data
function getSessionBMI() {
  const ft  = SESSION.heightFt || 0;
  const ins = SESSION.heightIn || 0;
  const lbs = SESSION.weight   || 0;
  if (!ft || !lbs) return null;
  const totalIn = (ft * 12) + ins;
  return (lbs / (totalIn * totalIn)) * 703;
}

// Helper: get weight in kg from SESSION
function getWeightKg() {
  return SESSION.weight ? SESSION.weight * 0.453592 : null;
}

function closeProfile() {
  document.getElementById('profileModal').style.display = 'none';
}

function profSelectGender(g) {
  profGender = g;
  document.getElementById('prof-gb-male').classList.toggle('selected', g === 'male');
  document.getElementById('prof-gb-female').classList.toggle('selected', g === 'female');
}

async function saveProfile() {
  const newName   = document.getElementById('prof-name').value.trim();
  const newEmail  = document.getElementById('prof-email').value.trim();
  const newHtFt   = parseFloat(document.getElementById('prof-height-ft').value) || null;
  const newHtIn   = parseFloat(document.getElementById('prof-height-in').value) || 0;
  const newWeight = parseFloat(document.getElementById('prof-weight').value)    || null;
  const newAge    = parseInt(document.getElementById('prof-age').value)          || null;
  const currPass = document.getElementById('prof-curr-pass').value;
  const newPass = document.getElementById('prof-new-pass').value;
  const newPass2 = document.getElementById('prof-new-pass2').value;
  const err = document.getElementById('prof-err');

  const showErr = (msg) => { err.style.color = 'var(--danger)'; err.textContent = msg; };
  const showInfo = (msg) => { err.style.color = 'var(--accent2)'; err.textContent = msg; };

  if (!newName) return showErr('DISPLAY NAME REQUIRED');
  if (!currPass) return showErr('CURRENT PASSWORD REQUIRED TO SAVE CHANGES');

  showInfo('VERIFYING...');

  try {
    // Verify current password
    const salt = SESSION.username;
    const hash = await sha256hex(currPass + salt + '_verify');
    const user = await getUser(SESSION.username);
    if (!user) return showErr('USER NOT FOUND — TRY LOGGING OUT AND BACK IN');
    if (hash !== user.passHash) return showErr('CURRENT PASSWORD IS INCORRECT');

    // Validate new password if provided
    let newPassHash = user.passHash;
    let newDek = SESSION.dek;

    if (newPass) {
      if (newPass.length < 8) return showErr('NEW PASSWORD MIN 8 CHARACTERS');
      if (newPass !== newPass2) return showErr('NEW PASSWORDS DO NOT MATCH');
      newPassHash = await sha256hex(newPass + salt + '_verify');
      newDek = await deriveKey(newPass, salt + '_dek');
      const newDekRaw = await exportKeyRaw(newDek);

      // Re-encrypt all user data with new DEK
      showInfo('RE-ENCRYPTING DATA...');
      for (const type of ['workout','steps','body','nutrition']) {
        try {
          // Load with OLD dek (still in SESSION.dek)
          const entries = await encryptedLoad(type);
          if (entries.length > 0) {
            const json = JSON.stringify(entries);
            const enc = await encryptStr(newDek, json);
            await db.collection('userdata').doc(SESSION.username)
              .collection(type).doc('entries').set({ data: enc, updated: new Date().toISOString() });
          }
        } catch(e) { /* no data for this type — skip */ }
      }
      await saveUser(SESSION.username, { dekHint: newDekRaw });
    }

    showInfo('SAVING...');

    const newEquipment = collectEquipment();

    // Save updated profile to Firebase
    await saveUser(SESSION.username, {
      displayName: newName,
      gender: profGender,
      passHash: newPassHash,
      email: newEmail,
      heightFt: newHtFt,
      heightIn: newHtIn,
      weight: newWeight,
      age: newAge,
      equipment: newEquipment
    });

    // Update session in memory
    SESSION.displayName = newName;
    SESSION.gender      = profGender;
    SESSION.email       = newEmail;
    SESSION.heightFt    = newHtFt;
    SESSION.heightIn    = newHtIn;
    SESSION.weight      = newWeight;
    SESSION.age         = newAge;
    SESSION.dek         = newDek;
    SESSION.equipment   = newEquipment;

    // Update remember-me token if password changed
    if (newPass) await saveRememberToken(SESSION.username, newPassHash);

    // Update UI immediately
    document.getElementById('headerUser').textContent = newName.toUpperCase();
    updateLogos(profGender);
    applyTheme(profGender);

    closeProfile();
    toast('✓ PROFILE UPDATED SUCCESSFULLY');

  } catch(e) {
    showErr('ERROR: ' + e.message);
  }
}

// Close modal if clicking outside
document.addEventListener('click', e => {
  const modal = document.getElementById('profileModal');
  if (modal && modal.style.display === 'flex' && e.target === modal) closeProfile();
});

window.openProfile = openProfile;
window.profileSubTab = profileSubTab;