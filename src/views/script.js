function calculateTagsAndCollectiblesProgress(data) {
    if (!data?.areas?.length) {
        console.error('Invalid data structure');
        return { progressPercentage: 0, totalCollectibles: 0, collectedCollectibles: 0 };
    }

    try {
        const totals = data.areas.reduce((acc, area) => {
            const missions = area.categories?.flatMap(cat => cat.missions) ?? [];

            missions.forEach(mission => {
                const counter = mission?.counter;
                if (typeof counter?.collected === 'number' && typeof counter?.total === 'number') {
                    if (counter.collected < 0 || counter.total < 0) {
                        console.warn(`Negative values found: ${counter.collected}/${counter.total}`);
                        return;
                    }
                    acc.collected += counter.collected;
                    acc.total += counter.total;
                }
            });

            return acc;
        }, { collected: 0, total: 0 });

        return {
            progressPercentage: totals.total > 0 ? Math.round((totals.collected / totals.total) * 100) : 0,
            totalCollectibles: totals.total,
            collectedCollectibles: totals.collected
        };
    } catch (error) {
        console.error('Calculation error:', error);
        return { progressPercentage: 0, totalCollectibles: 0, collectedCollectibles: 0 };
    }
}

// Andere Kategorien Fortschritt berechnen
function calculateOtherCategoriesProgress(data) {
    let totalMissions = 0;
    let completedMissions = 0;

    data.areas.forEach(area => {
        area.categories.forEach(category => {
            category.missions.forEach(mission => {
                if (!mission.counter) {
                    totalMissions++;
                    if (mission.completed) {
                        completedMissions++;
                    }
                }
            });
        });
    });

    const progressPercentage = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
    return { progressPercentage, totalMissions, completedMissions };
}

