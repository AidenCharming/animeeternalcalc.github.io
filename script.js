// --- Tab Switching Logic ---
const tabs = ['rankup', 'eta', 'ttk', 'raid', 'checklist'];
function switchTab(activeTab) {
    tabs.forEach(tab => {
        const panel = document.getElementById(`panel-${tab}`);
        const button = document.getElementById(`tab-${tab}`);
        if (tab === activeTab) {
            panel.classList.remove('hidden');
            button.classList.add('active');
        } else {
            panel.classList.add('hidden');
            button.classList.remove('active');
        }
    });
}

// Global objects to hold dynamically loaded data.
// They are populated by the loadAllData() function.
const worldData = {};
const activityData = {};


// --- Helper Functions ---
function getNumberValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
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

// --- LocalStorage Save/Load Functions ---
function saveRankUpData() {
    try {
        localStorage.setItem('ae_rankSelect', document.getElementById('rankSelect').value);
        localStorage.setItem('ae_rankInput', document.getElementById('rankInput').value);
        localStorage.setItem('ae_currentEnergy', document.getElementById('currentEnergy').value);
        localStorage.setItem('ae_currentEnergyDenomInput', document.getElementById('currentEnergyDenominationInput').value);
        localStorage.setItem('ae_currentEnergyDenomValue', document.getElementById('currentEnergyDenominationValue').value);
        localStorage.setItem('ae_energyPerClick', document.getElementById('energyPerClick').value);
        localStorage.setItem('ae_energyPerClickDenomInput', document.getElementById('energyPerClickDenominationInput').value);
        localStorage.setItem('ae_energyPerClickDenomValue', document.getElementById('energyPerClickDenominationValue').value);
        localStorage.setItem('ae_clickerSpeed', document.getElementById('clickerSpeed').checked);
    } catch (e) {
        console.error("Failed to save rankup data to localStorage", e);
    }
}

function loadRankUpData() {
    try {
        const rankSelect = localStorage.getItem('ae_rankSelect');
        if (rankSelect) {
            document.getElementById('rankSelect').value = rankSelect;
            document.getElementById('rankInput').value = rankSelect;
        }
        
        const rankInput = localStorage.getItem('ae_rankInput');
        if (rankInput) document.getElementById('rankInput').value = rankInput;

        const currentEnergy = localStorage.getItem('ae_currentEnergy');
        if (currentEnergy) document.getElementById('currentEnergy').value = currentEnergy;

        // FIXED: Added this line to load the saved text
        const currentEnergyDenomInput = localStorage.getItem('ae_currentEnergyDenomInput');
        if (currentEnergyDenomInput) document.getElementById('currentEnergyDenominationInput').value = currentEnergyDenomInput;

        // --- NEW FIX ---
        // Find the matching value for the loaded text and update the hidden input
        const currentDenom = denominations.find(d => d.name === currentEnergyDenomInput);
        if (currentDenom) {
            document.getElementById('currentEnergyDenominationValue').value = currentDenom.value;
        } else {
            document.getElementById('currentEnergyDenominationValue').value = '1';
        }
        // --- END NEW FIX ---

        const energyPerClick = localStorage.getItem('ae_energyPerClick');
        if (energyPerClick) document.getElementById('energyPerClick').value = energyPerClick;

        // FIXED: Added this line to load the saved text
        const energyPerClickDenomInput = localStorage.getItem('ae_energyPerClickDenomInput');
        if (energyPerClickDenomInput) document.getElementById('energyPerClickDenominationInput').value = energyPerClickDenomInput;

        // --- NEW FIX ---
        // Find the matching value for the loaded text and update the hidden input
        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomInput);
        if (energyPerClickDenom) {
            document.getElementById('energyPerClickDenominationValue').value = energyPerClickDenom.value;
        } else {
            document.getElementById('energyPerClickDenominationValue').value = '1';
        }
        // --- END NEW FIX ---

        const clickerSpeed = localStorage.getItem('ae_clickerSpeed');
        if (clickerSpeed !== null) {
            const isChecked = (clickerSpeed === 'true');
            document.getElementById('clickerSpeed').checked = isChecked;
            document.getElementById('clickerSpeedETA').checked = isChecked;
        }
        
        displayRankRequirement();
        calculateRankUp();
        
    } catch (e) {
        console.error("Failed to load rankup data from localStorage", e);
    }
}

