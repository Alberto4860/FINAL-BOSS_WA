// Importa el constructor de rutas de Express.
const { Router } = require('express');
// Importa las funciones que ejecutan la logica de cada endpoint.
const controller = require('../controllers/contactController');

// Crea un enrutador para el modulo de contactos.
const router = Router();

// Lista todos los contactos.
router.get('/', controller.getContacts);
// Obtiene un contacto por id.
router.get('/:id', controller.getContact);
// Crea un nuevo contacto.
router.post('/', controller.createContact);
// Actualiza un contacto existente.
router.put('/:id', controller.updateContact);
// Elimina un contacto por id.
router.delete('/:id', controller.deleteContact);

// Exporta el router para montarlo en la app principal.
module.exports = router;
