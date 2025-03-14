// Fonction pour obtenir le numéro de semaine
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Fonction pour formater une date
function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Configuration des jours fériés français pour 2024-2025
const FRENCH_HOLIDAYS = {
    '2024': [
        '2024-01-01', // Jour de l'an
        '2024-04-01', // Lundi de Pâques
        '2024-05-01', // Fête du Travail
        '2024-05-08', // Victoire 1945
        '2024-05-09', // Ascension
        '2024-05-20', // Lundi de Pentecôte
        '2024-07-14', // Fête Nationale
        '2024-08-15', // Assomption
        '2024-11-01', // Toussaint
        '2024-11-11', // Armistice
        '2024-12-25'  // Noël
    ],
    '2025': [
        '2025-01-01', // Jour de l'an
        '2025-04-21', // Lundi de Pâques
        '2025-05-01', // Fête du Travail
        '2025-05-08', // Victoire 1945
        '2025-05-29', // Ascension
        '2025-06-09', // Lundi de Pentecôte
        '2025-07-14', // Fête Nationale
        '2025-08-15', // Assomption
        '2025-11-01', // Toussaint
        '2025-11-11', // Armistice
        '2025-12-25'  // Noël
    ]
};

// Périodes de vacances scolaires Zone C (Paris) 2023-2025
const SCHOOL_HOLIDAYS = {
    '2024': {
        'christmas_start': { start: '2024-01-01', end: '2024-01-08' },
        'winter': { start: '2024-02-17', end: '2024-03-04' },
        'spring': { start: '2024-04-13', end: '2024-04-29' },
        'summer': { start: '2024-07-06', end: '2024-09-02' },
        'autumn': { start: '2024-10-19', end: '2024-11-04' },
        'christmas_end': { start: '2024-12-21', end: '2024-12-31' }
    },
    '2025': {
        'christmas_start': { start: '2025-01-01', end: '2025-01-06' },
        'winter': { start: '2025-02-15', end: '2025-03-03' },
        'spring': { start: '2025-04-12', end: '2025-04-28' },
        'summer': { start: '2025-07-05', end: '2025-09-01' },
        'autumn': { start: '2025-10-18', end: '2025-11-03' },
        'christmas_end': { start: '2025-12-20', end: '2025-12-31' }
    }
};

