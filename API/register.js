const API_BASE = 'http://localhost:3000/contactos';

const form = document.getElementById('registerForm');
const alertBox = document.getElementById('alertBox');
const pageTitle = document.getElementById('pageTitle');
const submitBtn = document.getElementById('submitBtn');

const editId = new URLSearchParams(window.location.search).get('id');

function showAlert(message, type = 'success') {
	alertBox.textContent = message;
	alertBox.className = `alert alert-${type}`;

	window.clearTimeout(showAlert.timeoutId);
	showAlert.timeoutId = window.setTimeout(() => {
		alertBox.classList.add('d-none');
	}, 2500);
}

function validateInputs(nombre, telefono, email) {
	if (!nombre || !telefono || !email) {
		throw new Error('Completa todos los campos obligatorios.');
	}

	if (!/^\d+$/.test(telefono)) {
		throw new Error('El telefono debe contener solo numeros.');
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error('Ingresa un email valido.');
	}
}

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

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const nombre = document.getElementById('nombre').value.trim();
	const telefono = document.getElementById('telefono').value.trim();
	const email = document.getElementById('email').value.trim();

	try {
		validateInputs(nombre, telefono, email);

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

initEditMode();
