// backend/src/services/sheets.js
const { google } = require('googleapis');

function getJwtClient() {
    const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
    if (!base64 || base64.includes('DEMO')) {
        throw new Error('Google Sheets no configurado correctamente. Configure GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 con credenciales válidas.');
    }
    try {
        const creds = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
        const jwtClient = new google.auth.JWT(
            creds.client_email,
            null,
            creds.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        return jwtClient;
    } catch (error) {
        throw new Error('Credenciales de Google Sheets inválidas. Verifique el formato base64.');
    }
}

async function appendRow(valuesArray, sheetName = 'Clientes') {
    try {
        const jwt = getJwtClient();
        await jwt.authorize();
        const sheets = google.sheets({ version: 'v4', auth: jwt });
        const spreadsheetId = process.env.SHEET_ID;
        
        if (!spreadsheetId || spreadsheetId.includes('DEMO')) {
            throw new Error('SHEET_ID no configurado correctamente');
        }
        
        const res = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [valuesArray] }
        });
        return res.data;
    } catch (error) {
        console.error('Error adding row to Google Sheets:', error.message);
        throw new Error(`Error al guardar en Google Sheets: ${error.message}`);
    }
}

async function getRows(range = 'Clientes!A2:Z1000') {
    try {
        const jwt = getJwtClient();
        await jwt.authorize();
        const sheets = google.sheets({ version: 'v4', auth: jwt });
        const spreadsheetId = process.env.SHEET_ID;
        
        if (!spreadsheetId || spreadsheetId.includes('DEMO')) {
            // Return demo data for testing
            return [
                ['demo-1', 'Cliente Demo', 'demo@pepcoach.com', '555-0001', '1990-01-01', 'Masculino', '175', '75', 'Pérdida de grasa', 'Intermedio', '3', 'Gym completo', 'Ninguna', 'Ninguna', 'Ninguna', 'Ninguna', 'Cliente de demostración', new Date().toISOString()],
                ['demo-2', 'Ana García', 'ana@pepcoach.com', '555-0002', '1985-05-15', 'Femenino', '165', '65', 'Ganancia muscular', 'Avanzado', '4', 'Gym completo', 'Vegetariana', 'Ninguna', 'Ninguna', 'Ninguna', 'Cliente ejemplo', new Date().toISOString()]
            ];
        }
        
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        return res.data.values || [];
    } catch (error) {
        console.error('Error reading from Google Sheets:', error.message);
        
        // Return demo data if Google Sheets is not properly configured
        return [
            ['demo-1', 'Cliente Demo', 'demo@pepcoach.com', '555-0001', '1990-01-01', 'Masculino', '175', '75', 'Pérdida de grasa', 'Intermedio', '3', 'Gym completo', 'Ninguna', 'Ninguna', 'Ninguna', 'Ninguna', 'Cliente de demostración', new Date().toISOString()],
            ['demo-2', 'Ana García', 'ana@pepcoach.com', '555-0002', '1985-05-15', 'Femenino', '165', '65', 'Ganancia muscular', 'Avanzado', '4', 'Gym completo', 'Vegetariana', 'Ninguna', 'Ninguna', 'Ninguna', 'Cliente ejemplo', new Date().toISOString()]
        ];
    }
}

module.exports = { appendRow, getRows };