// Fonction pour vérifier si une date est pendant les vacances scolaires
function isInSchoolHolidays(date) {
    const year = date.getFullYear().toString();
    const dateString = date.toISOString().split('T')[0];
    
    // Vérifier dans les périodes de l'année en cours et l'année suivante
    const yearsToCheck = [year, (parseInt(year) + 1).toString()];
    
    for (const yearToCheck of yearsToCheck) {
        const periods = SCHOOL_HOLIDAYS[yearToCheck];
        if (periods) {
            for (const periodName in periods) {
                const period = periods[periodName];
                if (dateString >= period.start && dateString <= period.end) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Configuration par défaut du formulaire
const DEFAULT_VALUES = {
    lastName: 'Dupont',
    firstName: 'Jean',
    referenceYear: '2025',
    startDate: '2025-01-01',
    annualHours: '1607',
    trainingHours: '40',
    meetingHours: '0',
    leavePeriods: [
        { start: '2025-04-14', end: '2025-04-18' },
        { start: '2025-07-07', end: '2025-08-01' }
    ],
    highPeriodsEnabled: true,
    highPeriods: {
        winter: '9.5',
        spring: '9.5',
        summer: '9.5',
        autumn: '9.5',
        christmas: '9.5',
        wednesday: '9.5'
    }
};

function initializeFormValues() {
    // Pré-remplissage des valeurs simples
    Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
        if (key === 'leavePeriods' || key === 'highPeriods') return;
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'SELECT') {
                const option = Array.from(element.options).find(opt => opt.value === value);
                if (option) element.value = value;
            } else if (element.classList.contains('datepicker')) {
                // Convertir la date au format DD/MM/YYYY
                const dateParts = value.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    element.value = `${day}/${month}/${year}`;
                    // Initialiser le datepicker avec la nouvelle valeur
                    if (element._flatpickr) {
                        element._flatpickr.setDate(element.value);
                    }
                } else {
                    element.value = value;
                }
            } else {
                element.value = value;
            }
        }
    });

    // Pré-remplissage des périodes de congés
    const leavePeriods = document.getElementById('leavePeriods');
    if (leavePeriods) {
        // Supprimer toutes les périodes existantes
        leavePeriods.innerHTML = '';

        // Ajouter les périodes de congés avec les dates par défaut
        DEFAULT_VALUES.leavePeriods.forEach(period => {
            const template = document.createElement('div');
            template.className = 'leave-period row mb-2';
            
            // Convertir les dates au format DD/MM/YYYY
            const startDate = period.start.split('-');
            const endDate = period.end.split('-');
            const formattedStart = `${startDate[2]}/${startDate[1]}/${startDate[0]}`;
            const formattedEnd = `${endDate[2]}/${endDate[1]}/${endDate[0]}`;
            
            template.innerHTML = `
                <div class="col-md-5">
                    <input type="text" class="form-control datepicker leave-start" value="${formattedStart}" required>
                </div>
                <div class="col-md-5">
                    <input type="text" class="form-control datepicker leave-end" value="${formattedEnd}" required>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger remove-period">×</button>
                </div>
            `;
            leavePeriods.appendChild(template);

            // Ajouter le bouton de suppression
            const removeButton = template.querySelector('.remove-period');
            if (removeButton) {
                removeButton.addEventListener('click', function() {
                    if (document.querySelectorAll('.leave-period').length > 1) {
                        template.remove();
                    } else {
                        const startInput = template.querySelector('.leave-start');
                        const endInput = template.querySelector('.leave-end');
                        if (startInput) startInput.value = '';
                        if (endInput) endInput.value = '';
                    }
                    calculateTotalLeaveDays();
                });
            }
        });

        // Les datepickers seront initialisés plus tard
    }

    // Activer et configurer les périodes hautes
    if (DEFAULT_VALUES.highPeriodsEnabled) {
        const switchElement = document.getElementById('highPeriodsSwitch');
        if (switchElement) {
            switchElement.checked = true;
            const section = document.getElementById('highPeriodsSection');
            if (section) {
                section.classList.remove('d-none');
                // Pré-remplir les heures des périodes hautes
                Object.entries(DEFAULT_VALUES.highPeriods).forEach(([period, value]) => {
                    const element = document.getElementById(`highPeriod${period.charAt(0).toUpperCase() + period.slice(1)}`);
                    if (element) element.value = value;
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les valeurs du formulaire avec les périodes par défaut
    initializeFormValues();
    
    // Initialiser les datepickers après avoir rempli les valeurs
    initializeDatePickers();
    
    // Initialiser les événements
    initializeEventListeners();
    
    // Calculer le total initial des jours de congés
    calculateTotalLeaveDays();
});

function initializeDatePickers() {
    const dateConfig = {
        dateFormat: "d/m/Y",
        allowInput: true,
        time_24hr: true,
        firstDayOfWeek: 1,
        monthSelectorType: 'static',
        position: 'auto',
        locale: 'fr',
        onChange: function(selectedDates, dateStr, instance) {
            calculateTotalLeaveDays();
        }
    };

    // Initialiser tous les datepickers existants
    document.querySelectorAll('.datepicker').forEach(input => {
        // Détruire l'instance existante si elle existe
        if (input._flatpickr) {
            input._flatpickr.destroy();
        }

        // Convertir le format de date si nécessaire
        let dateToSet = input.value;
        if (input.value && input.value.includes('-')) {
            const [year, month, day] = input.value.split('-');
            dateToSet = `${day}/${month}/${year}`;
            input.value = dateToSet;
        }

        // Initialiser le datepicker avec la date formatée
        const fp = flatpickr(input, dateConfig);
        if (dateToSet) {
            fp.setDate(dateToSet, true);
        }
    });
}

function initializeEventListeners() {
    // Gestion du formulaire
    const form = document.getElementById('workTimeForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            
            try {
                handleFormSubmit(e);
            } catch (error) {
                console.error('Erreur lors de la soumission:', error);
                alert('Une erreur est survenue lors du calcul. Veuillez vérifier vos données.');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // Gestion du bouton d'ajout de période
    const addButton = document.getElementById('addLeavePeriod');
    if (addButton) addButton.addEventListener('click', addLeavePeriod);

    // Gestion du switch des périodes hautes
    const highPeriodsSwitch = document.getElementById('highPeriodsSwitch');
    if (highPeriodsSwitch) {
        highPeriodsSwitch.addEventListener('change', function(e) {
            document.getElementById('highPeriodsSection').classList.toggle('d-none', !e.target.checked);
        });
        // Activer les périodes hautes par défaut
        highPeriodsSwitch.checked = true;
        document.getElementById('highPeriodsSection').classList.remove('d-none');
    }

    // Gestion des exports
    const exportPdfButton = document.getElementById('exportPdf');
    const exportExcelButton = document.getElementById('exportExcel');
    if (exportPdfButton) exportPdfButton.addEventListener('click', exportToPDF);
    if (exportExcelButton) exportExcelButton.addEventListener('click', exportToExcel);

    // Calcul en temps réel des jours de congés
    const leavePeriods = document.getElementById('leavePeriods');
    if (leavePeriods) {
        leavePeriods.addEventListener('change', calculateTotalLeaveDays);
    }

    // Ajouter les écouteurs pour les datepickers
    document.querySelectorAll('.datepicker').forEach(input => {
        input.addEventListener('change', calculateTotalLeaveDays);
    });

    // Calculer le total initial des jours de congés
    calculateTotalLeaveDays();
}

function addLeavePeriod() {
    const template = `
        <div class="leave-period row mb-2">
            <div class="col-md-5">
                <input type="text" class="form-control datepicker leave-start" required>
            </div>
            <div class="col-md-5">
                <input type="text" class="form-control datepicker leave-end" required>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger remove-period">×</button>
            </div>
        </div>
    `;
    
    const leavePeriods = document.getElementById('leavePeriods');
    leavePeriods.insertAdjacentHTML('beforeend', template);
    
    // Récupérer la nouvelle période ajoutée
    const newPeriod = leavePeriods.lastElementChild;
    const startInput = newPeriod.querySelector('.leave-start');
    const endInput = newPeriod.querySelector('.leave-end');
    
    // Ajouter le bouton de suppression
    const removeButton = newPeriod.querySelector('.remove-period');
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            if (document.querySelectorAll('.leave-period').length > 1) {
                newPeriod.remove();
            } else {
                startInput.value = '';
                endInput.value = '';
            }
            calculateTotalLeaveDays();
        });
    }
    
    // Initialiser les datepickers
    const dateConfig = {
        dateFormat: "d/m/Y",
        allowInput: true,
        time_24hr: true,
        firstDayOfWeek: 1,
        monthSelectorType: 'static',
        position: 'auto',
        locale: 'fr',
        onChange: function(selectedDates, dateStr, instance) {
            calculateTotalLeaveDays();
        }
    };
    
    [startInput, endInput].forEach(input => {
        flatpickr(input, dateConfig);
    });
}

function calculateTotalLeaveDays() {
    let total = 0;
    const periods = document.querySelectorAll('.leave-period');
    
    periods.forEach(period => {
        const startInput = period.querySelector('.leave-start');
        const endInput = period.querySelector('.leave-end');
        
        if (startInput && endInput && startInput.value && endInput.value) {
            // Convertir les dates du format DD/MM/YYYY au format YYYY-MM-DD pour le calcul
            const startParts = startInput.value.split('/');
            const endParts = endInput.value.split('/');
            const startDate = new Date(`${startParts[2]}-${startParts[1]}-${startParts[0]}`);
            const endDate = new Date(`${endParts[2]}-${endParts[1]}-${endParts[0]}`);
            
            if (!isNaN(startDate) && !isNaN(endDate)) {
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                // Ne compter que les jours de semaine (lundi-vendredi)
                let workingDays = 0;
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay();
                    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                        workingDays++;
                    }
                }
                total += workingDays;
            }
        }
    });
    
    document.getElementById('totalLeaveDays').textContent = total;
}

function validateLeavePeriods() {
    let isValid = true;
    document.querySelectorAll('.leave-period').forEach(period => {
        const startInput = period.querySelector('.leave-start');
        const endInput = period.querySelector('.leave-end');
        
        if ((startInput.value && !endInput.value) || (!startInput.value && endInput.value)) {
            startInput.classList.add('is-invalid');
            endInput.classList.add('is-invalid');
            isValid = false;
        } else if (startInput.value && endInput.value) {
            const startParts = startInput.value.split('/');
            const endParts = endInput.value.split('/');
            const start = new Date(`${startParts[2]}-${startParts[1]}-${startParts[0]}`);
            const end = new Date(`${endParts[2]}-${endParts[1]}-${endParts[0]}`);
            if (end < start) {
                startInput.classList.add('is-invalid');
                endInput.classList.add('is-invalid');
                isValid = false;
            } else {
                startInput.classList.remove('is-invalid');
                endInput.classList.remove('is-invalid');
            }
        }
    });
    return isValid;
}

