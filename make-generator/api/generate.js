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
    app.use(express.static(path.join(__dirname, '../public')));
}

const SYSTEM_PROMPT = `Actúa como un Ingeniero Experto en Automatizaciones, especialista en Make.com (anteriormente Integromat) y n8n. Tu objetivo es convertir descripciones en lenguaje natural o flujos de n8n en configuraciones completas de Make.com.

REGLAS DE ORO:
1. ESTRATEGIA "FREE-TIER": Prioriza siempre la opción que consuma menos operaciones en Make.
2. EFICIENCIA: Minimiza el número de movimientos/módulos. Usa filtros en las rutas en lugar de módulos condicionales si es posible.
3. PARA PRINCIPIANTES: Usa un lenguaje claro, pero técnico donde sea necesario, explicando el "por qué" de cada elección.
4. EXPERTO EN PROBLEMAS: Resuelve errores comunes de n8n (como manejo de arrays) al pasar a Make (usando Iteradores/Agregadores si es necesario).

FORMATO DE RESPUESTA REQUERIDO:
Debes responder SIEMPRE con estas tres secciones claramente delimitadas por las etiquetas indicadas:

[STRATEGY]
(Aquí explicas la estrategia de ahorro de costes y por qué este diseño es el más eficiente en Make. Menciona si se usan Webhooks para ahorrar encuestas periódicas).
[/STRATEGY]

[BLUEPRINT]
(Aquí generas el JSON del Blueprint de Make.com. Si el flujo es complejo, asegúrate de que la estructura JSON sea válida y contenga los campos 'name', 'flow' y los módulos con sus 'mappers').
[/BLUEPRINT]

[EXPLANATION]
(Aquí explicas paso a paso cada módulo. Para cada módulo, detalla:
- Qué hace.
- Configuración recomendada de CADA opción importante.
- Cómo conectar los datos del módulo anterior (Mapping).
- Consejos para evitar fallos comunes).
[/EXPLANATION]

Si el usuario provee un JSON de n8n, analiza sus nodos y conexiones y replícalos fielmente pero optimizados para la lógica de Make.`;

app.post('/api/generate', async (req, res) => {
  const { mode, input, experience } = req.body;

  let userMessage = "";
  if (mode === 'natural') {
    userMessage = `Genera una automatización para el siguiente requerimiento: "${input}".
    Nivel de experiencia del usuario: ${experience}.`;
  } else {
    userMessage = `Convierte el siguiente flujo de n8n a Make.com, optimizándolo:
    ${input}
    Nivel de experiencia del usuario: ${experience}.`;
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const body = {
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nSOLICITUD DEL USUARIO:\n${userMessage}`
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
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app;
