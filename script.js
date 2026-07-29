const STORAGE_KEY = 'med_hours_app_data_v1';

let appState = {
    theme: 'light',
    activeMedId: null,
    medications: []
};

let timerInterval = null;

const el = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    medSelect: document.getElementById('medSelect'),
    addMedBtn: document.getElementById('addMedBtn'),
    deleteMedBtn: document.getElementById('deleteMedBtn'),
    doseForm: document.getElementById('doseForm'),
    doseDate: document.getElementById('doseDate'),
    doseHour: document.getElementById('doseHour'),
    doseMinute: document.getElementById('doseMinute'),
    doseAmpm: document.getElementById('doseAmpm'),
    intervalSelect: document.getElementById('intervalSelect'),
    customIntervalGroup: document.getElementById('customIntervalGroup'),
    customIntervalInput: document.getElementById('customIntervalInput'),
    takeNowBtn: document.getElementById('takeNowBtn'),
    lastDoseVal: document.getElementById('lastDoseVal'),
    timeSinceVal: document.getElementById('timeSinceVal'),
    nextDoseVal: document.getElementById('nextDoseVal'),
    timeRemainingVal: document.getElementById('timeRemainingVal'),
    remainingCard: document.getElementById('remainingCard'),
    editLastDoseBtn: document.getElementById('editLastDoseBtn'),
    historyTableBody: document.getElementById('historyTableBody'),
    deleteLastDoseBtn: document.getElementById('deleteLastDoseBtn'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    addMedDialog: document.getElementById('addMedDialog'),
    addMedForm: document.getElementById('addMedForm'),
    newMedName: document.getElementById('newMedName'),
    cancelDialogBtn: document.getElementById('cancelDialogBtn'),
    editDoseDialog: document.getElementById('editDoseDialog'),
    editDoseForm: document.getElementById('editDoseForm'),
    editDoseDate: document.getElementById('editDoseDate'),
    editDoseHour: document.getElementById('editDoseHour'),
    editDoseMinute: document.getElementById('editDoseMinute'),
    editDoseAmpm: document.getElementById('editDoseAmpm'),
    cancelEditDialogBtn: document.getElementById('cancelEditDialogBtn')
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    registerServiceWorker();
    requestNotificationPermission();
});

function initApp() {
    loadState();
    setupTheme();
    setupEventListeners();
    setDefaultInputs();
    renderMedicationOptions();
    updateUI();
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateUI, 1000);
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse state:', e);
            createDefaultState();
        }
    } else {
        createDefaultState();
    }
}

function createDefaultState() {
    const defaultMedId = 'med_' + Date.now();
    appState = {
        theme: 'light',
        activeMedId: defaultMedId,
        medications: [
            {
                id: defaultMedId,
                name: 'Panadol',
                intervalHours: 12,
                doses: []
            }
        ]
    };
    saveState();
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function setupTheme() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    el.themeToggleBtn.querySelector('.theme-icon').textContent = appState.theme === 'dark' ? '☀️' : '🌙';
}