function validateHighPeriods() {
    let isValid = true;
    if (document.getElementById('highPeriodsSwitch').checked) {
        const highPeriodInputs = document.querySelectorAll('.high-period');
        highPeriodInputs.forEach(input => {
            const value = parseFloat(input.value);
            if (isNaN(value) || value < 0 || value > 24) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
    }
    return isValid;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validation des champs requis
    const requiredFields = ['lastName', 'firstName', 'referenceYear', 'startDate', 'annualHours'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element || !element.value.trim()) {
            if (element) element.classList.add('is-invalid');
            isValid = false;
            console.error(`Champ requis manquant: ${field}`);
        } else {
            element.classList.remove('is-invalid');
        }
    });
    
    // Validation des périodes de congés
    if (!validateLeavePeriods()) {
        isValid = false;
    }
    
    // Validation des périodes hautes
    if (!validateHighPeriods()) {
        isValid = false;
    }
    
    if (!isValid) {
        alert('Veuillez corriger les erreurs dans le formulaire.');
        return;
    }
    
    // Récupération des données du formulaire
    const formData = {
        lastName: document.getElementById('lastName').value.trim(),
        firstName: document.getElementById('firstName').value.trim(),
        year: document.getElementById('referenceYear').value,
        startDate: document.getElementById('startDate').value.trim(),
        annualHours: parseFloat(document.getElementById('annualHours').value),
        trainingHours: parseFloat(document.getElementById('trainingHours').value) || 0,
        meetingHours: parseFloat(document.getElementById('meetingHours').value) || 0,
        highPeriodsEnabled: document.getElementById('highPeriodsSwitch').checked,
        leavePeriods: getLeavePeriods(),
        highPeriods: getHighPeriods()
    };

    try {
        // Log des données du formulaire pour le débogage
        console.log('Données du formulaire:', JSON.stringify(formData, null, 2));

        // Vérification des valeurs numériques
        if (!formData.annualHours || isNaN(formData.annualHours) || formData.annualHours <= 0) {
            throw new Error('Le nombre d\'heures annuelles doit être un nombre positif valide');
        }
        if (isNaN(formData.trainingHours) || formData.trainingHours < 0) {
            throw new Error('Les heures de formation doivent être un nombre positif ou nul');
        }
        if (isNaN(formData.meetingHours) || formData.meetingHours < 0) {
            throw new Error('Les heures de réunion doivent être un nombre positif ou nul');
        }
        if (formData.trainingHours + formData.meetingHours >= formData.annualHours) {
            throw new Error('Le total des heures de formation et de réunion ne peut pas dépasser le nombre d\'heures annuelles');
        }

        // Vérification des dates
        const startDate = new Date(formData.startDate);
        if (isNaN(startDate.getTime())) {
            throw new Error('La date de début est invalide');
        }

        // Afficher la section des résultats
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            resultsSection.classList.remove('d-none');
        }

        // Calcul de la répartition du temps de travail
        const workSchedule = calculateWorkSchedule(formData);
        if (!workSchedule || !workSchedule.schedule) {
            throw new Error('Erreur lors du calcul du planning');
        }
        
        // Affichage des résultats
        displayResults(workSchedule);
    } catch (error) {
        // Log détaillé de l'erreur pour le débogage
        console.error('Erreur lors du calcul:', {
            message: error.message,
            stack: error.stack,
            formData: formData
        });
        alert(`Erreur de calcul : ${error.message || 'Veuillez vérifier vos données'}`);
    }
}

