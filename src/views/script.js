async function loadMissions() {
    const response = await fetch('/missions');
    const data = await response.json();
    const container = document.getElementById('missions-container');

    data.areas.forEach((area, areaIndex) => {
        // Wrapper für das Area-Accordion
        const areaAccordion = document.createElement('div');
        areaAccordion.classList.add('accordion', 'mb-3');
        areaAccordion.id = `area-accordion-${areaIndex}`;

        // Item innerhalb des Accordions
        const areaAccordionItem = document.createElement('div');
        areaAccordionItem.classList.add('accordion-item');

        // Header des Accordions
        const areaHeader = document.createElement('h2');
        areaHeader.classList.add('accordion-header', 'd-flex', 'justify-content-between', 'align-items-center');

        // Button für den Namen der Area
        const areaButton = document.createElement('button');
        areaButton.classList.add('accordion-button', 'collapsed', 'text-white', 'bg-primary', 'flex-grow-1');
        areaButton.setAttribute('type', 'button');
        areaButton.setAttribute('data-bs-toggle', 'collapse');
        areaButton.setAttribute('data-bs-target', `#area-collapse-${areaIndex}`);
        areaButton.setAttribute('aria-expanded', 'false');
        areaButton.textContent = area.name;

        // Fortschrittsbalken für die Area
        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container', 'd-flex', 'align-items-center', 'ms-3');
        progressContainer.innerHTML = `
            <div class="progress" style="width: 150px;">
                <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="progress-percentage ms-2">0%</span>`;

        areaHeader.appendChild(areaButton);
        areaHeader.appendChild(progressContainer);

        // Collapse-Element für den Content
        const areaCollapse = document.createElement('div');
        areaCollapse.id = `area-collapse-${areaIndex}`;
        areaCollapse.classList.add('accordion-collapse', 'collapse');

        const areaBodyWrapper = document.createElement('div');
        areaBodyWrapper.classList.add('accordion-body');

        // Inhalte der Area
        area.categories.forEach((category, categoryIndex) => {
            const categoryAccordion = document.createElement('div');
            categoryAccordion.classList.add('accordion', 'mb-2');

            const categoryAccordionItem = document.createElement('div');
            categoryAccordionItem.classList.add('accordion-item', 'bg-transparent');

            const categoryHeader = document.createElement('h2');
            categoryHeader.classList.add('accordion-header');

            const categoryButton = document.createElement('button');
            categoryButton.classList.add('accordion-button', 'text-white', 'collapsed');
            categoryButton.setAttribute('type', 'button');
            categoryButton.setAttribute('data-bs-toggle', 'collapse');
            categoryButton.setAttribute('data-bs-target', `#category-${areaIndex}-${categoryIndex}`);
            categoryButton.setAttribute('aria-expanded', 'false');
            categoryButton.textContent = category.name;

            const categoryBody = document.createElement('div');
            categoryBody.classList.add('accordion-collapse', 'collapse');
            categoryBody.id = `category-${areaIndex}-${categoryIndex}`;

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
            areaBodyWrapper.appendChild(categoryAccordion);
        });

        areaCollapse.appendChild(areaBodyWrapper);
        areaAccordionItem.appendChild(areaHeader);
        areaAccordionItem.appendChild(areaCollapse);
        areaAccordion.appendChild(areaAccordionItem);

        container.appendChild(areaAccordion);
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

        // Finde alle Accordion-Header-Elemente
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        // Iteriere durch die Accordion-Header
        accordionHeaders.forEach(header => {
            // Überprüfe, ob der Textinhalt des Buttons den Area-Namen enthält
            const button = header.querySelector('.accordion-button');
            if (button && button.textContent === areaName) {
                // Finde die Progress-Container innerhalb des Headers
                const progressContainer = header.querySelector('.progress-container');
                if (progressContainer) {
                    const progressBar = progressContainer.querySelector('.progress-bar');
                    const progressPercentageSpan = progressContainer.querySelector('.progress-percentage');

                    // Aktualisiere den Fortschrittsbalken und die Prozentanzeige
                    progressBar.style.width = `${areaProgress}%`;
                    progressBar.setAttribute('aria-valuenow', areaProgress);
                    progressPercentageSpan.textContent = `${areaProgress}%`;
                }
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

function checkCategoryCompletion() {
    const categoryAccordions = document.querySelectorAll('.accordion-item');

    categoryAccordions.forEach(accordion => {
        const checkboxes = accordion.querySelectorAll('.mission-checkbox');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        const button = accordion.querySelector('.accordion-button');

        // Entferne alle vorhandenen Emoji-Spans
        button.querySelectorAll('.category-completion-emoji').forEach(emoji => emoji.remove());

        // Hole oder erstelle das Text-Span
        let textSpan = button.querySelector('.category-text');
        if (!textSpan) {
            textSpan = document.createElement('span');
            textSpan.classList.add('category-text');
            textSpan.textContent = button.textContent.trim();
            button.textContent = ''; // Entfernt alten Text
            button.appendChild(textSpan);
        }

        if (allChecked) {
            // Emoji hinzufügen
            const checkmarkSpan = document.createElement('span');
            checkmarkSpan.classList.add('category-completion-emoji', 'ms-2');
            checkmarkSpan.textContent = '💯';
            button.appendChild(checkmarkSpan);

            // Text durchstreichen
            textSpan.style.textDecoration = 'line-through';
        } else {
            // Text wiederherstellen, falls nicht mehr alle Checkboxen markiert sind
            textSpan.style.textDecoration = 'none';
        }
    });
}


document.addEventListener('DOMContentLoaded', loadMissions);


document.addEventListener('change', checkCategoryCompletion);