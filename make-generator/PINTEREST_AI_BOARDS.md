# Pinterest AI Boards: Automatización Profesional (Sin Slides ni APIs)

Este sistema automatiza la creación de **Tableros (Boards)** y **Pines** de forma dinámica, manteniendo un estilo profesional mediante prompts de imagen avanzados.

---

## Escenario 1: Planificador de Tableros y Pines
**Frecuencia:** Semanal.
1. **Gemini**: Genera 30 ideas. Para cada una define:
   - **Tablero**: (Ej: *Rutina Nocturna, Errores Skincare, Piel Seca*).
   - **Título/Desc**: SEO optimizado.
   - **Prompt Estético**: (Ej: *Professional skincare product shot, minimal glass bottle, soft sunlight, pastel background*).
2. **Google Sheets**: Guarda con `estado = pendiente`.

---

## Escenario 2: Publicador con Lógica de Tableros
**Frecuencia:** Diario (10 pines).

1.  **Google Sheets (Search Rows)**: Busca filas `pendientes`.
2.  **Pinterest (List Boards)**: Lista tus tableros actuales.
3.  **Router + Filtro**:
    - **Si el Tablero NO existe**: Usa el módulo nativo de Pinterest **"Create a Board"**.
    - **Si el Tablero SÍ existe**: Salta al siguiente paso.
4.  **Pinterest (Create a Pin)**:
    - **Board**: Usa el ID del tablero (existente o recién creado).
    - **Image URL**: `https://image.pollinations.ai/prompt/{{prompt_estetico}}`
5.  **Google Sheets (Update)**: Marca como `publicado`.

---

## Ventajas de esta Versión:
- ✅ **Cero Diseño Manual**: No necesitas Slides ni Canva. La IA hace fotos profesionales.
- ✅ **Organización Total**: Tus pines se agrupan automáticamente en tableros temáticos.
- ✅ **Sin API Keys**: Todo se conecta con un botón usando el módulo oficial de Pinterest en Make.
- ✅ **Optimizado**: Consume muy pocas operaciones (~3-4 por Pin).

*Consejo: Para que los tableros se vean profesionales, Gemini siempre debe elegir nombres de tableros cortos y directos (Skincare Tips, Rutinas, Remedios).*
