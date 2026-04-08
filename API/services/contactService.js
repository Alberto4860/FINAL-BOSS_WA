// Importa el repositorio que lee/escribe la base de datos.
const repository = require('../repository/contactRepository');

// Limpia espacios de un texto; si no es texto regresa cadena vacia.
function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Convierte distintos valores a booleano.
function toBool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

// Crea un Error con codigo HTTP personalizado.
function buildError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Valida formato basico de email.
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valida que telefono tenga solo numeros.
function validatePhone(phone) {
  return /^\+?\d+$/.test(phone);
}

// Quita el campo foto antes de responder al cliente.
function sanitizeContact(contact) {
  const { foto, ...rest } = contact;
  return rest;
}

// Genera el siguiente id disponible como texto.
function getNextSimpleId(contacts) {
  const usedIds = new Set(contacts.map((contact) => String(contact.id)));
  let candidate = 1;

  while (usedIds.has(String(candidate))) {
    candidate += 1;
  }

  return String(candidate);
}

// Aplica filtros de busqueda, orden y favoritos.
function applyFilters(contacts, query) {
  let result = [...contacts];

  // Filtro por termino en nombre o email.
  if (query.q) {
    const term = query.q.toLowerCase();
    result = result.filter((contact) =>
      contact.nombre.toLowerCase().includes(term) || contact.email.toLowerCase().includes(term)
    );
  }

  // Orden alfabetico por nombre.
  if (query.sort === 'nombre') {
    result.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }

  // Muestra solo favoritos si se solicita.
  if (query.favorite === 'true') {
    result = result.filter((contact) => contact.favorite === true);
  }

  return result;
}

// Devuelve contactos filtrados y sin campos sensibles.
function listContacts(query = {}) {
  return repository
    .getAllContacts()
    .then((contacts) => applyFilters(contacts, query).map(sanitizeContact));
}

// Busca un contacto por id y lo sanea antes de devolver.
function getContactById(id) {
  return repository.getAllContacts().then((contacts) => {
    const found = contacts.find((contact) => contact.id === id) || null;
    return found ? sanitizeContact(found) : null;
  });
}

// Valida y normaliza los datos de entrada para crear/actualizar.
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

// Crea un contacto nuevo validando duplicados por email.
function createContact(payload) {
  const input = validatePayload(payload);

  return repository.getAllContacts().then((contacts) => {
    // Evita registrar dos contactos con el mismo email.
    const duplicated = contacts.some((contact) => contact.email.toLowerCase() === input.email);
    if (duplicated) {
      throw buildError('Ya existe un contacto con ese email.');
    }

    const newContact = {
      id: getNextSimpleId(contacts),
      ...input
    };

    // Guarda la lista actualizada en disco.
    contacts.push(newContact);
    return repository.saveAllContacts(contacts).then(() => sanitizeContact(newContact));
  });
}

// Actualiza un contacto existente y valida email duplicado.
function updateContact(id, payload) {
  return repository.getAllContacts().then((contacts) => {
    const index = contacts.findIndex((contact) => contact.id === id);

    // Si no existe el contacto, responde 404.
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

    // Revisa que el nuevo email no pertenezca a otro contacto.
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

    // Guarda cambios y devuelve el contacto actualizado.
    contacts[index] = updated;
    return repository.saveAllContacts(contacts).then(() => sanitizeContact(updated));
  });
}

// Elimina un contacto por id.
function deleteContact(id) {
  return repository.getAllContacts().then((contacts) => {
    const index = contacts.findIndex((contact) => contact.id === id);

    // Si no existe, informa con error 404.
    if (index === -1) {
      throw buildError('Contacto no encontrado.', 404);
    }

    // Lo elimina de la lista, guarda y devuelve el eliminado.
    const [removed] = contacts.splice(index, 1);
    return repository.saveAllContacts(contacts).then(() => sanitizeContact(removed));
  });
}

// Exporta funciones para que el controlador las use.
module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
