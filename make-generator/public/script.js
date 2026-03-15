document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    const loader = document.getElementById('loader');
    const copyBtn = document.getElementById('copyBtn');

    let activeTab = 'natural';

    window.setPrompt = (type) => {
        const textarea = document.getElementById('prompt');
        if (type === 'Pinterest Skincare') {
            textarea.value = "Crea un sistema de Pinterest Skincare nivel 'Professional Creator'. Escenario 1: Gemini genera ideas y prompts. Escenario 2: Usa Google Slides como plantilla (templates en Drive) para poner texto sobre las imágenes de Pollinations.ai, descarga el resultado y publícalo usando el módulo nativo de Pinterest de Make. Optimiza para menos de 1000 operaciones al mes.";
        } else if (type === 'Auto-responder Gmail') {
            textarea.value = "Cuando llegue un correo a Gmail, usa la IA para clasificarlo. Si es una duda técnica, responde educadamente y guarda el contacto en una hoja de Google Sheets. Si es spam, bórralo.";
        } else if (type === 'Notificador Stocks') {
            textarea.value = "Cada mañana a las 9:00, consulta el precio de las acciones de Apple y Tesla. Si han subido más de un 2%, envíame un mensaje por Telegram con un resumen.";
        }
    };

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');
            document.getElementById(activeTab).classList.add('active');
        });
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const code = document.getElementById('blueprint').innerText;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = '¡Copiado!';
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        });
    });

    generateBtn.addEventListener('click', async () => {
        const promptValue = document.getElementById('prompt').value;
        const n8nJsonValue = document.getElementById('n8nJson').value;
        const experience = document.getElementById('experience').value;

        const input = activeTab === 'natural' ? promptValue : n8nJsonValue;

        if (!input.trim()) {
            alert('Por favor, ingresa una descripción o un JSON de n8n.');
            return;
        }

        loader.classList.remove('hidden');
        resultSection.classList.add('hidden');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: activeTab,
                    input: input,
                    experience: experience
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Parse response - expecting a JSON structure from the AI if possible,
            // or we'll handle markdown parsing here.
            // Let's assume the AI returns a structured object or a formatted string.

            displayResult(data.result);

        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al generar la automatización: ' + error.message);
        } finally {
            loader.classList.add('hidden');
        }
    });

    function displayResult(resultText) {
        // The AI will be instructed to provide a specific format.
        // We'll use simple delimiters to split the response parts.

        const strategyMatch = resultText.match(/\[STRATEGY\]([\s\S]*?)\[\/STRATEGY\]/);
        const blueprintMatch = resultText.match(/\[BLUEPRINT\]([\s\S]*?)\[\/BLUEPRINT\]/);
        const explanationMatch = resultText.match(/\[EXPLANATION\]([\s\S]*?)\[\/EXPLANATION\]/);

        if (strategyMatch && blueprintMatch && explanationMatch) {
            document.getElementById('explanation').innerHTML = marked.parse(strategyMatch[1].trim());
            document.getElementById('blueprint').innerText = blueprintMatch[1].trim();
            document.getElementById('stepByStep').innerHTML = marked.parse(explanationMatch[1].trim());
        } else {
            // Fallback if formatting fails
            document.getElementById('explanation').innerHTML = marked.parse(resultText);
            document.getElementById('blueprint').innerText = "// Blueprint no encontrado en formato estándar";
            document.getElementById('stepByStep').innerHTML = "";
        }

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
});
