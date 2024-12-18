const express = require('express');
const app = express();
const port = 3000;

// Middleware для обработки JSON
app.use(express.json());

// Обработчик POST-запроса
app.post('/api/submit', (req, res) => {
    const { gender, height, weight, age, activity } = req.body;

    console.log('Полученные данные:', req.body);

    // Пример проверки и ответа
    if (!gender || !height || !weight || !age || !activity) {
        return res.status(400).json({ error: 'Все поля должны быть заполнены!' });
    }

    res.json({
        message: 'Данные успешно получены!',
        data: req.body
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
