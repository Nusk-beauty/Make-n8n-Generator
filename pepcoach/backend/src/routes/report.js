// backend/src/routes/report.js
const express = require('express');
const router = express.Router();
const mailer = require('../services/mailer');

// POST /api/report/generate -> devuelve PDF
router.post('/generate', async (req,res) => {
    try {
        const { cliente, plan, chartsBase64 } = req.body;
        const buffer = await mailer.generatePdfBuffer({ cliente, plan, chartsBase64 });
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Informe_${(cliente.nombre||'cliente').replace(/\s+/g,'_')}.pdf`);
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/report/send -> genera PDF y lo envía por e-mail
router.post('/send', async (req,res) => {
    try {
        const { cliente, plan, chartsBase64 } = req.body;
        await mailer.sendReportEmail({ cliente, plan, chartsBase64 });
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
