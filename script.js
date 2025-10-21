// --- Tab Switching Logic ---
const tabs = ['rankup', 'ttk', 'raid'];
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

// --- Helper Function ---
function getNumberValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) return num.toLocaleString();
    const reversedDenominations = [...denominations].reverse();
    for (const denom of reversedDenominations) {
        if (denom.value > 1 && num >= denom.value) {
            return `${(num / denom.value).toFixed(2)}${denom.name}`;
        }
    }
    return num.toLocaleString();
}

// --- Combine Raid and Dungeon data into one object ---
const activityData = { ...raidData, ...dungeonData };


// --- LocalStorage Save/Load Functions ---

/**
 * Saves the current state of the Rank Up tab to localStorage.
 */
function saveRankUpData() {
    try {
        localStorage.setItem('ae_rankSelect', document.getElementById('rankSelect').value);
        localStorage.setItem('ae_currentEnergy', document.getElementById('currentEnergy').value);
        localStorage.setItem('ae_currentEnergyDenomInput', document.getElementById('currentEnergyDenominationInput').value);
        localStorage.setItem('ae_currentEnergyDenomValue', document.getElementById('currentEnergyDenominationValue').value);
        localStorage.setItem('ae_energyPerClick', document.getElementById('energyPerClick').value);
        localStorage.setItem('ae_energyPerClickDenomInput', document.getElementById('energyPerClickDenominationInput').value);
        localStorage.setItem('ae_energyPerClickDenomValue', document.getElementById('energyPerClickDenominationValue').value);
        localStorage.setItem('ae_clickerSpeed', document.getElementById('clickerSpeed').checked);
    } catch (e) {
        console.error("Failed to save data to localStorage", e);
    }
}

/**
 * Loads the saved state for the Rank Up tab from localStorage.
 */
function loadRankUpData() {
    try {
        const rankSelect = localStorage.getItem('ae_rankSelect');
        if (rankSelect) document.getElementById('rankSelect').value = rankSelect;

        const currentEnergy = localStorage.getItem('ae_currentEnergy');
        if (currentEnergy) document.getElementById('currentEnergy').value = currentEnergy;

        const currentEnergyDenomInput = localStorage.getItem('ae_currentEnergyDenomInput');
        if (currentEnergyDenomInput) document.getElementById('currentEnergyDenominationInput').value = currentEnergyDenomInput;

        const currentEnergyDenomValue = localStorage.getItem('ae_currentEnergyDenomValue');
        if (currentEnergyDenomValue) document.getElementById('currentEnergyDenominationValue').value = currentEnergyDenomValue;

        const energyPerClick = localStorage.getItem('ae_energyPerClick');
        if (energyPerClick) document.getElementById('energyPerClick').value = energyPerClick;

        const energyPerClickDenomInput = localStorage.getItem('ae_energyPerClickDenomInput');
        if (energyPerClickDenomInput) document.getElementById('energyPerClickDenominationInput').value = energyPerClickDenomInput;

        const energyPerClickDenomValue = localStorage.getItem('ae_energyPerClickDenomValue');
        if (energyPerClickDenomValue) document.getElementById('energyPerClickDenominationValue').value = energyPerClickDenomValue;

        const clickerSpeed = localStorage.getItem('ae_clickerSpeed');
        if (clickerSpeed !== null) { // Check for null in case it was never set
            document.getElementById('clickerSpeed').checked = (clickerSpeed === 'true');
        }
        
        // --- After loading, update the UI calculations ---
        displayRankRequirement();
        calculateRankUp();
        
    } catch (e) {
        console.error("Failed to load data from localStorage", e);
    }
}


// --- Calculator Logics ---

function calculateTTK() {
    const enemyHealth = getNumberValue('enemyHealth');
    const dpsInput = getNumberValue('yourDPS');
    const dpsMultiplier = parseFloat(document.getElementById('dpsDenominationValue').value) || 1;
    const yourDPS = dpsInput * dpsMultiplier;

    if (enemyHealth <= 0 || yourDPS <= 0) {
        document.getElementById('ttkResult').innerText = 'N/A';
        return;
    }
    const timeInSeconds = enemyHealth / yourDPS;
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);
    let resultString = '';
    if (hours > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;
    document.getElementById('ttkResult').innerText = resultString.trim();
}

/**
 * MODIFIED: Populates the rank dropdown dynamically from the rankRequirements object.
 */
