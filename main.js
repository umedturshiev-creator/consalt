const API_URL = "https://script.google.com/macros/s/AKfycbw57_6uKs2-I6rh1S4a560b9YS3P4ufULgx4Mcu8USIPguNxCk6nVUALwWkIdhr5JMWgw/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const statusBox = document.getElementById("status");

// Автоподстановка ФИО
innInput.addEventListener("input", async () => {
    const inn = innInput.value.trim();
    fioInput.value = "";

    if (inn.length < 4) return;

    try {
        const response = await fetch(`${API_URL}?inn=${inn}`);
        const data = await response.json();

        if (data.success) {
            fioInput.value = data.fio;
        } else {
            fioInput.value = "Не найдено";
        }
    } catch {
        fioInput.value = "Ошибка";
    }
});

// Отправка данных
document.getElementById("sendBtn").addEventListener("click", async () => {
    statusBox.innerText = "Отправка...";

    const payload = {
        inn: innInput.value.trim(),
        income: document.getElementById("income").value.trim(),
        month: document.getElementById("month").value.trim()
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === "ok") {
            statusBox.innerText = "Заявка успешно отправлена!";
        } else {
            statusBox.innerText = "Ошибка: " + data.message;
        }
    } catch {
        statusBox.innerText = "Ошибка сети";
    }
});