function displayResults(workSchedule) {
    // Log détaillé pour le débogage
    console.log('Détail du workSchedule:', {
        dailyHours: workSchedule.dailyHours,
        formData: workSchedule.formData,
        holidayInfo: workSchedule.holidayInfo,
        schedule: workSchedule.schedule?.length,
        workingDays: workSchedule.workingDays,
        highPeriodDays: workSchedule.highPeriodDays,
        lowPeriodDays: workSchedule.lowPeriodDays
    });

    if (!workSchedule || !workSchedule.schedule || !Array.isArray(workSchedule.schedule)) {
        console.error('Planning invalide:', workSchedule);
        throw new Error('Planning invalide');
    }

    if (!workSchedule.dailyHours || !workSchedule.formData) {
        console.error('Données de planning incomplètes:', workSchedule);
        throw new Error('Données de planning incomplètes');
    }

    // Fonction utilitaire pour mettre à jour un élément du DOM en toute sécurité
    function updateElement(id, value, isHTML = false) {
        const element = document.getElementById(id);
        if (element) {
            if (isHTML) {
                element.innerHTML = value;
            } else {
                element.textContent = value;
            }
        } else {
            console.warn(`Élément '${id}' non trouvé dans le DOM`);
        }
    }

    // Afficher les informations de l'employé
    updateElement('resultName', `${workSchedule.formData.firstName} ${workSchedule.formData.lastName}`);
    updateElement('resultYear', workSchedule.formData.year);
    updateElement('resultAnnualHours', workSchedule.formData.annualHours);
    updateElement('resultTrainingHours', workSchedule.formData.trainingHours);
    updateElement('resultMeetingHours', workSchedule.formData.meetingHours);

    // Calculer et afficher les périodes de congés
    if (workSchedule.formData.leavePeriods && workSchedule.formData.leavePeriods.length > 0) {
        const leaveDaysHtml = [];
        let totalLeaveDays = 0;
        
        workSchedule.formData.leavePeriods.forEach(period => {
            const startDate = new Date(period.start);
            const endDate = new Date(period.end);
            let workingDays = 0;
            
            // Parcourir chaque jour de la période
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = d.getDay();
                const dateString = d.toISOString().split('T')[0];
                const year = d.getFullYear().toString();
                
                // Ne compter que les jours de semaine (lundi-vendredi) qui ne sont pas fériés
                if (dayOfWeek > 0 && dayOfWeek < 6 && 
                    !(FRENCH_HOLIDAYS[year] && FRENCH_HOLIDAYS[year].includes(dateString))) {
                    workingDays++;
                }
            }
            
            totalLeaveDays += workingDays;
            leaveDaysHtml.push(`
                <div class="mb-2">
                    ${formatDate(startDate)} au ${formatDate(endDate)}
                    <span class="text-muted">(${workingDays} jours ouvrés hors fériés)</span>
                </div>
            `);
        });
        
        updateElement('resultLeaveDays', `
            ${leaveDaysHtml.join('')}
            <div class="mt-2 text-info">
                <strong>Total : ${totalLeaveDays} jours ouvrés hors fériés</strong>
            </div>
        `, true);
    } else {
        updateElement('resultLeaveDays', '<div class="text-muted">Aucun congé saisi</div>');
    }

    // Afficher les périodes hautes
    if (workSchedule.formData.highPeriodsEnabled) {
        const highPeriods = workSchedule.formData.highPeriods;
        updateElement('resultHighPeriods', `
            Hiver: ${highPeriods.winter}h<br>
            Printemps: ${highPeriods.spring}h<br>
            Été: ${highPeriods.summer}h<br>
            Automne: ${highPeriods.autumn}h<br>
            Noël: ${highPeriods.christmas}h<br>
            Mercredi: ${highPeriods.wednesday}h
        `, true);
    } else {
        updateElement('resultHighPeriods', 'Non activées');
    }

    // Afficher les totaux
    const totalWorkingDays = workSchedule.schedule.filter(day => 
        !day.isWeekend && !day.isHoliday && !day.isLeave
    ).length;
    const resultTotalHours = workSchedule.schedule.reduce((sum, day) => sum + day.hours, 0);

    updateElement('resultTotalWorkingDays', totalWorkingDays);
    updateElement('resultTotalHours', resultTotalHours.toFixed(1));
    
    // Calculer et afficher le reste à planifier
    const holidayHours = workSchedule.holidayInfo ? workSchedule.holidayInfo.holidays.length * workSchedule.holidayInfo.baseHours : 0;
    const remainingHours = workSchedule.formData.annualHours - 
        (workSchedule.formData.trainingHours + 
        workSchedule.formData.meetingHours + 
        holidayHours);
    
    // Afficher le récapitulatif des heures
    const summaryHtml = `
        <table class="table table-sm">
            <tr>
                <td>Volume annuel</td>
                <td>${workSchedule.formData.annualHours.toFixed(1)}h</td>
            </tr>
            <tr>
                <td>Formation</td>
                <td>-${workSchedule.formData.trainingHours.toFixed(1)}h</td>
            </tr>
            <tr>
                <td>Réunion</td>
                <td>-${workSchedule.formData.meetingHours.toFixed(1)}h</td>
            </tr>
            <tr>
                <td>Jours fériés (${workSchedule.holidayInfo.holidays.length} jours)</td>
                <td>-${Math.ceil(holidayHours)}h</td>
            </tr>
            <tr class="table-info">
                <td>Reste à planifier</td>
                <td>${remainingHours.toFixed(1)}h</td>
            </tr>
        </table>
    `;
    updateElement('remainingHours', summaryHtml, true);

    // Afficher les heures journalières
    let dailyHoursHtml = '<table class="table table-sm">';
    
    if (workSchedule.formData.highPeriodsEnabled) {
        dailyHoursHtml += `
            <tr>
                <td>Périodes hautes</td>
                <td>${workSchedule.dailyHours.highPeriodRegularHours.toFixed(1)}h</td>
            </tr>
            <tr>
                <td>Périodes basses</td>
                <td>${workSchedule.dailyHours.lowPeriodRegularHours.toFixed(1)}h</td>
            </tr>
        `;
    } else {
        dailyHoursHtml += `
            <tr>
                <td>Jours normaux</td>
                <td>${workSchedule.dailyHours.lowPeriodRegularHours.toFixed(1)}h</td>
            </tr>
        `;
    }
    
    dailyHoursHtml += `
        <tr>
            <td>Mercredis</td>
            <td>${workSchedule.dailyHours.wednesday.toFixed(1)}h</td>
        </tr>
    `;
    
    if (workSchedule.holidayInfo) {
        dailyHoursHtml += `
            <tr>
                <td>Jours fériés</td>
                <td>${workSchedule.holidayInfo.baseHours.toFixed(1)}h</td>
            </tr>
            <tr class="table-info">
                <td>Total jours fériés</td>
                <td>${workSchedule.holidayInfo.holidays.length} jours</td>
            </tr>
        `;
    }
    
    dailyHoursHtml += '</table>';
    updateElement('dailyHours', dailyHoursHtml, true);

    // Générer le tableau du planning
    const scheduleTable = document.getElementById('scheduleTable');
    if (scheduleTable) {
        const tbody = scheduleTable.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            // Regrouper les jours par mois
            let currentMonth = null;
            let monthlyHours = 0;
            let monthlyWorkingDays = 0;
            
            workSchedule.schedule.forEach(day => {
                const date = new Date(day.date);
                const month = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
                
                // Ajouter un en-tête de mois si nouveau mois
                if (month !== currentMonth) {
                    if (currentMonth !== null) {
                        // Ajouter la ligne de total du mois précédent
                        const totalRow = document.createElement('tr');
                        totalRow.classList.add('table-info');
                        totalRow.innerHTML = `
                            <td colspan="2"><strong>Total ${currentMonth}</strong></td>
                            <td><strong>${monthlyHours.toFixed(1)}h</strong></td>
                            <td><strong>${monthlyWorkingDays} jours</strong></td>
                        `;
                        tbody.appendChild(totalRow);
                    }
                    
                    // Ajouter l'en-tête du nouveau mois
                    const monthRow = document.createElement('tr');
                    monthRow.classList.add('table-primary');
                    monthRow.innerHTML = `<td colspan="4"><strong>${month}</strong></td>`;
                    tbody.appendChild(monthRow);
                    
                    currentMonth = month;
                    monthlyHours = 0;
                    monthlyWorkingDays = 0;
                }
                
                // Ajouter la ligne du jour
                const row = document.createElement('tr');
                
                // Ajouter des classes pour le style
                if (day.isWeekend) row.classList.add('table-secondary');
                if (day.isHoliday) row.classList.add('table-danger');
                if (day.isLeave) row.classList.add('table-info');
                if (day.periodType === 'haute') row.classList.add('table-warning');
                
                // Déterminer le type de jour
                let dayType = 'Normal';
                if (day.isWeekend) dayType = 'Week-end';
                if (day.isHoliday) dayType = 'Férié';
                if (day.isLeave) dayType = 'Congé';
                if (day.periodType === 'haute') dayType = 'Période haute';
                
                row.innerHTML = `
                    <td>${formatDate(date)}</td>
                    <td>${dayType}</td>
                    <td>${day.hours.toFixed(1)}h</td>
                    <td>${day.notes || '-'}</td>
                `;
                
                tbody.appendChild(row);
                
                // Mettre à jour les totaux mensuels
                if (!day.isWeekend && !day.isHoliday && !day.isLeave) {
                    monthlyHours += day.hours;
                    monthlyWorkingDays++;
                }
            });
            
            // Ajouter le total du dernier mois
            if (currentMonth !== null) {
                const totalRow = document.createElement('tr');
                totalRow.classList.add('table-info');
                totalRow.innerHTML = `
                    <td colspan="2"><strong>Total ${currentMonth}</strong></td>
                    <td><strong>${monthlyHours.toFixed(1)}h</strong></td>
                    <td><strong>${monthlyWorkingDays} jours</strong></td>
                `;
                tbody.appendChild(totalRow);
            }
            
            // Ajouter une légende pour les couleurs
            const legend = document.createElement('div');
            legend.className = 'mb-3';
            legend.innerHTML = `
                <h5>Légende</h5>
                <div class="d-flex flex-wrap gap-3">
                    <div class="d-flex align-items-center">
                        <div class="legend-color table-secondary me-2" style="width: 20px; height: 20px;"></div>
                        <span>Week-end</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="legend-color table-danger me-2" style="width: 20px; height: 20px;"></div>
                        <span>Jour férié</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="legend-color table-info me-2" style="width: 20px; height: 20px;"></div>
                        <span>Congé</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="legend-color table-warning me-2" style="width: 20px; height: 20px;"></div>
                        <span>Période haute</span>
                    </div>
                </div>
            `;
            
            // Ajouter la légende avant le tableau
            scheduleTable.parentNode.insertBefore(legend, scheduleTable);
        }
    }

    // Afficher la section des résultats
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.classList.remove('d-none');
    }
}

