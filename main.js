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
const errorToast=document.getElementById("errorToast");
const successOverlay=document.getElementById("successOverlay");
const skeleton=document.getElementById("skeletonOverlay");

let timer;

function showSkeleton(){
skeleton.classList.remove("hidden");
setTimeout(()=>skeleton.classList.add("show"),10);
}
function hideSkeleton(){
skeleton.classList.remove("show");
setTimeout(()=>skeleton.classList.add("hidden"),300);
}

function showError(){
errorToast.classList.remove("hidden");
setTimeout(()=>errorToast.classList.add("show"),10);
if(navigator.vibrate) navigator.vibrate([200,100,200]);
setTimeout(()=>{
errorToast.classList.remove("show");
setTimeout(()=>errorToast.classList.add("hidden"),300);
},2000);
}

function validate(){
return innInput.value.length===9 &&
Number(incomeInput.value.replace(/\s/g,""))>0 &&
monthInput.value!=="";
}

function updateBtn(){ sendBtn.disabled=!validate(); }

innInput.addEventListener("input",()=>{
innInput.value=innInput.value.replace(/\D/g,"").slice(0,9);
clearTimeout(timer);
if(innInput.value.length!==9) return;
timer=setTimeout(fetchInn,500);
});

async function fetchInn(){
showSkeleton();
try{
const res=await fetch(`${API_URL}?inn=${innInput.value}`);
const data=await res.json();
hideSkeleton();
if(data && data.fio){
fioInput.value=data.fio;
addressInput.value=data.address||"";
fioStatus.classList.add("show");
addressStatus.classList.add("show");
incomeInput.focus();
}else{
showError();
setTimeout(()=>innInput.value="",700);
}
}catch(e){
hideSkeleton();
showError();
}
}

incomeInput.addEventListener("input",()=>{
let raw=incomeInput.value.replace(/\D/g,"");
incomeInput.value=raw.replace(/\B(?=(\d{3})+(?!\d))/g," ");
if(Number(raw)>0) incomeCheck.classList.add("show");
else incomeCheck.classList.remove("show");
updateBtn();
});

monthInput.addEventListener("change",updateBtn);

sendBtn.addEventListener("click",async()=>{
if(!validate()) return;
sendBtn.disabled=true;
sendBtn.innerText="Отправка...";

const params=new URLSearchParams();
params.append("inn",innInput.value);
params.append("fio",fioInput.value);
params.append("address",addressInput.value);
params.append("income",incomeInput.value.replace(/\s/g,""));
params.append("month",monthInput.value);

try{
const response=await fetch(API_URL,{method:"POST",body:params});
const result=await response.json();
if(result.status==="ok"){
successOverlay.classList.remove("hidden");
setTimeout(()=>successOverlay.classList.add("show"),10);
if(navigator.vibrate) navigator.vibrate([100,50,150]);
setTimeout(()=>{
successOverlay.classList.remove("show");
setTimeout(()=>successOverlay.classList.add("hidden"),300);
},2200);
innInput.value="";
incomeInput.value="";
monthInput.value="";
fioInput.value="";
addressInput.value="";
fioStatus.classList.remove("show");
addressStatus.classList.remove("show");
incomeCheck.classList.remove("show");
updateBtn();
}
}catch(e){
showError();
}
sendBtn.disabled=false;
sendBtn.innerText="Отправить";
});