function saveETAData() {
    try {
        localStorage.setItem('ae_currentEnergyETA', document.getElementById('currentEnergyETA').value);
        localStorage.setItem('ae_currentEnergyETADenomInput', document.getElementById('currentEnergyETADenominationInput').value);
        localStorage.setItem('ae_currentEnergyETADenomValue', document.getElementById('currentEnergyETADenominationValue').value);
        localStorage.setItem('ae_targetEnergyETA', document.getElementById('targetEnergyETA').value);
        localStorage.setItem('ae_targetEnergyETADenomInput', document.getElementById('targetEnergyETADenominationInput').value);
        localStorage.setItem('ae_targetEnergyETADenomValue', document.getElementById('targetEnergyETADenominationValue').value);
        localStorage.setItem('ae_energyPerClickETA', document.getElementById('energyPerClickETA').value);
        localStorage.setItem('ae_energyPerClickETADenomInput', document.getElementById('energyPerClickETADenominationInput').value);
        localStorage.setItem('ae_energyPerClickETADenomValue', document.getElementById('energyPerClickETADenominationValue').value);
        localStorage.setItem('ae_clickerSpeedETA', document.getElementById('clickerSpeedETA').checked);
    } catch(e) {
        console.error("Failed to save ETA data to localStorage", e);
    }
}

function loadETAData() {
    // console.group("DEBUG: loadETAData"); // <-- REMOVING DEBUG LOGS
    try {
        const currentEnergyNum = localStorage.getItem('ae_currentEnergyETA') || '';
        document.getElementById('currentEnergyETA').value = currentEnergyNum;
        // console.log("Loading 'ae_currentEnergyETA':", currentEnergyNum);
        
        // FIXED: Added this line to load the saved text
        const currentEnergyDenomText = localStorage.getItem('ae_currentEnergyETADenomInput') || '';
        document.getElementById('currentEnergyETADenominationInput').value = currentEnergyDenomText;
        // console.log("Loading 'ae_currentEnergyETADenomInput':", currentEnergyDenomText);
        
        // --- NEW FIX ---
        // Find the matching value for the loaded text and update the hidden input
        const currentDenom = denominations.find(d => d.name === currentEnergyDenomText);
        if (currentDenom) {
            document.getElementById('currentEnergyETADenominationValue').value = currentDenom.value;
        } else {
            document.getElementById('currentEnergyETADenominationValue').value = '1';
        }
        // --- END NEW FIX ---

        const targetEnergyNum = localStorage.getItem('ae_targetEnergyETA') || '';
        document.getElementById('targetEnergyETA').value = targetEnergyNum;
        // console.log("Loading 'ae_targetEnergyETA':", targetEnergyNum);

        // FIXED: Added this line to load the saved text
        const targetEnergyDenomText = localStorage.getItem('ae_targetEnergyETADenomInput') || '';
        document.getElementById('targetEnergyETADenominationInput').value = targetEnergyDenomText;
        // console.log("Loading 'ae_targetEnergyETADenomInput':", targetEnergyDenomText);

        // --- NEW FIX ---
        const targetDenom = denominations.find(d => d.name === targetEnergyDenomText);
        if (targetDenom) {
            document.getElementById('targetEnergyETADenominationValue').value = targetDenom.value;
        } else {
            document.getElementById('targetEnergyETADenominationValue').value = '1';
        }
        // --- END NEW FIX ---

        const energyPerClickNum = localStorage.getItem('ae_energyPerClickETA') || '';
        document.getElementById('energyPerClickETA').value = energyPerClickNum;
        // console.log("Loading 'ae_energyPerClickETA':", energyPerClickNum);

        // FIXED: Added this line to load the saved text
        const energyPerClickDenomText = localStorage.getItem('ae_energyPerClickETADenomInput') || '';
        document.getElementById('energyPerClickETADenominationInput').value = energyPerClickDenomText;
        // console.log("Loading 'ae_energyPerClickETADenomInput':", energyPerClickDenomText);

        // --- NEW FIX ---
        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (energyPerClickDenom) {
            document.getElementById('energyPerClickETADenominationValue').value = energyPerClickDenom.value;
        } else {
            document.getElementById('energyPerClickETADenominationValue').value = '1';
        }
        // --- END NEW FIX ---
        
        const clickerSpeed = localStorage.getItem('ae_clickerSpeedETA');
        if (clickerSpeed !== null) {
            const isChecked = (clickerSpeed === 'true');
            // Sync both toggles
            document.getElementById('clickerSpeed').checked = isChecked;
            document.getElementById('clickerSpeedETA').checked = isChecked;
        }

        calculateEnergyETA();
    } catch(e) {
        console.error("Failed to load ETA data from localStorage", e);
    }
    // console.groupEnd(); // <-- REMOVING DEBUG LOGS
}

