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
const skeleton=document.getElementById("skeletonOverlay");
const skeletonText=document.getElementById("skeletonText");

let timer;

/* ================= TYPE EFFECT ================= */

function typeText(text){
  if(!skeletonText) return;
  skeletonText.innerHTML="";
  let i=0;
  const interval=setInterval(()=>{
    skeletonText.innerHTML+=text[i];
    i++;
    if(i>=text.length) clearInterval(interval);
  },25);
}

/* ================= SKELETON ================= */

function showSkeleton(){
  if(!skeleton) return;
  skeleton.classList.remove("hidden");
  setTimeout(()=>skeleton.classList.add("show"),10);
  typeText("Идёт поиск данных...");

  if(navigator.vibrate){
    navigator.vibrate(50);
  }
}

function hideSkeleton(){
  if(!skeleton) return;
  skeleton.classList.remove("show");
  setTimeout(()=>skeleton.classList.add("hidden"),300);
}

/* ================= VALIDATION ================= */

function validate(){
  return innInput.value.length===9 &&
         fioInput.value.trim()!=="" &&
         addressInput.value.trim()!=="" &&
         Number(incomeInput.value.replace(/\s/g,""))>0 &&
         monthInput.value!=="";
}

function updateBtn(){
  sendBtn.disabled=!validate();
}

/* ================= RESET ================= */

function reset(){
  fioInput.value="";
  addressInput.value="";
  fioStatus?.classList.remove("show");
  addressStatus?.classList.remove("show");
  innInput.classList.remove("error-input");
}

/* ================= INN INPUT ================= */

innInput.addEventListener("input",()=>{
  innInput.value=innInput.value.replace(/\D/g,"").slice(0,9);
  clearTimeout(timer);
  innError?.classList.remove("show");
  reset();

  if(innInput.value.length!==9){
    hideSkeleton();
    return;
  }

  timer=setTimeout(fetchInn,500);
});

/* ================= FETCH (GET) ================= */

async function fetchInn(){
  showSkeleton();

  try{
    const res=await fetch(`${API_URL}?inn=${innInput.value}`);
    const data=await res.json();

    hideSkeleton();

    if(data && (data.fio || data.address)){
      fioInput.value=data.fio||"";
      addressInput.value=data.address||"";
      fioStatus?.classList.add("show");
      addressStatus?.classList.add("show");
      incomeInput.focus();
    }else{
      innInput.classList.add("error-input");
      innError?.classList.add("show");

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

/* ================= INCOME MASK (FIXED) ================= */

incomeInput.addEventListener("input",()=>{

  // 1️⃣ Берём только цифры
  let raw = incomeInput.value.replace(/\D/g,"");

  // 2️⃣ Проверяем число ДО форматирования
  const numberValue = Number(raw);

  // 3️⃣ Форматируем с пробелами
  let formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  incomeInput.value = formatted;

  // 4️⃣ Галочка показывается если число > 0
  if(numberValue > 0){
    incomeCheck?.classList.add("show");
  }else{
    incomeCheck?.classList.remove("show");
  }

  updateBtn();
});

monthInput.addEventListener("change",updateBtn);

/* ================= SEND (POST WITHOUT CORS ISSUE) ================= */

sendBtn.addEventListener("click", async ()=>{

  if(!validate()) return;

  sendBtn.disabled = true;
  const originalText = sendBtn.innerText;
  sendBtn.innerText = "Отправка...";

  try{

    const params = new URLSearchParams();
    params.append("inn", innInput.value);
    params.append("fio", fioInput.value);
    params.append("address", addressInput.value);
    params.append("income", incomeInput.value.replace(/\s/g,""));
    params.append("month", monthInput.value);

    const response = await fetch(API_URL, {
      method: "POST",
      body: params
    });

    const result = await response.json();

    if(result.status === "ok"){
      alert("Заявка успешно отправлена ✅");

      innInput.value="";
      incomeInput.value="";
      monthInput.value="";
      reset();
      updateBtn();

    }else{
      alert("Ошибка сервера ❌");
    }

  }catch(error){
    console.error(error);
    alert("Ошибка соединения ❌");
  }

  sendBtn.disabled = false;
  sendBtn.innerText = originalText;

});
