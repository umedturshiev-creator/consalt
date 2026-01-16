// <-- ВСТАВЬ СЮДА ТВОЙ URL ВЕБ-APP -->
const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const statusBox = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");

// Автоподтягивание (GET)
innInput.addEventListener("input", async () => {
  statusBox.innerText = "";
  const inn = innInput.value.trim();
  if (inn.length < 6) { fioInput.value = ""; return; }

  try {
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { statusBox.innerText = "Ошибка ответа сервера: " + text; return; }

    if (data.success) {
      fioInput.value = data.fio || "";
    } else {
      fioInput.value = "Не найдено";
    }
  } catch (err) {
    statusBox.innerText = "Ошибка сети (GET): " + err.message;
  }
});

// Отправка (POST) — используем URLSearchParams чтобы избежать preflight
sendBtn.addEventListener("click", async () => {
  statusBox.innerText = "Отправка...";
  const payload = {
    inn: innInput.value.trim(),
    fio: fioInput.value.trim(),
    income: incomeInput.value.trim(),
    month: monthInput.value.trim()
  };

  try {
    const body = new URLSearchParams(payload);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString()
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { statusBox.innerText = "Сервер вернул не JSON: " + text; return; }

    if (data.status === "ok") {
      statusBox.innerText = "Заявка успешно отправлена!";
      // очистить поля частично:
      incomeInput.value = "";
      monthInput.value = "";
    } else {
      statusBox.innerText = "Ошибка: " + (data.message || JSON.stringify(data));
    }

  } catch (err) {
    statusBox.innerText = "Ошибка сети (POST): " + err.message;
  }
});
