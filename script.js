async function getOrgInfo() {
  const inn = document.getElementById("inn").value.trim();
  const chat = document.getElementById("chat");

  if (!inn) return alert("Введите ИНН!");

  chat.innerHTML += `<div class="user">Вы: ${inn}</div>`;

  const response = await fetch("data.json");
  const orgs = await response.json();
  const org = orgs.find(o => o.inn === inn);

  if (!org) {
    chat.innerHTML += `<div class="bot">Бот: организация не найдена 😕</div>`;
    return;
  }

  const info = `
    <b>Полное:</b> ${org.full_name}<br>
    <b>Район:</b> ${org.district}<br>
    <b>ФИО:</b> ${org.fio}<br>
    <b>Должность:</b> ${org.position}<br>
    <b>Тип:</b> ${org.type}
  `;
  chat.innerHTML += `<div class="bot">Бот: <br>${info}</div>`;

  // Отправляем на сервер для общения с IO API
  const aiRes = await fetch("http://localhost:3000/api/io", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ org })
  });

  const data = await aiRes.json();
  const aiText = data.choices?.[0]?.message?.content || "ИИ не ответил 😕";

  chat.innerHTML += `<div class="bot">ИИ: ${aiText}</div>`;
  chat.scrollTop = chat.scrollHeight;
}
