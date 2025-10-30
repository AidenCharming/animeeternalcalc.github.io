// --- OPTIMIZATION: Element Cache ---
// This object will hold references to all our DOM elements
// for much faster access. It's populated in DOMContentLoaded.
const el = {};

// --- Tab Switching Logic ---
const tabs = ['rankup', 'eta', 'ttk', 'raid', 'checklist'];
function switchTab(activeTab) {
    tabs.forEach(tab => {
        // Use cached elements
        const panel = el[`panel-${tab}`]; // Uses bracket notation (correct)
        const button = el[`tab-${tab}`]; // Uses bracket notation (correct)
        
        // Safety check if elements don't exist
        if (panel && button) {
            if (tab === activeTab) {
                panel.classList.remove('hidden');
                button.classList.add('active');
            } else {
                panel.classList.add('hidden');
                button.classList.remove('active');
            }
        }
    });
}

// Global objects to hold dynamically loaded data.
// 'worldData' is now defined in data-core.js!
// 'activityData' will be populated by loadAllData().
const activityData = {};


// --- Helper Functions ---
function getNumberValue(id) {
    // Use cached element
    if (el[id]) { // Uses bracket notation (correct)
        return parseFloat(el[id].value) || 0;
    }
    return 0;
}

function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    // Create a reversed copy to find the largest denomination match first
    const reversedDenominations = [...denominations].reverse();
    for (const denom of reversedDenominations) {
        // We check for > 1 to skip the 'None' denomination
        if (denom.value > 1 && num >= denom.value) {
            return `${(num / denom.value).toFixed(2)}${denom.name}`;
        }
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// --- Debounce Function ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- NEW SYNC HELPER FUNCTION ---
/**
 * Creates a sync function for denomination inputs.
 * Uses cached elements.
 */
function syncDenominationInput(sourceTextId, sourceValueId, destTextId, destValueId, destCallback) {
    // Get elements from cache
    const sourceTextEl = el[sourceTextId];
    const sourceValueEl = el[sourceValueId];
    const destTextEl = el[destTextId];
    const destValueEl = el[destValueId];

    return function() {
        if (!sourceTextEl || !sourceValueEl || !destTextEl || !destValueEl) {
            console.warn("Sync function missing elements, aborting.");
            return;
        }
        
        // Copy values from source to destination
        destTextEl.value = sourceTextEl.value;
        destValueEl.value = sourceValueEl.value;
        
        // Trigger the destination's calculation function
        if (destCallback) {
            destCallback();
        }
    }
}


// --- LocalStorage Save/Load Functions (Refactored for element cache) ---
function saveRankUpData() {
    try {
        // These are all camelCase IDs, so el.dotNotation is fine
        if (el.rankSelect) localStorage.setItem('ae_rankSelect', el.rankSelect.value);
        if (el.rankInput) localStorage.setItem('ae_rankInput', el.rankInput.value);
        if (el.currentEnergy) localStorage.setItem('ae_currentEnergy', el.currentEnergy.value);
        if (el.currentEnergyDenominationInput) localStorage.setItem('ae_currentEnergyDenomInput', el.currentEnergyDenominationInput.value);
        if (el.currentEnergyDenominationValue) localStorage.setItem('ae_currentEnergyDenomValue', el.currentEnergyDenominationValue.value);
        if (el.energyPerClick) localStorage.setItem('ae_energyPerClick', el.energyPerClick.value);
        if (el.energyPerClickDenominationInput) localStorage.setItem('ae_energyPerClickDenomInput', el.energyPerClickDenominationInput.value);
        if (el.energyPerClickDenominationValue) localStorage.setItem('ae_energyPerClickDenomValue', el.energyPerClickDenominationValue.value);
        if (el.clickerSpeed) localStorage.setItem('ae_clickerSpeed', el.clickerSpeed.checked);
    } catch (e) {
        console.error("Failed to save rankup data to localStorage", e);
    }
}

function loadRankUpData() {
    try {
        const rankSelect = localStorage.getItem('ae_rankSelect');
        if (rankSelect && el.rankSelect) {
            el.rankSelect.value = rankSelect;
            if (el.rankInput) el.rankInput.value = rankSelect;
        }

        const rankInput = localStorage.getItem('ae_rankInput');
        if (rankInput && el.rankInput) el.rankInput.value = rankInput;

        const currentEnergy = localStorage.getItem('ae_currentEnergy');
        if (currentEnergy && el.currentEnergy) el.currentEnergy.value = currentEnergy;

        const currentEnergyDenomInput = localStorage.getItem('ae_currentEnergyDenomInput');
        if (currentEnergyDenomInput && el.currentEnergyDenominationInput) el.currentEnergyDenominationInput.value = currentEnergyDenomInput;

        const currentDenom = denominations.find(d => d.name === currentEnergyDenomInput);
        if (el.currentEnergyDenominationValue) {
            el.currentEnergyDenominationValue.value = currentDenom ? currentDenom.value : '1';
        }

        const energyPerClick = localStorage.getItem('ae_energyPerClick');
        if (energyPerClick && el.energyPerClick) el.energyPerClick.value = energyPerClick;

        const energyPerClickDenomInput = localStorage.getItem('ae_energyPerClickDenomInput');
        if (energyPerClickDenomInput && el.energyPerClickDenominationInput) el.energyPerClickDenominationInput.value = energyPerClickDenomInput;

        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomInput);
        if (el.energyPerClickDenominationValue) {
            el.energyPerClickDenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }

        const clickerSpeed = localStorage.getItem('ae_clickerSpeed');
        if (clickerSpeed !== null && el.clickerSpeed && el.clickerSpeedETA) {
            const isChecked = (clickerSpeed === 'true');
            el.clickerSpeed.checked = isChecked;
            el.clickerSpeedETA.checked = isChecked;
        }

        displayRankRequirement();
        calculateRankUp();

    } catch (e) {
        console.error("Failed to load rankup data from localStorage", e);
    }
}

