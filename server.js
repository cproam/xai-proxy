const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Настройка рейт-лимитера: 10 запросов в минуту на IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 10,
    message: 'Слишком много запросов, попробуйте позже.',
});
app.use('/api', limiter);

// Инициализация OpenAI клиента
const openai = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1', // Укажите правильный URL для xAI API
});

// Эндпоинт для обработки запросов к xAI
app.post('/api/completions', async (req, res) => {
    try {
        const { messages, model, max_tokens, temperature } = req.body;

        // Валидация входных данных
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Массив messages обязателен' });
        }

        // Запрос к xAI
        const response = await openai.chat.completions.create({
            model: model || 'grok-3',
            messages: messages,
            max_tokens: max_tokens || 100,
            temperature: temperature || 0.7,
        });

        // Отправка ответа клиенту
        res.json(response);
    } catch (error) {
        console.error('Ошибка при запросе к xAI:', error.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});