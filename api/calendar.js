const { google } = require('googleapis');

/**
 * VERCEL SERVERLESS FUNCTION: Google Calendar Service Account Sync
 * 
 * Authenticates as a Service Account (Robot) to read the user's primary calendar.
 * Returns only 'busy' time ranges to protect privacy.
 */
export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Load Credentials from Environment
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
    const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
      console.warn('Missing Google Service Account Credentials');
      return res.status(503).json({ error: 'Server misconfigured (Missing Credentials)' });
    }

    // 3. Authenticate the Robot
    const auth = new google.auth.JWT(
      GOOGLE_CLIENT_EMAIL,
      null,
      // Handle Vercel's double-escape behavior with newlines in private keys
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar.readonly']
    );

    const calendar = google.calendar({ version: 'v3', auth });

    // 4. Fetch Real Events (Next 45 Days to cover current + next month views)
    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    // 5. Privacy Filter (Convert to simple 'Busy' slots)
    // We strictly strip all personal data (Summary, Description, Attendees)
    const busySlots = response.data.items.map(event => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    }));

    // 6. Return Clean Data
    return res.status(200).json({ busySlots });

  } catch (error) {
    console.error('Google Sync Failed:', error);
    return res.status(500).json({ error: 'Sync Error', details: error.message });
  }
}
