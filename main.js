const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEvKW4sVTrserlxjx9GIDBc1xzLxtdanFCZf-fETgkHqYHOeyT4Hy2kBnLD5WORZVy/exec";
document.getElementById("clientForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        inn: document.getElementById("inn").value,
        fio: document.getElementById("fio").value,
        phone: document.getElementById("phone").value,
        income: document.getElementById("income").value,
        staff: document.getElementById("staff").value,
        month: document.getElementById("month").value
    };
    await fetch(GOOGLE_SCRIPT_URL,{method:"POST",mode:"no-cors",body:JSON.stringify(data)});
    document.getElementById("success").style.display="block";
    setTimeout(()=>location.reload(),2000);
});
