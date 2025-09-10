// backend/src/services/mailer.js
const sgMail = require('@sendgrid/mail');
const JSZip = require('jszip');
const puppeteer = require('puppeteer');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function renderReportHtml({ cliente, plan, chartsBase64 }) {
  // Plantilla de informe (simple y elegante). Puedes personalizar CSS.
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Informe PepFit Pro</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body{font-family:Inter,Arial;margin:0;padding:24px;color:#0f1115;background:#fff}
      .header{display:flex;gap:16px;align-items:center}
      .logo{width:84px;height:84px;border-radius:12px;background:linear-gradient(90deg,#0A66C2,#E53935);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700}
      h1{margin:0;font-size:20px}
      .meta{color:#666;margin-top:6px}
      .section{margin-top:18px}
      .table{width:100%;border-collapse:collapse}
      .table td{padding:6px;border-bottom:1px solid #eee}
      pre{background:#fafafa;padding:12px;border-radius:8px;overflow:auto}
      .chart{max-width:700px;margin-top:12px}
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">PepFit<br/>Pro</div>
      <div>
        <h1>Informe personalizado — ${cliente.nombre}</h1>
        <div class="meta">Generado: ${new Date().toLocaleString()}</div>
      </div>
    </div>

    <div class="section">
      <h3>Resumen</h3>
      <table class="table">
        <tr><td><strong>Nombre</strong></td><td>${cliente.nombre}</td></tr>
        <tr><td><strong>Email</strong></td><td>${cliente.email || '—'}</td></tr>
        <tr><td><strong>Objetivo</strong></td><td>${cliente.objetivo || '—'}</td></tr>
        <tr><td><strong>IMC</strong></td><td>${plan.metrics?.imc || '—'}</td></tr>
        <tr><td><strong>Grasa estimada</strong></td><td>${plan.metrics?.bodyFat || '—'} %</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Plan nutricional</h3>
      <pre>${(plan.nutricion && JSON.stringify(plan.nutricion, null, 2)) || '—'}</pre>
    </div>

    <div class="section">
      <h3>Plan de entrenamiento</h3>
      <pre>${(plan.entreno && JSON.stringify(plan.entreno, null, 2)) || '—'}</pre>
    </div>

    ${chartsBase64 ? `<div class="section"><h3>Progreso</h3><img class="chart" src="data:image/png;base64,${chartsBase64}" /></div>` : ''}

  </body>
  </html>
  `;
}

async function generatePdfBuffer({ cliente, plan, chartsBase64 }) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const html = renderReportHtml({ cliente, plan, chartsBase64 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '18mm', right: '12mm', bottom: '18mm', left: '12mm' } });
  await browser.close();
  return buffer;
}

async function sendReportEmail({ cliente, plan, chartsBase64 }) {
  const pdfBuffer = await generatePdfBuffer({ cliente, plan, chartsBase64 });
  const pdfBase64 = pdfBuffer.toString('base64');

  const msg = {
    to: cliente.email,
    from: process.env.SENDGRID_FROM,
    subject: `Informe PepFit Pro — ${cliente.nombre}`,
    text: `Hola ${cliente.nombre}, adjunto tu informe personalizado.`,
    attachments: [
      { content: pdfBase64, filename: 'Informe_PepFitPro.pdf', type: 'application/pdf', disposition: 'attachment' }
    ]
  };
  await sgMail.send(msg);
}

async function sendPlanZip({ cliente, plan }) {
  const zip = new JSZip();
  zip.file('perfil.txt', `Nombre: ${cliente.nombre}\nEmail: ${cliente.email}\nObjetivo: ${cliente.objetivo || ''}\n`);
  zip.file('plan.json', JSON.stringify(plan, null, 2));
  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  const base64 = buf.toString('base64');

  const msg = {
    to: cliente.email,
    from: process.env.SENDGRID_FROM,
    subject: `Plan PepFit Pro — ${cliente.nombre}`,
    text: `Hola ${cliente.nombre}, adjunto tu plan en ZIP.`,
    attachments: [
      { content: base64, filename: 'Plan_PepFitPro.zip', type: 'application/zip', disposition: 'attachment' }
    ]
  };
  await sgMail.send(msg);
}

module.exports = { generatePdfBuffer, sendReportEmail, sendPlanZip };
