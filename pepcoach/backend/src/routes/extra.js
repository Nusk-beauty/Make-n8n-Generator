// backend/src/routes/extra.js
const express = require('express');
const router = express.Router();
const { calcBodyFatUSNavy } = require('../utils/planGenerator');
const { fatCalcValidationRules, handleValidationErrors } = require('../middleware/validators');

// POST /api/extra/calcFat
router.post('/calcFat', fatCalcValidationRules(), handleValidationErrors, (req,res) => {
    try {
        const body = req.body;
        const bf = calcBodyFatUSNavy(body);
        res.json({ bodyFat: bf });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
