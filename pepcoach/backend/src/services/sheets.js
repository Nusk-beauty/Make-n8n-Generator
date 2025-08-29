// backend/src/services/sheets.js
const { google } = require('googleapis');

function getJwtClient() {
    const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
    if (!base64) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 no configurado');
    const creds = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    const jwtClient = new google.auth.JWT(
        creds.client_email,
        null,
        creds.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    return jwtClient;
}

async function appendRow(valuesArray, sheetName = 'Clientes') {
    const jwt = getJwtClient();
    await jwt.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const spreadsheetId = process.env.SHEET_ID;
    const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [valuesArray] }
    });
    return res.data;
}

async function getRows(range = 'Clientes!A2:Z1000') {
    const jwt = getJwtClient();
    await jwt.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range
    });
    return res.data.values || [];
}

module.exports = { appendRow, getRows };