function getLeavePeriods() {
    const periods = [];
    document.querySelectorAll('.leave-period').forEach(period => {
        const startInput = period.querySelector('.leave-start').value;
        const endInput = period.querySelector('.leave-end').value;
        if (startInput && endInput) {
            // Convertir les dates du format DD/MM/YYYY au format YYYY-MM-DD
            const startParts = startInput.split('/');
            const endParts = endInput.split('/');
            const start = `${startParts[2]}-${startParts[1].padStart(2, '0')}-${startParts[0].padStart(2, '0')}`;
            const end = `${endParts[2]}-${endParts[1].padStart(2, '0')}-${endParts[0].padStart(2, '0')}`;
            periods.push({ start, end });
        }
    });
    return periods;
}

function getHighPeriods() {
    if (!document.getElementById('highPeriodsSwitch').checked) {
        return {};
    }
    
    return {
        winter: parseFloat(document.getElementById('highPeriodWinter').value) || 9.5,
        spring: parseFloat(document.getElementById('highPeriodSpring').value) || 9.5,
        summer: parseFloat(document.getElementById('highPeriodSummer').value) || 9.5,
        autumn: parseFloat(document.getElementById('highPeriodAutumn').value) || 9.5,
        christmas: parseFloat(document.getElementById('highPeriodChristmas').value) || 9.5,
        wednesday: parseFloat(document.getElementById('highPeriodWednesday').value) || 9.5
    };
}

function calculateWorkSchedule(formData) {
    if (!formData || !formData.startDate || !formData.year) {
        throw new Error('Données de formulaire invalides');
    }

    // Vérification des périodes hautes
    if (formData.highPeriodsEnabled && !formData.highPeriods) {
        throw new Error('Les périodes hautes sont activées mais aucune valeur n\'est définie');
    }

    // Calcul des jours travaillés et leur répartition
    const workingDays = calculateWorkingDays(formData);
    if (workingDays <= 0) {
        throw new Error('Aucun jour travaillé trouvé pour la période sélectionnée');
    }

    // Vérification des périodes hautes/basses
    const { highPeriodDays, lowPeriodDays } = calculatePeriodDays(formData, workingDays);
    if (highPeriodDays < 0 || lowPeriodDays < 0) {
        throw new Error('Erreur dans le calcul des périodes : nombre de jours négatif');
    }
    if (highPeriodDays + lowPeriodDays !== workingDays) {
        throw new Error('Erreur dans le calcul des périodes : total des jours incorrect');
    }
    
    // Calcul des heures par jour
    const dailyHours = calculateDailyHours(formData, highPeriodDays, lowPeriodDays);
    
    // Génération du planning
    const schedule = generateSchedule(formData, dailyHours);
    
    // Calcul des heures des jours fériés
    const holidayInfo = calculateHolidayHours(formData);

    return {
        dailyHours,
        schedule,
        holidayInfo,
        workingDays,
        highPeriodDays,
        lowPeriodDays,
        formData
    };
}

function calculateWorkingDays(formData) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.year, 11, 30); // 30 décembre
    let workingDays = 0;
    let regularDays = 0;
    let wednesdays = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateString = d.toISOString().split('T')[0];
        const year = d.getFullYear().toString();
        
        // Vérifier si c'est un jour de semaine (1-5 = Lundi-Vendredi)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Vérifier si ce n'est pas un jour férié
            const holidays = FRENCH_HOLIDAYS[year] || [];
            if (!holidays.includes(dateString)) {
                // Vérifier si ce n'est pas un jour de congé
                if (!isLeaveDay(dateString, formData.leavePeriods)) {
                    workingDays++;
                    if (dayOfWeek === 3) { // Mercredi
                        wednesdays++;
                    } else {
                        regularDays++;
                    }
                }
            }
        }
    }
    
    console.log('Jours de travail:', {
        total: workingDays,
        joursReguliers: regularDays,
        mercredis: wednesdays
    });
    
    return workingDays;
}

function isLeaveDay(date, leavePeriods) {
    return leavePeriods.some(period => {
        const start = new Date(period.start);
        const end = new Date(period.end);
        const current = new Date(date);
        
        // Réinitialiser les heures pour comparer uniquement les dates
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        current.setHours(0, 0, 0, 0);
        
        return current >= start && current <= end;
    });
}

function calculatePeriodDays(formData, totalWorkingDays) {
    let highPeriodDays = 0;
    let lowPeriodDays = totalWorkingDays;

    if (formData.highPeriodsEnabled) {
        // Compter les jours en période haute
        const startYear = new Date(formData.startDate).getFullYear().toString();
        const endYear = formData.year;
        
        // Vérifier si les vacances scolaires sont définies pour l'année
        if (!SCHOOL_HOLIDAYS[startYear] && !SCHOOL_HOLIDAYS[endYear]) {
            throw new Error(`Les périodes de vacances scolaires ne sont pas définies pour ${startYear}-${endYear}`);
        }

        // Parcourir les années concernées
        for (const year of [startYear, endYear]) {
            const holidays = SCHOOL_HOLIDAYS[year];
            if (!holidays) continue;

            for (const period of Object.keys(holidays)) {
                const holiday = holidays[period];
                const start = new Date(holiday.start);
                const end = new Date(holiday.end);

                // Vérifier si la période de vacances est dans la plage de dates du contrat
                const contractStart = new Date(formData.startDate);
                const contractEnd = new Date(formData.year, 11, 31);
                
                // Si la période est hors du contrat, on passe
                if (end < contractStart || start > contractEnd) continue;

                // Ajuster les dates de début et fin si nécessaire
                const effectiveStart = start < contractStart ? contractStart : start;
                const effectiveEnd = end > contractEnd ? contractEnd : end;

                let days = 0;
                for (let d = new Date(effectiveStart); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay();
                    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lundi-Vendredi
                        const dateString = d.toISOString().split('T')[0];
                        const currentYear = d.getFullYear().toString();
                        const publicHolidays = FRENCH_HOLIDAYS[currentYear] || [];
                        
                        if (!publicHolidays.includes(dateString) && !isLeaveDay(dateString, formData.leavePeriods)) {
                            days++;
                        }
                    }
                }
                highPeriodDays += days;
            }
        }
        lowPeriodDays = totalWorkingDays - highPeriodDays;
    }

    return { highPeriodDays, lowPeriodDays };
}

function getWorkingHolidays(startDate, endDate) {
    const workingHolidays = [];
    const startYear = startDate.getFullYear().toString();
    const endYear = endDate.getFullYear().toString();
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    // Créer un ensemble d'années uniques pour éviter les doublons
    const years = new Set([startYear, endYear]);
    
    // Parcourir tous les jours fériés des années concernées
    years.forEach(year => {
        if (FRENCH_HOLIDAYS[year]) {
            FRENCH_HOLIDAYS[year].forEach(holiday => {
                const holidayDate = new Date(holiday);
                // Ne compter que les jours fériés entre startDate et endDate
                if (holidayDate >= startDate && holidayDate <= endDate) {
                    const dayOfWeek = holidayDate.getDay();
                    // Ne compter que les jours fériés qui tombent en semaine (lundi-vendredi)
                    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                        workingHolidays.push({
                            date: holiday,
                            jour: weekDays[dayOfWeek],
                            description: FRENCH_HOLIDAYS[year].find(h => h === holiday)
                        });
                    }
                }
            });
        }
    });
    
    // Trier les jours fériés par date
    workingHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return workingHolidays;
}

