// backend/src/services/mailer.js
const sgMail = require('@sendgrid/mail');
const JSZip = require('jszip');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function generateQrCodeBase64(url) {
    if (!url) return null;
    try {
        return await qrcode.toDataURL(url, { width: 160 });
    } catch (err) {
        console.error('Error generating QR code:', err);
        return null;
    }
}

function renderReportHtml({ cliente, plan, chartsBase64, qrCodeBase64 }) {
    // Plantilla de informe (simple y elegante). Puedes personalizar CSS.
    return `
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 28px; color: #111; background: #f9f9f9; }
    .container { max-width: 700px; margin: auto; background: white; border: 1px solid #eee; border-radius: 12px; padding: 28px; }
    .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 18px; margin-bottom: 24px; }
    .logo { font-size: 28px; font-weight: bold; color: #0A66C2; }
    .tagline { color: #555; }
    .section { margin-bottom: 24px; }
    h3 { font-size: 18px; color: #0A66C2; border-bottom: 2px solid #0A66C2; padding-bottom: 6px; }
    .table { width: 100%; border-collapse: collapse; }
    .table td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    .table td:first-child { font-weight: bold; color: #333; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 8px; white-space: pre-wrap; word-break: break-all; }
    .chart { max-width: 100%; border-radius: 8px; margin-top: 12px; }
    .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 28px; }
    .qr-container { text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">PepFit Pro</div>
    <div class="tagline">Informe personalizado — ${cliente.nombre}</div>
    <div style="font-size:12px;color:#777;margin-top:6px">Generado: ${new Date().toLocaleString()}</div>
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

  ${qrCodeBase64 ? `<div class="section qr-container"><h3>Acceso Rápido</h3><img src="${qrCodeBase64}" alt="QR Code" /></div>` : ''}
</div>
</body>
</html>
`;
}

async function generatePdfBuffer({ cliente, plan, chartsBase64, qrUrl }) {
    const qrCodeBase64 = await generateQrCodeBase64(qrUrl);
    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const html = renderReportHtml({ cliente, plan, chartsBase64, qrCodeBase64 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '18mm', right: '12mm', bottom: '18mm', left: '12mm' } });
    await browser.close();
    return buffer;
}

async function sendReportEmail({ cliente, plan, chartsBase64, qrUrl }) {
    const pdfBuffer = await generatePdfBuffer({ cliente, plan, chartsBase64, qrUrl });
    const pdfBase64 = pdfBuffer.toString('base64');

    const msg = {
        to: cliente.email,
        from: process.env.SENDGRID_FROM,
        subject: `Informe PepFit Pro — ${cliente.nombre}`,
        text: `Hola ${cliente.nombre}, adjunto tu informe personalizado.`,
        attachments: [
            {
                content: pdfBase64,
                filename: 'Informe_PepFitPro.pdf',
                type: 'application/pdf',
                disposition: 'attachment'
            }
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
            {
                content: base64,
                filename: 'Plan_PepFitPro.zip',
                type: 'application/zip',
                disposition: 'attachment'
            }
        ]
    };
    await sgMail.send(msg);
}

module.exports = { generatePdfBuffer, sendReportEmail, sendPlanZip };