function setupEventListeners() {
    el.themeToggleBtn.addEventListener('click', () => {
        appState.theme = appState.theme === 'light' ? 'dark' : 'light';
        saveState();
        setupTheme();
    });

    el.medSelect.addEventListener('change', (e) => {
        appState.activeMedId = e.target.value;
        saveState();
        loadActiveMedToForm();
        updateUI();
    });

    el.addMedBtn.addEventListener('click', () => {
        el.newMedName.value = '';
        el.addMedDialog.showModal();
    });

    el.cancelDialogBtn.addEventListener('click', () => {
        el.addMedDialog.close();
    });

    el.addMedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = el.newMedName.value.trim();
        if (name) {
            const newId = 'med_' + Date.now();
            appState.medications.push({
                id: newId,
                name: name,
                intervalHours: 12,
                doses: []
            });
            appState.activeMedId = newId;
            saveState();
            renderMedicationOptions();
            loadActiveMedToForm();
            updateUI();
            el.addMedDialog.close();
        }
    });

    el.deleteMedBtn.addEventListener('click', () => {
        if (appState.medications.length <= 1) {
            alert('يجب أن يكون لديك دواء واحد على الأقل في التطبيق.');
            return;
        }
        const activeMed = getActiveMed();
        if (confirm(`هل أنت تأكد من حذف دواء "${activeMed.name}" بالكامل؟`)) {
            appState.medications = appState.medications.filter(m => m.id !== appState.activeMedId);
            appState.activeMedId = appState.medications[0].id;
            saveState();
            renderMedicationOptions();
            loadActiveMedToForm();
            updateUI();
        }
    });

    el.intervalSelect.addEventListener('change', () => {
        if (el.intervalSelect.value === 'custom') {
            el.customIntervalGroup.classList.remove('hidden');
        } else {
            el.customIntervalGroup.classList.add('hidden');
        }
    });

    el.doseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveDoseFromInputs();
    });

    el.takeNowBtn.addEventListener('click', () => {
        const now = new Date();
        populateFormWithDate(now);
        saveDoseFromInputs();
    });

    el.deleteLastDoseBtn.addEventListener('click', () => {
        const activeMed = getActiveMed();
        if (!activeMed || activeMed.doses.length === 0) return;
        if (confirm('هل ترغب في حذف آخر جرعة مسجلة؟')) {
            activeMed.doses.pop();
            saveState();
            updateUI();
        }
    });

    el.editLastDoseBtn.addEventListener('click', () => {
        const activeMed = getActiveMed();
        if (!activeMed || activeMed.doses.length === 0) return;
        
        const lastDoseTime = new Date(activeMed.doses[activeMed.doses.length - 1]);
        
        const year = lastDoseTime.getFullYear();
        const month = String(lastDoseTime.getMonth() + 1).padStart(2, '0');
        const day = String(lastDoseTime.getDate()).padStart(2, '0');
        el.editDoseDate.value = `${year}-${month}-${day}`;

        let hours = lastDoseTime.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        el.editDoseHour.value = hours;
        el.editDoseMinute.value = String(lastDoseTime.getMinutes()).padStart(2, '0');
        el.editDoseAmpm.value = ampm;

        el.editDoseDialog.showModal();
    });

    el.cancelEditDialogBtn.addEventListener('click', () => {
        el.editDoseDialog.close();
    });

    el.editDoseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeMed = getActiveMed();
        if (!activeMed || activeMed.doses.length === 0) return;

        const dateStr = el.editDoseDate.value;
        const hour = parseInt(el.editDoseHour.value, 10);
        const minute = parseInt(el.editDoseMinute.value, 10);
        const ampm = el.editDoseAmpm.value;

        const timestamp = parseDateTime(dateStr, hour, minute, ampm);
        if (timestamp) {
            activeMed.doses[activeMed.doses.length - 1] = timestamp;
            activeMed.doses.sort((a, b) => a - b);
            saveState();
            updateUI();
            el.editDoseDialog.close();
        }
    });

    el.clearDataBtn.addEventListener('click', () => {
        if (confirm('تنبيه: سيتم مسح جميع الأدوية والجرعات كلياً. هل أنت متأكد؟')) {
            localStorage.removeItem(STORAGE_KEY);
            createDefaultState();
            renderMedicationOptions();
            setDefaultInputs();
            updateUI();
        }
    });
}

function getActiveMed() {
    return appState.medications.find(m => m.id === appState.activeMedId) || appState.medications[0];
}

function renderMedicationOptions() {
    el.medSelect.innerHTML = '';
    appState.medications.forEach(med => {
        const option = document.createElement('option');
        option.value = med.id;
        option.textContent = med.name;
        if (med.id === appState.activeMedId) {
            option.selected = true;
        }
        el.medSelect.appendChild(option);
    });
    loadActiveMedToForm();
}

function loadActiveMedToForm() {
    const activeMed = getActiveMed();
    if (!activeMed) return;

    const interval = activeMed.intervalHours;
    const standardVals = ['4', '6', '8', '12', '24'];
    if (standardVals.includes(String(interval))) {
        el.intervalSelect.value = String(interval);
        el.customIntervalGroup.classList.add('hidden');
    } else {
        el.intervalSelect.value = 'custom';
        el.customIntervalGroup.classList.remove('hidden');
        el.customIntervalInput.value = interval;
    }
}

function setDefaultInputs() {
    populateFormWithDate(new Date());
}

function populateFormWithDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    el.doseDate.value = `${year}-${month}-${day}`;

    let hours = dateObj.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    el.doseHour.value = hours;
    el.doseMinute.value = String(dateObj.getMinutes()).padStart(2, '0');
    el.doseAmpm.value = ampm;
}