function calculateHolidayHours(formData) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.year, 11, 31);
    
    // Calcul des heures par jour férié en fonction du volume annuel
    const baseHolidayHours = formData.annualHours / (52 * 5); // Volume annuel divisé par le nombre de jours ouvrés (52 semaines * 5 jours)
    const workingHolidays = getWorkingHolidays(startDate, endDate);
    const totalHolidayHours = workingHolidays.length * baseHolidayHours;
    
    console.log('Détail des jours fériés:', {
        annéeDébut: startDate.getFullYear(),
        annéeFin: endDate.getFullYear(),
        joursFeries: workingHolidays.map(h => ({
            date: h.date,
            jour: h.jour,
            heures: baseHolidayHours
        })),
        nombreJoursFériés: workingHolidays.length,
        heuresParJourFérié: baseHolidayHours,
        totalHeuresFériées: totalHolidayHours
    });

    console.log('Récapitulatif des heures:', {
        totalJoursFériés: workingHolidays.length,
        heuresParJourFérié: baseHolidayHours,
        totalHeuresFériées: totalHolidayHours
    });
    
    return {
        hours: Math.ceil(totalHolidayHours),
        holidays: workingHolidays,
        baseHours: baseHolidayHours
    };
}

function calculateDailyHours(formData, highPeriodDays, lowPeriodDays) {
    if (!formData || typeof formData.annualHours !== 'number' || formData.annualHours <= 0) {
        throw new Error('Heures annuelles invalides');
    }

    // Calcul des heures des jours fériés
    const holidayInfo = calculateHolidayHours(formData);
    const holidayHours = holidayInfo.hours;

    // Heures totales à répartir (sans formation, réunions, ni jours fériés)
    const totalHours = formData.annualHours - (formData.trainingHours || 0) - (formData.meetingHours || 0) - holidayHours;
    if (totalHours <= 0) {
        throw new Error('Le total des heures doit être positif');
    }

    // Heures du mercredi (depuis le formulaire)
    const wednesdayHours = formData.highPeriods.wednesday;
    
    // Calcul pour les périodes hautes
    const highPeriodRegularHours = formData.highPeriods.christmas;
    
    // Calcul du nombre de jours effectifs
    let totalDays = 0;
    let highDays = 0;
    let lowDays = 0;
    let highWednesdays = 0;
    let lowWednesdays = 0;
    let effectiveLowDays = 0; // Jours effectifs en période basse (hors fériés et congés)
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateString = d.toISOString().split('T')[0];
        const year = d.getFullYear().toString();
        
        // Vérifier si c'est un jour de semaine (1-5 = Lundi-Vendredi)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const holidays = FRENCH_HOLIDAYS[year] || [];
            const isHoliday = holidays.includes(dateString);
            const isLeave = isLeaveDay(dateString, formData.leavePeriods);
            const isHigh = formData.highPeriodsEnabled && isInSchoolHolidays(d);
            
            if (!isHoliday && !isLeave) {
                totalDays++;
                
                if (dayOfWeek === 3) { // Mercredi
                    if (isHigh) {
                        highWednesdays++;
                    } else {
                        lowWednesdays++;
                    }
                } else {
                    if (isHigh) {
                        highDays++;
                    } else {
                        lowDays++;
                        if (dayOfWeek !== 3) { // Compter les jours effectifs hors mercredi
                            effectiveLowDays++;
                        }
                    }
                }
            }
        }
    }
    
    // Calcul des heures totales des mercredis
    const totalWednesdayHours = wednesdayHours * (highWednesdays + lowWednesdays);
    
    // Calcul des heures restantes pour les jours réguliers
    const remainingHours = totalHours - totalWednesdayHours;
    
    // Calcul des heures en période haute (hors mercredis)
    const highPeriodTotalHours = highPeriodRegularHours * highDays;
    
    // Calcul des heures par jour en période basse (répartition sur les jours effectifs)
    const lowPeriodRegularHours = (remainingHours - highPeriodTotalHours) / effectiveLowDays;
    
    // Vérification du total
    const totalCalculatedHours = 
        (highPeriodRegularHours * highDays) + // Jours réguliers en période haute
        (wednesdayHours * (highWednesdays + lowWednesdays)) + // Tous les mercredis
        (lowPeriodRegularHours * effectiveLowDays) + // Jours réguliers en période basse
        holidayHours + // Heures des jours fériés
        (formData.trainingHours || 0) + // Heures de formation
        (formData.meetingHours || 0); // Heures de réunion

    // Vérification de la précision du calcul
    const targetTotal = formData.annualHours;
    const difference = Math.abs(totalCalculatedHours - targetTotal);
    
    console.log('Détail de la répartition des heures:', {
        volumeAnnuelInitial: formData.annualHours,
        déductions: {
            heuresFormation: formData.trainingHours || 0,
            heuresRéunion: formData.meetingHours || 0,
            heuresJoursFériés: holidayHours
        },
        volumeAprèsDéductions: totalHours,
        répartitionJours: {
            périodeBasse: {
                joursEffectifs: effectiveLowDays,
                heuresParJour: lowPeriodRegularHours.toFixed(2),
                heuresMercredi: wednesdayHours.toFixed(2),
                totalHeures: (lowPeriodRegularHours * effectiveLowDays).toFixed(2)
            },
            périodeHaute: {
                joursEffectifs: highDays,
                heuresParJour: highPeriodRegularHours.toFixed(2),
                heuresMercredi: wednesdayHours.toFixed(2),
                totalHeures: (highPeriodRegularHours * highDays).toFixed(2)
            },
            mercredis: {
                nombreTotal: highWednesdays + lowWednesdays,
                heuresParJour: wednesdayHours.toFixed(2),
                totalHeures: ((highWednesdays + lowWednesdays) * wednesdayHours).toFixed(2)
            }
        },
        vérification: {
            totalCalculé: totalCalculatedHours.toFixed(2),
            totalCible: targetTotal,
            différence: difference.toFixed(2)
        }
    });
    
    // Ajuster les heures si nécessaire pour atteindre exactement le total
    if (difference > 0.01) {
        const adjustment = (targetTotal - totalCalculatedHours) / effectiveLowDays;
        console.log(`Ajustement des heures quotidiennes: ${adjustment.toFixed(3)}h par jour`);
        lowPeriodRegularHours += adjustment;
    }
    
    return {
        monday: lowPeriodRegularHours,
        tuesday: lowPeriodRegularHours,
        wednesday: wednesdayHours,
        thursday: lowPeriodRegularHours,
        friday: lowPeriodRegularHours,
        highPeriodRegularHours: highPeriodRegularHours,
        lowPeriodRegularHours: lowPeriodRegularHours,
        baseHours: lowPeriodRegularHours // Pour les jours fériés
    };
}