function populateRankDropdown() {
    const rankSelect = document.getElementById('rankSelect');
    
    // Get all the rank keys from your data and sort them numerically
    const rankKeys = Object.keys(rankRequirements).sort((a, b) => parseInt(a) - parseInt(b));

    // Loop through the sorted keys and create an option for each one
    for (const rank of rankKeys) {
        const option = document.createElement('option');
        option.value = rank;
        option.innerText = `Rank ${rank}`;
        rankSelect.appendChild(option);
    }
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

/**
 * MODIFIED: Saves data to localStorage on every calculation.
 */
function calculateRankUp() {
    const isFastClicker = document.getElementById('clickerSpeed').checked;
    const currentEnergy = (getNumberValue('currentEnergy') || 0) * (parseFloat(document.getElementById('currentEnergyDenominationValue').value) || 1);
    const energyPerClick = (getNumberValue('energyPerClick') || 0) * (parseFloat(document.getElementById('energyPerClickDenominationValue').value) || 1);
    const selectedRank = document.getElementById('rankSelect').value;
    const energyForRank = rankRequirements[selectedRank] || 0;

    if (!energyForRank) {
        document.getElementById('rankUpResult').innerText = 'Select a rank';
        saveRankUpData(); // Save state
        return;
    }

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = energyForRank - currentEnergy;

    if (energyNeeded <= 0) {
        document.getElementById('rankUpResult').innerText = 'Rank Up Ready!';
        saveRankUpData(); // Save state
        return;
    }
    if (energyPerClick <= 0) {
        document.getElementById('rankUpResult').innerText = 'N/A';
        saveRankUpData(); // Save state
        return;
    }

    const timeInSeconds = (energyNeeded / energyPerClick) / clicksPerSecond;
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);
    let resultString = '';
    if (hours > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;
    document.getElementById('rankUpResult').innerText = resultString.trim();

    saveRankUpData(); // Save state
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
    
    enemySelect.innerHTML = '<option value="">-- Select an Enemy/Room --</option>';
    document.getElementById('enemyHealth').value = '';
    document.getElementById('enemyHealthDisplay').innerText = 'Select an enemy/room to see health';

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

function populateActivityDropdown() {
    const select = document.getElementById('activitySelect');
    Object.keys(activityData).forEach(name => {
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
    
    if (activity.type === 'raid') {
        resultLabel.innerText = 'Estimated Max Wave:';
    } else { // dungeon
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

    if (activity.type === 'raid') {
        let currentHealth = activity.baseHealth;
        for (let i = 1; i <= activity.maxStages; i++) {
            const totalWaveHealth = currentHealth * 5;
            if (maxDamageInTime < totalWaveHealth) {
                break;
            }
            completedStage = i;
            currentHealth *= activity.healthMultiplier;
        }
    } else { // dungeon or leaf raid with 'enemies'
        for (let i = 1; i <= activity.maxStages; i++) {
            const roomHealth = activity.enemies[`Room ${i}`];
            if (!roomHealth || maxDamageInTime < roomHealth) {
                break;
            }
            completedStage = i;
        }
    }
    
    resultEl.innerText = `${completedStage} / ${activity.maxStages}`;
}

// --- Searchable Denomination Dropdown Logic ---
function setupDenominationSearch(inputId, valueId, listId, callback) {
    const inputEl = document.getElementById(inputId);
    const valueEl = document.getElementById(valueId);
    const listEl = document.getElementById(listId);

    if (!inputEl || !valueEl || !listEl) { 
        console.error("Missing elements for setupDenominationSearch:", inputId);
        return; 
    }

    function filterAndShowDenominations() {
        const filterText = inputEl.value.toLowerCase();
        const filtered = denominations.filter(d => d.name.toLowerCase().startsWith(filterText));
        renderDenominationsList(filtered);
    }

    function renderDenominationsList(list) {
        listEl.innerHTML = '';
        if (list.length === 0) { listEl.classList.add('hidden'); return; }
        list.forEach(d => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-[#3a3a5a] cursor-pointer text-sm';
            item.textContent = d.name;
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
    inputEl.addEventListener('input', filterAndShowDenominations);
    inputEl.addEventListener('focus', filterAndShowDenominations);
}

// Hide dropdown when clicking anywhere else
document.addEventListener('click', (event) => {
    const allLists = document.querySelectorAll('[id$="DenominationList"]');
    let clickedInside = false;
    // Use composedPath when available, otherwise build a simple path via parentNode traversal
    const path = event.composedPath ? event.composedPath() : (function buildPath(node) {
        const p = [];
        let cur = node;
        while (cur) { p.push(cur); cur = cur.parentNode; }
        return p;
    })(event.target);

    for (const el of path) {
        if (!el) continue;
        const nodeName = (el.nodeName || '').toUpperCase();
        const id = el.id || '';
        // We only consider clicks inside denomination inputs or their dropdown lists
        if (nodeName === 'INPUT' && id.endsWith('DenominationInput')) { clickedInside = true; break; }
        if (nodeName === 'DIV' && id.endsWith('DenominationList')) { clickedInside = true; break; }
    }

    if (!clickedInside) {
        allLists.forEach(list => list.classList.add('hidden'));
    }
});

// --- Initialization ---
/**
 * MODIFIED: Loads saved data on page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    switchTab('rankup');
    populateRankDropdown();
    populateWorldDropdown();
    populateActivityDropdown();

    // Setup searchable dropdowns
    setupDenominationSearch('dpsDenominationInput', 'dpsDenominationValue', 'dpsDenominationList', calculateTTK);
    setupDenominationSearch('dpsActivityDenominationInput', 'dpsActivityDenominationValue', 'dpsActivityDenominationList', calculateMaxStage);
    setupDenominationSearch('currentEnergyDenominationInput', 'currentEnergyDenominationValue', 'currentEnergyDenominationList', calculateRankUp);
    setupDenominationSearch('energyPerClickDenominationInput', 'energyPerClickDenominationValue', 'energyPerClickDenominationList', calculateRankUp);
    
    // Setup automatic calculation listeners
    const rankUpInputs = [document.getElementById('clickerSpeed'), document.getElementById('currentEnergy'), document.getElementById('energyPerClick')];
    rankUpInputs.forEach(input => {
        const eventType = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(eventType, calculateRankUp);
    });

    const ttkInputs = [document.getElementById('yourDPS')];
    ttkInputs.forEach(input => { input.addEventListener('input', calculateTTK); });
    
    const activityInputs = [document.getElementById('yourDPSActivity'), document.getElementById('activityTimeLimit')];
     activityInputs.forEach(input => {
        input.addEventListener('input', calculateMaxStage);
    });

    // Load saved data *after* all dropdowns and listeners are set up
    loadRankUpData();
});

