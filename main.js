const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const statusBox = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");

let innTimer = null;

innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "").slice(0, 8);
  clearTimeout(innTimer);
  innTimer = setTimeout(findFioByInn, 500);
});

incomeInput.addEventListener("input", () => {
  incomeInput.value = incomeInput.value.replace(/\D/g, "");
});

async function findFioByInn() {
  const inn = innInput.value.trim();

  fioInput.value = "";
  fioInput.classList.remove("success","error");
  sendBtn.disabled = true;
  statusBox.innerText = "";
  checkIcon.classList.remove("show");
  checkIcon.classList.add("hidden");

  if (inn.length !== 8) return;

  loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const text = await res.text();
    const data = JSON.parse(text);

    if (data.success && data.fio) {
      fioInput.value = data.fio;
      fioInput.classList.add("success");
      checkIcon.classList.remove("hidden");
      setTimeout(()=>checkIcon.classList.add("show"),50);
      sendBtn.disabled = false;
    } else {
      fioInput.value = "Не найдено";
      fioInput.classList.add("error");
    }
  } catch {
    statusBox.innerText = "Ошибка сети";
  } finally {
    loader.classList.add("hidden");
  }
}

sendBtn.addEventListener("click", async () => {
  if (innInput.value.length !== 8) {
    statusBox.innerText = "ИНН должен состоять из 8 цифр";
    return;
  }

  statusBox.innerText = "Отправка...";

  const body = new URLSearchParams({
    inn: innInput.value,
    fio: fioInput.value,
    income: incomeInput.value,
    month: monthInput.value
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
      body: body.toString()
    });

    const data = JSON.parse(await res.text());
    statusBox.innerText = data.status === "ok" ? "Заявка отправлена!" : "Ошибка";
  } catch {
    statusBox.innerText = "Ошибка сети";
  }
});