function generateSchedule(formData, dailyHours) {
    console.log('Daily hours configuration:', dailyHours);
    
    const schedule = [];
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.year, 11, 30);
    
    // S'assurer que les dates sont à minuit UTC pour éviter les problèmes de fuseau horaire
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    
    console.log('Start date:', startDate.toISOString(), 'End date:', endDate.toISOString());
    
    let scheduleTotalHours = 0;
    
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        // Créer une nouvelle instance de date pour éviter les références
        const d = new Date(currentDate.getTime());
        d.setUTCHours(0, 0, 0, 0);
        
        const dateString = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        const year = d.getFullYear().toString();
        
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        
        const daySchedule = {
            date: dateString,
            type: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'working',
            hours: 0,
            isHighPeriod: false,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            isHoliday: false,
            isLeave: false
        };
        
        // Vérifier les jours fériés pour l'année en cours
        if (FRENCH_HOLIDAYS[year] && FRENCH_HOLIDAYS[year].includes(dateString)) {
            daySchedule.type = 'holiday';
            daySchedule.isHoliday = true;
            daySchedule.hours = 7; // 7h pour un jour férié
        }
        // Vérifier les congés
        else if (isLeaveDay(dateString, formData.leavePeriods)) {
            daySchedule.type = 'leave';
            daySchedule.isLeave = true;
            daySchedule.hours = 0; // 0h pour un jour de congé
        }
        // Jours travaillés (hors week-end)
        else if (!daySchedule.isWeekend) {
            daySchedule.type = 'working';
            daySchedule.isHighPeriod = formData.highPeriodsEnabled && isInSchoolHolidays(d);
            
            // Définir les heures selon le jour et la période
            if (dayOfWeek === 3) { // Mercredi
                daySchedule.hours = dailyHours.wednesday;
            } else if (daySchedule.isHighPeriod) { // Période de vacances scolaires
                daySchedule.hours = dailyHours.highPeriodRegularHours;
            } else { // Période basse
                daySchedule.hours = dailyHours.lowPeriodRegularHours;
            }
            
            if (daySchedule.hours > 0) {
                scheduleTotalHours += daySchedule.hours;
            }
        }
        
        schedule.push(daySchedule);
        
        // Log pour le débogage
        if (daySchedule.type === 'working' && daySchedule.hours > 0) {
            console.log(`${dateString} (${days[dayOfWeek]}):`, {
                heures: daySchedule.hours,
                type: daySchedule.type,
                periodeHaute: daySchedule.isHighPeriod
            });
        }
    }
    
    return schedule;
}

// Vérifie si une date est dans les vacances scolaires
function isInSchoolHolidays(date) {
    const currentDate = new Date(date);
    const year = currentDate.getFullYear().toString();
    
    if (!SCHOOL_HOLIDAYS[year]) return false;
    
    for (const period of Object.keys(SCHOOL_HOLIDAYS[year])) {
        const holidayPeriod = SCHOOL_HOLIDAYS[year][period];
        const start = new Date(holidayPeriod.start);
        const end = new Date(holidayPeriod.end);
        
        // Ajuster la fin des vacances à la fin de la journée
        end.setHours(23, 59, 59);
        
        // Convertir les dates en timestamps pour la comparaison
        const startTime = start.getTime();
        const endTime = end.getTime();
        const currentTime = currentDate.getTime();
        
        // Vérifier si le jour est dans la période de vacances
        if (currentTime >= startTime && currentTime <= endTime) {
            // Si c'est le dernier lundi des vacances, le traiter comme un jour de vacances
            const nextDay = new Date(currentDate);
            nextDay.setDate(currentDate.getDate() + 1);
            
            // Si c'est un lundi et que le lendemain n'est plus dans les vacances, c'est un lundi de reprise
            if (currentDate.getDay() === 1 && nextDay.getTime() > endTime) {
                return false; // C'est un lundi de reprise, donc période basse
            }
            return true;
        }
    }
    
    return false;
}

