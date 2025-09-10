// backend/src/routes/progreso.js
const express = require('express');
const router = express.Router();
const sheets = require('../services/sheets');

// GET /api/progreso/:clienteId
router.get('/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const progress = await sheets.getProgress(clienteId);
        // Formatear la respuesta para que sea más útil en el frontend
        const formattedProgress = progress.map(p => ({
            clienteId: p[0],
            fecha: p[1],
            peso: p[2],
            notas: p[3]
        }));
        res.json(formattedProgress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/progreso
router.post('/', async (req, res) => {
    try {
        const { clienteId, fecha, peso, notas } = req.body;
        if (!clienteId || !fecha || !peso) {
            return res.status(400).json({ error: 'clienteId, fecha y peso son requeridos.' });
        }

        const rowData = [clienteId, fecha, peso, notas || ''];
        await sheets.appendProgress(rowData);
        res.status(201).json({ clienteId, fecha, peso, notas });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
