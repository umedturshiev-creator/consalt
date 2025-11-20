document.getElementById('myForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const obj = Object.fromEntries(formData.entries());

    let response = await fetch('https://script.google.com/macros/s/AKfycbzKMbvmwKkZeQWjfEShXohJHCwFkzcbvUEQv6k2ViGlQrGDXuhsRXn1ZBtmKY9EDpzB/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(obj)
    });

    document.getElementById('result').innerText = "Данные отправлены!";
});
