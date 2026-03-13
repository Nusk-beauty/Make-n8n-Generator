# Configuración Detallada: Automatización Pinterest Skincare (Make.com Free Tier)

Esta guía detalla cómo configurar los 2 escenarios optimizados para mantenerse bajo el límite de 1,000 operaciones mensuales de Make.com.

---

## Escenario 1: Generador de Ideas SEO (Ejecución Semanal)
**Frecuencia:** Cada Domingo, 09:00 AM.
**Propósito:** Alimentar la base de datos con 30 ideas frescas para la semana.

### Módulos:

1.  **Módulo 1: Scheduler (Tools)**
    *   **Schedule type:** Weekly
    *   **Days:** Sunday
    *   **Time:** 09:00

2.  **Módulo 2: HTTP - Make a request**
    *   **Method:** POST
    *   **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=TU_API_KEY`
    *   **Header:** `Content-Type: application/json`
    *   **Body Type:** Raw
    *   **Content Type:** JSON (application/json)
    *   **Body:**
        ```json
        {
          "contents": [{
            "parts": [{
              "text": "Eres un experto en Pinterest SEO. Genera exactamente 30 pines de skincare en formato JSON. Estructura: {\"pins\":[{\"titulo\":\"\",\"descripcion\":\"\",\"prompt_imagen\":\"\",\"keyword\":\"\"}]}. No uses markdown."
            }]
          }]
        }
        ```

3.  **Módulo 3: JSON - Parse JSON**
    *   **JSON String:** `{{2.body.candidates[1].content.parts[1].text}}`

4.  **Módulo 4: Iterator (Flow Control)**
    *   **Array:** `{{3.pins}}`

5.  **Módulo 5: Google Sheets - Add Row**
    *   **Spreadsheet:** Selecciona tu hoja de cálculo.
    *   **Values:**
        *   **Título:** `{{4.titulo}}`
        *   **Descripción:** `{{4.descripcion}}`
        *   **Prompt Imagen:** `{{4.prompt_imagen}}`
        *   **Estado:** `pendiente`
        *   **Fecha:** `{{now}}`

---

## Escenario 2: Publicador Automático (Ejecución Diaria)
**Frecuencia:** Todos los días, una vez al día.
**Propósito:** Publicar 10 pines diarios extrayendo la imagen directamente de la IA.

### Módulos:

1.  **Módulo 1: Scheduler (Tools)**
    *   **Schedule type:** Daily
    *   **Time:** (Ej: 10:00)

2.  **Módulo 2: Google Sheets - Search Rows**
    *   **Filter:** `Estado` (Columna) Equal to `pendiente`.
    *   **Sort order:** Ascending (por fecha).
    *   **Maximum number of returned rows:** 10.

3.  **Módulo 3: Iterator (Flow Control)**
    *   **Array:** `{{2.rows}}`

4.  **Módulo 4: HTTP - Make a request (Pinterest API)**
    *   **Method:** POST
    *   **URL:** `https://api.pinterest.com/v5/pins`
    *   **Headers:**
        *   `Authorization: Bearer TU_TOKEN`
        *   `Content-Type: application/json`
    *   **Body:**
        ```json
        {
          "title": "{{3.titulo}}",
          "description": "{{3.descripcion}}",
          "media_source": {
            "source_type": "image_url",
            "url": "https://image.pollinations.ai/prompt/vertical%20pinterest%20pin,skincare,{{3.prompt_imagen}}?width=1024&height=1536&seed={{3.row_id}}"
          },
          "board_id": "ID_DE_TU_TABLERO"
        }
        ```

5.  **Módulo 5: Google Sheets - Update Row**
    *   **Row number:** `{{3.row_number}}`
    *   **Values:**
        *   **Estado:** `publicado`

---

## Resumen de Consumo (Operaciones)
*   **Escenario 1:** 5 módulos x 1 ejecución/semana = 20 ops/mes.
*   **Escenario 2:** (2 módulos de búsqueda + 3 módulos x 10 pines) x 30 días = 960 ops/mes.
*   **Total:** **980 operaciones/mes** (Encaja perfecto en el plan de 1,000 ops).
