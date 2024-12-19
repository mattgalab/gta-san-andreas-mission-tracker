async function loadMissions() {
    const response = await fetch('/missions');
    const data = await response.json();
    const container = document.getElementById('missions-container');

    data.areas.forEach((area, areaIndex) => {
        const areaAccordion = document.createElement('div');
        areaAccordion.classList.add('accordion', 'mb-3');
        areaAccordion.id = `area-accordion-${areaIndex}`;

        const areaAccordionItem = document.createElement('div');
        areaAccordionItem.classList.add('accordion-item');

        const areaHeader = document.createElement('h2');
        areaHeader.classList.add('accordion-header');

        const areaButton = document.createElement('button');
        areaButton.classList.add('accordion-button', 'collapsed', 'text-white', 'bg-primary');
        areaButton.setAttribute('type', 'button');
        areaButton.setAttribute('data-bs-toggle', 'collapse');
        areaButton.setAttribute('data-bs-target', `#area-collapse-${areaIndex}`);
        areaButton.setAttribute('aria-expanded', 'false');
        areaButton.textContent = area.name;

        // Fortschrittsanzeige hinzufügen
        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');

        const progress = document.createElement('div');
        progress.classList.add('progress');

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar', 'progress-bar-striped', 'bg-info');
        progressBar.style.width = '0%';

        progress.appendChild(progressBar);
        progressContainer.appendChild(progress);
        areaHeader.appendChild(progressContainer);
        areaHeader.appendChild(areaButton);

        const areaCollapse = document.createElement('div');
        areaCollapse.id = `area-collapse-${areaIndex}`;
        areaCollapse.classList.add('accordion-collapse', 'collapse');

        const areaBodyWrapper = document.createElement('div');
        areaBodyWrapper.classList.add('accordion-body');

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
                if (mission.counter) {
                    // Create counter UI for Collectibles
                    const counterContainer = document.createElement('div');
                    counterContainer.classList.add('counter-container');

                    const minusButton = document.createElement('button');
                    minusButton.classList.add('counter-button');
                    minusButton.textContent = '-';
                    minusButton.addEventListener('click', () => updateCounter(mission.id, -1));

                    const counterValue = document.createElement('span');
                    counterValue.classList.add('counter-value');
                    counterValue.id = `counter-${mission.id}`;
                    counterValue.textContent = `${mission.counter.collected} / ${mission.counter.total}`;

                    const plusButton = document.createElement('button');
                    plusButton.classList.add('counter-button');
                    plusButton.textContent = '+';
                    plusButton.addEventListener('click', () => updateCounter(mission.id, 1));

                    counterContainer.appendChild(minusButton);
                    counterContainer.appendChild(counterValue);
                    counterContainer.appendChild(plusButton);

                    categoryContent.appendChild(counterContainer);
                } else {
                    // Default checkbox for regular missions
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
                }
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

        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            const button = header.querySelector('.accordion-button');
            if (button && button.textContent === areaName) {
                const progressContainer = header.querySelector('.progress-container');
                if (progressContainer) {
                    const progressBar = progressContainer.querySelector('.progress-bar');

                    progressBar.style.width = `${areaProgress}%`;
                    progressBar.setAttribute('aria-valuenow', areaProgress);

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

async function updateCounter(missionId, increment) {
    const counterElement = document.getElementById(`counter-${missionId}`);
    const [current, total] = counterElement.textContent.split(' / ').map(Number);

    let newCount = current + increment;
    newCount = Math.max(0, Math.min(newCount, total)); // Begrenzung zwischen 0 und total

    counterElement.textContent = `${newCount} / ${total}`;

    // Sende die aktualisierten Daten an den Server
    await fetch('/update-counter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId, collected: newCount })
    });

    updateProgress(); // Optional: Fortschritt neu berechnen
}

document.addEventListener('DOMContentLoaded', loadMissions);
document.addEventListener('change', checkCategoryCompletion);