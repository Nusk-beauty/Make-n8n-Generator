# Despliegue en Vercel - KDP Storybook Creator

Esta aplicación está estructurada para un despliegue sencillo en Vercel.

### Pasos para el Despliegue:

1. **Subir a GitHub**: Asegúrate de que tu código esté en un repositorio de GitHub.
2. **Importar en Vercel**:
   - Ve a [Vercel](https://vercel.com) y selecciona **"Create a New Project"**.
   - Importa tu repositorio.
3. **Configuración Crucial**:
   - **Root Directory**: Haz clic en **"Edit"** y selecciona la carpeta `kdp-storybook-creator`. **Esto es fundamental.**
   - Vercel detectará automáticamente la configuración de Node.js y los archivos estáticos.
4. **Variables de Entorno**:
   - Ve a la pestaña **"Environment Variables"**.
   - Añade `GEMINI_API_KEY` con tu clave de Google AI Studio.
5. **Finalizar**: Haz clic en **"Deploy"**.

### Estructura del Proyecto:
- `/api`: Contiene el backend (Serverless Functions).
- `/public`: Contiene el frontend (HTML, CSS, JS).
- `vercel.json`: Configura las rutas para que todo funcione coordinado.

¡Listo! Tu app estará disponible en la URL que te proporcione Vercel.
