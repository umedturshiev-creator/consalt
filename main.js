const API_URL="https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOvKp3qiQ7p_D9sBgwFcuf7ksqX3gkwtUlnRIW1ArbXtnw4L4bIdPXQ/exec";

const innInput=document.getElementById("inn");
const fioInput=document.getElementById("fio");
const addressInput=document.getElementById("address");
const incomeInput=document.getElementById("income");
const monthInput=document.getElementById("month");
const sendBtn=document.getElementById("sendBtn");

const fioStatus=document.getElementById("fioStatus");
const addressStatus=document.getElementById("addressStatus");
const incomeCheck=document.getElementById("incomeCheck");
const innError=document.getElementById("innError");
const skeleton=document.getElementById("skeleton");
const formContainer=document.getElementById("formContainer");

let timer;

function validate(){
  return innInput.value.length===9 &&
         fioInput.value!=="" &&
         addressInput.value!=="" &&
         Number(incomeInput.value.replace(/\s/g,""))>0 &&
         monthInput.value!=="";
}

function updateBtn(){
  sendBtn.disabled=!validate();
}

function reset(){
  fioInput.value="";
  addressInput.value="";
  fioStatus?.classList.add("hidden");
  addressStatus?.classList.add("hidden");
  innError?.classList.add("hidden");
  innInput.classList.remove("error-input");
}

innInput.addEventListener("input",()=>{
  innInput.value=innInput.value.replace(/\D/g,"").slice(0,9);
  clearTimeout(timer);
  reset();
  if(innInput.value.length!==9){
    hideSkeleton();
    return;
  }
  timer=setTimeout(fetchInn,500);
});

function showSkeleton(){
  skeleton.classList.remove("hidden");
  setTimeout(()=>skeleton.classList.add("show"),10);
  formContainer.classList.add("blur");
}

function hideSkeleton(){
  skeleton.classList.remove("show");
  setTimeout(()=>skeleton.classList.add("hidden"),300);
  formContainer.classList.remove("blur");
}

async function fetchInn(){

  showSkeleton();

  try{
    const res=await fetch(`${API_URL}?inn=${innInput.value}`);
    const data=await res.json();

    hideSkeleton();

    if(data.success){

      fioInput.value=data.fio||"";
      addressInput.value=data.address||"";

      fioStatus?.classList.remove("hidden");
      addressStatus?.classList.remove("hidden");

      setTimeout(()=>{
        fioStatus?.classList.add("show");
        addressStatus?.classList.add("show");
      },50);

      incomeInput.focus();

    }else{

      innInput.classList.add("error-input");
      innError?.classList.remove("hidden");

      if(navigator.vibrate){
        navigator.vibrate([200,100,200]);
      }

      setTimeout(()=>{
        innInput.value="";
        reset();
      },700);
    }

  }catch(e){
    hideSkeleton();
  }

  updateBtn();
}

incomeInput.addEventListener("input",()=>{
  let val=incomeInput.value.replace(/\D/g,"");
  val=val.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  incomeInput.value=val;

  if(Number(val)>0){
    incomeCheck?.classList.remove("hidden");
    setTimeout(()=>incomeCheck?.classList.add("show"),50);
  }else{
    incomeCheck?.classList.add("hidden");
    incomeCheck?.classList.remove("show");
  }

  updateBtn();
});

monthInput.addEventListener("change",updateBtn);

sendBtn.addEventListener("click",async()=>{
  if(!validate()) return;
  alert("Заявка отправлена");
});
