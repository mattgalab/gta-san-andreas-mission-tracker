const express = require('express');
const path = require('path');
const data = require('./data');

const app = express();
const PORT = 187;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/missions', (req, res) => {
    const missions = data.loadMissions();
    res.json(missions);
});

app.post('/update-mission', (req, res) => {
    const { areaName, categoryName, missionId } = req.body;
    const missions = data.loadMissions();

    const area = missions.areas.find(a => a.name === areaName);
    if (area) {
        const category = area.categories.find(c => c.name === categoryName);
        if (category) {
            const mission = category.missions.find(m => m.id === missionId);
            if (mission) {
                mission.completed = !mission.completed;
                data.saveMissions(missions);
                return res.json(mission);
            }
        }
    }

    res.status(404).json({ error: 'Mission not found' });
});

app.post('/update-counter', (req, res) => {
    const { missionId, collected } = req.body;
    const missions = data.loadMissions();
    const mission = data.findMissionById(missions, missionId);

    if (mission && mission.counter) {
        mission.counter.collected = Math.max(0, Math.min(collected, mission.counter.total));
        data.saveMissions(missions);
        return res.json({ message: 'Counter updated successfully' });
    }

    res.status(404).json({ error: 'Mission with counter not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Mission Tracker running on http://localhost:${PORT}`);
});
