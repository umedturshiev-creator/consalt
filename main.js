const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXpqkjhV9ZnxgfxhPJGvR8zA3zg55PjXRMnN5J2ul7cG1uwRc_JNI_oal_uyxI5prlsA/exec";

const fioField = document.getElementById("fio");
const innField = document.getElementById("inn");

// Автозагрузка ФИО при вводе ИНН
innField.addEventListener("input", async () => {
  const inn = innField.value.trim();

  if (inn.length < 5) {
    fioField.value = "";
    return;
  }

  try {
    const res = await fetch(SCRIPT_URL + "?inn=" + inn);
    const data = await res.json();

    if (data && data.fio) {
      fioField.value = data.fio;
    } else {
      fioField.value = "Клиент не найден";
    }

  } catch (err) {
    fioField.value = "Ошибка запроса";
  }
});

// Отправка формы
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    inn: form.inn.value.trim(),
    income: form.income.value.trim(),
    month: form.month.value.trim()
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
    fioField.value = "";

  } catch (err) {
    document.getElementById("status").innerText = "Ошибка отправки!";
  }
});
