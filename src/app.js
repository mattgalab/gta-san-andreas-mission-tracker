const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const missionData = require('./mission-data');

const app = express();
const PORT = 187;
const MISSIONS_FILE = path.join(__dirname, '..', 'missions.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

// Load missions
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

// Save missions
function saveMissions(missions) {
    try {
        fs.writeJsonSync(MISSIONS_FILE, missions, { spaces: 2 });
    } catch (error) {
        console.error('Error saving missions:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/missions', (req, res) => {
    const missions = loadMissions();
    res.json(missions);
});

app.post('/update-mission', (req, res) => {
    const { areaName, categoryName, missionId } = req.body;
    const missions = loadMissions();

    const area = missions.areas.find(a => a.name === areaName);
    if (area) {
        const category = area.categories.find(c => c.name === categoryName);
        if (category) {
            const mission = category.missions.find(m => m.id === missionId);
            if (mission) {
                mission.completed = !mission.completed;
                saveMissions(missions);
                return res.json(mission);
            }
        }
    }

    res.status(404).json({ error: 'Mission not found' });
});

// New Route: Update Counter
app.post('/update-counter', (req, res) => {
    const { missionId, collected } = req.body;
    const missions = loadMissions();

    let missionFound = false;

    // Find the mission with the given ID and update its counter
    missions.areas.forEach(area => {
        area.categories.forEach(category => {
            category.missions.forEach(mission => {
                if (mission.id === missionId && mission.counter) {
                    mission.counter.collected = Math.max(0, Math.min(collected, mission.counter.total));
                    missionFound = true;
                }
            });
        });
    });

    if (missionFound) {
        saveMissions(missions);
        return res.json({ message: 'Counter updated successfully' });
    }

    res.status(404).json({ error: 'Mission with counter not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Mission Tracker running on http://localhost:${PORT}`);
});