function adjustHoursForHighPeriod(date, dailyHours, formData) {
    if (!formData.highPeriodsEnabled) {
        return dailyHours.monday; // Retourner les heures de période basse
    }

    const dayOfWeek = new Date(date).getDay();
    
    // Si c'est un mercredi, toujours utiliser les heures spécifiques du mercredi
    if (dayOfWeek === 3) {
        return dailyHours.wednesday;
    }
    
    // Si c'est une période de vacances scolaires
    if (isInSchoolHolidays(date)) {
        switch (dayOfWeek) {
            case 1: return dailyHours.christmas;
            case 2: return dailyHours.christmas;
            case 3: return dailyHours.wednesday;
            case 4: return dailyHours.christmas;
            case 5: return dailyHours.christmas;
            default: return dailyHours.monday;
        }
    }
    
    // Par défaut, utiliser les heures de période basse selon le jour
    switch (dayOfWeek) {
        case 1: return dailyHours.monday;
        case 2: return dailyHours.tuesday;
        case 4: return dailyHours.thursday;
        case 5: return dailyHours.friday;
        default: return dailyHours.monday;
    }
}
function generateCalendarView(schedule) {
    const calendarElement = document.getElementById('calendar');
    if (!calendarElement) {
        console.error('Élément calendar non trouvé');
        return;
    }
    if (!schedule || !Array.isArray(schedule)) {
        console.error('Planning invalide:', schedule);
        return;
    }
    calendarElement.innerHTML = '';
    
    // Créer le tableau détaillé
    const detailedTable = document.createElement('div');
    detailedTable.className = 'table-responsive mb-4';
    detailedTable.innerHTML = `
        <h3>Planning détaillé</h3>
        <table class="table table-bordered table-sm">
            <thead>
                <tr class="table-primary">
                    <th>Date</th>
                    <th>Type</th>
                    <th>Heures</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    const tbody = detailedTable.querySelector('tbody');
    let currentMonth = null;
    let monthlyHours = 0;
    let monthlyDays = 0;
    calendarElement.appendChild(detailedTable);
    
    schedule.forEach((day, index) => {
        const date = new Date(day.date);
        const month = date.getMonth();
        const dayOfWeek = date.getDay();
        
        // Nouveau mois
        if (month !== currentMonth) {
            if (currentMonth !== null) {
                // Ajouter une ligne de total pour le mois précédent
                const totalRow = document.createElement('tr');
                totalRow.classList.add('table-info');
                totalRow.innerHTML = `
                    <td colspan="2"><strong>Total ${new Date(2024, currentMonth, 1).toLocaleDateString('fr-FR', { month: 'long' })}</strong></td>
                    <td><strong>${monthlyHours.toFixed(1)}h</strong></td>
                    <td><strong>${monthlyDays} jours</strong></td>
                `;
                tbody.appendChild(totalRow);
            }
            
            // Ajouter l'en-tête du nouveau mois
            const monthRow = document.createElement('tr');
            monthRow.classList.add('table-primary');
            monthRow.innerHTML = `<td colspan="4"><strong>${new Date(day.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong></td>`;
            tbody.appendChild(monthRow);
            
            currentMonth = month;
            monthlyHours = 0;
            monthlyDays = 0;
        }
        
        // Créer la ligne du jour
        const row = document.createElement('tr');
        
        // Formater la date
        const dayName = date.toLocaleString('fr-FR', { weekday: 'long' });
        const formattedDate = `${date.getDate()} ${dayName}`;
        
        // Déterminer le type de jour et les notes
        let dayType = '';
        let notes = '';
        
        if (day.isWeekend) {
            dayType = 'Week-end';
            row.classList.add('type-weekend');
        } else if (day.isHoliday) {
            dayType = 'Férié';
            row.classList.add('type-ferie');
        } else if (day.isLeave) {
            dayType = 'Congé';
            row.classList.add('type-conge');
        } else if (day.isHighPeriod) {
            dayType = 'Haute';
            row.classList.add('type-haute');
            notes = 'Vacances scolaires';
        } else {
            dayType = 'Basse';
            row.classList.add('type-basse');
        }
        
        // Mettre à jour les totaux du mois
        if (day.hours > 0 && !day.isWeekend) {
            monthlyHours += day.hours;
            if (day.type === 'working') {
                monthlyDays++;
            }
        }

        // Remplir la ligne
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${dayType}</td>
            <td>${day.hours > 0 ? day.hours.toFixed(1) + 'h' : '-'}</td>
            <td>${notes}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Ajouter le total du dernier mois
    if (currentMonth !== null) {
        const totalRow = document.createElement('tr');
        totalRow.classList.add('table-info');
        totalRow.innerHTML = `
            <td colspan="2"><strong>Total ${new Date(2024, currentMonth, 1).toLocaleDateString('fr-FR', { month: 'long' })}</strong></td>
            <td><strong>${monthlyHours.toFixed(1)}h</strong></td>
            <td><strong>${monthlyDays} jours</strong></td>
        `;
        tbody.appendChild(totalRow);
    }
    
    // Créer le récapitulatif des heures et jours par période
    const summaryTable = document.createElement('div');
    summaryTable.className = 'table-responsive mt-4';
    summaryTable.innerHTML = `
        <h3>Récapitulatif annuel</h3>
        <table class="table table-bordered table-sm">
            <thead>
                <tr class="table-primary">
                    <th>Période</th>
                    <th>Jours</th>
                    <th>Heures</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    const summaryBody = summaryTable.querySelector('tbody');
    
    // Calculer les totaux
    let totalWorkingDays = 0;
    let totalHighPeriodDays = 0;
    let totalHighPeriodHours = 0;
    let totalLowPeriodHours = 0;
    let totalHolidayHours = 0;
    
    schedule.forEach(day => {
        if (!day.isWeekend && !day.isHoliday && !day.isLeave) {
            totalWorkingDays++;
            if (day.isHighPeriod) {
                totalHighPeriodDays++;
                totalHighPeriodHours += day.hours;
            } else {
                totalLowPeriodHours += day.hours;
            }
        } else if (day.isHoliday) {
            totalHolidayHours += day.hours;
        }
    });
    
    // Ajouter les lignes au récapitulatif
    const rows = [
        {
            period: 'Haute',
            days: totalHighPeriodDays,
            hours: totalHighPeriodHours,
            notes: 'Vacances scolaires et mercredis',
            class: 'type-haute'
        },
        {
            period: 'Basse',
            days: totalWorkingDays - totalHighPeriodDays,
            hours: totalLowPeriodHours,
            notes: 'Jours normaux hors vacances',
            class: 'type-basse'
        },
        {
            period: 'Fériés',
            days: schedule.filter(d => d.isHoliday).length,
            hours: totalHolidayHours,
            notes: '',
            class: 'type-ferie'
        },
        {
            period: 'Week-ends',
            days: schedule.filter(d => d.isWeekend).length,
            hours: 0,
            notes: '',
            class: 'type-weekend'
        },
        {
            period: 'Congés',
            days: schedule.filter(d => d.isLeave).length,
            hours: 0,
            notes: '',
            class: 'type-conge'
        }
    ];
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        if (row.class) {
            tr.classList.add(row.class);
        }
        tr.innerHTML = `
            <td>${row.period}</td>
            <td>${row.days} jours</td>
            <td>${row.hours > 0 ? row.hours.toFixed(1) + 'h' : '-'}</td>
            <td>${row.notes}</td>
        `;
        summaryBody.appendChild(tr);
    });
    
    // Ajouter le total
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-success');
    totalRow.innerHTML = `
        <td><strong>Total</strong></td>
        <td><strong>${totalWorkingDays} jours</strong></td>
        <td><strong>${(totalHighPeriodHours + totalLowPeriodHours + totalHolidayHours).toFixed(1)}h</strong></td>
        <td></td>
    `;
    summaryBody.appendChild(totalRow);
    
    calendarElement.appendChild(summaryTable);
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Calcul du Temps de Travail Annualisé', 20, 20);
    
    // Informations de base
    doc.setFontSize(12);
    doc.text(`Nom: ${document.getElementById('lastName').value}`, 20, 40);
    doc.text(`Prénom: ${document.getElementById('firstName').value}`, 20, 50);
    doc.text(`Année: ${document.getElementById('referenceYear').value}`, 20, 60);
    
    // Heures annuelles
    doc.text(`Volume annuel: ${document.getElementById('annualHours').value}h`, 20, 80);
    doc.text(`Formation: ${document.getElementById('trainingHours').value}h`, 20, 90);
    doc.text(`Réunions: ${document.getElementById('meetingHours').value}h`, 20, 100);
    
    // Sauvegarder le PDF
    doc.save('temps-travail-annualise.pdf');
}

function exportToExcel() {
    const workbook = XLSX.utils.book_new();
    
    // Première feuille : Formulaire
    const formData = [
        ['Calcul du Temps de Travail Annualisé'],
        [],
        ['Nom', document.getElementById('lastName').value],
        ['Prénom', document.getElementById('firstName').value],
        ['Année', document.getElementById('referenceYear').value],
        ['Volume annuel', document.getElementById('annualHours').value + 'h'],
        ['Formation', document.getElementById('trainingHours').value + 'h'],
        ['Réunions', document.getElementById('meetingHours').value + 'h']
    ];
    
    const formSheet = XLSX.utils.aoa_to_sheet(formData);
    XLSX.utils.book_append_sheet(workbook, formSheet, 'Informations');
    
    // Deuxième feuille : Planning
    const planningData = [['Date', 'Type', 'Heures']];
    document.querySelectorAll('.calendar-day').forEach(day => {
        const date = day.querySelector('div:first-child').textContent;
        const hours = day.querySelector('div:last-child').textContent;
        planningData.push([
            date, 
            day.classList.contains('working') ? 'Travail' : 
            day.classList.contains('holiday') ? 'Férié' : 'Congé',
            hours
        ]);
    });
    
    const planningSheet = XLSX.utils.aoa_to_sheet(planningData);
    XLSX.utils.book_append_sheet(workbook, planningSheet, 'Planning');
    
    // Sauvegarder le fichier
    XLSX.writeFile(workbook, 'temps-travail-annualise.xlsx');
}
