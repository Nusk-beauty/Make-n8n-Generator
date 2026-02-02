# Despliegue en Vercel - KDP Storybook Creator

Esta versión está optimizada al máximo para Vercel. Sigue estos pasos:

1. **Subir a GitHub**: Asegúrate de que los cambios estén en tu repositorio de GitHub.
2. **Crear nuevo proyecto en Vercel**:
   - Ve a [Vercel](https://vercel.com).
   - Haz clic en **"Add New"** > **"Project"**.
   - Importa tu repositorio.
3. **Configurar el proyecto**:
   - **Root Directory**: **¡IMPORTANTE!** Selecciona la carpeta `kdp-storybook-creator`.
   - **Framework Preset**: Déjalo en `Other`.
4. **Variables de Entorno**:
   - En la sección **Environment Variables**, añade:
     - `GEMINI_API_KEY`: Tu clave de API de Google Gemini (Google AI Studio).
5. **Desplegar**: Haz clic en **"Deploy"**.

**Estructura Técnica**:
- El frontend está en la raíz (`index.html`, `style.css`, `script.js`).
- El backend está en `api/generate.js` (Serverless Function).
- Vercel servirá automáticamente el frontend en `/` y el backend en `/api/generate`.
