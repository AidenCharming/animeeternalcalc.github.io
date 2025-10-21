// --- Tab Switching Logic ---
const tabs = ['rankup', 'eta', 'ttk', 'raid']; // 'star' removed
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

// --- Helper Functions ---
function getNumberValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    const reversedDenominations = [...denominations].reverse();
    for (const denom of reversedDenominations) {
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

// Global variables to hold all fetched data
// REMOVED: let worldData = {}; and let activityData = {}; 
// They are now consts defined in data-core.js and accessed globally.

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
            document.getElementById('rankInput').value = `Rank ${rankSelect}`;
        }
        
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
    try {
        document.getElementById('currentEnergyETA').value = localStorage.getItem('ae_currentEnergyETA') || '';
        document.getElementById('currentEnergyETADenominationInput').value = localStorage.getItem('ae_currentEnergyETADenomInput') || '';
        document.getElementById('currentEnergyETADenominationValue').value = localStorage.getItem('ae_currentEnergyETADenominationValue') || '1';
        document.getElementById('targetEnergyETA').value = localStorage.getItem('ae_targetEnergyETA') || '';
        document.getElementById('targetEnergyETADenominationInput').value = localStorage.getItem('ae_targetEnergyETADenomInput') || '';
        document.getElementById('targetEnergyETADenominationValue').value = localStorage.getItem('ae_targetEnergyETADenominationValue') || '1';
        document.getElementById('energyPerClickETA').value = localStorage.getItem('ae_energyPerClickETA') || '';
        document.getElementById('energyPerClickETADenominationInput').value = localStorage.getItem('ae_energyPerClickETADenominationInput') || '';
        document.getElementById('energyPerClickETADenominationValue').value = localStorage.getItem('ae_energyPerClickETADenominationValue') || '1';
        
        const clickerSpeed = localStorage.getItem('ae_clickerSpeedETA');
        if (clickerSpeed !== null) {
            const isChecked = (clickerSpeed === 'true');
            document.getElementById('clickerSpeed').checked = isChecked;
            document.getElementById('clickerSpeedETA').checked = isChecked;
        }

        calculateEnergyETA();
    } catch(e) {
        console.error("Failed to load ETA data from localStorage", e);
    }
}

// --- Calculator Logics ---