function saveETAData() {
    try {
        if (el.currentEnergyETA) localStorage.setItem('ae_currentEnergyETA', el.currentEnergyETA.value);
        if (el.currentEnergyETADenominationInput) localStorage.setItem('ae_currentEnergyETADenomInput', el.currentEnergyETADenominationInput.value);
        if (el.currentEnergyETADenominationValue) localStorage.setItem('ae_currentEnergyETADenomValue', el.currentEnergyETADenominationValue.value);
        if (el.targetEnergyETA) localStorage.setItem('ae_targetEnergyETA', el.targetEnergyETA.value);
        if (el.targetEnergyETADenominationInput) localStorage.setItem('ae_targetEnergyETADenomInput', el.targetEnergyETADenominationInput.value);
        if (el.targetEnergyETADenominationValue) localStorage.setItem('ae_targetEnergyETADenomValue', el.targetEnergyETADenominationValue.value);
        if (el.energyPerClickETA) localStorage.setItem('ae_energyPerClickETA', el.energyPerClickETA.value);
        if (el.energyPerClickETADenominationInput) localStorage.setItem('ae_energyPerClickETADenomInput', el.energyPerClickETADenominationInput.value);
        if (el.energyPerClickETADenominationValue) localStorage.setItem('ae_energyPerClickETADenomValue', el.energyPerClickETADenominationValue.value);
        if (el.clickerSpeedETA) localStorage.setItem('ae_clickerSpeedETA', el.clickerSpeedETA.checked);
    } catch(e) {
        console.error("Failed to save ETA data to localStorage", e);
    }
}

function loadETAData() {
    try {
        const currentEnergyNum = localStorage.getItem('ae_currentEnergyETA') || '';
        if (el.currentEnergyETA) el.currentEnergyETA.value = currentEnergyNum;

        const currentEnergyDenomText = localStorage.getItem('ae_currentEnergyETADenomInput') || '';
        if (el.currentEnergyETADenominationInput) el.currentEnergyETADenominationInput.value = currentEnergyDenomText;

        const currentDenom = denominations.find(d => d.name === currentEnergyDenomText);
        if (el.currentEnergyETADenominationValue) {
            el.currentEnergyETADenominationValue.value = currentDenom ? currentDenom.value : '1';
        }

        const targetEnergyNum = localStorage.getItem('ae_targetEnergyETA') || '';
        if (el.targetEnergyETA) el.targetEnergyETA.value = targetEnergyNum;

        const targetEnergyDenomText = localStorage.getItem('ae_targetEnergyETADenomInput') || '';
        if (el.targetEnergyETADenominationInput) el.targetEnergyETADenominationInput.value = targetEnergyDenomText;

        const targetDenom = denominations.find(d => d.name === targetEnergyDenomText);
        if (el.targetEnergyETADenominationValue) {
            el.targetEnergyETADenominationValue.value = targetDenom ? targetDenom.value : '1';
        }

        const energyPerClickNum = localStorage.getItem('ae_energyPerClickETA') || '';
        if (el.energyPerClickETA) el.energyPerClickETA.value = energyPerClickNum;

        const energyPerClickDenomText = localStorage.getItem('ae_energyPerClickETADenomInput') || '';
        if (el.energyPerClickETADenominationInput) el.energyPerClickETADenominationInput.value = energyPerClickDenomText;

        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (el.energyPerClickETADenominationValue) {
            el.energyPerClickETADenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }

        const clickerSpeed = localStorage.getItem('ae_clickerSpeedETA');
        if (clickerSpeed !== null && el.clickerSpeed && el.clickerSpeedETA) {
            const isChecked = (clickerSpeed === 'true');
            // Sync both toggles
            el.clickerSpeed.checked = isChecked;
            el.clickerSpeedETA.checked = isChecked;
        }

        calculateEnergyETA();
    } catch(e) {
        console.error("Failed to load ETA data from localStorage", e);
    }
}

function saveTTKData() {
    try {
        if (el.worldSelect) localStorage.setItem('ae_ttk_world', el.worldSelect.value);
        if (el.enemySelect) localStorage.setItem('ae_ttk_enemy', el.enemySelect.value);
        if (el.yourDPS) localStorage.setItem('ae_ttk_dps', el.yourDPS.value);
        if (el.dpsDenominationInput) localStorage.setItem('ae_ttk_dpsDenomInput', el.dpsDenominationInput.value);
        if (el.dpsDenominationValue) localStorage.setItem('ae_ttk_dpsDenomValue', el.dpsDenominationValue.value);
        if (el.enemyQuantity) localStorage.setItem('ae_ttk_quantity', el.enemyQuantity.value);
        if (el.fourSpotFarming) localStorage.setItem('ae_ttk_fourSpot', el.fourSpotFarming.checked);
    } catch(e) {
        console.error("Failed to save TTK data to localStorage", e);
    }
}

function loadTTKData() {
    try {
        const dps = localStorage.getItem('ae_ttk_dps');
        if (dps && el.yourDPS) el.yourDPS.value = dps;

        const dpsDenomInput = localStorage.getItem('ae_ttk_dpsDenomInput');
        if (dpsDenomInput && el.dpsDenominationInput) el.dpsDenominationInput.value = dpsDenomInput;
        
        const dpsDenom = denominations.find(d => d.name === dpsDenomInput);
        if (el.dpsDenominationValue) {
            el.dpsDenominationValue.value = dpsDenom ? dpsDenom.value : '1';
        }

        const quantity = localStorage.getItem('ae_ttk_quantity');
        if (quantity && el.enemyQuantity) el.enemyQuantity.value = quantity;
        
        const fourSpot = localStorage.getItem('ae_ttk_fourSpot');
        if (fourSpot !== null && el.fourSpotFarming) {
            el.fourSpotFarming.checked = (fourSpot === 'true');
        }

        const world = localStorage.getItem('ae_ttk_world');
        if (world && el.worldSelect) {
            el.worldSelect.value = world;
            populateEnemyDropdown(); 
            
            const enemy = localStorage.getItem('ae_ttk_enemy');
            if (enemy && el.enemySelect) {
                el.enemySelect.value = enemy;
                displayEnemyHealth(); 
            }
        }
        calculateTTK();
    } catch(e) {
        console.error("Failed to load TTK data from localStorage", e);
    }
}

