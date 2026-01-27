# Despliegue en Vercel - KDP Storybook Creator

Sigue estos pasos para desplegar la aplicación en Vercel:

1. **Subir a GitHub**: Asegúrate de que los cambios estén en tu repositorio de GitHub.
2. **Crear nuevo proyecto en Vercel**:
   - Ve a [Vercel](https://vercel.com) e inicia sesión.
   - Haz clic en **"Add New"** > **"Project"**.
   - Importa tu repositorio.
3. **Configurar el proyecto**:
   - **Root Directory**: Cambia el directorio raíz a `kdp-storybook-creator`.
   - **Framework Preset**: Déjalo en `Other`.
4. **Variables de Entorno**:
   - En la sección **Environment Variables**, añade la siguiente:
     - `GEMINI_API_KEY`: Tu clave de API de Google Gemini.
5. **Desplegar**: Haz clic en **"Deploy"**.

Una vez finalizado, Vercel te proporcionará una URL pública donde la aplicación estará funcionando.
