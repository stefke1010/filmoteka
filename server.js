const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Додато за рад са свим уређајима
const app = express();

// Омогућавамо CORS и читање JSON-а
app.use(cors());
app.use(express.json());

// Сервирамо статичке фајлове из public фолдера (твој index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Повезивање са MongoDB базом на клауду
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/filmoteka';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Успешно повезан са клауд базом!'))
  .catch(err => console.error('Грешка са базом:', err));

// Шема и модел
const MovieSchema = new mongoose.Schema({
    title: String,
    genre: String,
    origin: String,
    image: String,
    description: String
});
const Movie = mongoose.model('Movie', MovieSchema);

// РУТА ЗА УЧИТАВАЊЕ И ПРЕТРАГУ ФИЛМОВА
app.get('/api/movies', async (req, res) => {
    try {
        let query = {};
        if (req.query.genre) {
            query.genre = { regex: req.query.genre, options: 'i' };
        }
        if (req.query.origin && req.query.origin !== 'sve') {
            query.origin = req.query.origin;
        }
        const movies = await Movie.find(query);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// РУТА ЗА ДОДАВАЊЕ НОВОГ ФИЛМА
app.post('/api/movies', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// РУТА ЗА БРИСАЊЕ ФИЛМА ПРЕКО ID-ја
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ error: "Филм није пронађен" });
        }
        res.json({ message: "Успешно обрисано" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Све остале руте враћају почетну страницу (важно за мобилне прегледаче)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Порт за Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер успешно покренут на порту ${PORT}`));
