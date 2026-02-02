const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (only for local testing, Vercel serves from root)
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `Actúa como una IA experta editorial en creación de libros infantiles para Amazon KDP.
Tu misión es crear libros 100% listos para vender.

DEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO.
No incluyas texto fuera del JSON.

Estructura del JSON:
{
  "datosLibro": { ... },
  "tipoElegido": "...",
  "portada": {
    "titulo": "...",
    "subtitulo": "...",
    "textoContraportada": "...",
    "promptImagen": "Prompt detallado para la portada en el estilo visual solicitado"
  },
  "interior": [
    {
      "pagina": "1",
      "texto": "Párrafo 1\\nPárrafo 2",
      "promptImagen": "Prompt detallado para esta página coherente con personajes y estilo"
    },
    ...
  ],
  "seo": {
    "titulos": ["...", "...", "..."],
    "descripcion": "...",
    "keywords": ["...", "..."],
    "categorias": ["...", "..."],
    "publico": "..."
  },
  "medidasKDP": {
    "sangrado": "...",
    "tamanoCompleto": "...",
    "instrucciones": "..."
  }
}

REGLAS SEGÚN TIPO DE LIBRO:
- LIBRO PARA COLOREAR: Texto mínimo. Prompts de imagen deben especificar "Black and white, clean line art, no shading, coloring book style".
- CUENTO INCLUSIVO/ILUSTRADO: Texto narrativo. Prompts de imagen deben ser detallados y coherentes.

ESTILO VISUAL: Aplicar el estilo solicitado (3D Pixar, 3D Cartoon, Clay, etc.) en todos los prompts de imagen.`;

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
          text: `${SYSTEM_PROMPT}\n\nDATOS DEL LIBRO A GENERAR:\n${userPrompt}\n\nRECUERDA: SOLO RESPONDE CON JSON.`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });

    let resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('No se recibió respuesta de la IA');
    }

    const bookData = JSON.parse(resultText);

    // Generar URLs de imágenes usando Pollinations.ai
    // Portada
    bookData.portada.urlImagen = `https://gen.pollinations.ai/image/${encodeURIComponent(bookData.portada.promptImagen)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    // Interior
    for (let i = 0; i < bookData.interior.length; i++) {
      const page = bookData.interior[i];
      page.urlImagen = `https://gen.pollinations.ai/image/${encodeURIComponent(page.promptImagen)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    }

    res.json({ result: bookData });
  } catch (err) {
    console.error('Error in generate:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// For local testing
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KDP Storybook Backend listening on ${PORT}`);
  });
}

module.exports = app;
