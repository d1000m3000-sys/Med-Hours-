const lastDoseElement = document.getElementById("lastDose");
const elapsedElement = document.getElementById("elapsed");
const saveButton = document.getElementById("saveDose");

// عرض الوقت بصيغة 10:30 ص / 05:04 م
function formatTime(date) {
    return date.toLocaleTimeString("ar-IQ", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// تحديث الوقت المنقضي
function updateElapsed() {

    const saved = localStorage.getItem("lastDose");

    if (!saved) {
        lastDoseElement.textContent = "لا توجد بيانات";
        elapsedElement.textContent = "--";
        return;
    }

    const lastDate = new Date(saved);

    lastDoseElement.textContent = formatTime(lastDate);

    const now = new Date();

    const diff = now - lastDate;

    const totalMinutes = Math.floor(diff / 60000);

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    elapsedElement.textContent =
        `${hours} ساعة و ${minutes} دقيقة`;
}

// عند الضغط على الزر
saveButton.addEventListener("click", () => {

    const now = new Date();

    localStorage.setItem("lastDose", now.toISOString());

    updateElapsed();

});

// تحديث كل دقيقة
updateElapsed();

setInterval(updateElapsed, 60000);

// تسجيل Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js");
    });
}
