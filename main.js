const API_URL="https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput=document.getElementById("inn");
const fioInput=document.getElementById("fio");
const addressInput=document.getElementById("address");
const incomeInput=document.getElementById("income");
const monthInput=document.getElementById("month");
const sendBtn=document.getElementById("sendBtn");

const incomeCheck=document.getElementById("incomeCheck");
const errorToast=document.getElementById("errorToast");
const successOverlay=document.getElementById("successOverlay");

let timer;

/* VALIDATION */

function validate(){
  return innInput.value.length===9 &&
         fioInput.value.trim()!=="" &&
         addressInput.value.trim()!=="" &&
         Number(incomeInput.value.replace(/\s/g,""))>0 &&
         monthInput.value!=="";
}

function updateBtn(){ sendBtn.disabled=!validate(); }

/* INN */

innInput.addEventListener("input",()=>{
  innInput.value=innInput.value.replace(/\D/g,"").slice(0,9);
  clearTimeout(timer);

  if(innInput.value.length!==9) return;
  timer=setTimeout(fetchInn,500);
});

async function fetchInn(){
  try{
    const res=await fetch(`${API_URL}?inn=${innInput.value}`);
    const data=await res.json();

    if(data && (data.fio || data.address)){
      fioInput.value=data.fio||"";
      addressInput.value=data.address||"";
      incomeInput.focus();
    }else{
      showErrorToast();
      setTimeout(()=>{ innInput.value=""; },700);
    }

  }catch(e){
    showErrorToast();
  }
}

function showErrorToast(){
  errorToast.classList.remove("hidden");
  setTimeout(()=>errorToast.classList.add("show"),10);

  if(navigator.vibrate){
    navigator.vibrate([200,100,200]);
  }

  setTimeout(()=>{
    errorToast.classList.remove("show");
    setTimeout(()=>errorToast.classList.add("hidden"),300);
  },2000);
}

/* INCOME */

incomeInput.addEventListener("input",()=>{
  let raw=incomeInput.value.replace(/\D/g,"");
  let numberValue=Number(raw);
  incomeInput.value=raw.replace(/\B(?=(\d{3})+(?!\d))/g," ");

  if(numberValue>0){
    incomeCheck?.classList.add("show");
  }else{
    incomeCheck?.classList.remove("show");
  }

  updateBtn();
});

monthInput.addEventListener("change",updateBtn);

/* SEND */

sendBtn.addEventListener("click", async ()=>{

  if(!validate()) return;

  sendBtn.disabled=true;
  sendBtn.innerText="Отправка...";

  try{
    const params=new URLSearchParams();
    params.append("inn",innInput.value);
    params.append("fio",fioInput.value);
    params.append("address",addressInput.value);
    params.append("income",incomeInput.value.replace(/\s/g,""));
    params.append("month",monthInput.value);

    const response=await fetch(API_URL,{
      method:"POST",
      body:params
    });

    const result=await response.json();

    if(result.status==="ok"){
      showSuccess();
      innInput.value="";
      incomeInput.value="";
      monthInput.value="";
      fioInput.value="";
      addressInput.value="";
      updateBtn();
    }

  }catch(e){
    showErrorToast();
  }

  sendBtn.disabled=false;
  sendBtn.innerText="Отправить";
});

function showSuccess(){

  successOverlay.classList.remove("hidden");
  setTimeout(()=>successOverlay.classList.add("show"),10);

  if(navigator.vibrate){
    navigator.vibrate([100,50,150]);
  }

  const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  const oscillator=audioCtx.createOscillator();
  const gainNode=audioCtx.createGain();

  oscillator.type="sine";
  oscillator.frequency.setValueAtTime(800,audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.05,audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime+0.15);

  setTimeout(()=>{
    successOverlay.classList.remove("show");
    setTimeout(()=>successOverlay.classList.add("hidden"),300);
  },2200);
}
