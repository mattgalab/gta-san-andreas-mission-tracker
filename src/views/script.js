async function loadMissions() {
    const response = await fetch('/missions');
    const data = await response.json();
    const container = document.getElementById('missions-container');

    data.areas.forEach((area, areaIndex) => { // Füge areaIndex hinzu
        const areaColumn = document.createElement('div');
        areaColumn.classList.add('col-12', 'mission-area', 'mb-3');

        const areaCard = document.createElement('div');
        areaCard.classList.add('card');

        const areaCardHeader = document.createElement('div');
        areaCardHeader.classList.add('card-header', 'text-white', 'bg-primary', 'd-flex', 'justify-content-between', 'align-items-center'); // Füge d-flex, justify-content-between und align-items-center hinzu

        const areaNameSpan = document.createElement('span');
        areaNameSpan.classList.add('areaName');
        areaNameSpan.textContent = area.name;
        areaCardHeader.appendChild(areaNameSpan);

        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');
        progressContainer.innerHTML = `<div class="progress">
                                    <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 0" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                 </div>
                                 <span class="progress-percentage">0%</span>`;
        areaCardHeader.appendChild(progressContainer);

        areaCard.appendChild(areaCardHeader);

        const areaCardBody = document.createElement('div');
        areaCardBody.classList.add('card-body');

        area.categories.forEach((category, categoryIndex) => {
            // Create category accordion
            const categoryAccordion = document.createElement('div');
            categoryAccordion.classList.add('accordion', 'mb-2');

            const categoryAccordionItem = document.createElement('div');
            categoryAccordionItem.classList.add('accordion-item', 'bg-transparent');

            const categoryHeader = document.createElement('h2');
            categoryHeader.classList.add('accordion-header');

            const categoryButton = document.createElement('button');
            categoryButton.classList.add('accordion-button', 'text-white');
            categoryButton.classList.add('collapsed');
            categoryButton.setAttribute('type', 'button');
            categoryButton.setAttribute('data-bs-toggle', 'collapse');
            categoryButton.setAttribute('data-bs-target', `#category-${areaIndex}-${categoryIndex}`); // Verwende areaIndex und categoryIndex für die ID
            categoryButton.setAttribute('aria-expanded', 'false');
            categoryButton.textContent = category.name;

            const categoryBody = document.createElement('div');
            categoryBody.classList.add('accordion-collapse', 'collapse');
            categoryBody.id = `category-${areaIndex}-${categoryIndex}`; // Verwende areaIndex und categoryIndex für die ID

            const categoryContent = document.createElement('div');
            categoryContent.classList.add('accordion-body');

            category.missions.forEach(mission => {
                const missionDiv = document.createElement('div');
                missionDiv.classList.add('form-check');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('form-check-input', 'mission-checkbox');
                checkbox.id = `${area.name}-${category.name}-${mission.id}`;
                checkbox.checked = mission.completed;

                checkbox.addEventListener('change', async () => {
                    await updateMission(area.name, category.name, mission.id);
                });

                const label = document.createElement('label');
                label.classList.add('form-check-label', 'text-white');
                label.htmlFor = checkbox.id;
                label.textContent = mission.name;

                missionDiv.appendChild(checkbox);
                missionDiv.appendChild(label);
                categoryContent.appendChild(missionDiv);
            });

            categoryBody.appendChild(categoryContent);
            categoryHeader.appendChild(categoryButton);
            categoryAccordionItem.appendChild(categoryHeader);
            categoryAccordionItem.appendChild(categoryBody);
            categoryAccordion.appendChild(categoryAccordionItem);
            areaCardBody.appendChild(categoryAccordion);
        });

        areaCard.appendChild(areaCardBody);
        areaColumn.appendChild(areaCard);
        container.appendChild(areaColumn);
    });
    updateProgress();
    updateAreaProgress(data);
}

async function updateMission(areaName, categoryName, missionId) {
    await fetch('/update-mission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({areaName, categoryName, missionId})
    });
    updateProgress();
    const response = await fetch('/missions');
    const data = await response.json();
    updateAreaProgress(data);
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.mission-checkbox');
    const totalMissions = checkboxes.length;
    let completedMissions = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            completedMissions++;
        }
    });

    const progressPercentage = Math.round((completedMissions / totalMissions) * 100);
    document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;

    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
}

function updateAreaProgress(data) {
    data.areas.forEach(area => {
        const areaName = area.name;
        const areaProgress = calculateAreaProgress(areaName, data);

        // Finde alle card-header Elemente
        const cardHeaders = document.querySelectorAll('.card-header');

        // Iteriere durch die card-header Elemente
        cardHeaders.forEach(cardHeader => {
            // Überprüfe, ob der Textinhalt des card-header Elements mit dem areaName übereinstimmt
            if (cardHeader.textContent.includes(areaName)) {
                // Finde die progress-container innerhalb des aktuellen card-header Elements
                const progressContainer = cardHeader.querySelector('.progress-container');
                const progressBar = progressContainer.querySelector('.progress-bar');
                const progressPercentageSpan = progressContainer.querySelector('.progress-percentage');

                progressBar.style.width = `${areaProgress}%`;
                progressBar.setAttribute('aria-valuenow', areaProgress);
                progressPercentageSpan.textContent = `${areaProgress}%`;
            }
        });
    });
}

function calculateAreaProgress(areaName, data) {
    let areaMissions = 0;
    let completedAreaMissions = 0;

    data.areas.forEach(area => {
        if (area.name === areaName) {
            area.categories.forEach(category => {
                areaMissions += category.missions.length;
                category.missions.forEach(mission => {
                    if (mission.completed) {
                        completedAreaMissions++;
                    }
                });
            });
        }
    });

    return Math.round((completedAreaMissions / areaMissions) * 100); // Berechne den Fortschritt in Prozent
}

document.addEventListener('DOMContentLoaded', loadMissions);
