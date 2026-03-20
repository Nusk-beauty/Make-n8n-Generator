const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
// Solo sirve estáticos en local. En Vercel, se encarga vercel.json
if (process.env.NODE_ENV !== 'production') {
    app.use('/pinterest', express.static(path.join(__dirname, '../public/pinterest')));
    app.use(express.static(path.join(__dirname, '../public')));
}

const SYSTEM_PROMPT = `Actúa como un Experto en Marketing de Pinterest. Tu objetivo es generar contenido viral (títulos, descripciones, hashtags) y prompts estéticos para imágenes de alta calidad adaptados al nicho solicitado.

REGLAS DE ORO:
1. SEO PINTEREST: Usa palabras clave virales en títulos y descripciones específicas del nicho.
2. ESTÉTICA PREMIUM: Genera prompts visuales detallados para Pollinations.ai (ej: "minimalist product photography, luxury aesthetic, cinematic lighting").
3. ENFOQUE EN CONVERSIÓN: Cada pin debe tener un Hook (gancho visual corto) potente que incite al click.
4. ESTRATEGIA AUTOMATIZADA: El formato debe ser JSON puro para integrarse con Google Sheets y Make.com.

FORMATO DE RESPUESTA REQUERIDO (JSON PURO):
{
  "pins": [
    {
      "hook": "Texto corto para el diseño del pin",
      "titulo": "Título SEO (Max 100 caracteres)",
      "descripcion": "Descripción optimizada con 3-5 #hashtags",
      "tablero": "Nombre del Tablero recomendado",
      "prompt_imagen": "Prompt artístico para Pollinations.ai",
      "alt_text": "Texto alternativo para accesibilidad"
    }
  ]
}`;

app.post('/api/pinterest/generate', async (req, res) => {
  const { input, niche } = req.body;

  const contextNiche = niche || "General / Lifestyle";

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const body = {
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nNICHO OBJETIVO: ${contextNiche}\n\nREQUERIMIENTO DEL USUARIO:\n${input}`
        }]
      }]
    };

    const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('La IA no devolvió contenido.');
    }

    res.json({ result: resultText });

  } catch (err) {
    console.error('Error en generate:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al procesar con la IA: ' + (err.response?.data?.error?.message || err.message) });
  }
});

// For local testing if not running as serverless
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001; // Port 3001 to not conflict with make-generator
    app.listen(PORT, () => console.log(`Pinterest Backend running on port ${PORT}`));
}

module.exports = app;
