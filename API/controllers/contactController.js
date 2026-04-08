// Importa las funciones de negocio para manejar contactos.
const service = require('../services/contactService');

// Devuelve la lista de contactos (puede aplicar filtros por query string).
function getContacts(req, res, next) {
  // Llama al servicio para obtener contactos usando los filtros recibidos.
  service
    .listContacts(req.query)
    .then((contacts) => {
      // Responde en formato JSON cuando todo sale bien.
      res.json({ code: 1, message: 'Contactos obtenidos', data: contacts });
    })
    // Si ocurre un error, lo pasa al manejador global de errores de Express.
    .catch(next);
}

// Devuelve un contacto por su id.
function getContact(req, res, next) {
  // Busca el contacto usando el id que viene en la URL.
  service
    .getContactById(req.params.id)
    .then((contact) => {
      // Si no existe, responde con 404.
      if (!contact) {
        return res.status(404).json({ code: 0, message: 'Contacto no encontrado' });
      }

      // Si existe, responde con los datos del contacto.
      return res.json({ code: 1, message: 'Contacto obtenido', data: contact });
    })
    // Si hay error, delega al middleware de errores.
    .catch(next);
}

// Crea un nuevo contacto con los datos enviados en el body.
function createContact(req, res, next) {
  // Envía el body al servicio para crear el contacto.
  service
    .createContact(req.body)
    .then((created) => {
      // Responde 201 porque se creó un recurso nuevo.
      res.status(201).json({ code: 1, message: 'Contacto creado', data: created });
    })
    // En caso de error, lo manda al siguiente middleware.
    .catch(next);
}

// Actualiza un contacto existente por id.
function updateContact(req, res, next) {
  // Envía id y body al servicio para actualizar.
  service
    .updateContact(req.params.id, req.body)
    .then((updated) => {
      // Responde con el contacto actualizado.
      res.json({ code: 1, message: 'Contacto actualizado', data: updated });
    })
    // Si falla, lo maneja el middleware de errores.
    .catch(next);
}

// Elimina un contacto por id.
function deleteContact(req, res, next) {
  // Llama al servicio para borrar el contacto indicado.
  service
    .deleteContact(req.params.id)
    .then((deleted) => {
      // Responde con el contacto eliminado.
      res.json({ code: 1, message: 'Contacto eliminado', data: deleted });
    })
    // Si hay un problema, lo pasa al manejador de errores.
    .catch(next);
}

// Exporta las funciones para que las rutas puedan usarlas.
module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
};