function calculateEnergyETA() {
    const isFastClicker = document.getElementById('clickerSpeedETA').checked;
    const currentEnergy = getNumberValue('currentEnergyETA') * (parseFloat(document.getElementById('currentEnergyETADenominationValue').value) || 1);
    const targetEnergy = getNumberValue('targetEnergyETA') * (parseFloat(document.getElementById('targetEnergyETADenominationValue').value) || 1);
    const energyPerClick = getNumberValue('energyPerClickETA') * (parseFloat(document.getElementById('energyPerClickETADenominationValue').value) || 1);
    
    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = targetEnergy - currentEnergy;

    if (energyNeeded <= 0) {
        document.getElementById('etaResult').innerText = 'Target Reached!';
        saveETAData();
        return;
    }
    if (energyPerClick <= 0 || clicksPerSecond <= 0) {
        document.getElementById('etaResult').innerText = 'N/A';
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
    document.getElementById('etaResult').innerText = resultString.trim();

    saveETAData();
}


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
    
    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);
    
    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;
    document.getElementById('rankUpResult').innerText = resultString.trim();

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

    // NOTE: worldData and activityData are already defined as constants in data-core.js
    // We will use Object.assign to merge fetched data into these global constants if available.

    const manifestPromise = fetch('data-manifest.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}. Make sure you have run the create_manifest.py script.`);
            return response.json();
        })
        .catch(error => {
            console.warn('WARNING: Could not load data-manifest.json. Using mock data.', error);
            return { raids: [], dungeons: [] };
        });

    const worldPromise = fetch('data-worlds.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .catch(error => {
            console.warn('WARNING: Error loading data-worlds.json. Using mock data.', error);
            // Returning null here so we don't overwrite the existing const worldData with an empty object
            return null; 
        });

    try {
        const [manifest, loadedWorlds] = await Promise.all([manifestPromise, worldPromise]);
        
        // If real world data was loaded, merge it into the global worldData constant
        if (loadedWorlds) {
            // Using Object.assign to modify the constant object's properties, which is allowed.
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
        
        const filteredDungeons = loadedDungeons.filter(Boolean);
        const filteredRaids = loadedRaids.filter(Boolean);
        
        let combinedData = {};
        // Start with the mock activity data defined in data-core.js
        Object.assign(combinedData, activityData); 
        
        filteredDungeons.forEach(d => { combinedData[d.name] = d.data; });
        filteredRaids.forEach(r => { combinedData[r.name] = r.data; });

        // Overwrite the activityData constant properties with the combined data
        Object.assign(activityData, combinedData);
        
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
            const totalWaveHealth = currentHealth * 5; // Assuming 5 enemies per wave
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
        const rankValue = inputEl.value.trim();
        if (rankRequirements[rankValue]) {
            if (valueEl.value === rankValue) return;
            valueEl.value = rankValue;
            inputEl.value = rankValue;
            displayRankRequirement();
            calculateRankUp();
        }
        listEl.classList.add('hidden'); // Hide list on blur
    }
    
    function handleRankInputFocus() {
        // Show all ranks when focusing if input is empty, or filter if not.
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
        const filterText = inputEl.value.toLowerCase();
        // Include 'None' only if the filter is empty or starts with 'n'
        const filtered = denominations.filter(d => 
            (filterText === '' && d.name === 'None') || // Always show 'None' if empty
            (d.name.toLowerCase().startsWith(filterText) && d.name !== 'None') // Filter others
        );
        renderDenominationsList(filtered);
    }

    function renderDenominationsList(list) {
        listEl.innerHTML = '';
        if (list.length === 0) { listEl.classList.add('hidden'); return; }
        
        // Ensure 'None' is always at the top if present
        list.sort((a, b) => {
            if (a.name === 'None') return -1;
            if (b.name === 'None') return 1;
            return 0;
        });
        
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
    
    function handleDenominationBlur() {
        // Find the denomination based on the input text
        const inputText = inputEl.value.trim();
        const foundDenom = denominations.find(d => d.name === inputText);

        if (foundDenom) {
            valueEl.value = foundDenom.value;
        } else if (inputText === '') {
             // Default to 'None' if input is cleared
            inputEl.value = '';
            valueEl.value = 1;
        } else {
            // Revert to the value stored in the hidden field or 'None'
            const currentValue = parseFloat(valueEl.value) || 1;
            const currentDenom = denominations.find(d => d.value == currentValue);
            inputEl.value = currentDenom && currentDenom.name !== 'None' ? currentDenom.name : '';
        }
        
        listEl.classList.add('hidden');
        if (callback) callback();
    }
    
    function handleDenominationFocus() {
        filterAndShowDenominations();
    }
    
    // The previous fix for the ReferenceError remains here (filterAndShowDenominations)
    inputEl.addEventListener('input', debounce(filterAndShowDenominations, 300));
    inputEl.addEventListener('focus', handleDenominationFocus);
    inputEl.addEventListener('blur', handleDenominationBlur);
}

// --- Global Click Listener to Hide Dropdowns ---
document.addEventListener('click', (event) => {
    const allLists = document.querySelectorAll('.search-list');
    let clickedInside = false;
    const path = event.composedPath || (event.composedPath || function(e) {
        for (var t = []; e; )
            t.push(e),
            e = e.parentNode;
        return t
    }(event.target));

    if (Array.isArray(path)) {
        for (const el of path) {
            if (!el || !el.classList) continue;
            if (el.classList.contains('input-field') || el.classList.contains('search-list')) {
                clickedInside = true;
                break;
            }
        }
    }

    if (!clickedInside) {
        allLists.forEach(list => list.classList.add('hidden'));
    }
});


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOM fully loaded. Initializing script.");

    // The functions below now use the global constants defined in data-core.js
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
        
        // --- Load Saved Data ---\
        loadRankUpData();
        loadETAData();
    });
});
