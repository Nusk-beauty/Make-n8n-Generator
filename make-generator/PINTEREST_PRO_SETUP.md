# Configuración Pro: Pinterest Viral Automation (Make Free Tier)

Este documento detalla cómo configurar el escenario de 45 pines semanales optimizado para el plan gratuito de Make (<1000 operaciones/mes).

## 📊 Análisis de Operaciones (Mensual)
- **Ejecución Semanal (x4):**
  - Trigger (Scheduler): 1 op
  - HTTP Gemini: 1 op
  - Parse JSON: 1 op
  - Iterator: 1 op
  - Operaciones por Pin (45 pines):
    - Sheets (Add Row): 1 op
    - Slides (Replace Text): 1 op
    - Slides (Export PNG): 1 op
    - Pinterest (Create Pin): 1 op
    - Sheets (Update Status): 1 op
    - **Total por pin: 5 ops**
  - Total semanal: 4 + (45 * 5) = 229 ops.
- **Total Mensual: 229 * 4 = 916 operaciones.** (Límite: 1000).

---

## 🛠 Pre-Configuración (Paso a Paso)

### 1. Google Sheets (La Base de Datos)
Crea una hoja de cálculo llamada `Pinterest_Automation` con las siguientes columnas en la primera fila:
- `hook`
- `titulo`
- `descripcion`
- `plantilla`
- `estado`
- `fecha`

### 2. Google Slides (El Motor de Diseño)
1. Crea una presentación de Google Slides.
2. Ajusta el tamaño de página a **1000x1500 px** (Formato vertical Pinterest).
3. Diseña tu plantilla y coloca estos "placeholders" donde quieras que aparezca el texto:
   - `{{hook}}` (Para el texto llamativo)
   - `{{titulo}}` (Para el título del pin)

### 3. Pinterest App (Conexión Nativa)
1. Ve a [Pinterest Developers](https://developers.pinterest.com/).
2. Crea una aplicación para obtener tu App ID y App Secret si usas el módulo nativo por primera vez, o simplemente usa la conexión Oauth2 de Make al añadir el módulo.

---

## ⚙️ Configuración del Escenario Módulo a Módulo

### 1. Scheduler (Tools)
- **Schedule setting:** Weekly
- **Days:** Sunday
- **Time:** 09:00
*Esto inicia el proceso cada domingo para toda la semana.*

### 2. HTTP - Gemini 1.5 Flash
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=TU_API_KEY`
- **Body (JSON):**
```json
{
  "contents": [{
    "parts": [{
      "text": "Eres un experto en SEO de Pinterest. Genera 45 pines virales de skincare. Devuelve SOLO un JSON con este formato: {\"pins\": [{\"hook\": \"...\", \"titulo\": \"...\", \"descripcion\": \"...\"}]}"
    }]
  }]
}
```

### 3. JSON - Parse JSON
- **JSON string:** `{{body.candidates[0].content.parts[0].text}}`

### 4. Flow Control - Iterator
- **Array:** `{{3.pins}}`

### 5. Google Sheets - Add Row
- **File:** `Pinterest_Automation`
- **Values:** Mapea los campos del Iterator (`hook`, `titulo`, etc.).
- **Estado:** "Pendiente".

### 6. Google Slides - Replace Text
- **Template Presentation:** Selecciona tu plantilla de Slides.
- **Values:**
  - `{{hook}}` -> `{{4.hook}}`
  - `{{titulo}}` -> `{{4.titulo}}`

### 7. Google Slides - Export as PNG
- **Presentation ID:** `{{6.presentationId}}`
*Esto genera la imagen final que se subirá.*

### 8. Pinterest - Create Pin
- **Board:** Selecciona tu tablero de Skincare.
- **Image:** Usa el archivo generado en el paso anterior.
- **Title:** `{{4.titulo}}`
- **Description:** `{{4.descripcion}}`

### 9. Google Sheets - Update Row
- **Row number:** `{{5.rowNumber}}`
- **Estado:** "Publicado"

---

## 💡 Consejos Pro para Evitar Fallos
1. **Timeouts:** Si el escenario falla por tiempo, puedes dividir los 45 pines en lotes de 15 usando filtros o Sleep entre módulos.
2. **Google Cloud:** Asegúrate de habilitar la "Google Slides API" y "Google Drive API" en tu consola de Google Cloud para que Make pueda acceder.
3. **Imágenes:** Slides es gratis y no consume créditos de generación de imágenes por IA (como Midjourney o DALL-E), lo que mantiene el coste en $0.
