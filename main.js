const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");
const incomeCheck = document.getElementById("incomeCheck");
const toastContainer = document.getElementById("toastContainer");

let innTimer = null;
let isSubmitting = false;

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

if (tg) {
  tg.MainButton.setText("Отправить");
  tg.MainButton.hide();
}

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

async function findFioByInn() {
  const inn = innInput.value.trim();

  fioInput.value = "";
  fioInput.classList.remove("success","error");
  checkIcon.classList.remove("show");
  checkIcon.classList.add("hidden");

  if (tg) tg.MainButton.hide();
  if (inn.length !== 8) return;

  loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const data = JSON.parse(await res.text());

    if (data.success && data.fio) {
      fioInput.value = data.fio;
      fioInput.classList.add("success");
      checkIcon.classList.remove("hidden");
      setTimeout(()=>checkIcon.classList.add("show"),50);
      if (tg) tg.MainButton.show();
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

if (tg) {
  tg.MainButton.onClick(async () => {
    if (isSubmitting) return;
    isSubmitting = true;

    tg.MainButton.showProgress();

    const payload = {
      inn: innInput.value,
      fio: fioInput.value,
      income: incomeInput.value,
      month: monthInput.value
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body: new URLSearchParams(payload).toString()
      });

      const data = JSON.parse(await res.text());

      if (data.status === "ok") {
        showToast("Заявка отправлена");
        tg.HapticFeedback && tg.HapticFeedback.impactOccurred("light");
        setTimeout(() => tg.close(), 1500);
      } else {
        showToast("Ошибка отправки", "error");
        tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("error");
      }
    } catch {
      showToast("Ошибка сети", "error");
      tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("error");
    } finally {
      tg.MainButton.hideProgress();
      isSubmitting = false;
    }
  });
}
