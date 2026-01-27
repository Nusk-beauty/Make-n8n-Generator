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
    resultContent.innerHTML = '';

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

        renderBook(data.result);
    } catch (err) {
        resultContent.textContent = 'Error: ' + err.message;
        console.error(err);
    } finally {
        loading.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

function renderBook(book) {
    const container = document.getElementById('result-content');
    container.innerHTML = '';

    // Portada
    const portadaHtml = `
        <div class="book-page cover-page">
            <h3>Portada y Contraportada</h3>
            <div class="image-container">
                <img src="${book.portada.urlImagen}" alt="Portada" loading="lazy">
            </div>
            <div class="text-content">
                <p><strong>Título:</strong> ${book.portada.titulo}</p>
                <p><strong>Subtítulo:</strong> ${book.portada.subtitulo || 'N/A'}</p>
                <p><strong>Contraportada:</strong> ${book.portada.textoContraportada}</p>
                <p class="prompt-text"><strong>Prompt:</strong> ${book.portada.promptImagen}</p>
            </div>
        </div>
    `;
    container.innerHTML += portadaHtml;

    // Interior
    book.interior.forEach(page => {
        const pageHtml = `
            <div class="book-page">
                <h3>Página ${page.pagina}</h3>
                <div class="image-container">
                    <img src="${page.urlImagen}" alt="Página ${page.pagina}" loading="lazy">
                </div>
                <div class="text-content">
                    <p class="narrative-text">${page.texto.replace(/\n/g, '<br>')}</p>
                    <p class="prompt-text"><strong>Prompt:</strong> ${page.promptImagen}</p>
                </div>
            </div>
        `;
        container.innerHTML += pageHtml;
    });

    // SEO y Medidas
    const footerHtml = `
        <div class="book-info">
            <h3>SEO Amazon KDP</h3>
            <p><strong>Títulos Sugeridos:</strong> ${book.seo.titulos.join(', ')}</p>
            <p><strong>Descripción:</strong> ${book.seo.descripcion}</p>
            <p><strong>Keywords:</strong> ${book.seo.keywords.join(', ')}</p>

            <h3>Medidas KDP</h3>
            <p><strong>Sangrado:</strong> ${book.medidasKDP.sangrado}</p>
            <p><strong>Tamaño Completo:</strong> ${book.medidasKDP.tamanoCompleto}</p>
            <p><strong>Instrucciones:</strong> ${book.medidasKDP.instrucciones}</p>
        </div>
    `;
    container.innerHTML += footerHtml;
}

document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('form-section').classList.remove('hidden');
    document.getElementById('result-section').classList.add('hidden');
});

document.getElementById('copy-btn').addEventListener('click', () => {
    // Para copiar el texto crudo, podríamos necesitar una forma de extraerlo o usar el JSON original
    const text = document.getElementById('result-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Contenido copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar: ', err);
        alert('Error al copiar el contenido');
    });
});
