const { google } = require('googleapis');
const { oauth2Client } = require('./_utils/oauth');

export default async function handler(req, res) {
  // 1. CORS Headers (Allow Frontend Access)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Validate Environment
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  if (!REFRESH_TOKEN || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Vercel Env Vars');
    return res.status(503).json({ 
      error: 'Backend system not initialized. Admin must configure credentials.' 
    });
  }

  // 3. Validate Payload
  const { name, email, briefing, date, startTime, timezone } = req.body;
  if (!name || !email || !date || !startTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 4. Authenticate
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 5. Construct Event
    // Parse Date/Time: "2023-01-01" + "10:00" -> ISO
    // Assume 1 hour duration per previous architecture
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `Alignment: ${name}`,
      description: `Briefing: ${briefing}\n\nContact: ${email}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone || 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone || 'UTC',
      },
      attendees: [
        { email: email }
      ],
    };

    // 6. Insert into Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all', // Sends email invite to the user
    });

    // 7. Return Success
    return res.status(200).json({
      status: 'CONFIRMED',
      calendar: 'GOOGLE_LIVE',
      eventId: response.data.id,
      link: response.data.htmlLink
    });

  } catch (error) {
    console.error('Google Calendar API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to synchronize with Google Calendar.',
      details: error.message 
    });
  }
}
