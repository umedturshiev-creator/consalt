const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const statusBox = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");

innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "");
});

incomeInput.addEventListener("input", () => {
  incomeInput.value = incomeInput.value.replace(/\D/g, "");
});

innInput.addEventListener("input", async () => {
  const inn = innInput.value.trim();

  fioInput.value = "";
  fioInput.classList.remove("success","error");
  sendBtn.disabled = true;
  statusBox.innerText = "";
  checkIcon.classList.remove("show");
  checkIcon.classList.add("hidden");

  if (inn.length < 6) return;

  loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const data = await res.json();

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
  } catch (e) {
    statusBox.innerText = "Ошибка сети";
  } finally {
    loader.classList.add("hidden");
  }
});

sendBtn.addEventListener("click", async () => {
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
      headers: {"Content-Type":"application/x-www-form-urlencoded"},
      body
    });

    const data = await res.json();
    statusBox.innerText = data.status === "ok" ? "Заявка отправлена!" : "Ошибка";
  } catch {
    statusBox.innerText = "Ошибка сети";
  }
});