function saveRaidData() {
    try {
        if (el.activitySelect) localStorage.setItem('ae_raid_activity', el.activitySelect.value);
        if (el.yourDPSActivity) localStorage.setItem('ae_raid_dps', el.yourDPSActivity.value);
        if (el.dpsActivityDenominationInput) localStorage.setItem('ae_raid_dpsDenomInput', el.dpsActivityDenominationInput.value);
        if (el.dpsActivityDenominationValue) localStorage.setItem('ae_raid_dpsDenomValue', el.dpsActivityDenominationValue.value);
        if (el.activityTimeLimit) localStorage.setItem('ae_raid_timeLimit', el.activityTimeLimit.value);
    } catch(e) {
        console.error("Failed to save Raid data to localStorage", e);
    }
}

function loadRaidData() {
    try {
        const dps = localStorage.getItem('ae_raid_dps');
        if (dps && el.yourDPSActivity) el.yourDPSActivity.value = dps;

        const dpsDenomInput = localStorage.getItem('ae_raid_dpsDenomInput');
        if (dpsDenomInput && el.dpsActivityDenominationInput) el.dpsActivityDenominationInput.value = dpsDenomInput;
        
        const dpsDenom = denominations.find(d => d.name === dpsDenomInput);
        if (el.dpsActivityDenominationValue) {
            el.dpsActivityDenominationValue.value = dpsDenom ? dpsDenom.value : '1';
        }

        const timeLimit = localStorage.getItem('ae_raid_timeLimit');
        if (timeLimit && el.activityTimeLimit) el.activityTimeLimit.value = timeLimit;

        const activity = localStorage.getItem('ae_raid_activity');
        if (activity && el.activitySelect) {
            // Check if the activity option exists before setting it
            if (el.activitySelect.querySelector(`option[value="${activity}"]`)) {
                el.activitySelect.value = activity;
            } else {
                console.warn(`Saved activity "${activity}" not found in dropdown.`);
            }
            handleActivityChange();
        }
        calculateMaxStage();
    } catch(e) {
        console.error("Failed to load Raid data from localStorage", e);
    }
}


// --- Calculator Logics (Refactored for element cache) ---

function calculateEnergyETA() {
    // Check if all required elements exist
    if (!el.clickerSpeedETA || !el.currentEnergyETA || !el.currentEnergyETADenominationValue || 
        !el.targetEnergyETA || !el.targetEnergyETADenominationValue || !el.energyPerClickETA || 
        !el.energyPerClickETADenominationValue || !el.etaResult || !el.etaReturnTime) {
        return; // Exit if elements aren't ready
    }

    const isFastClicker = el.clickerSpeedETA.checked;

    const currentEnergyValue = getNumberValue('currentEnergyETA');
    const currentEnergyDenom = (parseFloat(el.currentEnergyETADenominationValue.value) || 1);
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    const targetEnergyValue = getNumberValue('targetEnergyETA');
    const targetEnergyDenom = (parseFloat(el.targetEnergyETADenominationValue.value) || 1);
    const targetEnergy = targetEnergyValue * targetEnergyDenom;

    const energyPerClickValue = getNumberValue('energyPerClickETA');
    const energyPerClickDenom = (parseFloat(el.energyPerClickETADenominationValue.value) || 1);
    const energyPerClick = energyPerClickValue * energyPerClickDenom;

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = targetEnergy - currentEnergy;
    const returnTimeEl = el.etaReturnTime;

    if (energyNeeded <= 0) {
        el.etaResult.innerText = 'Target Reached!';
        returnTimeEl.innerText = "You're already there!";
        saveETAData();
        return;
    }
    if (energyPerClick <= 0 || clicksPerSecond <= 0) {
        el.etaResult.innerText = 'N/A';
        returnTimeEl.innerText = '';
        saveETAData();
        return;
    }

    const timeInSeconds = (energyNeeded / energyPerClick) / clicksPerSecond;

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);

    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;

    el.etaResult.innerText = resultString.trim();

    const now = new Date();
    const returnTime = new Date(now.getTime() + timeInSeconds * 1000);
    const returnString = returnTime.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    returnTimeEl.innerText = `Return on: ${returnString}`;
    
    saveETAData();
}


