// backend/src/services/gemini.js
const axios = require('axios');

async function ask(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY no configurada');

  // EJEMPLO para Google Generative; ajusta al endpoint real si cambia.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5:generateText?key=${key}`;

  try {
    const body = { prompt };
    const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    // Ajusta el parsing a la respuesta real de la API
    return res.data?.candidates?.[0]?.content || (res.data?.output || res.data);
  } catch (err) {
    console.error('Error en Gemini request:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { ask };
