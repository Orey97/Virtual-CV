const { google } = require('googleapis');

/**
 * VERCEL SERVERLESS FUNCTION: Google Calendar Service Account Sync (V4.0)
 * 
 * Authenticates as a Service Account (Robot) to:
 * 1. GET: Read 'busy' slots from the user's primary calendar.
 * 2. POST: Write new 'Alignment' events (bookings) to the calendar.
 */
export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Load Credentials
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
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar'] // UPGRADED SCOPE: Read/Write
    );

    const calendar = google.calendar({ version: 'v3', auth });

    // === GET: READ AVAILABILITY ===
    if (req.method === 'GET') {
      const response = await calendar.events.list({
        calendarId: GOOGLE_CALENDAR_ID,
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 Days
        singleEvents: true,
        orderBy: 'startTime',
      });

      const busySlots = response.data.items.map(event => ({
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      return res.status(200).json({ busySlots });
    }

    // === POST: CREATE BOOKING ===
    if (req.method === 'POST') {
      const { name, email, briefing, date, startTime, timezone } = req.body;
      
      if (!name || !email || !date || !startTime) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Parse Date/Time: "2026-01-20" + "10:00" -> ISO
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 Hour

      const event = {
        summary: `ALIGNMENT: ${name}`,
        description: `Briefing: ${briefing || 'No details provided.'}\n\nContact: ${email}\n\n[System: Booked via Virtual Portfolio]`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: timezone || 'Europe/Rome', // Fallback
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: timezone || 'Europe/Rome',
        },
        attendees: [
            { email: email } // Sends invite to recruiter
        ]
      };

      const response = await calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        resource: event,
        sendUpdates: 'all', // Email notification
      });

      return res.status(200).json({ 
        success: true, 
        link: response.data.htmlLink,
        eventId: response.data.id
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error) {
    console.error('Google Calendar Operation Failed:', error);
    return res.status(500).json({ error: 'Operation Failed', details: error.message });
  }
}
