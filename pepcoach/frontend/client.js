// frontend/client.js

const API_BASE = localStorage.getItem('pepcoach_api_base') || 'http://localhost:4000';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* Navegación de pestañas */
$$('button[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('section.panel').forEach(s => s.classList.add('hidden'));
    document.getElementById(b.dataset.tab).classList.remove('hidden');
    $$('button[data-tab]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
}));

/* Cargar datos del cliente */
async function loadClientData() {
    // Por ahora, usaremos un ID de cliente harcodeado para pruebas.
    // En una aplicación real, el ID del cliente vendría de la URL o de una sesión de login.
    const clientId = 'a_fake_client_id';

    // **WORKAROUND:** El backend no se está iniciando correctamente.
    // Usaremos un objeto de cliente harcodeado para poder seguir desarrollando el frontend.
    const client = {
        id: 'a_fake_client_id',
        nombre: 'Cliente de Prueba',
        email: 'test@example.com',
        objetivo: 'Pérdida de grasa',
    };

    // const response = await fetch(`${API_BASE}/api/clientes/${clientId}`);
    // const client = await response.json();

    if (client) {
        $('#objetivoPrincipal').textContent = client.objetivo || 'No definido';
        // Lógica para cargar rutina y menú...
        // Por ahora, solo mostramos el objetivo.
    }
}

/* Enviar feedback */
$('#enviarFeedback')?.addEventListener('click', async () => {
    const feedback = $('#feedbackDiario').value.trim();
    if (!feedback) return alert('Por favor, escribe tu feedback.');

    // TODO: Enviar feedback al backend. Necesitaremos un nuevo endpoint para esto.

    alert('Feedback enviado. ¡Gracias!');
    $('#feedbackDiario').value = '';
});


// Init
loadClientData();
