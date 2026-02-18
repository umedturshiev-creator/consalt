const API_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

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

let isSubmitting = false;

function showToast(message, type="success"){
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
}

function validateForm(){
  const innValid = innInput.value.length === 9;
  const fioValid = fioInput.value.trim() !== "" && fioInput.value !== "Не найдено";
  const addressValid = addressInput.value.trim() !== "";
  const incomeValid = Number(incomeInput.value.replace(/\s/g,"")) > 0;
  const monthValid = monthInput.value !== "";

  return innValid && fioValid && addressValid && incomeValid && monthValid;
}

function updateButtonState(){
  sendBtn.disabled = !validateForm();
}

innInput.addEventListener("input",()=>{
  innInput.value = innInput.value.replace(/\D/g,"").slice(0,9);
  updateButtonState();
});

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
