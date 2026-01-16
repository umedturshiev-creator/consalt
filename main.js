// URL Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const statusBox = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");

/* ===== Ограничение ввода: только цифры ===== */
innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "");
});

incomeInput.addEventListener("input", () => {
  incomeInput.value = incomeInput.value.replace(/\D/g, "");
});

/* ===== Поиск ФИО по ИНН ===== */
innInput.addEventListener("input", async () => {
  const inn = innInput.value.trim();

  // Сброс состояния
  fioInput.value = "";
  fioInput.classList.remove("success", "error");
  statusBox.innerText = "";
  sendBtn.disabled = true;
  checkIcon.classList.remove("show");
  checkIcon.classList.add("hidden");

  if (inn.length < 6) return;

  loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      statusBox.innerText = "Сервер вернул некорректный ответ";
      return;
    }

    if (data.success === true && data.fio) {
      // ✅ ФИО найдено
      fioInput.value = data.fio;
      fioInput.classList.add("success");
      fioInput.classList.remove("error");

      checkIcon.classList.remove("hidden");
      setTimeout(() => checkIcon.classList.add("show"), 50);

      sendBtn.disabled = false;
    } else {
      // ❌ ФИО не найдено
      fioInput.value = "Не найдено";
      fioInput.classList.add("error");
      fioInput.classList.remove("success");

      checkIcon.classList.remove("show");
      checkIcon.classList.add("hidden");

      sendBtn.disabled = true;
    }

  } catch (err) {
    statusBox.innerText = "Ошибка сети";
    sendBtn.disabled = true;
  } finally {
    loader.classList.add("hidden");
  }
});

/* ===== Отправка формы ===== */
sendBtn.addEventListener("click", async () => {
  statusBox.innerText = "Отправка...";

  const body = new URLSearchParams({
    inn: innInput.value.trim(),
    fio: fioInput.value.trim(),
    income: incomeInput.value.trim(),
    month: monthInput.value
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: body.toString()
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      statusBox.innerText = "Ошибка ответа сервера";
      return;
    }

    if (data.status === "ok") {
      statusBox.innerText = "Заявка отправлена!";
      incomeInput.value = "";
      monthInput.value = "";
    } else {
      statusBox.innerText = "Ошибка отправки";
    }

  } catch (err) {
    statusBox.innerText = "Ошибка сети";
  }
});
