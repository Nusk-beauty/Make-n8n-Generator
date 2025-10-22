// frontend/app.js (module)
const API_BASE = localStorage.getItem('pepcoach_api_base') || 'http://localhost:4000';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// --- State ---
let allClients = [];
let currentClient = null;
let lastPlan = null;

// --- Navigation ---
$$('button[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('section.panel').forEach(s => s.classList.add('hidden'));
    document.getElementById(b.dataset.tab).classList.remove('hidden');
    $$('button[data-tab]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
}));

// --- Clientes ---
async function loadClientes() {
    try {
        const res = await fetch(`${API_BASE}/api/clientes`);
        if (!res.ok) throw new Error(`Error fetching clients: ${res.statusText}`);
        allClients = await res.json();

        const ul = $('#listaClientes');
        ul.innerHTML = ''; // Clear list
        allClients.forEach(c => {
            const li = document.createElement('li');
            li.textContent = `${c.nombre} — ${c.email || ''}`;
            li.addEventListener('click', () => showDetalle(c));
            ul.appendChild(li);
        });

        const sel = $('#selCliente');
        if (sel) {
            sel.innerHTML = '<option value="">— selecciona —</option>';
            allClients.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.nombre;
                sel.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load clients:', err);
        $('#listaClientes').textContent = 'Error al cargar clientes.';
    }
}

function showDetalle(c) {
    currentClient = c;
    const container = $('#detalleCliente');
    container.innerHTML = ''; // Clear previous details

    function createDetailRow(label, value) {
        const row = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        row.appendChild(strong);
        row.appendChild(document.createTextNode(value || '—'));
        return row;
    }

    container.appendChild(createDetailRow('Email', c.email));
    container.appendChild(createDetailRow('Objetivo', c.objetivo));

    const notesLabel = document.createElement('strong');
    notesLabel.textContent = 'Notas';
    container.appendChild(notesLabel);

    const notesTextarea = document.createElement('textarea');
    notesTextarea.id = 'notas';
    notesTextarea.value = c.notas || '';
    container.appendChild(notesTextarea);

    const saveButton = document.createElement('button');
    saveButton.id = 'saveNotas';
    saveButton.className = 'btn';
    saveButton.textContent = 'Guardar notas';
    saveButton.style.marginTop = '8px';
    container.appendChild(saveButton);

    const calcButton = document.createElement('button');
    calcButton.id = 'btnCalc';
    calcButton.className = 'btn primary';
    calcButton.textContent = 'Calcular grasa corporal';
    calcButton.style.marginTop = '12px';
    container.appendChild(calcButton);

    const calcResultDiv = document.createElement('div');
    calcResultDiv.id = 'calcResult';
    calcResultDiv.style.marginTop = '12px';
    container.appendChild(calcResultDiv);

    saveButton.addEventListener('click', async () => {
        const notas = notesTextarea.value;
        try {
            const res = await fetch(`${API_BASE}/api/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...c, notas })
            });
            if (!res.ok) throw new Error('Failed to save notes');
            alert('Notas guardadas (se añaden como nueva fila en Sheets).');
            loadClientes();
        } catch (err) {
            console.error(err);
            alert('Error al guardar las notas.');
        }
    });

    calcButton.addEventListener('click', () => {
        renderFatCalcForm(c, calcResultDiv);
    });
}

function renderFatCalcForm(c, container) {
    container.innerHTML = `
        <h4>Calcular grasa corporal</h4>
        <label>Cintura (cm) <input type="number" id="cintura" required></label>
        <label>Cuello (cm) <input type="number" id="cuello" required></label>
        ${c.sexo === 'Mujer' ? '<label>Cadera (cm) <input type="number" id="cadera" required></label>' : ''}
        <button id="btnDoCalc" class="btn">Calcular</button>
    `;

    $('#btnDoCalc').addEventListener('click', async () => {
        const cObj = {
            sexo: c.sexo,
            estatura: Number(c.estatura),
            cintura: Number($('#cintura').value),
            cuello: Number($('#cuello').value),
            cadera: c.sexo === 'Mujer' ? Number($('#cadera').value) : 0
        };

        if (!cObj.cintura || !cObj.cuello || (c.sexo === 'Mujer' && !cObj.cadera)) {
            alert('Por favor, rellena todos los campos.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/extra/calcFat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cObj)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Calculation failed');
            container.innerHTML = `<strong>Grasa estimada: ${data.bodyFat} %</strong>`;
        } catch (err) {
            console.error(err);
            container.textContent = `Error al calcular: ${err.message}`;
        }
    });
}

// --- Generador de plan ---
$('#btnGenerarPlan')?.addEventListener('click', async () => {
    const clienteId = $('#selCliente')?.value;
    if (!clienteId) return alert('Selecciona cliente');

    const cliente = allClients.find(x => x.id === clienteId);
    if (!cliente) return alert('Cliente no encontrado.');

    const dias = Number($('#selDuracion').value);
    const enfoque = $('#selEnfoque').value;

    try {
        const res = await fetch(`${API_BASE}/api/planes/${clienteId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente, dias, enfoque, enviarEmail: false })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
        const plan = data.plan;
        $('#planRender').textContent = JSON.stringify(plan, null, 2);
        lastPlan = { cliente, plan }; // Store for PDF generation
    } catch (err) {
        console.error(err);
        $('#planRender').textContent = `Error al generar el plan: ${err.message}`;
    }
});

// --- Generar PDF y enviar ---
$('#btnGenerarPdf')?.addEventListener('click', async () => {
    if (!lastPlan) return alert('Genera un plan primero');
    const { cliente, plan } = lastPlan;
    const chartsBase64 = null;

    try {
        const res = await fetch(`${API_BASE}/api/report/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente, plan, chartsBase64 })
        });
        if (!res.ok) throw new Error('Failed to send report');
        const r = await res.json();
        if (r.ok) alert('Informe enviado por correo');
        else alert('Error al enviar informe');
    } catch (err) {
        console.error(err);
        alert('Error al enviar informe.');
    }
});

// --- Chat IA ---
function appendChatMessage(role, message) {
    const log = $('#chatLog');
    const msgContainer = document.createElement('div');

    const strong = document.createElement('strong');
    strong.textContent = role === 'user' ? 'Tú: ' : 'Agente: ';

    msgContainer.appendChild(strong);
    msgContainer.appendChild(document.createTextNode(message));

    log.appendChild(msgContainer);
    log.scrollTop = log.scrollHeight;
}

$('#chatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('#chatInput');
    const q = input.value.trim();
    if (!q) return;

    input.value = '';
    appendChatMessage('user', q);

    try {
        const r = await fetch(`${API_BASE}/api/gemini`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: q })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'API request failed');
        appendChatMessage('agent', j.result);
    } catch (err) {
        console.error(err);
        appendChatMessage('agent', `Lo siento, ha ocurrido un error: ${err.message}`);
    }
});

// --- Init ---
loadClientes();