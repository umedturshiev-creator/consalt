const WEB_APP_URL="https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOVkP3qiQ7p_D9sBgwFcfu7KsqX3gkwtUlnRlW1ArbXtnw44LbIDPXQ/exec";
let innConfirmed=false,debounceTimer=null;

async function checkINN(){
const inn=document.getElementById("inn").value.trim();
const fio=document.getElementById("fio");
const result=document.getElementById("result");
innConfirmed=false;fio.value="";fio.className="";
if(inn.length<8||inn.length>10)return;
clearTimeout(debounceTimer);
debounceTimer=setTimeout(async()=>{
try{
fio.value="Проверка...";fio.className="loading";
const r=await fetch(`${WEB_APP_URL}?inn=${inn}`,{cache:"no-store"});
const d=await r.json();
if(d.success&&d.fio){
fio.value=d.fio;fio.className="valid";innConfirmed=true;
result.textContent="ИНН подтверждён";
}else{
fio.value="Ваш ИНН не зарегистрирован";fio.className="invalid";
result.textContent="ИНН не подтверждён";
}
}catch{
fio.value="Ошибка проверки";fio.className="invalid";
result.textContent="Ошибка соединения";
}
},500);
}

async function sendForm(){
if(!innConfirmed){result.textContent="ИНН не подтверждён";return;}
const payload={
inn:inn.value,fio:fio.value,
income:income.value,month:month.value
};
spinner.style.display="block";sendBtn.disabled=true;
try{
const r=await fetch(WEB_APP_URL,{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)});
const d=await r.json();
result.textContent=d.status==="ok"?"Заявка отправлена":"Ошибка отправки";
}catch{result.textContent="Ошибка соединения";}
spinner.style.display="none";sendBtn.disabled=false;
}