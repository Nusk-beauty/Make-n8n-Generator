# Guía Pinterest PRO: Creador Profesional (Sin API, con Drive Templates)

Esta versión utiliza **Google Slides** como motor de diseño para crear pines con texto profesional, logos y estética de marca, sin usar código ni la API técnica de Pinterest.

---

## Preparación: El Template en Google Drive
1. Crea una presentación en **Google Slides** con tamaño personalizado (1024x1536 px).
2. Diseña tu Pin base. Añade:
   - Un cuadro de texto para el título con la etiqueta `{{titulo}}`.
   - Un cuadro de texto para el CTA con la etiqueta `{{cta}}`.
   - Una forma o imagen de fondo que reemplazaremos.

---

## Escenario 1: Cerebro (Gemini + Sheets)
**Frecuencia:** Semanal.
1. **Gemini**: Genera 30 ideas con: Título Viral, CTA, y Prompt de Imagen.
2. **Sheets**: Guarda todo en una fila con `Estado = pendiente`.

---

## Escenario 2: Diseñador y Publicador PRO
**Frecuencia:** Diario (5-7 pines para no exceder 1,000 ops).

1.  **Google Sheets (Search Rows)**: Busca filas `pendientes`.
2.  **HTTP (Get Image)**:
    - URL: `https://image.pollinations.ai/prompt/{{prompt}}`
    - Descarga la imagen de la IA.
3.  **Google Drive (Upload)**: Sube esa imagen a una carpeta temporal en Drive.
4.  **Google Slides (Create Presentation from Template)**:
    - Selecciona tu Template.
    - Mapea `{{titulo}}` y `{{cta}}` con los datos de Sheets.
    - **Truco PRO**: Reemplaza la imagen de fondo con el ID del archivo subido en el paso 3.
5.  **Google Slides (Download a Presentation)**:
    - Descarga la diapositiva como **PNG** o **PDF**.
6.  **Pinterest (Native Module)**:
    - Usa el módulo **"Create a Pin"** de Make.
    - Conecta tu cuenta con un click (sin API keys).
    - Sube el archivo descargado en el paso 5.
7.  **Google Sheets (Update)**: Marca como `publicado`.

---

## Por qué es mejor:
- ✅ **Diseño Profesional**: No es solo una foto, tiene texto con fuentes bonitas y tu marca.
- ✅ **Sin API técnica**: Usas el conector oficial de Pinterest de Make.
- ✅ **100% Gratis**: Slides, Pollinations y el plan gratuito de Make son suficientes.

*Nota: Al usar Slides, cada Pin consume ~7 operaciones. Para mantenerte bajo 1,000, publica 4-5 pines al día.*
