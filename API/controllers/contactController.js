const service = require('../services/contactService');

function getContacts(req, res, next) {
  service
    .listContacts(req.query)
    .then((contacts) => {
      res.json({ code: 1, message: 'Contactos obtenidos', data: contacts });
    })
    .catch(next);
}

function getContact(req, res, next) {
  service
    .getContactById(req.params.id)
    .then((contact) => {
      if (!contact) {
        return res.status(404).json({ code: 0, message: 'Contacto no encontrado' });
      }

      return res.json({ code: 1, message: 'Contacto obtenido', data: contact });
    })
    .catch(next);
}

function createContact(req, res, next) {
  service
    .createContact(req.body)
    .then((created) => {
      res.status(201).json({ code: 1, message: 'Contacto creado', data: created });
    })
    .catch(next);
}

function updateContact(req, res, next) {
  service
    .updateContact(req.params.id, req.body)
    .then((updated) => {
      res.json({ code: 1, message: 'Contacto actualizado', data: updated });
    })
    .catch(next);
}

function deleteContact(req, res, next) {
  service
    .deleteContact(req.params.id)
    .then((deleted) => {
      res.json({ code: 1, message: 'Contacto eliminado', data: deleted });
    })
    .catch(next);
}

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
};
