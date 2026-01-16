const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOVkP3qiQ7p_D9sBgwFcfu7KsqX3gkwtUlnRlW1ArbXtnw44LbIDPXQ/exec";
let innConfirmed=false;
let timer=null;

async function checkINN(){
const inn=document.getElementById("inn").value;
const fio=document.getElementById("fio");
const status=document.getElementById("innStatus");
innConfirmed=false; fio.value=""; fio.className=""; status.textContent="";
if(inn.length!==8 && inn.length!==10) return;
clearTimeout(timer);
timer=setTimeout(async()=>{
try{
const r=await fetch(`${WEB_APP_URL}?inn=${inn}`);
const d=await r.json();
if(d.success){
fio.value=d.fio; fio.className="success";
status.textContent="✔ ИНН подтверждён"; status.className="ok";
innConfirmed=true;
}else{
fio.value="ИНН не зарегистрирован"; fio.className="error";
status.textContent="ИНН не подтверждён"; status.className="bad";
}
}catch{
fio.value="Ошибка проверки"; fio.className="error";
status.textContent="Ошибка соединения"; status.className="bad";
}
},500);
}

async function sendForm(){
if(!innConfirmed){result.textContent="ИНН не подтверждён";return;}
result.textContent="Заявка отправлена";
}
