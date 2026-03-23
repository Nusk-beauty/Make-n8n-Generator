const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT_VIDEO || 4000;

const SYSTEM_PROMPT = `Actúa como un director creativo experto en contenido infantil para YouTube, especializado en cuentos animados 3D con estilo moderno (tipo Pixar/Disney).

Tu misión es generar un guion completo para un video, prompts de imagen coherentes, y metadatos SEO.

1️⃣ ESTILO VISUAL (OBLIGATORIO):
Estilo: Modern 3D Cartoon, Pixar-style, vibrant colors, expressive characters, soft cinematic lighting, high detail, 8k resolution.
Los prompts deben asegurar coherencia en los personajes a lo largo de todas las escenas.

2️⃣ DATOS DE ENTRADA:
- Tema/Título: {topic}
- Público: {audience}
- Tono: {tone}
- Idioma: Español

3️⃣ FORMATO DE RESPUESTA (JSON):
Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "title": "Título del cuento",
  "story": [
    {
      "scene_number": 1,
      "text": "Texto narrado para esta escena (en español)",
      "image_prompt": "Prompt detallado en inglés para generar la imagen (Estilo 3D Pixar, describiendo personajes y entorno)"
    }
  ],
  "seo": {
    "youtube_title": "Título optimizado para YouTube",
    "description": "Descripción optimizada con emojis",
    "keywords": ["tag1", "tag2", "tag3"],
    "thumbnail_prompt": "Prompt en inglés para una miniatura impactante (3D Pixar style)"
  }
}

4️⃣ REGLAS IMPORTANTES:
- El lenguaje debe ser sencillo y cautivador para niños.
- Los prompts de imagen deben ser en INGLÉS para mejor compatibilidad con modelos de IA.
- Asegúrate de incluir descripciones físicas constantes de los personajes en cada prompt para mantener la coherencia.
- No añadidas texto introductorio, solo el JSON.`;

app.post('/api/generate_all', async (req, res) => {
  const { topic, audience, tone } = req.body;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY no configurada');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const promptText = SYSTEM_PROMPT
      .replace('{topic}', topic)
      .replace('{audience}', audience)
      .replace('{tone}', tone);

    const body = {
      contents: [{
        parts: [{
          text: promptText
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('No se recibió respuesta de la IA');
    }

    const parsedResult = JSON.parse(resultText);

    // Generate Pollinations.ai image URLs for each scene
    const storyWithImages = parsedResult.story.map(scene => {
      const encodedPrompt = encodeURIComponent(scene.image_prompt + ", 3d cartoon pixar style, high resolution");
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      return { ...scene, image_url: imageUrl };
    });

    // Generate Thumbnail URL
    const thumbnailPromptEncoded = encodeURIComponent(parsedResult.seo.thumbnail_prompt + ", 3d cartoon pixar style, cinematic, vibrant, youtube thumbnail");
    const thumbnailUrl = `https://image.pollinations.ai/prompt/${thumbnailPromptEncoded}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    res.json({
      ...parsedResult,
      story: storyWithImages,
      thumbnail_url: thumbnailUrl
    });

  } catch (err) {
    console.error('Error in generate_all:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Video Kids Creator Backend listening on ${PORT}`);
});
