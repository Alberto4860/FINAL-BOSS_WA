// Modulo para leer/escribir archivos usando promesas.
const fs = require('fs/promises');
// Modulo para construir rutas de archivos.
const path = require('path');

// Ruta absoluta al archivo de base de datos JSON.
const DB_PATH = path.join(__dirname, '..', 'db.json');

// Lee el archivo db.json y devuelve un objeto con contacts.
function readDb() {
  return fs
    .readFile(DB_PATH, 'utf-8')
    .then((content) => {
      // Si el archivo esta vacio, regresa estructura inicial.
      if (!content.trim()) {
        return { contacts: [] };
      }

      // Convierte el texto JSON a objeto JavaScript.
      const parsed = JSON.parse(content);

      // Compatibilidad: si el JSON es un arreglo, lo adapta.
      if (Array.isArray(parsed)) {
        return { contacts: parsed };
      }

      // Si contacts no es arreglo, usa arreglo vacio por seguridad.
      if (!Array.isArray(parsed.contacts)) {
        return { contacts: [] };
      }

      // Retorna la estructura valida.
      return parsed;
    })
    .catch((error) => {
      // Si no existe el archivo, lo crea con estructura inicial.
      if (error.code === 'ENOENT') {
        const initial = { contacts: [] };
        return writeDb(initial).then(() => initial);
      }

      // Re-lanza otros errores para que se manejen arriba.
      throw error;
    });
}

// Guarda en db.json el objeto recibido.
function writeDb(data) {
  return fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Devuelve todos los contactos almacenados.
function getAllContacts() {
  return readDb().then((db) => db.contacts);
}

// Reemplaza la lista de contactos y devuelve la misma lista.
function saveAllContacts(contacts) {
  return writeDb({ contacts }).then(() => contacts);
}

// Exporta funciones del repositorio para usarlas en el servicio.
module.exports = {
  getAllContacts,
  saveAllContacts
};
