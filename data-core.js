const denominations = [
    { name: 'None', value: 1 },
    { name: 'K', value: 1e3 },
    { name: 'M', value: 1e6 },
    { name: 'B', value: 1e9 },
    { name: 'T', value: 1e12 },
    { name: 'q', value: 1e15 },
    { name: 'Q', value: 1e18 },
    { name: 's', value: 1e21 },
    { name: 'S', value: 1e24 },
    { name: 'o', value: 1e27 },
    { name: 'N', value: 1e30 },
    { name: 'd', value: 1e33 },
    { name: 'U', value: 1e36 },
    { name: 'D', value: 1e39 },
    { name: 'T', value: 1e42 },
    { name: 'Qd', value: 1e45 },
    { name: 'Qn', value: 1e48 },
    { name: 'Sx', value: 1e51 },
    { name: 'Sp', value: 1e54 },
    { name: 'O', value: 1e57 },
    { name: 'Nn', value: 1e60 },
    { name: 'V', value: 1e63 },
    { name: 'uV', value: 1e66 },
    { name: 'dV', value: 1e69 },
    { name: 'tV', value: 1e72 },
    { name: 'qV', value: 1e75 },
    { name: 'QV', value: 1e78 },
    { name: 'sV', value: 1e81 },
    { name: 'SV', value: 1e84 },
    { name: 'oV', value: 1e87 },
    { name: 'nV', value: 1e90 },
    { name: 'Tg', value: 1e93 },
    { name: 'uT', value: 1e96 },
    { name: 'dT', value: 1e99 }
];

const rankRequirements = {
    "100": 1e20, "101": 1.2e20, "102": 1.5e20, "103": 1.8e20, "104": 2.2e20, "105": 2.7e20, "106": 3.3e20, "107": 4.1e20, "108": 5e20, "109": 6.2e20, "110": 7.7e20,
    "111": 9.5e20, "112": 1.2e21, "113": 1.4e21, "114": 1.8e21, "115": 2.2e21, "116": 2.7e21, "117": 3.3e21, "118": 4.1e21, "119": 5e21, "120": 6.2e21
    // ... add more ranks as needed
};

// Mock world data to prevent loading errors in Time to Kill/Raid tabs
const worldData = {
    "World 1": { 
        "enemies": { "Enemy 1": 1e10, "Enemy 2": 5e10, "Boss": 1e11 }
    }
};

const activityData = {
    "Dungeon 1": { 
        "type": "dungeon", "maxStages": 10, "timeLimit": 300, 
        "enemies": { "Room 1": 1e12, "Room 5": 5e12, "Room 10": 1e13 } 
    }
};