function calculateTTK() {
    if (!el.enemyHealth || !el.yourDPS || !el.dpsDenominationValue || !el.enemyQuantity || 
        !el.fourSpotFarming || !el.ttkResult || !el.questTTKResult || !el.questReturnTime) {
        return; // Exit if elements aren't ready
    }

    const enemyHealth = getNumberValue('enemyHealth');
    const dpsInput = getNumberValue('yourDPS');
    const dpsMultiplier = parseFloat(el.dpsDenominationValue.value) || 1;
    const yourDPS = dpsInput * dpsMultiplier;
    
    const quantity = Math.floor(getNumberValue('enemyQuantity')) || 0;
    const isFourSpot = el.fourSpotFarming.checked;

    const singleResultEl = el.ttkResult;
    const questResultEl = el.questTTKResult;
    const questReturnEl = el.questReturnTime;

    if (enemyHealth <= 0 || yourDPS <= 0) {
        singleResultEl.innerText = 'N/A';
        questResultEl.innerText = '';
        questReturnEl.innerText = '';
        saveTTKData();
        return;
    }

    const timeInSeconds = enemyHealth / yourDPS;

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);

    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;
    
    if (resultString.trim() === '0s') {
        singleResultEl.innerText = "Instakill";
    } else {
        singleResultEl.innerText = resultString.trim();
    }

    if (quantity > 0) {
        const ENEMY_RESPAWN_TIME = 3;
        const ENEMY_GROUP_SIZE = isFourSpot ? 4 : 1;
        const respawnLimitPerKill = ENEMY_RESPAWN_TIME / ENEMY_GROUP_SIZE;
        const yourTimePerKill = timeInSeconds + 0.5; 
        const effectiveTimePerKill = Math.max(yourTimePerKill, respawnLimitPerKill);
        const totalTimeInSeconds = effectiveTimePerKill * quantity;

        const totalDays = Math.floor(totalTimeInSeconds / 86400);
        const totalHours = Math.floor((totalTimeInSeconds % 86400) / 3600);
        const totalMinutes = Math.floor((totalTimeInSeconds % 3600) / 60);
        const totalSeconds = Math.round(totalTimeInSeconds % 60);

        let totalResultString = '';
        if (totalDays > 0) totalResultString += `${totalDays}d `;
        if (totalHours > 0 || totalDays > 0) totalResultString += `${totalHours}h `;
        if (totalMinutes > 0 || totalHours > 0 || totalDays > 0) totalResultString += `${totalMinutes}m `;
        totalResultString += `${totalSeconds}s`;

        questResultEl.innerText = `Time for ${quantity} kills: ${totalResultString.trim()}`;

        const now = new Date();
        const returnTime = new Date(now.getTime() + totalTimeInSeconds * 1000);
        const returnString = returnTime.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        questReturnEl.innerText = `Mobs killed by: ${returnString}`;

    } else {
        questResultEl.innerText = '';
        questReturnEl.innerText = '';
    }
    
    saveTTKData();
}

function displayRankRequirement() {
    if (!el.rankSelect || !el.energyForRankFormatted) return;
    const selectedRank = el.rankSelect.value;
    if (selectedRank && rankRequirements[selectedRank]) {
        el.energyForRankFormatted.innerText = formatNumber(rankRequirements[selectedRank]);
    } else {
        el.energyForRankFormatted.innerText = 'Select a rank to see requirement';
    }
}

function calculateRankUp() {
    if (!el.clickerSpeed || !el.currentEnergy || !el.currentEnergyDenominationValue || !el.energyPerClick ||
        !el.energyPerClickDenominationValue || !el.rankSelect || !el.rankUpResult || !el.rankUpReturnTime) {
        return; // Exit if elements aren't ready
    }
    const isFastClicker = el.clickerSpeed.checked;

    const currentEnergyValue = (getNumberValue('currentEnergy') || 0);
    const currentEnergyDenom = (parseFloat(el.currentEnergyDenominationValue.value) || 1);
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    const energyPerClickValue = (getNumberValue('energyPerClick') || 0);
    const energyPerClickDenom = (parseFloat(el.energyPerClickDenominationValue.value) || 1);
    const energyPerClick = energyPerClickValue * energyPerClickDenom;

    const selectedRank = el.rankSelect.value;
    const energyForRank = rankRequirements[selectedRank] || 0;

    const returnTimeEl = el.rankUpReturnTime;

    if (!energyForRank) {
        el.rankUpResult.innerText = 'Select a rank';
        returnTimeEl.innerText = '';
        saveRankUpData();
        return;
    }

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = energyForRank - currentEnergy;

    if (energyNeeded <= 0) {
        el.rankUpResult.innerText = 'Rank Up Ready!';
        returnTimeEl.innerText = 'Ready to rank up now!';
        saveRankUpData();
        return;
    }
    if (energyPerClick <= 0) {
        el.rankUpResult.innerText = 'N/A';
        returnTimeEl.innerText = '';
        saveRankUpData();
        return;
    }

    const timeInSeconds = (energyNeeded / energyPerClick) / clicksPerSecond;

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);

    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;

    el.rankUpResult.innerText = resultString.trim();

    const now = new Date();
    const returnTime = new Date(now.getTime() + timeInSeconds * 1000);
    const returnString = returnTime.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    returnTimeEl.innerText = `Return on: ${returnString}`;
    
    saveRankUpData();
}

function populateWorldDropdown() {
    // worldData is now available globally from data-core.js
    const worldSelect = el.worldSelect;
    if (!worldSelect) return;
    
    // Clear existing options except the first one
    while (worldSelect.options.length > 1) {
        worldSelect.remove(1);
    }
    
    Object.keys(worldData).forEach(worldName => {
        const option = document.createElement('option');
        option.value = worldName;
        option.innerText = worldName;
        worldSelect.appendChild(option);
    });
}

function populateEnemyDropdown() {
    const enemySelect = el.enemySelect;
    if (!enemySelect || !el.worldSelect || !el.enemyHealth || !el.enemyHealthDisplay) return;

    const selectedWorldName = el.worldSelect.value;
    const world = worldData[selectedWorldName]; // Use global worldData

    enemySelect.innerHTML = '<option value="">-- Select an Enemy --</option>';
    el.enemyHealth.value = '';
    el.enemyHealthDisplay.innerText = 'Select an enemy to see health';

    if (world && world.enemies) {
        Object.keys(world.enemies).forEach(enemyName => {
            const option = document.createElement('option');
            option.value = enemyName;
            option.innerText = enemyName;
            enemySelect.appendChild(option);
        });
    }
    displayEnemyHealth();
}

