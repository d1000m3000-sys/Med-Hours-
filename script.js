const STORAGE_KEY = 'med_hours_app_v1_1';

const translations = {
    ar: {
        subtitle: "احسب وقت الجرعات بسهولة",
        chooseThemeColor: "اختر لون التطبيق:",
        selectMed: "اختر الدواء الحالي:",
        newMed: "دواء جديد",
        recordDose: "تسجيل الجرعة",
        date: "التاريخ",
        time: "الوقت",
        doseInterval: "فترة الجرعة:",
        every4h: "كل 4 ساعات",
        every6h: "كل 6 ساعات",
        every8h: "كل 8 ساعات",
        every12h: "كل 12 ساعة",
        every24h: "كل 24 ساعة",
        customHours: "إدخال عدد ساعات مخصص...",
        customHoursLabel: "عدد الساعات المخصص:",
        saveDose: "حفظ الجرعة",
        tookNow: "أخذت الدواء الآن",
        lastDose: "آخر جرعة",
        timeSinceLast: "الوقت منذ آخر جرعة",
        nextDose: "الجرعة القادمة",
        timeRemaining: "الوقت المتبقي",
        confirmDoseTaken: "تم أخذ الجرعة الآن",
        progress: "نسبة الوقت المنقضي للجرعة القادمة",
        copyDoseInfo: "نسخ معلومات الجرعة للحافظة",
        historyTitle: "سجل آخر 20 جرعة",
        deleteLatest: "حذف أحدث جرعة",
        doseDateTime: "تاريخ ووقت الجرعة",
        interval: "الفترة",
        noDoses: "لا توجد جرعات مسجلة لهذا الدواء.",
        clearAllData: "مسح جميع البيانات والبدء من جديد",
        addNewMed: "إضافة دواء جديد",
        medName: "اسم الدواء:",
        cancel: "إلغاء",
        add: "إضافة",
        editLastDose: "تعديل وقت آخر جرعة",
        saveEdit: "حفظ التعديل",
        edit: "تعديل",
        dueNow: "💊 حان موعد الجرعة",
        version: "رقم الإصدار",
        developer: "المطور",
        lastUpdated: "تاريخ آخر تحديث",
        aboutDesc: "تطبيق PWA متكامل يساعدك على تتبع مواعيد جرعات أدويتك بدقة، ويعمل كلياً بدون اتصال بالإنترنت.",
        close: "إغلاق",
        copied: "تم نسخ معلومات الجرعة للحافظة!",
        installApp: "تثبيت التطبيق",
        hours: "ساعة",
        minutes: "دقيقة",
        seconds: "ثانية",
        and: "و"
    },
    en: {
        subtitle: "Track medication doses easily",
        chooseThemeColor: "App Theme Color:",
        selectMed: "Select Current Medication:",
        newMed: "New Medication",
        recordDose: "Record Dose",
        date: "Date",
        time: "Time",
        doseInterval: "Dose Interval:",
        every4h: "Every 4 hours",
        every6h: "Every 6 hours",
        every8h: "Every 8 hours",
        every12h: "Every 12 hours",
        every24h: "Every 24 hours",
        customHours: "Enter custom hours...",
        customHoursLabel: "Custom Hours:",
        saveDose: "Save Dose",
        tookNow: "Took Medicine Now",
        lastDose: "Last Dose",
        timeSinceLast: "Time Since Last Dose",
        nextDose: "Next Dose",
        timeRemaining: "Time Remaining",
        confirmDoseTaken: "Dose Taken Now",
        progress: "Time Elapsed Percentage",
        copyDoseInfo: "Copy Dose Info to Clipboard",
        historyTitle: "Last 20 Doses History",
        deleteLatest: "Delete Latest Dose",
        doseDateTime: "Dose Date & Time",
        interval: "Interval",
        noDoses: "No doses recorded for this medicine.",
        clearAllData: "Clear All Data & Reset",
        addNewMed: "Add New Medication",
        medName: "Medication Name:",
        cancel: "Cancel",
        add: "Add",
        editLastDose: "Edit Last Dose Time",
        saveEdit: "Save Changes",
        edit: "Edit",
        dueNow: "💊 Time for your dose",
        version: "Version",
        developer: "Developer",
        lastUpdated: "Last Updated",
        aboutDesc: "A complete PWA app to help you track your medication schedules precisely, fully functional offline.",
        close: "Close",
        copied: "Dose info copied to clipboard!",
        installApp: "Install App",
        hours: "hrs",
        minutes: "mins",
        seconds: "secs",
        and: "and"
    }
};

let appState = {
    lang: 'ar',
    theme: 'light',
    colorScheme: 'default',
    activeMedId: null,
    medications: []
};

let timerInterval = null;
let deferredPrompt = null;
let preNotificationTriggered = false;
let dueNotificationTriggered = false;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeepSound() {
    try {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.value = 587.33; // D5
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 1.2);
    } catch (e) {
        console.log("Audio play error", e);
    }
}

