const express = require('express');

const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());
app.use('/contactos', contactRoutes);

app.use((error, _req, res, _next) => {
    const status = error.status || 500;
    const message = status === 500 ? 'Error interno del servidor.' : error.message;

    if (status === 500) {
        console.error(error);
    }

    res.status(status).json({ code: 0, message });
});

app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});