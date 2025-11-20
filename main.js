
function sendData() {
  const inn = document.getElementById("inn").value;
  const fio = document.getElementById("fio").value;
  const phone = document.getElementById("phone").value;
  const income = document.getElementById("income").value;
  const employees = document.getElementById("employees").value;
  const month = document.getElementById("month").value;

  fetch("https://script.google.com/macros/s/AKfycbzKMbvmwKkZeQWjfEShXohJHCwFkzcbvUEQv6k2ViGlQrGDXuhsRXn1ZBtmKY9EDpzB/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inn, fio, phone, income, employees, month })
  });

  document.getElementById("inn").value = "";
  document.getElementById("fio").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("income").value = "";
  document.getElementById("employees").value = "";
  document.getElementById("month").value = "";

  const msg = document.getElementById("successMessage");
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.remove("show");
  }, 3000);
}
