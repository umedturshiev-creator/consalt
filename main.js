const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXpqkjhV9ZnxgfxhPJGvR8zA3zg55PjXRMnN5J2ul7cG1uwRc_JNI_oal_uyxI5prlsA/exec";

document.getElementById("form").addEventListener("submit", async (e) => {
e.preventDefault();
const form = e.target;
const data = {
 inn: form.inn.value.trim(),
 fio: form.fio.value.trim(),
 phone: form.phone.value.trim(),
 income: form.income.value.trim(),
 employees: form.employees.value.trim(),
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
