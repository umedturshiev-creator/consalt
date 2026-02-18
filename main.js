// Google Script URL (оставь свой)
const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const addressInput = document.getElementById("address");

const checkIcon = document.getElementById("checkIcon");
const addressCheckIcon = document.getElementById("addressCheckIcon");

const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const incomeCheck = document.getElementById("incomeCheck");
const toastContainer = document.getElementById("toastContainer");

let innTimer = null;
let isSubmitting = false;


// уведомления
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

// состояние кнопки
function setSubmitting(state) {
  isSubmitting = state;
  sendBtn.disabled = state;
  sendBtn.innerText = state ? "Отправляется…" : "Отправить";
}

// ввод ИНН
innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "").slice(0, 9);
  clearTimeout(innTimer);
  innTimer = setTimeout(findDataByInn, 500);
});

// проверка дохода
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


// ==========================
// получение ФИО + адреса
// ==========================
async function findDataByInn() {
  const inn = innInput.value.trim();

  fioInput.value = "";
  addressInput.value = "";

  checkIcon.classList.remove("show");
  checkIcon.classList.add("hidden");

  addressCheckIcon.classList.remove("show");
  addressCheckIcon.classList.add("hidden");

  sendBtn.disabled = true;

  if (inn.length !== 9) return;

  loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const data = JSON.parse(await res.text());

    if (data.success) {
      // ФИО
      fioInput.value = data.fio || "";
      checkIcon.classList.remove("hidden");
      setTimeout(()=>checkIcon.classList.add("show"),50);

      // адрес
      addressInput.value = data.address || "";
      if (data.address) {
        addressCheckIcon.classList.remove("hidden");
        setTimeout(()=>addressCheckIcon.classList.add("show"),50);
      }

      sendBtn.disabled = false;

    } else {
      fioInput.value = "Не найдено";
      showToast("ИНН не найден", "error");
    }

  } catch {
    showToast("Ошибка сети", "error");
  } finally {
    loader.classList.add("hidden");
  }
}


// отправка формы
sendBtn.addEventListener("click", async () => {
  if (isSubmitting) return;

  setSubmitting(true);

  const body = new URLSearchParams({
    inn: innInput.value,
    fio: fioInput.value,
    address: addressInput.value,
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
    } else {
      showToast("Ошибка отправки", "error");
    }

  } catch {
    showToast("Ошибка сети", "error");
  } finally {
    setSubmitting(false);
  }
});
