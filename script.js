const lastDoseElement = document.getElementById("lastDose");
const elapsedElement = document.getElementById("elapsed");
const nextDoseElement = document.getElementById("nextDose");
const remainingElement = document.getElementById("remaining");

const saveManualButton = document.getElementById("saveManual");
const saveDoseButton = document.getElementById("saveDose");

const dateInput = document.getElementById("date");
const hourSelect = document.getElementById("hour");
const minuteSelect = document.getElementById("minute");
const ampmSelect = document.getElementById("ampm");
const intervalSelect = document.getElementById("interval");


// إنشاء دقائق من 00 إلى 59
for (let i = 0; i < 60; i++) {

    let option = document.createElement("option");

    option.value = i;

    option.textContent = i.toString().padStart(2, "0");

    minuteSelect.appendChild(option);

}


// وضع تاريخ اليوم تلقائياً
let today = new Date();

dateInput.value = today.toISOString().split("T")[0];



// تحويل الوقت إلى عرض جميل
function formatTime(date) {

    return date.toLocaleTimeString("ar-IQ", {

        hour: "2-digit",

        minute: "2-digit"

    });

}


// حفظ الجرعة
function saveDoseTime(time) {


    localStorage.setItem(
        "lastDose",
        time.toISOString()
    );


    localStorage.setItem(
        "interval",
        intervalSelect.value
    );


    update();


}



// زر أخذ الدواء الآن
saveDoseButton.addEventListener("click", () => {


    let now = new Date();


    saveDoseTime(now);


});




// حفظ وقت يدوي
saveManualButton.addEventListener("click", () => {


    let parts = dateInput.value.split("-");


    let hour = Number(hourSelect.value);

    let minute = Number(minuteSelect.value);

    let ampm = ampmSelect.value;



    if (ampm === "PM" && hour !== 12) {

        hour += 12;

    }


    if (ampm === "AM" && hour === 12) {

        hour = 0;

    }



    let selected = new Date(

        parts[0],

        parts[1] - 1,

        parts[2],

        hour,

        minute

    );


    saveDoseTime(selected);



});





// تحديث البيانات
function update() {


    let saved = localStorage.getItem("lastDose");


    if (!saved) {


        lastDoseElement.textContent = "لا توجد بيانات";

        elapsedElement.textContent = "--";

        nextDoseElement.textContent = "--";

        remainingElement.textContent = "--";

        return;

    }



    let lastDose = new Date(saved);



    let now = new Date();



    lastDoseElement.textContent =
        formatTime(lastDose);



    let passed = now - lastDose;



    if (passed < 0) {

        passed = 0;

    }



    let passedMinutes =
        Math.floor(passed / 60000);



    let passedHours =
        Math.floor(passedMinutes / 60);



    let passedRemain =
        passedMinutes % 60;



    elapsedElement.textContent =
        `${passedHours} ساعة و ${passedRemain} دقيقة`;





    // حساب الجرعة القادمة

    let interval =
        Number(localStorage.getItem("interval")) || 8;



    let next =
        new Date(lastDose.getTime() + interval * 60 * 60 * 1000);



    nextDoseElement.textContent =
        formatTime(next);





    let remaining =
        next - now;



    if (remaining <= 0) {


        remainingElement.textContent =
            "موعد الجرعة حان الآن 💊";


    } else {


        let remainingMinutes =
            Math.floor(remaining / 60000);



        let rh =
            Math.floor(remainingMinutes / 60);



        let rm =
            remainingMinutes % 60;



        remainingElement.textContent =
            `${rh} ساعة و ${rm} دقيقة`;

    }


}




// تشغيل عند فتح التطبيق
update();


// تحديث كل دقيقة
setInterval(update, 60000);
