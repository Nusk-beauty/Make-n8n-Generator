document.getElementById('storybook-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        tipoLibro: document.getElementById('tipoLibro').value,
        edad: document.getElementById('edad').value,
        tema: document.getElementById('tema').value,
        valorEducativo: document.getElementById('valorEducativo').value,
        numPaginas: document.getElementById('numPaginas').value,
        tamano: document.getElementById('tamano').value,
        idioma: document.getElementById('idioma').value,
        formatoTexto: document.getElementById('formatoTexto').value,
        estiloVisual: document.getElementById('estiloVisual').value,
        formatoNarrativo: document.getElementById('formatoNarrativo').value
    };

    const submitBtn = document.getElementById('submit-btn');
    const loading = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    const formSection = document.getElementById('form-section');

    // Show loading
    submitBtn.disabled = true;
    formSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    loading.classList.remove('hidden');
    resultContent.textContent = '';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        resultContent.textContent = data.result;
    } catch (err) {
        resultContent.textContent = 'Error: ' + err.message;
        console.error(err);
    } finally {
        loading.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('form-section').classList.remove('hidden');
    document.getElementById('result-section').classList.add('hidden');
});

document.getElementById('copy-btn').addEventListener('click', () => {
    const text = document.getElementById('result-content').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Contenido copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar: ', err);
        // Fallback para entornos donde navigator.clipboard no está disponible
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert('Contenido copiado (fallback)');
    });
});
