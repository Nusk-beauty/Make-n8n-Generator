// frontend/app.js (module)
const API_BASE = localStorage.getItem('pepcoach_api_base') || 'http://localhost:4000';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* Navegación */
$$('button[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('section.panel').forEach(s => s.classList.add('hidden'));
    document.getElementById(b.dataset.tab).classList.remove('hidden');
    $$('button[data-tab]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
}));

/* Clientes */
async function loadClientes(){
    const res = await fetch(`${API_BASE}/api/clientes`);
    const list = await res.json();
    const ul = $('#listaClientes');
    ul.innerHTML = '';
    list.forEach(c=>{
        const li = document.createElement('li');
        li.textContent = `${c.nombre} — ${c.email || ''}`;
        li.addEventListener('click', ()=> showDetalle(c));
        ul.appendChild(li);
    });

    const sel = $('#selCliente');
    if (sel) {
        sel.innerHTML = '<option value="">— selecciona —</option>';
        list.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
    }
}

function showDetalle(c){
    const container = $('#detalleCliente');
    container.innerHTML = `
        <h3>${c.nombre}</h3>
        <div><strong>Email</strong> ${c.email || '—'}</div>
        <div><strong>Objetivo</strong> ${c.objetivo || '—'}</div>
        <div><strong>Notas</strong><textarea id="notas">${c.notas || ''}</textarea></div>
        <div style="margin-top:8px"><button id="saveNotas" class="btn">Guardar notas</button></div>
        <div style="margin-top:12px"><button id="btnCalc" class="btn primary">Calcular grasa corporal</button></div>
        <div id="calcResult" style="margin-top:12px"></div>`;

    $('#saveNotas').addEventListener('click', async ()=>{
        const notas = $('#notas').value;
        // NOTA: La API de ejemplo añade una nueva fila, no actualiza.
        // Para actualizar se necesitaría una ruta PUT /api/clientes/:id y lógica en backend.
        await fetch(`${API_BASE}/api/clientes`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({...c, notas})
        });
        alert('Notas guardadas (se añaden como nueva fila en Sheets).');
        loadClientes();
    });

    $('#btnCalc').addEventListener('click', ()=> {
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

        fetch(`${API_BASE}/api/extra/calcFat`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(cObj)
        })
        .then(r=>r.json()).then(d=> $('#calcResult').innerText = 'Grasa estimada: ' + d.bodyFat + ' %');
    });
}

/* Generador de plan */
$('#btnGenerarPlan')?.addEventListener('click', async ()=>{
    const clienteId = $('#selCliente')?.value;
    if (!clienteId) return alert('Selecciona cliente');
    const resC = await fetch(`${API_BASE}/api/clientes`);
    const clientes = await resC.json();
    const cliente = clientes.find(x=>x.id===clienteId);
    const dias = Number($('#selDuracion').value);
    const enfoque = $('#selEnfoque').value;

    const gen = await fetch(`${API_BASE}/api/planes/${clienteId}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ cliente, dias, enfoque, enviarEmail:false })
    });
    const data = await gen.json();
    const plan = data.plan;
    $('#planRender').innerText = JSON.stringify(plan, null, 2);
    window.lastPlan = { cliente, plan };
});

/* Generar PDF y enviar */
$('#btnGenerarPdf')?.addEventListener('click', async ()=>{
    if(!window.lastPlan) return alert('Genera un plan primero');
    const { cliente, plan } = window.lastPlan;
    // Aquí podrías añadir una lógica para generar un gráfico con Chart.js y pasarlo como base64
    const chartsBase64 = null;
    const qrUrl = 'https://pep.coach/portal';

    const res = await fetch(`${API_BASE}/api/report/send`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ cliente, plan, chartsBase64, qrUrl })
    });
    const r = await res.json();
    if (r.ok) alert('Informe enviado por correo');
    else alert('Error al enviar informe');
});

/* Chat IA */
$('#chatForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const q = $('#chatInput').value.trim();
    if(!q) return;
    $('#chatInput').value = '';
    const log = $('#chatLog');
    log.innerHTML += `<div style="background:#e9f2ff;padding:8px;border-radius:8px;margin:6px"><strong>Tú:</strong> ${q}</div>`;
    const r = await fetch(`${API_BASE}/api/gemini`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: q })
    });
    const j = await r.json();
    log.innerHTML += `<div style="background:#fff;padding:8px;border-radius:8px;margin:6px"><strong>Agente:</strong> ${j.result}</div>`;
    log.scrollTop = log.scrollHeight;
});

/* Init */
loadClientes();
