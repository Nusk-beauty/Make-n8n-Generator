# Make Automation Generator

Esta aplicación convierte lenguaje natural o flujos de n8n en automatizaciones optimizadas para Make.com, enfocándose en el ahorro de operaciones y facilidad para principiantes.

## Características

- **IA Experta**: Utiliza Gemini 1.5 para diseñar flujos eficientes.
- **Estrategia Pro**: Prioriza el uso de webhooks y filtros para ahorrar operaciones.
- **Doble Entrada**: Soporta texto descriptivo o JSON de n8n.
- **Explicaciones Detalladas**: Guía paso a paso para configurar cada módulo en Make.

## Requisitos

- Node.js 18+
- Una clave de API de Google Gemini ([Google AI Studio](https://aistudio.google.com/))

## Instalación Local

1. Clona el repositorio.
2. Entra en la carpeta: `cd make-generator`
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Crea un archivo `.env` o exporta la variable:
   ```bash
   GEMINI_API_KEY=tu_clave_aqui
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
6. Abre `http://localhost:3000`.

## Despliegue en Vercel

Esta aplicación está lista para ser desplegada en Vercel como un proyecto full-stack (Frontend estático + Backend Serverless).

1. Instala la CLI de Vercel: `npm i -g vercel`
2. Desde la carpeta `make-generator`, ejecuta:
   ```bash
   vercel
   ```
3. Configura la variable de entorno `GEMINI_API_KEY` en el panel de Vercel.

### Estructura para Vercel
- `/api/generate.js`: Función principal (Node.js/Express).
- `/public/`: Contenido estático.
- `vercel.json`: Configuración de rutas y rewrites.
