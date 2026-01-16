const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOVkP3qiQ7p_D9sBgwFcfu7KsqX3gkwtUlnRlW1ArbXtnw44LbIDPXQ/exec";

let innTimer = null;
let innVerified = false;

// ====== DOM ======
const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthSelect = document.getElementById("month");
const result = document.getElementById("result");
const sendBtn = document.getElementById("sendBtn");
const spinner = document.getElementById("spinner");

// ====== INN INPUT ======
innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "").slice(0, 8);

  innVerified = false;
  sendBtn.disabled = true;
  fioInput.value = "";
  fioInput.className = "";

  if (innInput.value.length < 8) {
    result.textContent = "";
    return;
  }

  clearTimeout(innTimer);
  innTimer = setTimeout(checkINN, 500);
});

// ====== CHECK INN ======
async function checkINN() {
  const inn = innInput.value;
  if (inn.length < 8) return;

  fioInput.value = "Проверка...";
  fioInput.className = "skeleton";

  try {
    const res = await fetch(`${WEB_APP_URL}?inn=${inn}`);

    if (!res.ok) throw new Error("HTTP error");

    const data = await res.json();

    if (data.success && data.fio) {
      fioInput.value = data.fio;
      fioInput.className = "fio-ok";
      innVerified = true;
      sendBtn.disabled = false;
      result.textContent = "";
    } else {
      fioInput.value = "ИНН не зарегистрирован";
      fioInput.className = "fio-error";
      result.textContent = "ИНН не подтверждён";
    }
  } catch (e) {
    fioInput.value = "Ошибка проверки";
    fioInput.className = "fio-error";
    result.textContent = "Ошибка соединения";
  }
}

// ====== SEND FORM ======
async function sendForm() {
  if (!innVerified) {
    result.textContent = "Подтвердите ИНН";
    return;
  }

  if (!incomeInput.value) {
    result.textContent = "Введите выручку";
    return;
  }

  if (!monthSelect.value) {
    result.textContent = "Выберите месяц";
    return;
  }

  spinner.style.display = "block";
  sendBtn.disabled = true;
  result.textContent = "";

  const payload = {
    inn: innInput.value,
    fio: fioInput.value,
    income: incomeInput.value,
    month: monthSelect.value,
  };

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("HTTP error");

    const data = await res.json();

    if (data.status === "ok") {
      result.textContent = "Заявка отправлена ✅";

      innInput.value = "";
      fioInput.value = "";
      incomeInput.value = "";
      monthSelect.value = "";
      fioInput.className = "";
      innVerified = false;
    } else {
      result.textContent = "Ошибка при отправке";
    }
  } catch (e) {
    result.textContent = "Ошибка соединения";
  } finally {
    spinner.style.display = "none";
    sendBtn.disabled = false;
  }
}
