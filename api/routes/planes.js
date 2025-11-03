// backend/src/routes/planes.js
const express = require('express');
const router = express.Router();
const planGen = require('../utils/planGenerator');
const mailer = require('../services/mailer');

// POST /api/planes/:clienteId -> genera y opcionalmente envía por e-mail
router.post('/:clienteId', async (req,res) => {
    try {
        const clienteId = req.params.clienteId;
        const { cliente, dias = 7, enfoque = 'equilibrado', enviarEmail = false, chartsBase64 } = req.body;

        if (!cliente) return res.status(400).json({ error: 'Cliente requerido en body' });

        const plan = planGen.buildPlan(cliente, dias, enfoque);

        if (enviarEmail) {
            await mailer.sendReportEmail({ cliente, plan, chartsBase64 });
        }

        res.status(201).json({ plan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
