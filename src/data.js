const fs = require('fs-extra');
const path = require('path');
const missionData = require('./mission-data');

const MISSIONS_FILE = path.join(__dirname, '..', 'missions.json');

function loadMissions() {
    try {
        if (fs.existsSync(MISSIONS_FILE)) {
            return fs.readJsonSync(MISSIONS_FILE);
        }
        return { areas: missionData.areas };
    } catch (error) {
        console.error('Error loading missions:', error);
        return { areas: missionData.areas };
    }
}

function saveMissions(missions) {
    try {
        fs.writeJsonSync(MISSIONS_FILE, missions, { spaces: 2 });
    } catch (error) {
        console.error('Error saving missions:', error);
    }
}

function findMissionById(missions, missionId) {
    for (const area of missions.areas) {
        for (const category of area.categories) {
            const mission = category.missions.find(m => m.id === missionId);
            if (mission) {
                return mission;
            }
        }
    }
    return null;
}

module.exports = {
    loadMissions,
    saveMissions,
    findMissionById,
};
