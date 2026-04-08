// URL base de la API para contactos.
const API_BASE = 'http://localhost:3000/contactos';

// Elementos del DOM que se usan durante toda la pagina.
const tablaContactos = document.getElementById('tablaContactos');
const searchInput = document.getElementById('searchInput');
const sortBtn = document.getElementById('sortBtn');
const showFavBtn = document.getElementById('showFavBtn');
const alertBox = document.getElementById('alertBox');

// Estados de UI para orden y filtro por favoritos.
let sortEnabled = false;
let favoritesOnly = false;

// Muestra una alerta temporal en pantalla.
function showAlert(message, type = 'success') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;

    window.clearTimeout(showAlert.timeoutId);
    showAlert.timeoutId = window.setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 2500);
}

// Construye el query string segun busqueda/filtros activos.
function buildQueryParams() {
    const params = new URLSearchParams();
    const q = searchInput.value.trim();

    if (q) params.set('q', q);
    if (sortEnabled) params.set('sort', 'nombre');
    if (favoritesOnly) params.set('favorite', 'true');

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

// Dibuja los renglones de la tabla con los contactos recibidos.
function renderRows(contactos) {
    if (!contactos.length) {
        tablaContactos.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay contactos para mostrar.</td></tr>';
        return;
    }

    tablaContactos.innerHTML = '';

    contactos.forEach((contacto) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contacto.id}</td>
            <td>${contacto.nombre}</td>
            <td>${contacto.telefono}</td>
            <td>${contacto.email}</td>
            <td class="text-warning fs-5">${contacto.favorite ? '★' : '☆'}</td>
            <td class="d-flex flex-wrap gap-1">
                <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${contacto.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${contacto.id}">Eliminar</button>
                <button
                    class="btn btn-sm btn-outline-warning"
                    data-action="favorite"
                    data-id="${contacto.id}"
                    title="${contacto.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                    aria-label="${contacto.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                >${contacto.favorite ? '★' : '☆'}</button>
            </td>
        `;
        tablaContactos.appendChild(tr);
    });
}

// Wrapper de fetch: agrega headers y maneja errores de API.
function fetchJson(url, options = {}) {
    return fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    }).then((response) =>
        response.json().catch(() => ({})).then((json) => {
            if (!response.ok) {
                throw new Error(json.message || 'Ocurrio un error en la solicitud');
            }

            return json;
        })
    );
}

// Pide contactos a la API y actualiza la tabla.
function mostrarContactos() {
    return fetchJson(`${API_BASE}${buildQueryParams()}`)
        .then((data) => {
            renderRows(data.data || []);
        })
        .catch((error) => {
            showAlert(error.message, 'danger');
        });
}

// Obtiene un contacto individual por id.
function obtenerContacto(id) {
    return fetchJson(`${API_BASE}/${id}`).then((data) => data.data);
}

// Elimina un contacto y refresca la lista.
function eliminarContacto(id) {
    return fetchJson(`${API_BASE}/${id}`, { method: 'DELETE' })
        .then((data) => {
            showAlert(data.message, 'warning');
            return mostrarContactos();
        })
        .catch((error) => {
            showAlert(error.message, 'danger');
        });
}

// Navega al formulario de edicion con el id en query string.
function editarContacto(id) {
    window.location.href = `register.html?id=${encodeURIComponent(id)}`;
}

// Invierte el estado de favorito y guarda el cambio en API.
function alternarFavorito(id) {
    return obtenerContacto(id)
        .then((contacto) => {
            const payload = {
                nombre: contacto.nombre,
                telefono: contacto.telefono,
                email: contacto.email,
                favorite: !contacto.favorite
            };

            return fetchJson(`${API_BASE}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        })
        .then(() => mostrarContactos())
        .catch((error) => {
            showAlert(error.message, 'danger');
        });
}

// Busca en tiempo real al escribir.
searchInput.addEventListener('input', mostrarContactos);

// Activa/desactiva orden alfabetico.
sortBtn.addEventListener('click', () => {
    sortEnabled = !sortEnabled;
    sortBtn.textContent = sortEnabled ? 'Orden A-Z activo' : 'Ordenar A-Z';
    mostrarContactos();
});

// Activa/desactiva filtro de solo favoritos.
showFavBtn.addEventListener('click', () => {
    favoritesOnly = !favoritesOnly;
    showFavBtn.textContent = favoritesOnly ? 'Mostrando favoritos' : 'Solo favoritos';
    mostrarContactos();
});

// Maneja clics de botones dinamicos dentro de la tabla.
tablaContactos.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;
    if (!id) return;

    if (action === 'delete') {
        eliminarContacto(id);
        return;
    }

    if (action === 'edit') {
        editarContacto(id);
        return;
    }

    if (action === 'favorite') {
        alternarFavorito(id);
    }
});

// Carga inicial de datos al abrir la pagina.
mostrarContactos();