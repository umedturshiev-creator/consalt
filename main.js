// ==========================
// API НАСТРОЙКИ
// ==========================

// SmartPay API (основной источник)
const SMARTPAY_API_URL = "https://smartpay.tj/subapi/payler/tin/";

// Google Script API (резерв)
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";


// ==========================
// DOM ЭЛЕМЕНТЫ
// ==========================

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const addressInput = document.getElementById("address");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");
const incomeCheck = document.getElementById("incomeCheck");
const toastContainer = document.getElementById("toastContainer");

let innTimer = null;
let isSubmitting = false;


// ==========================
// УВЕДОМЛЕНИЯ
// ==========================

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


// ==========================
// СОСТОЯНИЕ КНОПКИ
// ==========================

function setSubmitting(state) {
  isSubmitting = state;
  sendBtn.disabled = state;
  sendBtn.innerText = state ? "Отправляется…" : "Отправить";
}


// ==========================
// ТОЛЬКО ЦИФРЫ В ИНН
// ==========================

innInput.addEventListener("input", () => {
  innInput.value = innInput.value.replace(/\D/g, "").slice(0, 9);
  clearTimeout(innTimer);
  innTimer = setTimeout(findDataByInn, 500);
});


// ==========================
// ПРОВЕРКА ДОХОДА
// ==========================

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
// FETCH С TIMEOUT
// ==========================

async function fetchWithTimeout(url, options = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}


// ==========================
// ПОЛУЧЕНИЕ ФИО + АДРЕС
// ==========================

async function findDataByInn() {
  const inn = innInput.value.trim();

  fioInput.value = "";
  addressInput.value = "";
  fioInput.classList.remove("success","error");
  sendBtn.disabled = true;
  checkIcon.classList.remove("show");
  checkIcon.classList.add("hidden");

  if (inn.length !== 9) return;

  loader.classList.remove("hidden");

  try {
    let result = null;

    // ======================
    // 1️⃣ ПЫТАЕМСЯ SMARTPAY
    // ======================
    try {
      const res = await fetchWithTimeout(
        `${SMARTPAY_API_URL}${encodeURIComponent(inn)}`,
        {},
        4000
      );

      if (res.ok) {
        const smartpayData = await res.json();

        if (smartpayData.errorCode === 0) {
          result = {
            fio: smartpayData.FullName,
            address: smartpayData.adr
          };

          console.log("Источник: SmartPay");
        }
      }
    } catch (e) {
      console.log("SmartPay недоступен → пробуем Google");
    }

    // ======================
    // 2️⃣ FALLBACK → GOOGLE
    // ======================
    if (!result) {
      try {
        const res = await fetchWithTimeout(
          `${GOOGLE_API_URL}?inn=${encodeURIComponent(inn)}`,
          {},
          4000
        );

        const googleData = JSON.parse(await res.text());

        if (googleData.success) {
          result = {
            fio: googleData.fio,
            address: googleData.address
          };

          console.log("Источник: Google Table");
        }
      } catch {
        console.log("Google тоже недоступен");
      }
    }

    // ======================
    // ОБРАБОТКА РЕЗУЛЬТАТА
    // ======================
    if (result && result.fio) {
      fioInput.value = result.fio || "";
      addressInput.value = result.address || "";

      fioInput.classList.add("success");

      checkIcon.classList.remove("hidden");
      setTimeout(()=>checkIcon.classList.add("show"),50);

      sendBtn.disabled = false;

    } else {
      throw new Error("not found");
    }

  } catch (e) {
    fioInput.value = "Не найдено";
    addressInput.value = "";
    fioInput.classList.add("error");
    showToast("ИНН не найден", "error");
  } finally {
    loader.classList.add("hidden");
  }
}


// ==========================
// ОТПРАВКА ФОРМЫ
// ==========================

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
    const res = await fetch(GOOGLE_API_URL, {
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
  } finally {
    setSubmitting(false);
  }
});