function displayEnemyHealth() {
    if (!el.worldSelect || !el.enemySelect || !el.enemyHealth || !el.enemyHealthDisplay) return;

    const selectedWorldName = el.worldSelect.value;
    const selectedEnemy = el.enemySelect.value;
    const world = worldData[selectedWorldName]; // Use global worldData
    const enemyHealthInput = el.enemyHealth;
    const enemyHealthDisplay = el.enemyHealthDisplay;

    if (world && world.enemies && world.enemies[selectedEnemy]) {
        const healthValue = world.enemies[selectedEnemy];
        enemyHealthInput.value = healthValue;
        enemyHealthDisplay.innerText = formatNumber(healthValue);
    } else {
        enemyHealthInput.value = '';
        enemyHealthDisplay.innerText = 'Select an enemy to see health';
    }
    calculateTTK();
}

// --- OPTIMIZATION: Updated Data Loading Function ---
async function loadAllData() {
    // This function now *only* loads the activity bundle.
    // worldData is already defined in data-core.js.
    try {
        // Fetch the single *activity* bundled data file
        const response = await fetch('activity-bundle.json'); // <-- CHANGED
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bundle = await response.json();
        
        // Assign data from the single bundle
        // We only need to assign activities now
        Object.assign(activityData, bundle.activities || {});
        
        console.log("DEBUG: Successfully loaded and parsed activity-bundle.json");

    } catch (error) {
        console.error("Fatal error loading activity-bundle.json:", error);
        // Alert the user that the app is broken
        alert("Failed to load critical raid/dungeon data. Please refresh the page.");
    }
}
// --- END OPTIMIZATION ---

function populateActivityDropdown() {
    const select = el.activitySelect;
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select an Activity --</option>';

    // Sort keys alphabetically for a consistent order
    const sortedActivityNames = Object.keys(activityData).sort((a, b) => a.localeCompare(b));

    sortedActivityNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        select.appendChild(option);
    });
}

function handleActivityChange() {
    if (!el.activitySelect || !el.activityResult || !el.activityTimeLimit || !el.activityResultLabel) return;
    
    const selection = el.activitySelect.value;
    const activity = activityData[selection];
    const resultLabel = el.activityResultLabel;

    if (!activity) {
        el.activityResult.innerText = '0 / 0';
        el.activityTimeLimit.value = ''; // Clear time limit
        return;
    }

    el.activityTimeLimit.value = activity.timeLimit;

    // Use "Wave" for raids, "Room" for dungeons
    if (activity.type === 'raid') {
        resultLabel.innerText = 'Estimated Max Wave:';
    } else {
        resultLabel.innerText = 'Estimated Max Room:';
    }
    calculateMaxStage();
}

function calculateMaxStage() {
    if (!el.activitySelect || !el.yourDPSActivity || !el.dpsActivityDenominationValue || 
        !el.activityTimeLimit || !el.activityResult) {
        return; // Exit if elements aren't ready
    }
    
    const selection = el.activitySelect.value;
    if (!selection) {
        el.activityResult.innerText = '0 / 0';
        saveRaidData();
        return;
    }

    const activity = activityData[selection];
    const yourDPS = (getNumberValue('yourDPSActivity') || 0) * (parseFloat(el.dpsActivityDenominationValue.value) || 1);
    const timeLimit = getNumberValue('activityTimeLimit');
    const resultEl = el.activityResult;

    // Default to a maximum of 0 stages if data is missing
    const maxStages = activity ? activity.maxStages : 0;

    if (!activity || yourDPS <= 0 || timeLimit <= 0) {
        resultEl.innerText = `0 / ${maxStages}`;
        saveRaidData();
        return;
    }

    const maxDamageInTime = yourDPS * timeLimit;
    let completedStage = 0;

    if (activity.enemies) {
        const singleEnemyRaids = ["Mundo Raid", "Gleam Raid", "Tournament Raid"];

        for (let i = 1; i <= maxStages; i++) {
            const stageKey = `Room ${i}`;
            let stageHealth = activity.enemies[stageKey];

            if (!stageHealth) {
                console.warn(`Health data missing for ${selection} - ${stageKey}`);
                break;
            }

            stageHealth = parseFloat(stageHealth);

            let enemyMultiplier = 1;
            if (activity.type === 'raid' && !singleEnemyRaids.includes(selection)) {
                enemyMultiplier = 5;
            }

            const totalStageHealth = stageHealth * enemyMultiplier;

            if (maxDamageInTime < totalStageHealth) {
                break;
            }
            completedStage = i;
        }
    } else {
        console.warn(`Activity "${selection}" does not have the expected 'enemies' structure.`);
    }

    resultEl.innerText = `${completedStage} / ${maxStages}`;
    saveRaidData();
}


// --- Searchable Dropdown Logic (Refactored for element cache) ---
function setupRankSearch(inputId, valueId, listId) {
    const inputEl = el[inputId];
    const valueEl = el[valueId];
    const listEl = el[listId];

    if (!inputEl || !valueEl || !listEl) {
        console.error("Missing elements for setupRankSearch:", inputId);
        return;
    }

    const allRanks = Object.keys(rankRequirements).sort((a, b) => parseInt(a) - parseInt(b));

    function filterAndShowRanks() {
        const filterText = inputEl.value.trim();
        const filtered = allRanks.filter(rank => rank.startsWith(filterText));
        renderRanksList(filtered);
    }

    function renderRanksList(list) {
        listEl.innerHTML = '';
        if (list.length === 0) {
            listEl.classList.add('hidden');
            return;
        }
        list.forEach(rank => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-[#3a3a5a] cursor-pointer text-sm';
            item.textContent = rank;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                inputEl.value = rank;
                valueEl.value = rank;
                listEl.classList.add('hidden');
                displayRankRequirement();
                calculateRankUp();
            });
            listEl.appendChild(item);
        });
        listEl.classList.remove('hidden');
    }

    function handleRankInputBlur() {
        setTimeout(() => {
            if (!inputEl || !valueEl) return; // Safety check
            const rankValue = inputEl.value.trim();
            if (rankRequirements[rankValue]) {
                if (valueEl.value !== rankValue) {
                    valueEl.value = rankValue;
                    displayRankRequirement();
                    calculateRankUp();
                }
            }
            if (listEl) listEl.classList.add('hidden');
        }, 150);
    }

    function handleRankInputFocus() {
        filterAndShowRanks();
    }


    inputEl.addEventListener('input', debounce(filterAndShowRanks, 300));
    inputEl.addEventListener('focus', handleRankInputFocus);
    inputEl.addEventListener('blur', handleRankInputBlur);
}


