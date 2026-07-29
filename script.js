const lastDoseElement = document.getElementById("lastDose");
const elapsedElement = document.getElementById("elapsed");

const saveDoseButton = document.getElementById("saveDose");
const saveManualButton = document.getElementById("saveManual");

const hourSelect = document.getElementById("hour");
const minuteSelect = document.getElementById("minute");
const ampmSelect = document.getElementById("ampm");


// تحويل الوقت إلى صيغة عربية
function formatTime(date) {

    return date.toLocaleTimeString("ar-IQ", {
        hour: "2-digit",
        minute: "2-digit"
    });

}


// حفظ الوقت
function saveTime(date) {

    localStorage.setItem(
        "lastDose",
        date.toISOString()
    );

    updateTime();

}


// زر أخذ الدواء الآن
saveDoseButton.addEventListener("click", () => {

    const now = new Date();

    saveTime(now);

});


// زر حفظ الوقت اليدوي
saveManualButton.addEventListener("click", () => {


    let hour = Number(hourSelect.value);

    let minute = Number(minuteSelect.value);

    let ampm = ampmSelect.value;


    const now = new Date();


    if (ampm === "PM" && hour !== 12) {

        hour += 12;

    }


    if (ampm === "AM" && hour === 12) {

        hour = 0;

    }


    const selectedTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute
    );


    saveTime(selectedTime);


});



// تحديث العداد
function updateTime() {


    const saved = localStorage.getItem("lastDose");


    if (!saved) {

        lastDoseElement.textContent = "لا توجد بيانات";

        elapsedElement.textContent = "--";

        return;

    }


    const lastDose = new Date(saved);


    lastDoseElement.textContent =
        formatTime(lastDose);



    const now = new Date();


    let difference = now - lastDose;



    if (difference < 0) {

        difference = 0;

    }


    const totalMinutes =
        Math.floor(difference / 60000);



    const hours =
        Math.floor(totalMinutes / 60);



    const minutes =
        totalMinutes % 60;



    elapsedElement.textContent =
        `${hours} ساعة و ${minutes} دقيقة`;

}



// تحديث عند فتح التطبيق
updateTime();


// تحديث كل دقيقة
setInterval(updateTime, 60000);



// تشغيل PWA
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register(
            "service-worker.js"
        );

    });

}
