const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput = document.getElementById("inn");
const fioInput = document.getElementById("fio");
const addressInput = document.getElementById("address");
const incomeInput = document.getElementById("income");
const monthInput = document.getElementById("month");
const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const incomeCheck = document.getElementById("incomeCheck");
const toastContainer = document.getElementById("toastContainer");
const fioStatus = document.getElementById("fioStatus");
const addressStatus = document.getElementById("addressStatus");

let innTimer = null;
let isSubmitting = false;

function showToast(message, type="success"){
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
}

function validateForm(){
  return (
    innInput.value.length === 9 &&
    fioInput.value.trim() !== "" &&
    addressInput.value.trim() !== "" &&
    Number(incomeInput.value.replace(/\s/g,"")) > 0 &&
    monthInput.value !== ""
  );
}

function updateButtonState(){
  sendBtn.disabled = !validateForm();
}

/* Поиск по ИНН */
innInput.addEventListener("input",()=>{
  innInput.value = innInput.value.replace(/\D/g,"").slice(0,9);
  clearTimeout(innTimer);
  innTimer = setTimeout(findDataByInn,500);
});

async function findDataByInn(){
  const inn = innInput.value.trim();

  fioInput.value = "";
  addressInput.value = "";
  fioStatus.classList.add("hidden");
  addressStatus.classList.add("hidden");

  if(inn.length !== 9) return;

  loader.classList.remove("hidden");

  try{
    const res = await fetch(`${API_URL}?inn=${encodeURIComponent(inn)}`);
    const data = await res.json();

    if(data.success){
      fioInput.value = data.fio || "";
      addressInput.value = data.address || "";
      fioStatus.classList.remove("hidden");
      addressStatus.classList.remove("hidden");
    } else {
      showToast("ИНН не найден","error");
    }
  } catch{
    showToast("Ошибка сети","error");
  }

  loader.classList.add("hidden");
  updateButtonState();
}

/* Маска дохода */
incomeInput.addEventListener("input",()=>{
  let value = incomeInput.value.replace(/\D/g,"");
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  incomeInput.value = value;

  if(Number(value) > 0){
    incomeCheck.classList.remove("hidden");
  } else {
    incomeCheck.classList.add("hidden");
  }

  updateButtonState();
});

monthInput.addEventListener("change",updateButtonState);

/* Отправка */
sendBtn.addEventListener("click",async()=>{
  if(isSubmitting || !validateForm()) return;

  isSubmitting = true;
  sendBtn.innerText = "Отправляется…";

  const body = new URLSearchParams({
    inn: innInput.value,
    fio: fioInput.value,
    address: addressInput.value,
    income: incomeInput.value.replace(/\s/g,""),
    month: monthInput.value
  });

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:body.toString()
    });

    const data = await res.json();

    if(data.status==="ok"){
      showToast("Заявка отправлена");
      incomeInput.value="";
      monthInput.value="";
      incomeCheck.classList.add("hidden");
    } else {
      showToast("Ошибка отправки","error");
    }
  } catch{
    showToast("Ошибка сети","error");
  }

  sendBtn.innerText="Отправить";
  isSubmitting=false;
  updateButtonState();
});
