const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwUUcRsGyZpHGqVOVkP3qiQ7p_D9sBgwFcfu7KsqX3gkwtUlnRlW1ArbXtnw44LbIDPXQ/exec";
const inn = document.getElementById("inn");
const fio = document.getElementById("fio");
const income = document.getElementById("income");
const month = document.getElementById("month");
const result = document.getElementById("result");
const status = document.getElementById("innStatus");
const btn = document.getElementById("sendBtn");

let timer=null, cache={};

inn.addEventListener("input",()=>{
 inn.value=inn.value.replace(/\D/g,"").slice(0,10);
 fio.value=""; fio.className=""; status.style.display="none";
 clearTimeout(timer);
 if(inn.value.length<8) return;
 timer=setTimeout(()=>checkInn(inn.value),500);
});

async function checkInn(v){
 fio.value="Проверка...";
 if(cache[v]) return apply(cache[v]);
 try{
  const r=await fetch(`${WEB_APP_URL}?inn=${v}`);
  const d=await r.json();
  cache[v]=d; apply(d);
 }catch{fio.value="Ошибка"; fio.className="fio-error";}
}

function apply(d){
 fio.className="";
 if(d.success&&d.fio){fio.value=d.fio; fio.className="fio-success"; status.style.display="block";}
 else{fio.value="Ваш ИНН не зарегистрирован"; fio.className="fio-error";}
}

btn.onclick=async()=>{
 if(!fio.classList.contains("fio-success")){result.innerText="ИНН не подтверждён"; return;}
 try{
  const r=await fetch(WEB_APP_URL,{method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({inn:inn.value,fio:fio.value,income:income.value,month:month.value})});
  const d=await r.json();
  result.innerText=d.status==="ok"?"Отправлено":"Ошибка";
  if(d.status==="ok"){inn.value=fio.value=income.value=month.value=""; status.style.display="none";}
 }catch{result.innerText="Ошибка соединения";}
};
