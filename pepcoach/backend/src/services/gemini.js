// backend/src/services/gemini.js
const axios = require('axios');

async function ask(prompt) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY no configurada');

    // Updated to use the correct Gemini API endpoint and request format
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`;

    try {
        const body = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };
        
        const res = await axios.post(url, body, { 
            headers: { 'Content-Type': 'application/json' } 
        });
        
        // Parse the response according to the actual Gemini API format
        const candidates = res.data?.candidates;
        if (candidates && candidates.length > 0) {
            const content = candidates[0].content;
            if (content && content.parts && content.parts.length > 0) {
                return content.parts[0].text;
            }
        }
        
        // Fallback for unexpected response format
        return "Lo siento, no pude procesar tu solicitud correctamente.";
    } catch (err) {
        console.error('Error en Gemini request:', err.response?.data || err.message);
        
        // Return a user-friendly error message instead of throwing
        if (err.response?.status === 401) {
            return "Error de autenticación con la API de Gemini. Verifica tu clave API.";
        } else if (err.response?.status === 400) {
            return "Solicitud inválida a la API de Gemini.";
        }
        
        return "Error temporal del servicio. Inténtalo de nuevo más tarde.";
    }
}

module.exports = { ask };
