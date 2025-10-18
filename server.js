// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // ← загружаем .env

const app = express();
app.use(cors());
app.use(express.json());

const IO_API_KEY = process.env.IOINTELLIGENCE_API_KEY;
const PORT = process.env.PORT || 3000;

app.post("/api/io", async (req, res) => {
  try {
    const org = req.body.org;

    const prompt = `
    Данные об организации:
    Полное название: ${org.full_name}
    Район: ${org.district}
    ФИО директора: ${org.fio}
    Должность: ${org.position}
    Тип: ${org.type}
    Составь краткое описание организации на русском языке.
    `;

    const response = await fetch("https://api.intelligence.io.solutions/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${IO_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка обращения к IO API" });
  }
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
