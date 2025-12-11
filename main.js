const API_URL = "https://script.google.com/macros/s/AKfycbxXpqkjhV9ZnxgfxhPJGvR8zA3zg55PjXRMnN5J2ul7cG1uwRc_JNI_oal_uyxI5prlsA/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const statusBox = document.getElementById("status");

innInput.addEventListener("input", async () => {
    let inn = innInput.value.trim();
    fioInput.value = "";

    if (inn.length < 6) return;

    try {
        const res = await fetch(`${API_URL}?inn=${inn}`);
        const data = await res.json();

        if (data.success) {
            fioInput.value = data.fio;
        } else {
            fioInput.value = "Ошибка запроса";
        }
    } catch (e) {
        fioInput.value = "Ошибка";
    }
});


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
            statusBox.innerText = "Заявка отправлена!";
        } else {
            statusBox.innerText = "Ошибка: " + data.message;
        }
    } catch (e) {
        statusBox.innerText = "Ошибка отправки";
    }
});
