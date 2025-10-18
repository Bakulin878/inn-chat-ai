// === Загрузка истории при старте ===
window.addEventListener("DOMContentLoaded", loadChatHistory);

async function getOrgInfo() {
  const inn = document.getElementById("inn").value.trim();
  const chat = document.getElementById("chat");

  if (!inn) return alert("Введите ИНН!");

  addMessage("user", `Вы: ${inn}`);

  const response = await fetch("data.json");
  const orgs = await response.json();
  const org = orgs.find(o => o.inn === inn);

  if (!org) {
    addMessage("bot", "Бот: организация не найдена 😕");
    return;
  }

  const info = `
    <b>Полное:</b> ${org.full_name}<br>
    <b>Район:</b> ${org.district}<br>
    <b>ФИО:</b> ${org.fio}<br>
    <b>Должность:</b> ${org.position}<br>
    <b>Адрес:</b> ${org.address}
  `;
  addMessage("bot", `Бот:<br>${info}`);

  // 👇 Добавляем "ИИ печатает..."
  const typingDiv = document.createElement("div");
  typingDiv.className = "bot typing";
  typingDiv.textContent = "ИИ печатает...";
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;

  try {
    const aiRes = await fetch("https://inn-chat-ai.onrender.com/api/io", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org })
    });

    const data = await aiRes.json();
    const aiText = data.choices?.[0]?.message?.content || "ИИ не ответил 😕";

    typingDiv.remove();

    // 👇 Печатаем текст по буквам
    await typeMessage(chat, aiText);
    saveChatHistory();
  } catch (err) {
    typingDiv.remove();
    addMessage("bot", "Ошибка связи с ИИ 😞");
    console.error(err);
  }

  chat.scrollTop = chat.scrollHeight;
}

// === Добавление сообщения с временем ===
function addMessage(role, text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = role;

  const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  div.innerHTML = `${text}<div class="time">🕒 ${time}</div>`;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  saveChatHistory();
}

// === Эффект “печати текста” ===
async function typeMessage(chat, text) {
  const div = document.createElement("div");
  div.className = "bot";
  chat.appendChild(div);

  const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  for (let i = 0; i < text.length; i++) {
    div.innerHTML = "ИИ: " + text.slice(0, i + 1) + `<div class="time">🕒 ${time}</div>`;
    chat.scrollTop = chat.scrollHeight;
    await new Promise(r => setTimeout(r, 20)); // скорость печати
  }
  saveChatHistory();
}

// === Очистка чата ===
function clearChat() {
  document.getElementById("chat").innerHTML = "";
  localStorage.removeItem("chatHistory");
}

// === Сохранение истории ===
function saveChatHistory() {
  const chat = document.getElementById("chat").innerHTML;
  localStorage.setItem("chatHistory", chat);
}

// === Загрузка истории ===
function loadChatHistory() {
  const saved = localStorage.getItem("chatHistory");
  if (saved) document.getElementById("chat").innerHTML = saved;
}

// === Отправка по Enter ===
document.getElementById("inn").addEventListener("keypress", e => {
  if (e.key === "Enter") getOrgInfo();
});
