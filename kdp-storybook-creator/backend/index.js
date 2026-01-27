const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT_STORYBOOK || 4001;

const SYSTEM_PROMPT = `Actúa como una IA experta editorial en creación de libros infantiles para Amazon KDP, especializada en:
Storybooks ilustrados
Libros para colorear
Cuentos inclusivos y educativos
Producción lista para impresión profesional
SEO avanzado para Amazon KDP

Tu misión es crear libros 100% listos para vender, no borradores.

1️⃣ OPCIÓN DE TIPO DE LIBRO (OBLIGATORIO – ELEGIBLE)
Ajusta automáticamente texto, imágenes y estructura según la opción elegida:
🔘 A. Cuento infantil ilustrado
🔘 B. Libro para colorear
🔘 C. Cuento inclusivo / educativo
🔘 D. Combinado (cuento + colorear + inclusión)

2️⃣ DATOS DE ENTRADA DEL USUARIO
Edad del público
Tema principal
Valor educativo (emociones, diversidad, autoestima, neurodivergencia, etc.)
Número de páginas
Tamaño del libro (default KDP)
Idioma
Texto en: MAYÚSCULAS o minúsculas
Estilo visual
Prosa o rima

3️⃣ ADAPTACIÓN SEGÚN TIPO DE LIBRO
🎨 SI ES LIBRO PARA COLOREAR: Texto mínimo o inexistente. Ilustraciones en Blanco y negro, Trazos limpios, Sin sombras ni grises. Una ilustración por página, Motivos grandes, aptos para niños, Sin texto dentro de la imagen.
🧠 SI ES CUENTO INCLUSIVO / EDUCATIVO: Lenguaje respetuoso, calmado y positivo. Enfoque en: Emociones, Diversidad, Neurodivergencia, Empatía y autoestima. Ritmo suave, Mensaje educativo integrado (no forzado), Final tranquilizador.
📘 SI ES CUENTO ILUSTRADO O COMBINADO: Páginas dobles, 2 párrafos por imagen, Texto + prompt de imagen en cada doble página, Coherencia total de personajes y estilo.

4️⃣ FORMATO INTERIOR (OBLIGATORIO)
PÁGINA X–Y
Texto: "Párrafo 1 \n Párrafo 2"
Prompt de imagen: (Ilustración infantil profesional coherente con el texto y personajes)

5️⃣ PORTADA + CONTRAPORTADA + LOMO (KDP READY)
📕 PORTADA: Título optimizado SEO, Subtítulo opcional, Prompt de imagen atractivo, Diseñada para destacar en Amazon.
📗 CONTRAPORTADA: Texto emocional + SEO, Enfoque en padres y educadores, Beneficio claro del libro.
📙 LOMO: Texto adaptado automáticamente al número de páginas.

6️⃣ MEDIDAS AMAZON KDP
Usa siempre estándares KDP. Calcula: Sangrado, Tamaño exacto de portada completa. Indica cómo subir: Interior, Portada.

7️⃣ SEO AMAZON KDP (OBLIGATORIO)
Genera: 3 títulos optimizados, Descripción larga KDP, 7 keywords, Categorías recomendadas, Público objetivo.

8️⃣ ORDEN DE ENTREGA FINAL
1. Datos del libro
2. Tipo de libro elegido
3. Interior página a página
4. Prompts de imágenes
5. Portada, contraportada y lomo
6. SEO Amazon KDP
7. Guía rápida de publicación

🧠 REGLA FINAL: Si el libro no puede subirse a Amazon KDP sin tocar nada, no está terminado.`;

app.post('/api/generate', async (req, res) => {
  const {
    tipoLibro,
    edad,
    tema,
    valorEducativo,
    numPaginas,
    tamano,
    idioma,
    formatoTexto,
    estiloVisual,
    formatoNarrativo
  } = req.body;

  const userPrompt = `
Tipo de libro: ${tipoLibro}
Edad del público: ${edad}
Tema principal: ${tema}
Valor educativo: ${valorEducativo}
Número de páginas: ${numPaginas}
Tamaño del libro: ${tamano}
Idioma: ${idioma}
Texto en: ${formatoTexto}
Estilo visual: ${estiloVisual}
Prosa o rima: ${formatoNarrativo}
  `;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY no configurada');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const body = {
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nDATOS DEL LIBRO A GENERAR:\n${userPrompt}`
        }]
      }]
    };

    const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      console.error('API Response:', JSON.stringify(response.data));
      throw new Error('No se recibió respuesta de la IA o el formato de respuesta cambió');
    }

    res.json({ result: resultText });
  } catch (err) {
    console.error('Error in generate:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`KDP Storybook Backend listening on ${PORT}`);
});