// --- Calculator Logics ---

function calculateEnergyETA() {
    // ADDED: Debug group
    console.group("DEBUG: calculateEnergyETA");

    const isFastClicker = document.getElementById('clickerSpeedETA').checked;

    // EDITED: Broke out variables for logging
    const currentEnergyValue = getNumberValue('currentEnergyETA');
    const currentEnergyDenom = (parseFloat(document.getElementById('currentEnergyETADenominationValue').value) || 1);
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    // EDITED: Broke out variables for logging
    const targetEnergyValue = getNumberValue('targetEnergyETA');
    const targetEnergyDenom = (parseFloat(document.getElementById('targetEnergyETADenominationValue').value) || 1);
    const targetEnergy = targetEnergyValue * targetEnergyDenom;

    // EDITED: Broke out variables for logging
    const energyPerClickValue = getNumberValue('energyPerClickETA');
    const energyPerClickDenom = (parseFloat(document.getElementById('energyPerClickETADenominationValue').value) || 1);
    const energyPerClick = energyPerClickValue * energyPerClickDenom;
    
    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = targetEnergy - currentEnergy;

    // ADDED: Debug logs
    console.log("Current Energy:", currentEnergyValue, "*", currentEnergyDenom.toExponential(), "=", currentEnergy.toExponential());
    console.log("Target Energy:", targetEnergyValue, "*", targetEnergyDenom.toExponential(), "=", targetEnergy.toExponential());
    console.log("Energy per Click:", energyPerClickValue, "*", energyPerClickDenom.toExponential(), "=", energyPerClick.toExponential());
    console.log("Energy Needed:", energyNeeded.toExponential());
    console.log("Clicker Speed:", isFastClicker ? "Fast (5.88 CPS)" : "Slow (1.09 CPS)");

    if (energyNeeded <= 0) {
        document.getElementById('etaResult').innerText = 'Target Reached!';
        // ADDED: Debug logs
        console.log("Result: Target Reached!");
        console.groupEnd();
        saveETAData();
        return;
    }
    if (energyPerClick <= 0 || clicksPerSecond <= 0) {
        document.getElementById('etaResult').innerText = 'N/A';
        // ADDED: Debug logs
        console.log("Result: N/A (EPC or CPS is zero)");
        console.groupEnd();
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

    // ADDED: Debug logs
    console.log("Time (seconds):", timeInSeconds.toExponential());
    console.log("Result (string):", resultString.trim());
    console.groupEnd();

    document.getElementById('etaResult').innerText = resultString.trim();

    saveETAData();
}


function calculateTTK() {
    // FIXED: This function was broken by a copy-paste error.
    // Restored the correct logic.
    const enemyHealth = getNumberValue('enemyHealth');
    const dpsInput = getNumberValue('yourDPS');
    const dpsMultiplier = parseFloat(document.getElementById('dpsDenominationValue').value) || 1;
    const yourDPS = dpsInput * dpsMultiplier;

    if (enemyHealth <= 0 || yourDPS <= 0) {
        document.getElementById('ttkResult').innerText = 'N/A';
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
    document.getElementById('ttkResult').innerText = resultString.trim();
}

function displayRankRequirement() {
    const selectedRank = document.getElementById('rankSelect').value;
    const energyForRankFormatted = document.getElementById('energyForRankFormatted');
    if (selectedRank && rankRequirements[selectedRank]) {
        energyForRankFormatted.innerText = formatNumber(rankRequirements[selectedRank]);
    } else {
        energyForRankFormatted.innerText = 'Select a rank to see requirement';
    }
}

function calculateRankUp() {
    // ADDED: Debug group
    console.group("DEBUG: calculateRankUp");

    const isFastClicker = document.getElementById('clickerSpeed').checked;
    
    // EDITED: Broke out variables for logging
    const currentEnergyValue = (getNumberValue('currentEnergy') || 0);
    const currentEnergyDenom = (parseFloat(document.getElementById('currentEnergyDenominationValue').value) || 1);
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    // EDITED: Broke out variables for logging
    const energyPerClickValue = (getNumberValue('energyPerClick') || 0);
    const energyPerClickDenom = (parseFloat(document.getElementById('energyPerClickDenominationValue').value) || 1);
    const energyPerClick = energyPerClickValue * energyPerClickDenom;

    const selectedRank = document.getElementById('rankSelect').value;
    const energyForRank = rankRequirements[selectedRank] || 0;

    // ADDED: Debug logs
    console.log("Rank:", selectedRank, "-> Needs:", energyForRank ? energyForRank.toExponential() : "N/A");
    console.log("Current Energy:", currentEnergyValue, "*", currentEnergyDenom.toExponential(), "=", currentEnergy.toExponential());
    console.log("Energy per Click:", energyPerClickValue, "*", energyPerClickDenom.toExponential(), "=", energyPerClick.toExponential());
    console.log("Clicker Speed:", isFastClicker ? "Fast (5.88 CPS)" : "Slow (1.09 CPS)");

    if (!energyForRank) {
        document.getElementById('rankUpResult').innerText = 'Select a rank';
        console.log("Result: Select a rank");
        console.groupEnd();
        saveRankUpData();
        return;
    }

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = energyForRank - currentEnergy;

    // ADDED: Debug log
    console.log("Energy Needed:", energyNeeded.toExponential());

    if (energyNeeded <= 0) {
        document.getElementById('rankUpResult').innerText = 'Rank Up Ready!';
        console.log("Result: Rank Up Ready!");
        console.groupEnd();
        saveRankUpData();
        return;
    }
    if (energyPerClick <= 0) {
        document.getElementById('rankUpResult').innerText = 'N/A';
        console.log("Result: N/A (EPC is zero)");
        console.groupEnd();
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

    // ADDED: Debug logs
    console.log("Time (seconds):", timeInSeconds.toExponential());
    console.log("Result (string):", resultString.trim());
    console.groupEnd();

    // FIXED: Changed 'etaResult' to 'rankUpResult'
    document.getElementById('rankUpResult').innerText = resultString.trim();

    // FIXED: Changed 'saveETAData' to 'saveRankUpData'
    saveRankUpData();
}

function populateWorldDropdown() {
    const worldSelect = document.getElementById('worldSelect');
    Object.keys(worldData).forEach(worldName => {
        const option = document.createElement('option');
        option.value = worldName;
        option.innerText = worldName;
        worldSelect.appendChild(option);
    });
}

function populateEnemyDropdown() {
    const enemySelect = document.getElementById('enemySelect');
    const selectedWorldName = document.getElementById('worldSelect').value;
    const world = worldData[selectedWorldName];
    
    enemySelect.innerHTML = '<option value="">-- Select an Enemy --</option>';
    document.getElementById('enemyHealth').value = '';
    document.getElementById('enemyHealthDisplay').innerText = 'Select an enemy to see health';

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
    const selectedWorldName = document.getElementById('worldSelect').value;
    const selectedEnemy = document.getElementById('enemySelect').value;
    const world = worldData[selectedWorldName];
    const enemyHealthInput = document.getElementById('enemyHealth');
    const enemyHealthDisplay = document.getElementById('enemyHealthDisplay');
    
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

async function loadAllData() {
    console.log("DEBUG: Starting to load all data...");

    const manifestPromise = fetch('data-manifest.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}. Make sure data-manifest.json exists.`);
            return response.json();
        })
        .catch(error => {
            console.warn('WARNING: Could not load data-manifest.json. Raids/Dungeons will be unavailable.', error);
            // Return a default structure to prevent further errors
            return { raids: [], dungeons: [] };
        });

    const worldPromise = fetch('data-worlds.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .catch(error => {
            console.warn('WARNING: Error loading data-worlds.json. TTK calculator will be unavailable.', error);
            return null; 
        });

    try {
        const [manifest, loadedWorlds] = await Promise.all([manifestPromise, worldPromise]);
        
        // Populate worldData if the fetch was successful
        if (loadedWorlds) {
            Object.assign(worldData, loadedWorlds);
        }

        console.log("DEBUG: Manifest and world data loaded.");

        const raidPromises = manifest.raids.map(file => 
            fetch(`raids/${file}`)
                .then(response => response.ok ? response.json() : Promise.reject(`Failed to load ${file}`))
                .then(data => ({ name: file.replace('.json', ''), data }))
                .catch(error => { console.warn(`WARNING: Error loading raid ${file}:`, error); return null; })
        );

        const dungeonPromises = manifest.dungeons.map(file => 
            fetch(`dungeons/${file}`)
                .then(response => response.ok ? response.json() : Promise.reject(`Failed to load ${file}`))
                .then(data => ({ name: file.replace('.json', ''), data }))
                .catch(error => { console.warn(`WARNING: Error loading dungeon ${file}:`, error); return null; })
        );
        
        const [loadedDungeons, loadedRaids] = await Promise.all([
            Promise.all(dungeonPromises),
            Promise.all(raidPromises)
        ]);
        
        const allActivities = [...loadedDungeons, ...loadedRaids].filter(Boolean); // Filter out nulls from failed fetches
        
        allActivities.forEach(activity => {
            activityData[activity.name] = activity.data;
        });
        
        console.log("DEBUG: Successfully loaded and combined all dynamic activity data.");

    } catch (error) {
        console.error("Fatal error during data loading process:", error);
    }
}

function populateActivityDropdown() {
    const select = document.getElementById('activitySelect');
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
    const selection = document.getElementById('activitySelect').value;
    const activity = activityData[selection];
    const resultLabel = document.getElementById('activityResultLabel');
    
    if (!activity) {
        document.getElementById('activityResult').innerText = '0 / 0';
        return;
    }

    document.getElementById('activityTimeLimit').value = activity.timeLimit;
    
    if (activity.type === 'raid' && activity.healthMultiplier) {
        resultLabel.innerText = 'Estimated Max Wave:';
    } else {
        resultLabel.innerText = 'Estimated Max Room:';
    }
    calculateMaxStage();
}

function calculateMaxStage() {
    const selection = document.getElementById('activitySelect').value;
    if (!selection) {
        document.getElementById('activityResult').innerText = '0 / 0';
        return;
    }

    const activity = activityData[selection];
    const yourDPS = (getNumberValue('yourDPSActivity') || 0) * (parseFloat(document.getElementById('dpsActivityDenominationValue').value) || 1);
    const timeLimit = getNumberValue('activityTimeLimit');
    const resultEl = document.getElementById('activityResult');

    if (yourDPS <= 0 || timeLimit <= 0) {
        resultEl.innerText = `0 / ${activity.maxStages}`;
        return;
    }
    
    const maxDamageInTime = yourDPS * timeLimit;
    let completedStage = 0;

    if (activity.type === 'raid' && activity.healthMultiplier) {
        let currentHealth = activity.baseHealth;
        for (let i = 1; i <= activity.maxStages; i++) {
            // Assuming 5 enemies per wave, as is common
            const totalWaveHealth = currentHealth * 5; 
            if (maxDamageInTime < totalWaveHealth) {
                break;
            }
            completedStage = i;
            currentHealth *= activity.healthMultiplier;
        }
    } else { // Dungeons
        for (let i = 1; i <= activity.maxStages; i++) {
            const roomHealth = activity.enemies[`Room ${i}`];
            if (!roomHealth || maxDamageInTime < parseFloat(roomHealth)) {
                break;
            }
            completedStage = i;
        }
    }
    
    resultEl.innerText = `${completedStage} / ${activity.maxStages}`;
}

// --- Searchable Dropdown Logic ---
function setupRankSearch(inputId, valueId, listId) {
    const inputEl = document.getElementById(inputId);
    const valueEl = document.getElementById(valueId);
    const listEl = document.getElementById(listId);

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
        setTimeout(() => { // Use timeout to allow click event to fire first
            const rankValue = inputEl.value.trim();
            if (rankRequirements[rankValue]) {
                if (valueEl.value !== rankValue) {
                    valueEl.value = rankValue;
                    displayRankRequirement();
                    calculateRankUp();
                }
            }
            listEl.classList.add('hidden');
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
    const inputEl = document.getElementById(inputId);
    const valueEl = document.getElementById(valueId);
    const listEl = document.getElementById(listId);

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
         setTimeout(() => { // Use timeout to allow click event to fire first
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
            
            listEl.classList.add('hidden');
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
    // Check if the click was outside of any element with the 'relative' class that contains a search list
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
    console.log("DEBUG: DOM fully loaded. Initializing script.");

    // --- NEW BACKGROUND TOGGLE LOGIC ---
    const backgroundToggle = document.getElementById('backgroundToggle');
    const BACKGROUND_KEY = 'ae_image_background';

    function applyBackgroundPreference(isImage) {
        if (isImage) {
            document.body.classList.add('image-background');
        } else {
            document.body.classList.remove('image-background');
        }
    }

    // 1. Set listener for the toggle
    if (backgroundToggle) {
        backgroundToggle.addEventListener('change', () => {
            const isImage = backgroundToggle.checked;
            applyBackgroundPreference(isImage);
            try {
                localStorage.setItem(BACKGROUND_KEY, isImage ? '1' : '0');
            } catch (e) {
                console.error("Failed to save background preference", e);
            }
        });
    }

    // 2. Load preference on page load
    try {
        const savedPref = localStorage.getItem(BACKGROUND_KEY);
        if (savedPref === '1') {
            if (backgroundToggle) backgroundToggle.checked = true;
            applyBackgroundPreference(true);
        } else {
            if (backgroundToggle) backgroundToggle.checked = false;
            applyBackgroundPreference(false);
        }
    } catch (e) {
        console.error("Failed to load background preference", e);
        applyBackgroundPreference(false); // Default to gradient
    }
    // --- END OF NEW BACKGROUND TOGGLE LOGIC ---


    loadAllData().then(() => {
        console.log("DEBUG: Data loading complete. Setting up UI.");
        switchTab('rankup');
        
        // --- Setup Searchable Dropdowns ---
        setupRankSearch('rankInput', 'rankSelect', 'rankList');
        populateWorldDropdown();
        populateActivityDropdown();

        // --- Denomination Searches ---
        setupDenominationSearch('dpsDenominationInput', 'dpsDenominationValue', 'dpsDenominationList', calculateTTK);
        setupDenominationSearch('dpsActivityDenominationInput', 'dpsActivityDenominationValue', 'dpsActivityDenominationList', calculateMaxStage);
        setupDenominationSearch('currentEnergyDenominationInput', 'currentEnergyDenominationValue', 'currentEnergyDenominationList', calculateRankUp);
        setupDenominationSearch('energyPerClickDenominationInput', 'energyPerClickDenominationValue', 'energyPerClickDenominationList', calculateRankUp);
        setupDenominationSearch('currentEnergyETADenominationInput', 'currentEnergyETADenominationValue', 'currentEnergyETADenominationList', calculateEnergyETA);
        setupDenominationSearch('targetEnergyETADenominationInput', 'targetEnergyETADenominationValue', 'targetEnergyETADenominationList', calculateEnergyETA);
        setupDenominationSearch('energyPerClickETADenominationInput', 'energyPerClickETADenominationValue', 'energyPerClickETADenominationList', calculateEnergyETA);

        // --- Event Listeners for Inputs ---
        const rankUpInputs = [document.getElementById('currentEnergy'), document.getElementById('energyPerClick')];
        rankUpInputs.forEach(input => input.addEventListener('input', debounce(calculateRankUp, 300)));
        document.getElementById('clickerSpeed').addEventListener('change', calculateRankUp);

        const ttkInputs = [document.getElementById('yourDPS')];
        ttkInputs.forEach(input => { input.addEventListener('input', debounce(calculateTTK, 300)); });
        
        const activityInputs = [document.getElementById('yourDPSActivity'), document.getElementById('activityTimeLimit')];
        activityInputs.forEach(input => input.addEventListener('input', debounce(calculateMaxStage, 300)));
        
        const etaInputs = [document.getElementById('currentEnergyETA'), document.getElementById('targetEnergyETA'), document.getElementById('energyPerClickETA')];
        etaInputs.forEach(input => input.addEventListener('input', debounce(calculateEnergyETA, 300)));
        document.getElementById('clickerSpeedETA').addEventListener('change', calculateEnergyETA);
        
        // --- Load Saved Data ---
        loadRankUpData();
        loadETAData();

        // --- ADD ALL THE NEW CHECKLIST LOGIC BELOW ---

        // Check if the checklist data is loaded (from data-checklist.js)
        // --- NEW LOGGING ---
        console.log("DEBUG: Checking for checklist data...");
        if (typeof checklistGachas !== 'undefined') {
            // --- NEW LOGGING ---
            console.log("DEBUG: Checklist data found! Initializing checklist UI...");

            const checklistPanel = document.getElementById('panel-checklist');
            const gachasList = document.getElementById('gachas-list');
            const levelersList = document.getElementById('levelers-list');
            const ssList = document.getElementById('ss-list');
            
            // Get references to the title elements
            const gachasTitle = document.getElementById('gachas-title');
            const levelersTitle = document.getElementById('levelers-title');
            const ssTitle = document.getElementById('ss-title');

            const CHECKLIST_SAVE_KEY = 'ae_checklist_progress';

            // --- NEW HELPER FUNCTION to style checklist items ---
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
            // --- END NEW HELPER FUNCTION ---

            // Function to update the checklist titles with completed counts
            function updateChecklistTitles(savedData) {
                // Default to an empty object if no data is passed
                if (!savedData) {
                    try {
                        savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
                    } catch (e) {
                        savedData = {};
                    }
                }

                // Get total counts from the data files
                const gachasTotal = checklistGachas.length;
                const levelersTotal = checklistLevelers.length;
                const ssTotal = checklistSS.length;

                // Get completed counts by checking the saved data
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

                // Update titles
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


            // Function to load saved data from localStorage
            function loadChecklistData() {
                // --- NEW LOGGING ---
                console.log("DEBUG: loadChecklistData() called.");
                try {
                    const savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
                    populateChecklists(savedData);
                    updateChecklistTitles(savedData); // Update titles on load
                } catch (e) {
                    console.error("Failed to load checklist data:", e);
                    populateChecklists({}); // Load with no items checked
                    updateChecklistTitles({}); // Update titles on load (fallback)
                }
            }

            // Function to save the current state to localStorage
            function saveChecklistData() {
                try {
                    const savedData = {};
                    const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]:checked');
                    checkboxes.forEach(cb => {
                        savedData[cb.id] = true;
                    });
                    localStorage.setItem(CHECKLIST_SAVE_KEY, JSON.stringify(savedData));
                    updateChecklistTitles(savedData); // Update titles on save
                } catch (e) {
                    console.error("Failed to save checklist data:", e);
                }
            }

            // Function to create a single checklist item
            function createChecklistItem(item, savedData) {
                const label = document.createElement('label');
                label.className = 'checklist-item';
                label.htmlFor = item.id;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = item.id;
                checkbox.name = item.id;
                checkbox.checked = !!savedData[item.id]; // Set checked state from save

                const span = document.createElement('span');
                span.textContent = item.name;
                
                // REMOVED old styling logic from here

                label.appendChild(checkbox);
                label.appendChild(span);

                // ADDED call to new helper function
                styleChecklistItem(checkbox, checkbox.checked);
                
                return label;
            }

            // Function to fill all three lists
            function populateChecklists(savedData) {
                // --- NEW LOGGING ---
                console.log("DEBUG: populateChecklists() called.");
                // Clear existing lists
                gachasList.innerHTML = '';
                levelersList.innerHTML = '';
                ssList.innerHTML = '';

                // Populate Gachas
                checklistGachas.forEach(item => {
                    gachasList.appendChild(createChecklistItem(item, savedData));
                });

                // Populate Levelers
                checklistLevelers.forEach(item => {
                    levelersList.appendChild(createChecklistItem(item, savedData));
                });

                // Populate Secret Shinies
                checklistSS.forEach(item => {
                    ssList.appendChild(createChecklistItem(item, savedData));
                });
            }

            // Add a single event listener to the panel for efficiency
            checklistPanel.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    // Style the label text
                    // REPLACED old styling logic with this:
                    styleChecklistItem(e.target, e.target.checked);
                    
                    // Save the new state
                    saveChecklistData();
                }
            });

            // Initial load of checklist data
            loadChecklistData();

            // --- NEW Check/Uncheck All Logic ---
            const checkAllBtn = document.getElementById('check-all-btn');
            const uncheckAllBtn = document.getElementById('uncheck-all-btn');

            if (checkAllBtn) {
                checkAllBtn.addEventListener('click', () => {
                    const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        cb.checked = true;
                        styleChecklistItem(cb, true);
                    });
                    saveChecklistData(); // Save and update counts
                });
            }

            if (uncheckAllBtn) {
                uncheckAllBtn.addEventListener('click', () => {
                    const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        cb.checked = false;
                        styleChecklistItem(cb, false);
                    });
                    saveChecklistData(); // Save and update counts
                });
            }
            // --- END NEW Check/Uncheck All Logic ---

        } else {
            // --- NEW LOGGING ---
            console.warn("DEBUG: Checklist data NOT found. Make sure data-checklist.js is loaded BEFORE script.js.");
        }
        // --- END OF NEW CHECKLIST LOGIC ---

    });
});