function setupDenominationSearch(inputId, valueId, listId, callback) {
    const inputEl = el[inputId];
    const valueEl = el[valueId];
    const listEl = el[listId];

    if (!inputEl || !valueEl || !listEl) {
        console.error("Missing elements for setupDenominationSearch:", inputId);
        return;
    }

    function filterAndShowDenominations() {
        const filterText = inputEl.value.trim().toLowerCase();
        const filtered = denominations.filter(d => d.name.toLowerCase().startsWith(filterText));
        renderDenominationsList(filtered);
    }

    function renderDenominationsList(list) {
        listEl.innerHTML = '';
        if (list.length === 0) { listEl.classList.add('hidden'); return; }

        list.sort((a, b) => a.value - b.value);

        list.forEach(d => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-[#3a3a5a] cursor-pointer text-sm';
            item.textContent = d.name === 'None' ? 'None (No Abbreviation)' : d.name;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                inputEl.value = d.name === 'None' ? '' : d.name;
                valueEl.value = d.value;
                listEl.classList.add('hidden');
                if (callback) callback();
            });
            listEl.appendChild(item);
        });
        listEl.classList.remove('hidden');
    }

    function handleDenominationBlur() {
         setTimeout(() => {
            if (!inputEl || !valueEl) return; // Safety check
            const inputText = inputEl.value.trim();
            const foundDenom = denominations.find(d => d.name.toLowerCase() === inputText.toLowerCase());

            if (foundDenom) {
                valueEl.value = foundDenom.value;
                inputEl.value = foundDenom.name === 'None' ? '' : foundDenom.name;
            } else if (inputText === '') {
                valueEl.value = 1;
            } else {
                const currentValue = parseFloat(valueEl.value) || 1;
                const currentDenom = denominations.find(d => d.value == currentValue);
                inputEl.value = currentDenom && currentDenom.name !== 'None' ? currentDenom.name : '';
            }

            if (listEl) listEl.classList.add('hidden');
            if (callback) callback();
        }, 150);
    }

    function handleDenominationFocus() {
        filterAndShowDenominations();
    }

    inputEl.addEventListener('input', debounce(filterAndShowDenominations, 300));
    inputEl.addEventListener('focus', handleDenominationFocus);
    inputEl.addEventListener('blur', handleDenominationBlur);
}

