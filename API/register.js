// URL base de la API para contactos.
const API_BASE = 'http://localhost:3000/contactos';

// Referencias a elementos de la interfaz.
const form = document.getElementById('registerForm');
const alertBox = document.getElementById('alertBox');
const pageTitle = document.getElementById('pageTitle');
const submitBtn = document.getElementById('submitBtn');

// Si existe id en la URL, la pagina entra en modo editar.
const editId = new URLSearchParams(window.location.search).get('id');

// Muestra una alerta temporal al usuario.
function showAlert(message, type = 'success') {
	alertBox.textContent = message;
	alertBox.className = `alert alert-${type}`;

	window.clearTimeout(showAlert.timeoutId);
	showAlert.timeoutId = window.setTimeout(() => {
		alertBox.classList.add('d-none');
	}, 2500);
}

// Valida campos obligatorios y formato de telefono/email.
function validateInputs(nombre, telefono, email) {
	if (!nombre || !telefono || !email) {
		throw new Error('Completa todos los campos obligatorios.');
	}

	if (!/^\+?\d+$/.test(telefono)) {
		throw new Error('El telefono debe contener solo numeros y puede iniciar con + (ejemplo: +52, +1).');
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error('Ingresa un email valido.');
	}

	if(!/^[\abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@]+$/.test(nombre)) {
		throw new Error('El nombre no debe contener caracteres especiales o numeros.');
	}

}

// Envia peticion POST para crear un contacto.
function createContact(payload) {
	return fetch(API_BASE, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	}).then((response) =>
		response.json().catch(() => ({})).then((json) => {
			if (!response.ok) {
				throw new Error(json.message || 'No se pudo crear el contacto.');
			}

			return json;
		})
	);
}

// Consulta un contacto por id.
function getContactById(id) {
	return fetch(`${API_BASE}/${id}`, {
		headers: { 'Content-Type': 'application/json' }
	}).then((response) =>
		response.json().catch(() => ({})).then((json) => {
			if (!response.ok) {
				throw new Error(json.message || 'No se pudo obtener el contacto.');
			}

			return json.data;
		})
	);
}

// Envia peticion PUT para actualizar un contacto.
function updateContact(id, payload) {
	return fetch(`${API_BASE}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	}).then((response) =>
		response.json().catch(() => ({})).then((json) => {
			if (!response.ok) {
				throw new Error(json.message || 'No se pudo actualizar el contacto.');
			}

			return json;
		})
	);
}

// Si hay id en la URL, carga datos y ajusta textos de la pagina.
function initEditMode() {
	if (!editId) return;

	getContactById(editId)
		.then((contacto) => {
			document.getElementById('nombre').value = contacto.nombre || '';
			document.getElementById('telefono').value = contacto.telefono || '';
			document.getElementById('email').value = contacto.email || '';

			pageTitle.textContent = 'Editar Contacto';
			submitBtn.textContent = 'Actualizar contacto';
		})
		.catch((error) => {
			showAlert(error.message, 'danger');
		});
}

// Maneja el envio del formulario para crear o actualizar.
form.addEventListener('submit', (event) => {
	event.preventDefault();

	const nombre = document.getElementById('nombre').value.trim();
	const telefono = document.getElementById('telefono').value.trim();
	const email = document.getElementById('email').value.trim();

	try {
		validateInputs(nombre, telefono, email);

		// Si hay id, actualiza el contacto existente.
		if (editId) {
			updateContact(editId, { nombre, telefono, email })
				.then(() => {
					showAlert('Contacto actualizado correctamente.');
					window.setTimeout(() => {
						window.location.href = 'index.html';
					}, 700);
				})
				.catch((error) => {
					showAlert(error.message, 'danger');
				});
			return;
		}

		// Si no hay id, crea un contacto nuevo.
		createContact({ nombre, telefono, email })
			.then(() => {
				showAlert('Contacto registrado correctamente.');
				form.reset();
			})
			.catch((error) => {
				showAlert(error.message, 'danger');
			});
	} catch (error) {
		showAlert(error.message, 'danger');
	}
});

// Inicializa la pagina al cargar.
initEditMode();
