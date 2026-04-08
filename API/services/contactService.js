const repository = require('../repository/contactRepository');

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toBool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function buildError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\d+$/.test(phone);
}

function sanitizeContact(contact) {
  const { foto, ...rest } = contact;
  return rest;
}

function getNextSimpleId(contacts) {
  const usedIds = new Set(contacts.map((contact) => String(contact.id)));
  let candidate = 1;

  while (usedIds.has(String(candidate))) {
    candidate += 1;
  }

  return String(candidate);
}

function applyFilters(contacts, query) {
  let result = [...contacts];

  if (query.q) {
    const term = query.q.toLowerCase();
    result = result.filter((contact) =>
      contact.nombre.toLowerCase().includes(term) || contact.email.toLowerCase().includes(term)
    );
  }

  if (query.sort === 'nombre') {
    result.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }

  if (query.favorite === 'true') {
    result = result.filter((contact) => contact.favorite === true);
  }

  return result;
}

function listContacts(query = {}) {
  return repository
    .getAllContacts()
    .then((contacts) => applyFilters(contacts, query).map(sanitizeContact));
}

function getContactById(id) {
  return repository.getAllContacts().then((contacts) => {
    const found = contacts.find((contact) => contact.id === id) || null;
    return found ? sanitizeContact(found) : null;
  });
}

function validatePayload(payload) {
  const nombre = normalize(payload.nombre);
  const telefono = normalize(String(payload.telefono || ''));
  const email = normalize(payload.email).toLowerCase();

  if (!nombre || !telefono || !email) {
    throw buildError('Nombre, telefono y email son obligatorios.');
  }

  if (!validatePhone(telefono)) {
    throw buildError('El telefono debe contener solo numeros.');
  }

  if (!validateEmail(email)) {
    throw buildError('El email no es valido.');
  }

  return {
    nombre,
    telefono,
    email,
    favorite: toBool(payload.favorite)
  };
}

function createContact(payload) {
  const input = validatePayload(payload);

  return repository.getAllContacts().then((contacts) => {
    const duplicated = contacts.some((contact) => contact.email.toLowerCase() === input.email);
    if (duplicated) {
      throw buildError('Ya existe un contacto con ese email.');
    }

    const newContact = {
      id: getNextSimpleId(contacts),
      ...input
    };

    contacts.push(newContact);
    return repository.saveAllContacts(contacts).then(() => sanitizeContact(newContact));
  });
}

function updateContact(id, payload) {
  return repository.getAllContacts().then((contacts) => {
    const index = contacts.findIndex((contact) => contact.id === id);

    if (index === -1) {
      throw buildError('Contacto no encontrado.', 404);
    }

    const current = contacts[index];
    const candidate = {
      nombre: payload.nombre ?? current.nombre,
      telefono: payload.telefono ?? current.telefono,
      email: payload.email ?? current.email,
      favorite: payload.favorite ?? current.favorite
    };

    const input = validatePayload(candidate);

    const duplicated = contacts.some(
      (contact) => contact.id !== id && contact.email.toLowerCase() === input.email
    );

    if (duplicated) {
      throw buildError('Ya existe otro contacto con ese email.');
    }

    const { foto, ...currentWithoutFoto } = current;
    const updated = {
      ...currentWithoutFoto,
      ...input
    };

    contacts[index] = updated;
    return repository.saveAllContacts(contacts).then(() => sanitizeContact(updated));
  });
}

function deleteContact(id) {
  return repository.getAllContacts().then((contacts) => {
    const index = contacts.findIndex((contact) => contact.id === id);

    if (index === -1) {
      throw buildError('Contacto no encontrado.', 404);
    }

    const [removed] = contacts.splice(index, 1);
    return repository.saveAllContacts(contacts).then(() => sanitizeContact(removed));
  });
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
