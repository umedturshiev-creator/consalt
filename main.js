const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");
const incomeCheck = document.getElementById("incomeCheck");
const toastContainer = document.getElementById("toastContainer");

let innTimer = null;

/* ===== Toast helper ===== */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toast-out .3s forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ===== Inputs ===== */
innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "").slice(0, 8);
  clearTimeout(innTimer);
  innTimer = setTimeout(findFioByInn, 500);
});

incomeInput.addEventListener("input", () => {
  incomeInput.value = incomeInput.value.replace(/\D/g, "");
  incomeCheck.classList.remove("show");
  incomeCheck.classList.add("hidden");
});

incomeInput.addEventListener("blur", () => {
  if (Number(incomeInput.value) > 0) {
    incomeCheck.classList.remove("hidden");
    setTimeout(()=>incomeCheck.classList.add("show"),50);
  }
});

/* ===== FIO search ===== */
async function findFioByInn() {
  const inn = innInput.value.trim();

  fioInput.value = "";
  fioInput.classList.remove("success","error");
  sendBtn.disabled = true;
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
      showToast("ИНН не найден", "error");
    }
  } catch {
    showToast("Ошибка сети", "error");
  } finally {
    loader.classList.add("hidden");
  }
}

/* ===== Submit ===== */
sendBtn.addEventListener("click", async () => {
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

    if (data.status === "ok") {
      showToast("Заявка успешно отправлена");
      incomeInput.value = "";
      monthInput.value = "";
      incomeCheck.classList.remove("show");
      incomeCheck.classList.add("hidden");
    } else {
      showToast("Ошибка отправки", "error");
    }
  } catch {
    showToast("Ошибка сети", "error");
  }
});
