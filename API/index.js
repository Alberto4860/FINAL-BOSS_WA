// Importa Express para crear el servidor.
const express = require('express');

// Importa las rutas del modulo de contactos.
const contactRoutes = require('./routes/contactRoutes');

// Inicializa la aplicacion Express.
const app = express();
// Puerto donde correra la API.
const PORT = 3000;

// Middleware CORS basico para permitir peticiones desde el frontend.
app.use((req, res, next) => {
    // Permite cualquier origen.
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Define metodos HTTP permitidos.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Define encabezados permitidos.
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapido a las preflight requests del navegador.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    // Continúa al siguiente middleware.
    next();
});

// Permite recibir JSON en el body.
app.use(express.json());
// Monta las rutas bajo /contactos.
app.use('/contactos', contactRoutes);

// Manejador global de errores.
app.use((error, _req, res, _next) => {
    // Usa el status del error o 500 por defecto.
    const status = error.status || 500;
    // Oculta detalle tecnico cuando el error es interno.
    const message = status === 500 ? 'Error interno del servidor.' : error.message;

    // Imprime error interno en consola para depuracion.
    if (status === 500) {
        console.error(error);
    }

    // Respuesta de error estandarizada.
    res.status(status).json({ code: 0, message });
});

// Inicia el servidor en el puerto configurado.
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});