// ====== URL твоего Apps Script WebApp ======
const API_URL =
"https://script.google.com/macros/s/AKfycbzV_wsqT2xmvvMPltUYwJr2NLjXl3xCbRvhcbfab8-F2iiGcimP6ZIlIjBrNxEG-iXyfQ/exec";

// ====== ЭЛЕМЕНТЫ ФОРМЫ ======
const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const statusBox = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");

// ============= АВТОПОДТЯГИВАНИЕ ФИО ПО ИНН =============
innInput.addEventListener("input", async () => {

    const inn = innInput.value.trim();
    fioInput.value = "";
    statusBox.innerText = "";

    if (inn.length < 6) return;

    try {
        const res = await fetch(`${API_URL}?inn=${inn}`, { method: "GET" });
        const data = await res.json();

        console.log("GET ответ:", data);

        if (data.success) {
            fioInput.value = data.fio || "";
        } else {
            fioInput.value = "Не найдено";
        }

    } catch (err) {
        statusBox.innerText = "Ошибка сети (GET): " + err.message;
    }
});

// ============= ОТПРАВКА ЗАЯВКИ =============
sendBtn.addEventListener("click", async () => {

    statusBox.innerText = "Отправка...";

    const payload = {
        inn: innInput.value.trim(),
        fio: fioInput.value.trim(),
        income: incomeInput.value.trim(),
        month: monthInput.value.trim()
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("POST ответ:", data);

        if (data.status === "ok") {
            statusBox.innerText = "Заявка успешно отправлена!";
        } else {
            statusBox.innerText = "Ошибка: " + (data.message || "Неизвестная ошибка");
        }

    } catch (err) {
        statusBox.innerText = "Ошибка сети (POST): " + err.message;
    }
});
