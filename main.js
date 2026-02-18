const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const addressInput = document.getElementById("address");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const fioStatus = document.getElementById("fioStatus");
const addressStatus = document.getElementById("addressStatus");
const incomeCheck = document.getElementById("incomeCheck");

let innTimer;

/* =========================
   Сброс состояния
========================= */

function resetData() {
  fioInput.value = "";
  addressInput.value = "";
  fioStatus.classList.add("hidden");
  addressStatus.classList.add("hidden");
  loader.classList.add("hidden");
}

/* =========================
   Валидация
========================= */

function validateForm() {
  return (
    innInput.value.length === 9 &&
    fioInput.value !== "" &&
    addressInput.value !== "" &&
    Number(incomeInput.value.replace(/\s/g, "")) > 0 &&
    monthInput.value !== ""
  );
}

function updateButton() {
  sendBtn.disabled = !validateForm();
}

/* =========================
   Поиск по ИНН
========================= */

innInput.addEventListener("input", () => {

  innInput.value = innInput.value.replace(/\D/g, "").slice(0, 9);

  clearTimeout(innTimer);
  resetData();

  if (innInput.value.length !== 9) {
    updateButton();
    return;
  }

  innTimer = setTimeout(fetchInnData, 400);
});

async function fetchInnData() {

  loader.classList.remove("hidden");

  try {
    const response = await fetch(`${API_URL}?inn=${innInput.value}`);
    const data = await response.json();

    loader.classList.add("hidden");

    if (data.success) {

      fioInput.value = data.fio || "";
      addressInput.value = data.address || "";

      if (data.fio) {
        fioStatus.classList.remove("hidden");
      }

      if (data.address) {
        addressStatus.classList.remove("hidden");
      }

    } else {
      resetData();
    }

  } catch (error) {
    loader.classList.add("hidden");
    resetData();
    console.log("Ошибка сети", error);
  }

  updateButton();
}

/* =========================
   Маска дохода
========================= */

incomeInput.addEventListener("input", () => {

  let value = incomeInput.value.replace(/\D/g, "");
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  incomeInput.value = value;

  if (Number(value) > 0) {
    incomeCheck.classList.remove("hidden");
  } else {
    incomeCheck.classList.add("hidden");
  }

  updateButton();
});

monthInput.addEventListener("change", updateButton);

/* =========================
   Отправка формы
========================= */

sendBtn.addEventListener("click", async () => {

  if (!validateForm()) return;

  sendBtn.innerText = "Отправляется...";
  sendBtn.disabled = true;

  try {

    const body = new URLSearchParams({
      inn: innInput.value,
      fio: fioInput.value,
      address: addressInput.value,
      income: incomeInput.value.replace(/\s/g, ""),
      month: monthInput.value
    });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    const data = await res.json();

    if (data.status === "ok") {
      alert("Заявка отправлена");
    }

  } catch (e) {
    alert("Ошибка сети");
  }

  sendBtn.innerText = "Отправить";
  updateButton();
});
