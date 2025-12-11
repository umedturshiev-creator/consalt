
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3OrH1nPuiv1YRvMaUbQV7DX6hpxqAmixNj71cmNTqZWlBL4-89hq3gCVAhCHw3fAT/exec";

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const data = {
    inn: form.inn.value,
    fio: form.fio.value,
    phone: form.phone.value,
    income: form.income.value,
    employees: form.employees.value,
    month: form.month.value
  };

  document.getElementById("status").innerText = "Отправка...";

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify(data)
    });

    document.getElementById("status").innerText = "Успешно отправлено!";
    form.reset();

  } catch (err) {
    document.getElementById("status").innerText = "Ошибка отправки!";
  }
});
