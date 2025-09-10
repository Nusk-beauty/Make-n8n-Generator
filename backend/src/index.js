// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const clientesRouter = require('./routes/clientes');
const planesRouter = require('./routes/planes');
const reportRouter = require('./routes/report');
const extraRouter = require('./routes/extra');
const progresoRouter = require('./routes/progreso');
const geminiService = require('./services/gemini');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/clientes', clientesRouter);
app.use('/api/planes', planesRouter);
app.use('/api/report', reportRouter);
app.use('/api/extra', extraRouter);
app.use('/api/progreso', progresoRouter);

// Proxy para Gemini (evita exponer la clave en frontend)
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });
    const response = await geminiService.ask(prompt);
    return res.json({ result: response });
  } catch (err) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: err.message || 'Error Gemini' });
  }
});

app.get('/health', (req,res) => res.json({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`PepCoach backend listening on ${PORT}`));
