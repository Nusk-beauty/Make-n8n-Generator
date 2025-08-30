// backend/src/services/sheets.js
const { google } = require('googleapis');

// Cache for sheet metadata to avoid repeated API calls
let sheetMetadataCache = null;

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

async function _getSheetMetadata(sheets) {
    if (!sheetMetadataCache) {
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: process.env.SHEET_ID,
        });
        sheetMetadataCache = spreadsheet.data.sheets;
    }
    return sheetMetadataCache;
}

async function _getSheetIdByName(sheets, sheetName) {
    const metadata = await _getSheetMetadata(sheets);
    const sheet = metadata.find(s => s.properties.title === sheetName);
    if (!sheet) {
        throw new Error(`No se encontró una hoja con el nombre "${sheetName}".`);
    }
    return sheet.properties.sheetId;
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

async function _findRowIndex(clienteId) {
    const rows = await getRows();
    const rowIndex = rows.findIndex(row => row[0] === clienteId);
    if (rowIndex === -1) return -1;
    return rowIndex + 2;
}

async function updateRow(clienteId, dataAsArray) {
    const jwt = getJwtClient();
    await jwt.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const row = await _findRowIndex(clienteId);
    if (row === -1) {
        throw new Error(`Cliente con ID ${clienteId} no encontrado.`);
    }
    const range = `Clientes!A${row}`;
    const res = await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [dataAsArray] }
    });
    return res.data;
}

async function deleteRow(clienteId) {
    const jwt = getJwtClient();
    await jwt.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const row = await _findRowIndex(clienteId);
    if (row === -1) {
        throw new Error(`Cliente con ID ${clienteId} no encontrado.`);
    }
    const sheetId = await _getSheetIdByName(sheets, 'Clientes');
    const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.SHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: row - 1,
                        endIndex: row
                    }
                }
            }]
        }
    });
    return res.data;
}

async function getProgress(clienteId) {
    const jwt = getJwtClient();
    await jwt.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: 'Progreso!A2:D1000'
    });
    const allProgress = res.data.values || [];
    return allProgress.filter(row => row[0] === clienteId);
}

async function appendProgress(progressData) {
  return appendRow(progressData, 'Progreso');
}

module.exports = { appendRow, getRows, updateRow, deleteRow, getProgress, appendProgress };