const el = {
    splashScreen: document.getElementById('splashScreen'),
    installAppBtn: document.getElementById('installAppBtn'),
    langToggleBtn: document.getElementById('langToggleBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    aboutAppBtn: document.getElementById('aboutAppBtn'),
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
    doseTakenActionBox: document.getElementById('doseTakenActionBox'),
    confirmDoseTakenBtn: document.getElementById('confirmDoseTakenBtn'),
    progressText: document.getElementById('progressText'),
    progressBarFill: document.getElementById('progressBarFill'),
    copyInfoBtn: document.getElementById('copyInfoBtn'),
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
    cancelEditDialogBtn: document.getElementById('cancelEditDialogBtn'),
    aboutDialog: document.getElementById('aboutDialog'),
    closeAboutBtn: document.getElementById('closeAboutBtn')
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    registerServiceWorker();
    requestNotificationPermission();

    setTimeout(() => {
        el.splashScreen.style.opacity = '0';
        setTimeout(() => el.splashScreen.classList.add('hidden'), 500);
    }, 1000);
});

function initApp() {
    loadState();
    applySettings();
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
            appState = Object.assign({}, appState, JSON.parse(saved));
        } catch (e) {
            createDefaultState();
        }
    } else {
        createDefaultState();
    }
}

function createDefaultState() {
    const defaultMedId = 'med_' + Date.now();
    appState = {
        lang: 'ar',
        theme: 'light',
        colorScheme: 'default',
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

function applySettings() {
    document.documentElement.setAttribute('lang', appState.lang);
    document.documentElement.setAttribute('dir', appState.lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('data-theme', appState.theme);
    document.documentElement.setAttribute('data-color', appState.colorScheme);

    el.themeToggleBtn.textContent = appState.theme === 'dark' ? '☀️' : '🌙';

    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.color === appState.colorScheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    applyLanguage();
}

function applyLanguage() {
    const langObj = translations[appState.lang];
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (langObj[key]) {
            element.textContent = langObj[key];
        }
    });
}

function setupEventListeners() {
    el.langToggleBtn.addEventListener('click', () => {
        appState.lang = appState.lang === 'ar' ? 'en' : 'ar';
        saveState();
        applySettings();
        updateUI();
    });

    el.themeToggleBtn.addEventListener('click', () => {
        appState.theme = appState.theme === 'light' ? 'dark' : 'light';
        saveState();
        applySettings();
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            appState.colorScheme = e.target.dataset.color;
            saveState();
            applySettings();
        });
    });

    el.aboutAppBtn.addEventListener('click', () => {
        el.aboutDialog.showModal();
    });

    el.closeAboutBtn.addEventListener('click', () => {
        el.aboutDialog.close();
    });

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        el.installAppBtn.classList.remove('hidden');
    });

    el.installAppBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
                el.installAppBtn.classList.add('hidden');
            });
        }
    });

    el.medSelect.addEventListener('change', (e) => {
        appState.activeMedId = e.target.value;
        preNotificationTriggered = false;
        dueNotificationTriggered = false;
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
            alert(appState.lang === 'ar' ? 'يجب أن يكون لديك دواء واحد على الأقل.' : 'You must have at least one medication.');
            return;
        }
        const activeMed = getActiveMed();
        const confirmMsg = appState.lang === 'ar' 
            ? `هل أنت تأكد من حذف دواء "${activeMed.name}" بالكامل؟`
            : `Are you sure you want to delete "${activeMed.name}"?`;
        
        if (confirm(confirmMsg)) {
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
        populateFormWithDate(new Date());
        saveDoseFromInputs();
    });

    el.confirmDoseTakenBtn.addEventListener('click', () => {
        populateFormWithDate(new Date());
        saveDoseFromInputs();
    });

    el.deleteLastDoseBtn.addEventListener('click', () => {
        const activeMed = getActiveMed();
        if (!activeMed || activeMed.doses.length === 0) return;
        
        const confirmMsg = appState.lang === 'ar' ? 'هل ترغب في حذف أحدث جرعة؟' : 'Delete latest dose?';
        if (confirm(confirmMsg)) {
            activeMed.doses.pop();
            preNotificationTriggered = false;
            dueNotificationTriggered = false;
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
            preNotificationTriggered = false;
            dueNotificationTriggered = false;
            saveState();
            updateUI();
            el.editDoseDialog.close();
        }
    });

    el.copyInfoBtn.addEventListener('click', () => {
        const activeMed = getActiveMed();
        if (!activeMed || activeMed.doses.length === 0) return;

        const lastTs = activeMed.doses[activeMed.doses.length - 1];
        const nextTs = lastTs + (activeMed.intervalHours * 3600000);

        const textToCopy = `💊 ${activeMed.name}\n${translations[appState.lang].lastDose}: ${formatDateTime(lastTs)}\n${translations[appState.lang].nextDose}: ${formatDateTime(nextTs)}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert(translations[appState.lang].copied);
        });
    });

    el.clearDataBtn.addEventListener('click', () => {
        const confirmMsg = appState.lang === 'ar' 
            ? 'تنبيه هام: سيتم مسح كافة البيانات والأدوية المسجلة كلياً. هل أنت متاكد؟'
            : 'Warning: All medications and recorded doses will be deleted. Are you sure?';
        
        if (confirm(confirmMsg)) {
            localStorage.removeItem(STORAGE_KEY);
            createDefaultState();
            applySettings();
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
        alert(appState.lang === 'ar' ? 'يرجى إدخال فترة زمنية صحيحة بالساعات.' : 'Please enter a valid interval in hours.');
        return;
    }

    const timestamp = parseDateTime(
        el.doseDate.value,
        el.doseHour.value,
        el.doseMinute.value,
        el.doseAmpm.value
    );

    if
