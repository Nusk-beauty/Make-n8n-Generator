# PepCoach — PepFit Pro (Full stack)

Proyecto listo para usar como base en Bolt.new / Lovable o desplegar localmente.

## Qué incluye

*   **Backend Node/Express** con:
    *   Google Sheets CRM (service account)
    *   Generador de plan (algoritmo)
    *   Generación de informe PDF con Puppeteer
    *   Envío por SendGrid
    *   Proxy a Gemini (Generative API)
*   **Frontend SPA**: panel de clientes, generador de planes, gráficas y chat IA
*   **Dockerfiles** y `docker-compose` para levantar todo

## Requisitos

*   Node 18+
*   npm
*   (Opcional) Docker y Docker Compose
*   Cuenta SendGrid (verifica remitente)
*   Google Cloud: Service Account + habilitar Google Sheets API
*   API Key para Gemini / Generative Language

## Setup rápido local (sin Docker)

1.  Copia `.env.example` a `backend/.env` y rellena valores (base64 del JSON del service account, `SHEET_ID`, `SENDGRID_API_KEY`, `SENDGRID_FROM`, `GEMINI_API_KEY`).
2.  **Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
3.  **Frontend**:
    *   Abrir `frontend/index.html` en el navegador (o servir con `npx serve frontend`).

## Levantar con Docker Compose

1.  Rellena `.env` en la raíz.
2.  Ejecuta:
    ```bash
    docker compose up --build -d
    ```
Frontend en http://localhost:8080, backend en http://localhost:4000.

---

## Visión a Futuro

Para evolucionar `pepcoach` de un prototipo funcional a una plataforma profesional y escalable, se proponen los siguientes pasos clave:

1.  **Migración de la Base de Datos**: Reemplazar el uso de Google Sheets por una base de datos más robusta y escalable como **Firestore**. Esto permitirá una mayor integridad de los datos, mejores capacidades de consulta y un rendimiento superior.

2.  **Evolución del Frontend**: Refactorizar la aplicación frontend utilizando un framework moderno como **React** o **Vue**. Esto facilitará la creación de componentes reutilizables, mejorará la mantenibilidad del código y permitirá construir una interfaz de usuario más rica y compleja.

3.  **Desarrollo de la Aplicación Móvil**: Construir una aplicación nativa para iOS y Android utilizando **React Native**. Esta aplicación se conectará al backend existente (ya securizado) y ofrecerá la mejor experiencia de usuario posible en dispositivos móviles, incluyendo el acceso a funcionalidades nativas como las notificaciones push.
