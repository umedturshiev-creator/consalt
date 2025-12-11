
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbYiBMywch-hFgYrd_46PzIZYkjzO5xwKZnk_Hwx6j7NQFkSU55BzVFHp257QNnKEkG/exec";

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
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    });

    document.getElementById("status").innerText = "Успешно отправлено!";
    form.reset();

  } catch (err) {
    document.getElementById("status").innerText = "Ошибка отправки!";
  }
});
