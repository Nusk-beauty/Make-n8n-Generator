// backend/src/routes/planes.js
const express = require('express');
const router = express.Router();
const planGen = require('../utils/planGenerator');
const mailer = require('../services/mailer');
const { planValidationRules, handleValidationErrors } = require('../middleware/validators');

// POST /api/planes/:clienteId -> genera y opcionalmente envía por e-mail
router.post('/:clienteId', planValidationRules(), handleValidationErrors, async (req,res) => {
    try {
        const clienteId = req.params.clienteId;
        const { cliente, dias = 7, enfoque = 'equilibrado', enviarEmail = false, chartsBase64 } = req.body;

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
