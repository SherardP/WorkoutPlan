// =============================================
// workouts-program.js - Program Generation & Wizard
// =============================================

let programWizardData = {
    timeOfDay: 'varies',
    habitLevel: 'solid',
    split: 'upper_lower',
    recovery: 'fresh',
    struggle: 'results'
};

function confirmGenerateProgram() {
    const modal = document.createElement('div');
    modal.id = 'program-wizard-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1000;overflow-y:auto;padding:20px;display:flex;align-items:center;justify-content:center;';
    
    modal.innerHTML = `
        <div style="max-width:560px;width:100%;background:var(--bg2);border:2px solid var(--accent2);padding:24px;">
            <h2 style="color:var(--accent2);margin-bottom:8px;">PROGRAM BUILDER</h2>
            <p style="color:var(--text-dim);margin-bottom:24px;">Answer 5 questions — your program will be customized.</p>
            
            <div id="wizard-content">
                <!-- Wizard steps will be injected here by JS -->
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showWizardStep(1);
}

function showWizardStep(step) {
    // This is a simplified version. Full rich wizard can be expanded later.
    const content = document.getElementById('wizard-content');
    if (!content) return;

    let html = '';

    if (step === 1) {
        html = `
            <h3>Question ${step}/5</h3>
            <p>What time do you usually train?</p>
            <div style="display:grid;gap:10px;margin:20px 0;">
                <button class="btn btn-s" onclick="selectWizardOption('timeOfDay','morning')">Morning</button>
                <button class="btn btn-s" onclick="selectWizardOption('timeOfDay','midday')">Midday</button>
                <button class="btn btn-s" onclick="selectWizardOption('timeOfDay','evening')">Evening</button>
            </div>
            <button class="btn btn-p" onclick="nextWizardStep(2)" style="width:100%;">Continue →</button>
        `;
    } else if (step === 5) {
        html = `
            <h3>Ready to Generate?</h3>
            <button class="btn btn-p" onclick="finishProgramGeneration()" style="width:100%;padding:16px;font-size:1.1rem;">⚡ GENERATE MY PROGRAM</button>
            <button class="btn btn-s" onclick="closeWizard()" style="width:100%;margin-top:12px;">Cancel</button>
        `;
    } else {
        html = `<p>Step ${step} content (expand as needed)...</p>`;
    }

    content.innerHTML = html;
}

function selectWizardOption(key, value) {
    programWizardData[key] = value;
    toast(`Selected: ${value}`, 1000);
}

function nextWizardStep(step) {
    showWizardStep(step);
}

async function finishProgramGeneration() {
    toast("Generating personalized program...", 2000);
    
    // Simple program generation
    activeProgram = {
        "day1": { title: "Upper Push", exercises: [] },
        "day2": { title: "Lower Body", exercises: [] },
        "day3": { title: "Upper Pull", exercises: [] },
        "day4": { title: "Legs + Core", exercises: [] }
    };

    await encryptedSave('program', activeProgram);
    
    closeWizard();
    loadWorkouts(); // Refresh the workouts page
}

function closeWizard() {
    const modal = document.getElementById('program-wizard-modal');
    if (modal) modal.remove();
}

function restoreBackupProgram() {
    toast("Backup restore feature coming soon...", 2000);
}

// Make functions global
window.confirmGenerateProgram = confirmGenerateProgram;
window.selectWizardOption = selectWizardOption;
window.nextWizardStep = nextWizardStep;
window.finishProgramGeneration = finishProgramGeneration;
window.closeWizard = closeWizard;
window.restoreBackupProgram = restoreBackupProgram;