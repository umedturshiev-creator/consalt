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
const innError = document.getElementById("innError");

let innTimer;

/* ===== RESET ===== */

function resetData(){
  fioInput.value="";
  addressInput.value="";
  fioStatus.classList.add("hidden");
  addressStatus.classList.add("hidden");
}

/* ===== VALIDATION ===== */

function validateForm(){
  return (
    innInput.value.length===9 &&
    fioInput.value!=="" &&
    addressInput.value!=="" &&
    Number(incomeInput.value.replace(/\s/g,""))>0 &&
    monthInput.value!==""
  );
}

function updateButton(){
  sendBtn.disabled=!validateForm();
}

/* ===== INN INPUT ===== */

innInput.addEventListener("input",()=>{

  innInput.value=innInput.value.replace(/\D/g,"").slice(0,9);

  clearTimeout(innTimer);
  resetData();
  loader.classList.add("hidden");
  innInput.classList.remove("error-input");
  innError.classList.add("hidden");

  if(innInput.value.length!==9){
    updateButton();
    return;
  }

  innTimer=setTimeout(fetchInnData,500);
});

/* ===== FETCH INN ===== */

async function fetchInnData(){

  loader.classList.remove("hidden");

  try{
    const res=await fetch(`${API_URL}?inn=${innInput.value}`);
    const data=await res.json();

    loader.classList.add("hidden");

    if(data.success){

      fioInput.value=data.fio||"";
      addressInput.value=data.address||"";

      fioStatus.classList.remove("hidden");
      addressStatus.classList.remove("hidden");

      setTimeout(()=>{
        fioStatus.classList.add("show");
        addressStatus.classList.add("show");
      },50);

    }else{

      innInput.classList.add("error-input");
      innInput.classList.add("shake");
      innError.classList.remove("hidden");

      if(navigator.vibrate){
        navigator.vibrate(200);
      }

      setTimeout(()=>{
        innInput.classList.remove("shake");
      },400);

      setTimeout(()=>{
        innInput.value="";
        innInput.classList.remove("error-input");
        innError.classList.add("hidden");
        resetData();
        updateButton();
      },1500);

      return;
    }

  }catch(e){
    loader.classList.add("hidden");
  }

  updateButton();
}

/* ===== INCOME MASK ===== */

incomeInput.addEventListener("input",()=>{

  let value=incomeInput.value.replace(/\D/g,"");
  value=value.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  incomeInput.value=value;

  if(Number(value)>0){
    incomeCheck.classList.remove("hidden");
    setTimeout(()=>incomeCheck.classList.add("show"),50);
  }else{
    incomeCheck.classList.add("hidden");
    incomeCheck.classList.remove("show");
  }

  updateButton();
});

monthInput.addEventListener("change",updateButton);

/* ===== SEND ===== */

sendBtn.addEventListener("click",async()=>{

  if(!validateForm()) return;

  sendBtn.classList.add("btn-loading");
  sendBtn.disabled=true;

  try{

    const body=new URLSearchParams({
      inn:innInput.value,
      fio:fioInput.value,
      address:addressInput.value,
      income:incomeInput.value.replace(/\s/g,""),
      month:monthInput.value
    });

    const res=await fetch(API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:body.toString()
    });

    const data=await res.json();

    if(data.status==="ok"){
      alert("Заявка отправлена");
    }

  }catch(e){
    alert("Ошибка сети");
  }

  sendBtn.classList.remove("btn-loading");
  updateButton();
});