function parseDateTime(dateStr, hour, minute, ampm) {
    if (!dateStr || isNaN(hour) || isNaN(minute)) return null;

    let h24 = parseInt(hour, 10);
    if (ampm === 'PM' && h24 < 12) h24 += 12;
    if (ampm === 'AM' && h24 === 12) h24 = 0;

    const [y, m, d] = dateStr.split('-').map(num => parseInt(num, 10));
    const date = new Date(y, m - 1, d, h24, parseInt(minute, 10), 0);
    return date.getTime();
}

function saveDoseFromInputs() {
    const activeMed = getActiveMed();
    if (!activeMed) return;

    let interval = parseFloat(el.intervalSelect.value);
    if (el.intervalSelect.value === 'custom') {
        interval = parseFloat(el.customIntervalInput.value);
    }

    if (!interval || interval <= 0) {
        alert('رجاءً أدخل فترة زمنية صحيحة بالاساعات.');
        return;
    }

    const timestamp = parseDateTime(
        el.doseDate.value,
        el.doseHour.value,
        el.doseMinute.value,
        el.doseAmpm.value
    );

    if (!timestamp) {
        alert('رجاءً تأكد من صحة التاريخ والوقت المدخل.');
        return;
    }

    activeMed.intervalHours = interval;
    activeMed.doses.push(timestamp);
    activeMed.doses.sort((a, b) => a - b);

    if (activeMed.doses.length > 20) {
        activeMed.doses = activeMed.doses.slice(-20);
    }

    saveState();
    updateUI();
}

function updateUI() {
    const activeMed = getActiveMed();
    if (!activeMed) return;

    const doses = activeMed.doses;
    if (doses.length === 0) {
        el.lastDoseVal.textContent = '--';
        el.timeSinceVal.textContent = '--';
        el.nextDoseVal.textContent = '--';
        el.timeRemainingVal.textContent = '--';
        el.remainingCard.classList.remove('due-now-alert');
        el.editLastDoseBtn.classList.add('hidden');
        renderHistoryTable([]);
        return;
    }

    el.editLastDoseBtn.classList.remove('hidden');

    const lastDoseTimestamp = doses[doses.length - 1];
    const now = new Date().getTime();

    el.lastDoseVal.textContent = formatDateFormatted(lastDoseTimestamp);

    const diffSince = Math.max(0, now - lastDoseTimestamp);
    el.timeSinceVal.textContent = formatDuration(diffSince);

    const intervalMs = activeMed.intervalHours * 60 * 60 * 1000;
    const nextDoseTimestamp = lastDoseTimestamp + intervalMs;

    el.nextDoseVal.textContent = formatTimeOnly(nextDoseTimestamp);

    const diffRemaining = nextDoseTimestamp - now;

    if (diffRemaining <= 0) {
        el.timeRemainingVal.textContent = '💊 حان موعد الجرعة';
        el.remainingCard.classList.add('due-now-alert');
        triggerDoseNotification(activeMed.name);
    } else {
        el.timeRemainingVal.textContent = formatDuration(diffRemaining);
        el.remainingCard.classList.remove('due-now-alert');
    }

    renderHistoryTable(doses, activeMed.intervalHours);
}

function renderHistoryTable(doses, interval) {
    el.historyTableBody.innerHTML = '';
    if (doses.length === 0) {
        el.historyTableBody.innerHTML = '<tr><td colspan="3" class="text-center">لا توجد جرعات مسجلة لهذا الدواء.</td></tr>';
        return;
    }

    const reversed = [...doses].reverse();
    reversed.forEach((ts, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doses.length - idx}</td>
            <td>${formatDateFormatted(ts)}</td>
            <td>كل ${interval} ساعة</td>
        `;
        el.historyTableBody.appendChild(row);
    });
}

function formatDateFormatted(ts) {
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

function formatTimeOnly(ts) {
    const d = new Date(ts);
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes} ${ampm}`;
}

function formatDuration(ms) {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let res = '';
    if (hours > 0) {
        res += `${hours} ساعة `;
    }
    res += `و${minutes} دقيقة`;
    return res;
}

let notificationSentForTimestamp = null;

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function triggerDoseNotification(medName) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const activeMed = getActiveMed();
        if (!activeMed || activeMed.doses.length === 0) return;
        const lastDose = activeMed.doses[activeMed.doses.length - 1];

        if (notificationSentForTimestamp !== lastDose) {
            new Notification('Med Hours 💊', {
                body: `حان موعد جرعة دواء: ${medName}`,
                icon: 'icons/icon-192.png',
                dir: 'rtl'
            });
            notificationSentForTimestamp = lastDose;
        }
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker Registered', reg))
            .catch(err => console.error('Service Worker Registration Failed', err));
    }
            }
            