// --- Global Click Listener to Hide Dropdowns ---
document.addEventListener('click', (event) => {
    const relativeContainers = document.querySelectorAll('.relative');
    let clickedInsideAContainer = false;

    relativeContainers.forEach(container => {
        if (container.contains(event.target)) {
            clickedInsideAContainer = true;
        }
    });

    if (!clickedInsideAContainer) {
        const allLists = document.querySelectorAll('.search-list');
        allLists.forEach(list => list.classList.add('hidden'));
    }
});


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- OPTIMIZATION: Cache All Elements by ID ---
    // This finds every element with an ID in your HTML and stores it
    // in the 'el' object for instant access.
    document.querySelectorAll('[id]').forEach(element => {
        el[element.id] = element; // Store with the exact ID string as the key
    });
    // --- End Element Cache ---

    // --- Background Toggle Logic ---
    const BACKGROUND_KEY = 'ae_image_background';

    function applyBackgroundPreference(isImage) {
        if (isImage) {
            document.body.classList.add('image-background');
        } else {
            document.body.classList.remove('image-background');
        }
    }

    if (el.backgroundToggle) {
        el.backgroundToggle.addEventListener('change', () => {
            const isImage = el.backgroundToggle.checked;
            applyBackgroundPreference(isImage);
            try {
                localStorage.setItem(BACKGROUND_KEY, isImage ? '1' : '0');
            } catch (e) {
                console.error("Failed to save background preference", e);
            }
        });
    }

    try {
        const savedPref = localStorage.getItem(BACKGROUND_KEY);
        if (savedPref === '1') {
            if (el.backgroundToggle) el.backgroundToggle.checked = true;
            applyBackgroundPreference(true);
        } else {
            if (el.backgroundToggle) el.backgroundToggle.checked = false;
            applyBackgroundPreference(false);
        }
    } catch (e) {
        console.error("Failed to load background preference", e);
        applyBackgroundPreference(false);
    }
    // --- End Background Toggle Logic ---


    // Load all data, *then* set up the UI
    // NOTE: worldData is now instantly available from data-core.js
    // so populateWorldDropdown can run immediately.
    // We only need to *wait* for activity data.
    
    // --- UPDATED LOGIC ---
    console.log("DEBUG: DOM fully loaded. Initializing script.");
    switchTab('rankup');
    
    // Populate worlds immediately, since data is now in data-core.js
    // This makes the TTK tab work instantly on load.
    populateWorldDropdown(); 

    // Load the (now smaller) activity bundle
    loadAllData().then(() => {
        console.log("DEBUG: Activity data loading complete. Setting up raid UI.");
        
        // Now that activityData is loaded, populate the dropdown
        populateActivityDropdown();

        // Load saved raid data *after* dropdown is populated
        loadRaidData();
    });
    // --- END UPDATED LOGIC ---

    // --- Setup Searchable Dropdowns ---
    setupRankSearch('rankInput', 'rankSelect', 'rankList');
    // populateWorldDropdown(); // <-- Moved up
    // populateActivityDropdown(); // <-- Moved into .then()

    // --- START: Combined Callbacks for Syncing ---
    const syncCE_RankToETA = syncDenominationInput(
        'currentEnergyDenominationInput', 'currentEnergyDenominationValue',
        'currentEnergyETADenominationInput', 'currentEnergyETADenominationValue',
        calculateEnergyETA
    );
    function onRankUpCEDenomChange() {
        calculateRankUp();
        syncCE_RankToETA();
    }

    const syncCE_ETAToRank = syncDenominationInput(
        'currentEnergyETADenominationInput', 'currentEnergyETADenominationValue',
        'currentEnergyDenominationInput', 'currentEnergyDenominationValue',
        calculateRankUp
    );
    function onETACEDenomChange() {
        calculateEnergyETA();
        syncCE_ETAToRank();
    }

    const syncEPC_RankToETA = syncDenominationInput(
        'energyPerClickDenominationInput', 'energyPerClickDenominationValue',
        'energyPerClickETADenominationInput', 'energyPerClickETADenominationValue',
        calculateEnergyETA
    );
    function onRankUpEPCDenomChange() {
        calculateRankUp();
        syncEPC_RankToETA();
    }

    const syncEPC_ETAToRank = syncDenominationInput(
        'energyPerClickETADenominationInput', 'energyPerClickETADenominationValue',
        'energyPerClickDenominationInput', 'energyPerClickDenominationValue',
        calculateRankUp
    );
    function onETAEPCdenomChange() {
        calculateEnergyETA();
        syncEPC_ETAToRank();
    }

    const syncDPS_TTKToRaid = syncDenominationInput(
        'dpsDenominationInput', 'dpsDenominationValue',
        'dpsActivityDenominationInput', 'dpsActivityDenominationValue',
        calculateMaxStage
    );
    function onTTKDenomChange() {
        calculateTTK();
        syncDPS_TTKToRaid();
    }
    
    const syncDPS_RaidToTTK = syncDenominationInput(
        'dpsActivityDenominationInput', 'dpsActivityDenominationValue',
        'dpsDenominationInput', 'dpsDenominationValue',
        calculateTTK
    );
    function onRaidDenomChange() {
        calculateMaxStage();
        syncDPS_RaidToTTK();
    }
    // --- END: Combined Callbacks for Syncing ---


    // --- Denomination Searches (Now use combined callbacks) ---
    setupDenominationSearch('dpsDenominationInput', 'dpsDenominationValue', 'dpsDenominationList', onTTKDenomChange);
    setupDenominationSearch('dpsActivityDenominationInput', 'dpsActivityDenominationValue', 'dpsActivityDenominationList', onRaidDenomChange);
    setupDenominationSearch('currentEnergyDenominationInput', 'currentEnergyDenominationValue', 'currentEnergyDenominationList', onRankUpCEDenomChange);
    setupDenominationSearch('energyPerClickDenominationInput', 'energyPerClickDenominationValue', 'energyPerClickDenominationList', onRankUpEPCDenomChange);
    setupDenominationSearch('currentEnergyETADenominationInput', 'currentEnergyETADenominationValue', 'currentEnergyETADenominationList', onETACEDenomChange);
    setupDenominationSearch('targetEnergyETADenominationInput', 'targetEnergyETADenominationValue', 'targetEnergyETADenominationList', calculateEnergyETA); // Not linked
    setupDenominationSearch('energyPerClickETADenominationInput', 'energyPerClickETADenominationValue', 'energyPerClickETADenominationList', onETAEPCdenomChange);

    
    // --- Event Listeners for Inputs (Using cached elements) ---
    
    // Safety check for all elements before adding listeners
    if (el.currentEnergy) {
        const rankUpCE = el.currentEnergy;
        rankUpCE.addEventListener('input', debounce(() => {
            calculateRankUp();
            if (el.currentEnergyETA) el.currentEnergyETA.value = rankUpCE.value;
            calculateEnergyETA();
        }, 300));
    }

    if (el.energyPerClick) {
        const rankUpEPC = el.energyPerClick;
        rankUpEPC.addEventListener('input', debounce(() => {
            calculateRankUp();
            if (el.energyPerClickETA) el.energyPerClickETA.value = rankUpEPC.value;
            calculateEnergyETA();
        }, 300));
    }
    
    if (el.clickerSpeed) el.clickerSpeed.addEventListener('change', calculateRankUp);

    if (el.yourDPS) {
        const ttkDPS = el.yourDPS;
        ttkDPS.addEventListener('input', debounce(() => {
            calculateTTK();
            if (el.yourDPSActivity) el.yourDPSActivity.value = ttkDPS.value;
            calculateMaxStage();
        }, 300));
    }
    
    if (el.enemyQuantity) el.enemyQuantity.addEventListener('input', debounce(calculateTTK, 300));
    if (el.fourSpotFarming) el.fourSpotFarming.addEventListener('change', calculateTTK);

    if (el.yourDPSActivity) {
        const raidDPS = el.yourDPSActivity;
        raidDPS.addEventListener('input', debounce(() => {
            calculateMaxStage();
            if (el.yourDPS) el.yourDPS.value = raidDPS.value;
            calculateTTK();
        }, 300));
    }

    if (el.activityTimeLimit) el.activityTimeLimit.addEventListener('input', debounce(calculateMaxStage, 300));

    if (el.currentEnergyETA) {
        const etaCE = el.currentEnergyETA;
        etaCE.addEventListener('input', debounce(() => {
            calculateEnergyETA();
            if (el.currentEnergy) el.currentEnergy.value = etaCE.value;
            calculateRankUp();
        }, 300));
    }

    if (el.targetEnergyETA) el.targetEnergyETA.addEventListener('input', debounce(calculateEnergyETA, 300));
    
    if (el.energyPerClickETA) {
        const etaEPC = el.energyPerClickETA;
        etaEPC.addEventListener('input', debounce(() => {
            calculateEnergyETA();
            if (el.energyPerClick) el.energyPerClick.value = etaEPC.value;
            calculateRankUp();
        }, 300));
    }

    if (el.clickerSpeedETA) el.clickerSpeedETA.addEventListener('change', calculateEnergyETA);


    // --- Load Saved Data ---
    loadRankUpData();
    loadETAData();
    loadTTKData();
    // loadRaidData(); // <-- Moved into .then()

    // --- Checklist Logic (Refactored for element cache) ---
    if (typeof checklistGachas !== 'undefined') {
        console.log("DEBUG: Checklist data found! Initializing checklist UI...");

        // --- 
        // THE FIX IS HERE! 
        // I am now using el['panel-checklist'] (bracket notation)
        // for all IDs that have a hyphen in them.
        // ---
        const checklistPanel = el['panel-checklist']; 
        if (!checklistPanel) {
            console.error("DEBUG: Checklist panel 'panel-checklist' not found in HTML. Checklist functionality will be disabled.");
            return; // Stop running checklist logic if the panel doesn't exist
        }

        const gachasList = el['gachas-list'];
        const levelersList = el['levelers-list'];
        const ssList = el['ss-list'];
        const gachasTitle = el['gachas-title'];
        const levelersTitle = el['levelers-title'];
        const ssTitle = el['ss-title'];

        const CHECKLIST_SAVE_KEY = 'ae_checklist_progress';

        function styleChecklistItem(checkbox, isChecked) {
            const span = checkbox.nextElementSibling;
            if (span) {
                if (isChecked) {
                    span.style.textDecoration = 'line-through';
                    span.style.color = '#888';
                } else {
                    span.style.textDecoration = 'none';
                    span.style.color = 'var(--muted)';
                }
            }
        }

        function updateChecklistTitles(savedData) {
            if (!savedData) {
                try {
                    savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
                } catch (e) {
                    savedData = {};
                }
            }

            const gachasTotal = checklistGachas.length;
            const levelersTotal = checklistLevelers.length;
            const ssTotal = checklistSS.length;

            let gachasCompleted = 0;
            let levelersCompleted = 0;
            let ssCompleted = 0;

            Object.keys(savedData).forEach(id => {
                if (id.startsWith('g')) {
                    gachasCompleted++;
                } else if (id.startsWith('l')) {
                    levelersCompleted++;
                } else if (id.startsWith('s')) {
                    ssCompleted++;
                }
            });

            if (gachasTitle) {
                gachasTitle.innerText = `Gachas (${gachasCompleted} / ${gachasTotal})`;
            }
            if (levelersTitle) {
                levelersTitle.innerText = `Progressions (${levelersCompleted} / ${levelersTotal})`;
            }
            if (ssTitle) {
                ssTitle.innerText = `SS Quest (${ssCompleted} / ${ssTotal})`;
            }
        }

        function loadChecklistData() {
            try {
                const savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
                populateChecklists(savedData);
                updateChecklistTitles(savedData);
            } catch (e) {
                console.error("Failed to load checklist data:", e);
                populateChecklists({});
                updateChecklistTitles({});
            }
        }

        function saveChecklistData() {
            try {
                const savedData = {};
                if (!checklistPanel) return; // Safety check
                const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]:checked');
                checkboxes.forEach(cb => {
                    savedData[cb.id] = true;
                });
                localStorage.setItem(CHECKLIST_SAVE_KEY, JSON.stringify(savedData));
                updateChecklistTitles(savedData);
            } catch (e) {
                console.error("Failed to save checklist data:", e);
            }
        }

        function createChecklistItem(item, savedData) {
            const label = document.createElement('label');
            label.className = 'checklist-item';
            label.htmlFor = item.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = item.id;
            checkbox.name = item.id;
            checkbox.checked = !!savedData[item.id];

            const span = document.createElement('span');
            span.textContent = item.name;

            label.appendChild(checkbox);
            label.appendChild(span);

            styleChecklistItem(checkbox, checkbox.checked);

            return label;
        }

        function populateChecklists(savedData) {
            if (gachasList) gachasList.innerHTML = '';
            if (levelersList) levelersList.innerHTML = '';
            if (ssList) ssList.innerHTML = '';

            if (gachasList && typeof checklistGachas !== 'undefined') {
                checklistGachas.forEach(item => {
                    gachasList.appendChild(createChecklistItem(item, savedData));
                });
            }
            if (levelersList && typeof checklistLevelers !== 'undefined') {
                checklistLevelers.forEach(item => {
                    levelersList.appendChild(createChecklistItem(item, savedData));
                });
            }
            if (ssList && typeof checklistSS !== 'undefined') {
                checklistSS.forEach(item => {
                    ssList.appendChild(createChecklistItem(item, savedData));
                });
            }
        }

        checklistPanel.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                styleChecklistItem(e.target, e.target.checked);
                saveChecklistData();
            }
        });

        loadChecklistData();

        // Using el['check-all-btn'] (correct)
        if (el['check-all-btn']) {
            el['check-all-btn'].addEventListener('click', () => {
                if (!checklistPanel) return;
                const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.checked = true;
                    styleChecklistItem(cb, true);
                });
                saveChecklistData();
            });
        }

        // Using el['uncheck-all-btn'] (correct)
        if (el['uncheck-all-btn']) {
            el['uncheck-all-btn'].addEventListener('click', () => {
                if (!checklistPanel) return;
                const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.checked = false;
                    styleChecklistItem(cb, false);
                });
                saveChecklistData();
            });
        }
    } else {
        console.warn("DEBUG: Checklist data NOT found. Make sure data-checklist.js is loaded BEFORE script.js.");
    }
    // --- END OF CHECKLIST LOGIC ---
});

