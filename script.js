// --- Tab Switching Logic ---
const tabs = ['rankup', 'eta', 'ttk', 'raid'];
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
    // Create a copy to reverse without modifying the original
    const reversedDenominations = [...denominations].reverse();
    for (const denom of reversedDenominations) {
        if (denom.value > 1 && num >= denom.value) {
            return `${(num / denom.value).toFixed(2)}${denom.name}`;
        }
    }
    return num.toLocaleString();
}

// Global variables to hold all fetched data
let worldData = {};
let activityData = {};

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
    } catch (e) {
        console.error("Failed to save data to localStorage", e);
    }
}

function loadRankUpData() {
    try {
        const rankSelect = localStorage.getItem('ae_rankSelect');
        if (rankSelect) document.getElementById('rankSelect').value = rankSelect;
        
        const rankInput = localStorage.getItem('ae_rankInput');
        if (rankInput) document.getElementById('rankInput').value = rankInput;

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
        
        displayRankRequirement();
        calculateRankUp();
        
    } catch (e) {
        console.error("Failed to load data from localStorage", e);
    }
}

function saveETAData() {
    try {
        localStorage.setItem('ae_eta_currentEnergy', document.getElementById('currentEnergyETA').value);
        localStorage.setItem('ae_eta_currentEnergyDenomInput', document.getElementById('currentEnergyETADenominationInput').value);
        localStorage.setItem('ae_eta_currentEnergyDenomValue', document.getElementById('currentEnergyETADenominationValue').value);
        localStorage.setItem('ae_eta_targetEnergy', document.getElementById('targetEnergyETA').value);
        localStorage.setItem('ae_eta_targetEnergyDenomInput', document.getElementById('targetEnergyETADenominationInput').value);
        localStorage.setItem('ae_eta_targetEnergyDenomValue', document.getElementById('targetEnergyETADenominationValue').value);
        localStorage.setItem('ae_eta_energyPerClick', document.getElementById('energyPerClickETA').value);
        localStorage.setItem('ae_eta_energyPerClickDenomInput', document.getElementById('energyPerClickETADenominationInput').value);
        localStorage.setItem('ae_eta_energyPerClickDenomValue', document.getElementById('energyPerClickETADenominationValue').value);
    } catch (e) {
        console.error("Failed to save ETA data to localStorage", e);
    }
}

