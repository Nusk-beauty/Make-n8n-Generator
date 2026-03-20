document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const sectionTitle = document.getElementById('section-title');
    const modal = document.getElementById('modal');
    const generateBtn = document.getElementById('generate-btn');
    const closeModal = document.getElementById('close-modal');
    const aiGenerateConfirm = document.getElementById('ai-generate-confirm');
    const aiPrompt = document.getElementById('ai-prompt');

    // Niche selection logic
    const chips = document.querySelectorAll('.chip');
    let selectedNiche = 'Skincare'; // Default based on initial UI

    chips.forEach(chip => {
        if (chip.innerText.includes('+')) return;
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedNiche = chip.innerText;
        });
    });

    // Navigation logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(sectionId).classList.add('active');

            sectionTitle.innerText = item.innerText.split(' ').slice(1).join(' ');
        });
    });

    // Placeholder actions
    const linkBtn = document.querySelector('.btn-secondary');
    if (linkBtn && linkBtn.innerText.includes('Vincular')) {
        linkBtn.addEventListener('click', () => {
            alert('Integración con Pinterest API v5 próximamente. Por ahora usa el generador manual.');
        });
    }

    const automationBtn = document.querySelector('#automation .btn-primary');
    if (automationBtn) {
        automationBtn.addEventListener('click', () => {
            alert('Automatización iniciada. Conectando con Google Sheets...');
            setTimeout(() => {
                alert('¡Configurado! Los pines generados se enviarán a tu hoja de cálculo vinculada.');
            }, 1000);
        });
    }

    // Modal logic
    generateBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    aiGenerateConfirm.addEventListener('click', async () => {
        const promptValue = aiPrompt.value;
        if (!promptValue.trim()) {
            alert('Por favor, describe qué quieres generar.');
            return;
        }

        aiGenerateConfirm.innerText = 'Generando...';
        aiGenerateConfirm.disabled = true;

        try {
            const response = await fetch('/api/pinterest/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: promptValue,
                    niche: selectedNiche
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Intentar limpiar el resultado si viene envuelto en markdown
            let cleanResult = data.result;
            if (cleanResult.includes('```json')) {
                cleanResult = cleanResult.split('```json')[1].split('```')[0].trim();
            } else if (cleanResult.includes('```')) {
                cleanResult = cleanResult.split('```')[1].split('```')[0].trim();
            }

            console.log('AI Result:', cleanResult);

            try {
                const parsed = JSON.parse(cleanResult);
                // Si parsea bien, lo guardamos formateado
                navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
                alert('¡Éxito! Se han generado los pines y se han copiado al portapapeles en formato JSON listo para tu automatización.');
            } catch (e) {
                // Si no parsea, guardamos el texto plano
                navigator.clipboard.writeText(data.result);
                alert('Contenido generado y copiado al portapapeles.');
            }

            modal.classList.add('hidden');

        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar contenido: ' + error.message);
        } finally {
            aiGenerateConfirm.innerText = 'Generar con Gemini';
            aiGenerateConfirm.disabled = false;
        }
    });

    // Chart initialization
    const ctx = document.getElementById('growthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
            datasets: [{
                label: 'Vistas Mensuales',
                data: [85000, 95000, 110000, 124500],
                borderColor: '#e60023',
                backgroundColor: 'rgba(230, 0, 35, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
});
