const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDb() {
  return fs
    .readFile(DB_PATH, 'utf-8')
    .then((content) => {
      if (!content.trim()) {
        return { contacts: [] };
      }

      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        return { contacts: parsed };
      }

      if (!Array.isArray(parsed.contacts)) {
        return { contacts: [] };
      }

      return parsed;
    })
    .catch((error) => {
      if (error.code === 'ENOENT') {
        const initial = { contacts: [] };
        return writeDb(initial).then(() => initial);
      }

      throw error;
    });
}

function writeDb(data) {
  return fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getAllContacts() {
  return readDb().then((db) => db.contacts);
}

function saveAllContacts(contacts) {
  return writeDb({ contacts }).then(() => contacts);
}

module.exports = {
  getAllContacts,
  saveAllContacts
};
