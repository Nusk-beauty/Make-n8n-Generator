// backend/src/routes/clientes.js
const express = require('express');
const router = express.Router();
const sheets = require('../services/sheets');
const { v4: uuidv4 } = require('uuid');

// GET /api/clientes
router.get('/', async (req,res) => {
    try {
        const rows = await sheets.getRows();
        const clientes = rows.map(r => ({
            id: r[0],
            nombre: r[1],
            email: r[2],
            telefono: r[3],
            nacimiento: r[4],
            sexo: r[5],
            estatura: r[6],
            peso: r[7],
            objetivo: r[8],
            nivel: r[9],
            dias: r[10],
            equipo: r[11],
            preferencias: r[12],
            alergias: r[13],
            patologias: r[14],
            historial: r[15],
            notas: r[16],
            createdAt: r[17]
        }));
        res.json(clientes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/clientes
router.post('/', async (req,res) => {
    try {
        const c = req.body;
        c.id = uuidv4();
        c.createdAt = new Date().toISOString();
        const row = [
            c.id, c.nombre, c.email || '', c.telefono || '', c.nacimiento || '',
            c.sexo || '', c.estatura || '', c.peso || '', c.objetivo || '',
            c.nivel || '', c.dias || '', c.equipo || '', c.preferencias || '',
            c.alergias || '', c.patologias || '', c.historial || '', c.notas || '',
            c.createdAt
        ];
        
        try {
            await sheets.appendRow(row);
            res.status(201).json(c);
        } catch (sheetsError) {
            console.warn('Google Sheets not available, returning demo response:', sheetsError.message);
            // Still return success for demo purposes
            res.status(201).json({...c, demo: true, message: 'Modo demo - datos no guardados en Google Sheets'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
