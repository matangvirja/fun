import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44;
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const order = body.order;
    if (!order || !order.id) return Response.json({ error: 'Missing order data' }, { status: 400 });

    // Read spreadsheet config from site settings
    const settingsList = await db.asServiceRole.entities.SiteSettings.list('-created_date', 1);
    const settings = settingsList[0];
    const sheetId = settings?.google_sheet_id;
    const tabName = settings?.google_sheet_tab || 'Orders';

    if (!sheetId) return Response.json({ error: 'No Google Sheet ID configured in site settings' }, { status: 400 });

    // Get the builder's Google Sheets OAuth token
    const { accessToken } = await db.asServiceRole.connectors.getConnection('googlesheets');

    const date = new Date(order.created_date || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const itemsSummary = (order.items || []).map(i => `${i.name} x${i.quantity}`).join('; ');
    const address = [order.address, order.city, order.zip, order.country].filter(Boolean).join(', ');

    const values = [[
      order.id.slice(0, 8),
      date,
      order.customer_name || 'Guest',
      order.customer_email || '',
      address,
      itemsSummary,
      order.subtotal || 0,
      order.shipping || 0,
      order.total || 0,
      order.status || 'pending'
    ]];

    const range = encodeURIComponent(`${tabName}!A:J`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: `Google Sheets API error: ${errText}` }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}