function loadETAData() {
    try {
        document.getElementById('currentEnergyETA').value = localStorage.getItem('ae_eta_currentEnergy') || '';
        document.getElementById('currentEnergyETADenominationInput').value = localStorage.getItem('ae_eta_currentEnergyDenomInput') || '';
        document.getElementById('currentEnergyETADenominationValue').value = localStorage.getItem('ae_eta_currentEnergyDenomValue') || '1';
        document.getElementById('targetEnergyETA').value = localStorage.getItem('ae_eta_targetEnergy') || '';
        document.getElementById('targetEnergyETADenominationInput').value = localStorage.getItem('ae_eta_targetEnergyDenomInput') || '';
        document.getElementById('targetEnergyETADenominationValue').value = localStorage.getItem('ae_eta_targetEnergyDenomValue') || '1';
        document.getElementById('energyPerClickETA').value = localStorage.getItem('ae_eta_energyPerClick') || '';
        document.getElementById('energyPerClickETADenominationInput').value = localStorage.getItem('ae_eta_energyPerClickDenomInput') || '';
        document.getElementById('energyPerClickETADenominationValue').value = localStorage.getItem('ae_eta_energyPerClickDenomValue') || '1';
        calculateEnergyETA();
    } catch (e) {
        console.error("Failed to load ETA data from localStorage", e);
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
    const isFastClicker = document.getElementById('clickerSpeed').checked;
    const currentEnergy = (getNumberValue('currentEnergy') || 0) * (parseFloat(document.getElementById('currentEnergyDenominationValue').value) || 1);
    const energyPerClick = (getNumberValue('energyPerClick') || 0) * (parseFloat(document.getElementById('energyPerClickDenominationValue').value) || 1);
    const selectedRank = document.getElementById('rankSelect').value;
    const energyForRank = rankRequirements[selectedRank] || 0;

    if (!energyForRank) {
        document.getElementById('rankUpResult').innerText = 'Select a rank';
        saveRankUpData();
        return;
    }

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = energyForRank - currentEnergy;

    if (energyNeeded <= 0) {
        document.getElementById('rankUpResult').innerText = 'Rank Up Ready!';
        saveRankUpData();
        return;
    }
    if (energyPerClick <= 0) {
        document.getElementById('rankUpResult').innerText = 'N/A';
        saveRankUpData();
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

    saveRankUpData();
}

function calculateEnergyETA() {
    const isFastClicker = document.getElementById('clickerSpeedETA').checked;
    const currentEnergy = (getNumberValue('currentEnergyETA') || 0) * (parseFloat(document.getElementById('currentEnergyETADenominationValue').value) || 1);
    const targetEnergy = (getNumberValue('targetEnergyETA') || 0) * (parseFloat(document.getElementById('targetEnergyETADenominationValue').value) || 1);
    const energyPerClick = (getNumberValue('energyPerClickETA') || 0) * (parseFloat(document.getElementById('energyPerClickETADenominationValue').value) || 1);

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = targetEnergy - currentEnergy;

    if (targetEnergy <= 0 || energyPerClick <= 0) {
        document.getElementById('etaResult').innerText = 'N/A';
        saveETAData();
        return;
    }

    if (energyNeeded <= 0) {
        document.getElementById('etaResult').innerText = 'Target Reached!';
        saveETAData();
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
    document.getElementById('etaResult').innerText = resultString.trim();

    saveETAData();
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
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}. Make sure you have run the create_manifest.py script.`);
            return response.json();
        })
        .catch(error => {
            console.error('CRITICAL: Could not load data-manifest.json.', error);
            return { raids: [], dungeons: [] };
        });

    const worldPromise = fetch('data-worlds.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .catch(error => {
            console.error('Error loading world data:', error);
            return {};
        });

    try {
        const [manifest, loadedWorlds] = await Promise.all([manifestPromise, worldPromise]);
        worldData = loadedWorlds;
        console.log("DEBUG: Manifest and world data loaded.");

        const raidPromises = manifest.raids.map(file => 
            fetch(`raids/${file}`)
                .then(response => response.ok ? response.json() : Promise.reject(`Failed to load ${file}`))
                .then(data => ({ name: file.replace('.json', ''), data }))
                .catch(error => { console.error(`Error loading raid ${file}:`, error); return null; })
        );

        const dungeonPromises = manifest.dungeons.map(file => 
            fetch(`dungeons/${file}`)
                .then(response => response.ok ? response.json() : Promise.reject(`Failed to load ${file}`))
                .then(data => ({ name: file.replace('.json', ''), data }))
                .catch(error => { console.error(`Error loading dungeon ${file}:`, error); return null; })
        );
        
        const [loadedDungeons, loadedRaids] = await Promise.all([
            Promise.all(dungeonPromises),
            Promise.all(raidPromises)
        ]);
        
        const filteredDungeons = loadedDungeons.filter(Boolean);
        const filteredRaids = loadedRaids.filter(Boolean);
        
        let combinedData = {};
        filteredDungeons.forEach(d => { combinedData[d.name] = d.data; });
        filteredRaids.forEach(r => { combinedData[r.name] = r.data; });

        activityData = combinedData;
        console.log("DEBUG: Successfully loaded, sorted, and combined all dynamic activity data.");

    } catch (error) {
        console.error("Fatal error during data loading process:", error);
    }
}

function populateActivityDropdown() {
    const select = document.getElementById('activitySelect');
    select.innerHTML = '<option value="">-- Select an Activity --</option>';
    
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
            const totalWaveHealth = currentHealth * 5;
            if (maxDamageInTime < totalWaveHealth) {
                break;
            }
            completedStage = i;
            currentHealth *= activity.healthMultiplier;
        }
    } else {
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

// +++ DEBOUNCE HELPER FUNCTION +++
// This function limits how often a function can run.
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
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
        const filterText = inputEl.value.toLowerCase().replace('rank', '').trim();
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
            item.textContent = `Rank ${rank}`;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                inputEl.value = `Rank ${rank}`;
                valueEl.value = rank;
                listEl.classList.add('hidden');
                displayRankRequirement();
                calculateRankUp();
            });
            listEl.appendChild(item);
        });
        listEl.classList.remove('hidden');
    }

    inputEl.addEventListener('input', debounce(filterAndShowRanks, 300)); // Apply debounce here
    inputEl.addEventListener('focus', filterAndShowRanks);
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
    inputEl.addEventListener('input', debounce(filterAndShowDenominations, 300)); // And apply it here
    inputEl.addEventListener('focus', filterAndShowDenominations);
}

document.addEventListener('click', (event) => {
    const allLists = document.querySelectorAll('.search-list');
    let clickedInside = false;
    const path = event.composedPath ? event.composedPath() : (function buildPath(node) {
        const p = [];
        let cur = node;
        while (cur) { p.push(cur); cur = cur.parentNode; }
        return p;
    })(event.target);

    for (const el of path) {
        if (!el || !el.classList) continue;
        if (el.classList.contains('input-field') || el.classList.contains('search-list')) {
            clickedInside = true;
            break;
        }
    }

    if (!clickedInside) {
        allLists.forEach(list => list.classList.add('hidden'));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOM fully loaded. Initializing script.");

    loadAllData().then(() => {
        console.log("DEBUG: Data loading complete. Setting up UI.");
        switchTab('rankup');
        
        // --- Setup UI elements ---
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

        // --- Clicker Speed Toggle Sync ---
        const clickerSpeedRankUp = document.getElementById('clickerSpeed');
        const clickerSpeedETA = document.getElementById('clickerSpeedETA');

        const savedClickerSpeed = localStorage.getItem('ae_clickerSpeed') === 'true';
        clickerSpeedRankUp.checked = savedClickerSpeed;
        clickerSpeedETA.checked = savedClickerSpeed;

        const syncAndSaveSpeed = (isFast) => {
            clickerSpeedRankUp.checked = isFast;
            clickerSpeedETA.checked = isFast;
            try {
                localStorage.setItem('ae_clickerSpeed', isFast);
            } catch (e) { console.error("Failed to save clicker speed", e); }
        };
        
        clickerSpeedRankUp.addEventListener('change', () => {
            syncAndSaveSpeed(clickerSpeedRankUp.checked);
            calculateRankUp();
        });

        clickerSpeedETA.addEventListener('change', () => {
            syncAndSaveSpeed(clickerSpeedETA.checked);
            calculateEnergyETA();
        });

        // --- Event Listeners for Inputs ---
        const rankUpInputs = [document.getElementById('currentEnergy'), document.getElementById('energyPerClick')];
        rankUpInputs.forEach(input => input.addEventListener('input', calculateRankUp));

        const ttkInputs = [document.getElementById('yourDPS')];
        ttkInputs.forEach(input => { input.addEventListener('input', calculateTTK); });
        
        const activityInputs = [document.getElementById('yourDPSActivity'), document.getElementById('activityTimeLimit')];
        activityInputs.forEach(input => input.addEventListener('input', calculateMaxStage));
        
        const etaInputs = [document.getElementById('currentEnergyETA'), document.getElementById('targetEnergyETA'), document.getElementById('energyPerClickETA')];
        etaInputs.forEach(input => input.addEventListener('input', calculateEnergyETA));

        // --- Load Saved Data ---
        loadRankUpData();
        loadETAData();
    });
});

