// =================================================================
// PepFit Pro - Frontend Logic
// =================================================================

const API_BASE = localStorage.getItem('pepcoach_api_base') || 'http://localhost:4000';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// --- Auth State & UI ---
const authPanel = $('#auth');
const mainPanel = $('main.container');
const logoutButton = $('#btnLogout');

function showAuthScreen() {
    authPanel.classList.remove('hidden');
    mainPanel.classList.add('hidden');
    logoutButton.style.display = 'none';
}

function showAppScreen() {
    authPanel.classList.add('hidden');
    mainPanel.classList.remove('hidden');
    logoutButton.style.display = 'block';
    initializeApp();
}

// --- API Helpers ---
const api = {
    async post(endpoint, body) {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('pepcoach_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'API Error');
        }
        return res.json();
    },
    async get(endpoint) {
        const headers = {};
        const token = localStorage.getItem('pepcoach_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE}${endpoint}`, { headers });
         if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'API Error');
        }
        return res.json();
    }
};


// --- Auth Event Listeners ---
$('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = $('#email').value;
        const password = $('#password').value;
        const data = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('pepcoach_token', data.token);
        showAppScreen();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

$('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = $('#regEmail').value;
        const password = $('#regPassword').value;
        await api.post('/api/auth/register', { email, password });
        alert('Registration successful! Please log in.');
        $('#loginForm').classList.remove('hidden');
        $('#registerForm').classList.add('hidden');
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

$('#btnLogout').addEventListener('click', () => {
    localStorage.removeItem('pepcoach_token');
    showAuthScreen();
    // Clear sensitive data on logout
    $('#listaClientes').innerHTML = '';
    $('#detalleCliente').innerHTML = 'Selecciona un cliente para ver detalles.';
});

$('#btnShowRegister').addEventListener('click', () => {
    $('#loginForm').classList.add('hidden');
    $('#registerForm').classList.remove('hidden');
});

$('#btnShowLogin').addEventListener('click', () => {
    $('#loginForm').classList.remove('hidden');
    $('#registerForm').classList.add('hidden');
});


// =================================================================
// Main Application Logic (runs after login)
// =================================================================

function initializeApp() {
    /* Navegación */
    $$('button[data-tab]').forEach(b => b.addEventListener('click', () => {
        $$('section.panel').forEach(s => s.classList.add('hidden'));
        document.getElementById(b.dataset.tab).classList.remove('hidden');
        $$('button[data-tab]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
    }));

    /* Clientes */
    async function loadClientes() {
        const list = await api.get('/api/clientes');
        const ul = $('#listaClientes');
        ul.innerHTML = ''; // Clear previous list safely
        list.forEach(c => {
            const li = document.createElement('li');
            li.textContent = `${c.nombre} — ${c.email || ''}`;
            li.addEventListener('click', () => showDetalle(c));
            ul.appendChild(li);
        });

        const sel = $('#selCliente');
        if (sel) {
            sel.innerHTML = ''; // Clear previous options safely
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "— selecciona —";
            sel.appendChild(defaultOption);
            list.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.nombre;
                sel.appendChild(option);
            });
        }
    }

    function showDetalle(c) {
        const container = $('#detalleCliente');
        container.innerHTML = ''; // Clear previous content safely

        const h3 = document.createElement('h3');
        h3.textContent = c.nombre;
        container.appendChild(h3);

        const emailDiv = document.createElement('div');
        const emailStrong = document.createElement('strong');
        emailStrong.textContent = 'Email ';
        emailDiv.appendChild(emailStrong);
        emailDiv.appendChild(document.createTextNode(c.email || '—'));
        container.appendChild(emailDiv);

        const objetivoDiv = document.createElement('div');
        const objetivoStrong = document.createElement('strong');
        objetivoStrong.textContent = 'Objetivo ';
        objetivoDiv.appendChild(objetivoStrong);
        objetivoDiv.appendChild(document.createTextNode(c.objetivo || '—'));
        container.appendChild(objetivoDiv);

        const notasDiv = document.createElement('div');
        const notasStrong = document.createElement('strong');
        notasStrong.textContent = 'Notas';
        notasDiv.appendChild(notasStrong);
        const notasTextarea = document.createElement('textarea');
        notasTextarea.id = 'notas';
        notasTextarea.textContent = c.notas || '';
        notasDiv.appendChild(notasTextarea);
        container.appendChild(notasDiv);

        const saveBtnDiv = document.createElement('div');
        saveBtnDiv.style.marginTop = '8px';
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveNotas';
        saveBtn.className = 'btn';
        saveBtn.textContent = 'Guardar notas';
        saveBtn.addEventListener('click', async () => {
            const notas = notasTextarea.value;
            await api.post('/api/clientes', { ...c, notas });
            alert('Notas guardadas (se añaden como nueva fila en Sheets).');
            loadClientes();
        });
        saveBtnDiv.appendChild(saveBtn);
        container.appendChild(saveBtnDiv);

        const calcBtnDiv = document.createElement('div');
        calcBtnDiv.style.marginTop = '12px';
        const calcBtn = document.createElement('button');
        calcBtn.id = 'btnCalc';
        calcBtn.className = 'btn primary';
        calcBtn.textContent = 'Calcular grasa corporal';
        calcBtn.addEventListener('click', async () => {
            const cintura = prompt('Medida cintura (cm)');
            const cuello = prompt('Medida cuello (cm)');
            const altura = prompt('Altura (cm)');
            const cObj = {
                sexo: c.sexo || 'Masculino',
                cintura: Number(cintura),
                cuello: Number(cuello),
                altura: Number(altura),
                cadera: 0
            };
            if (cObj.sexo === 'Femenino') cObj.cadera = Number(prompt('Medida cadera (cm)'));

            const d = await api.post('/api/extra/calcFat', cObj);
            $('#calcResult').textContent = 'Grasa estimada: ' + d.bodyFat + ' %';
        });
        calcBtnDiv.appendChild(calcBtn);
        container.appendChild(calcBtnDiv);

        const calcResultDiv = document.createElement('div');
        calcResultDiv.id = 'calcResult';
        calcResultDiv.style.marginTop = '12px';
        container.appendChild(calcResultDiv);
    }

    /* Generador de plan */
    $('#btnGenerarPlan')?.addEventListener('click', async () => {
        const clienteId = $('#selCliente')?.value;
        if (!clienteId) return alert('Selecciona cliente');
        const clientes = await api.get('/api/clientes');
        const cliente = clientes.find(x => x.id === clienteId);
        const dias = Number($('#selDuracion').value);
        const enfoque = $('#selEnfoque').value;

        const data = await api.post(`/api/planes/${clienteId}`, { cliente, dias, enfoque, enviarEmail: false });
        const plan = data.plan;
        $('#planRender').textContent = JSON.stringify(plan, null, 2);
        window.lastPlan = { cliente, plan };
    });

    /* Generar PDF y enviar */
    $('#btnGenerarPdf')?.addEventListener('click', async () => {
        if (!window.lastPlan) return alert('Genera un plan primero');
        const { cliente, plan } = window.lastPlan;
        const chartsBase64 = null;

        const r = await api.post('/api/report/send', { cliente, plan, chartsBase64 });
        if (r.ok) alert('Informe enviado por correo');
        else alert('Error al enviar informe');
    });

    /* Chat IA */
    $('#chatForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = $('#chatInput').value.trim();
        if (!q) return;
        $('#chatInput').value = '';
        const log = $('#chatLog');

        const userMsgDiv = document.createElement('div');
        userMsgDiv.style.cssText = "background:#e9f2ff;padding:8px;border-radius:8px;margin:6px";
        const userStrong = document.createElement('strong');
        userStrong.textContent = "Tú: ";
        userMsgDiv.appendChild(userStrong);
        userMsgDiv.appendChild(document.createTextNode(q));
        log.appendChild(userMsgDiv);

        const j = await api.post('/api/gemini', { prompt: q });

        const agentMsgDiv = document.createElement('div');
        agentMsgDiv.style.cssText = "background:#fff;padding:8px;border-radius:8px;margin:6px";
        const agentStrong = document.createElement('strong');
        agentStrong.textContent = "Agente: ";
        agentMsgDiv.appendChild(agentStrong);
        agentMsgDiv.appendChild(document.createTextNode(j.result));
        log.appendChild(agentMsgDiv);

        log.scrollTop = log.scrollHeight;
    });

    /* Init app data */
    loadClientes();
}


// --- Initial Page Load ---
function checkAuth() {
    const token = localStorage.getItem('pepcoach_token');
    // For a real app, you would also verify the token with the backend here
    if (token) {
        showAppScreen();
    } else {
        showAuthScreen();
    }
}

checkAuth();