// Gesamtfortschritt berechnen
function calculateOverallProgress(tagsAndCollectiblesProgress, otherCategoriesProgress) {
    const total = tagsAndCollectiblesProgress.totalCollectibles + otherCategoriesProgress.totalMissions;
    const completed = tagsAndCollectiblesProgress.collectedCollectibles + otherCategoriesProgress.completedMissions;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Fortschritt aktualisieren
function updateProgress() {
    fetch('/missions')
        .then(response => response.json())
        .then(data => {
            const tagsAndCollectiblesProgress = calculateTagsAndCollectiblesProgress(data);
            const otherCategoriesProgress = calculateOtherCategoriesProgress(data);
            const overallProgress = calculateOverallProgress(tagsAndCollectiblesProgress, otherCategoriesProgress);

            console.log("Gesamtfortschritt:", overallProgress);

            // Update des Gesamtfortschritts
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = `${overallProgress}%`;
            progressBar.setAttribute('aria-valuenow', String(overallProgress));

            const progressText = document.getElementById('progress-percentage');
            progressText.textContent = `${overallProgress}%`;

            checkCategoryCompletion(); // Neu hinzugefügt, um den Status zu aktualisieren
        })
        .catch(error => console.error('Fehler beim Laden der Missionen:', error));
}

// Bereichsfortschritt aktualisieren
async function updateAreaProgress() {
    try {
        // Missionsdaten abrufen
        const response = await fetch('/missions');
        const data = await response.json();

        if (!data?.areas?.length) {
            console.warn('Keine Bereiche vorhanden, Fortschritt wird nicht aktualisiert.');
            return;
        }

        // Fortschritt für jeden Bereich berechnen
        data.areas.forEach(area => {
            let totalAreaMissions = 0;
            let completedAreaMissions = 0;

            area.categories.forEach(category => {
                category.missions.forEach(mission => {
                    if (mission.counter) {
                        const { collected, total } = mission.counter;
                        if (!isNaN(collected) && !isNaN(total)) {
                            completedAreaMissions += collected;
                            totalAreaMissions += total;
                        }
                    } else {
                        totalAreaMissions++;
                        if (mission.completed) {
                            completedAreaMissions++;
                        }
                    }
                });
            });

            // Bereichsfortschritt berechnen
            const areaProgress = totalAreaMissions > 0 ? Math.round((completedAreaMissions / totalAreaMissions) * 100) : 0;

            // DOM-Elemente aktualisieren
            const header = document.querySelector(`.accordion-header[data-area-name="${area.name}"]`);
            if (header) {
                const progressContainer = header.querySelector('.progress-container');
                if (progressContainer) {
                    const progressBar = progressContainer.querySelector('.progress-bar');
                    if (progressBar) {
                        console.log(`Bereich: ${area.name}, Fortschritt: ${areaProgress}%`);
                        progressBar.style.width = `${areaProgress}%`;
                        progressBar.setAttribute('aria-valuenow', String(areaProgress));
                    } else {
                        console.warn(`Keine Progressbar für Bereich: ${area.name} gefunden.`);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Bereichsfortschritts:', error);
    }
}


// Missions-Daten laden und initialisieren
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
        areaHeader.setAttribute('data-area-name', area.name); // DATA ATTRIBUTE ADDED

        const areaButton = document.createElement('button');
        areaButton.classList.add('accordion-button', 'collapsed', 'text-white', 'bg-primary');
        areaButton.setAttribute('type', 'button');
        areaButton.setAttribute('data-bs-toggle', 'collapse');
        areaButton.setAttribute('data-bs-target', `#area-collapse-${areaIndex}`);
        areaButton.setAttribute('aria-expanded', 'false');
        areaButton.textContent = area.name;

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
                    const missionDiv = document.createElement('div');
                    missionDiv.classList.add('form-check');

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('form-check-input', 'mission-checkbox');
                    checkbox.id = `${area.name}-${category.name}-${mission.id}`;
                    checkbox.checked = mission.completed;

                    checkbox.addEventListener('change', async () => {
                        await updateMission(area.name, category.name, mission.id);
                        checkCategoryCompletion(); // Hinzugefügt
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

    updateProgress(); // Aktualisiert den Gesamtfortschritt
    await updateAreaProgress(); // Aktualisiert die Bereichsfortschritte
    checkCategoryCompletion(); // Überprüft Kategorieabschlüsse
}

// Missionsstatus aktualisieren
async function updateMission(areaName, categoryName, missionId) {
    await fetch('/update-mission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areaName, categoryName, missionId })
    });
    updateProgress();
    await updateAreaProgress(); // Aktualisiert die Bereichsfortschritte
}

// Counter aktualisieren
async function updateCounter(missionId, increment) {
    const counterElement = document.getElementById(`counter-${missionId}`);
    const [current, total] = counterElement.textContent.split(' / ').map(Number);

    let newCount = current + increment;
    newCount = Math.max(0, Math.min(newCount, total));

    counterElement.textContent = `${newCount} / ${total}`;

    await fetch('/update-counter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId, collected: newCount })
    });

    updateProgress();
    await updateAreaProgress(); // Aktualisiert die Bereichsfortschritte
    checkCategoryCompletion(); // Neu hinzugefügt
}

// Kategorie-Fertigstellungsstatus überprüfen
function checkCategoryCompletion() {
    const categoryAccordions = document.querySelectorAll('.accordion-item');

    categoryAccordions.forEach(accordion => {
        const checkboxes = accordion.querySelectorAll('.mission-checkbox');
        const counters = accordion.querySelectorAll('.counter-value');

        // Nur Kategorien mit Missionen prüfen
        if (checkboxes.length === 0 && counters.length === 0) {
            return;
        }

        // Überprüfen, ob alle Missionen abgeschlossen sind
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        const allCountersCompleted = Array.from(counters).every(counter => {
            const [current, total] = counter.textContent.split(' / ').map(Number);
            return current === total;
        });

        const isCategoryComplete = allChecked && allCountersCompleted;

        const button = accordion.querySelector('.accordion-button');
        if (!button) return;

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

        if (isCategoryComplete) {
            // Emoji hinzufügen
            const checkmarkSpan = document.createElement('span');
            checkmarkSpan.classList.add('category-completion-emoji', 'ms-2');
            checkmarkSpan.textContent = '💯';
            button.appendChild(checkmarkSpan);

            // Text durchstreichen und Klasse für Rahmen hinzufügen
            textSpan.style.textDecoration = 'line-through';
            button.classList.add('category-complete');
        } else {
            // Text wiederherstellen und Klasse für Rahmen entfernen
            textSpan.style.textDecoration = 'none';
            button.classList.remove('category-complete');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadMissions().then(() => {
        checkCategoryCompletion();
    });
});
