/**
 * ============================================
 * CALENDAR API ROUTE V4.0
 * Vercel Serverless Function (Node.js Runtime)
 * Strategy: Service Account Authentication
 * ============================================
 * 
 * ENVIRONMENT VARIABLES REQUIRED (set in Vercel Dashboard):
 * - GOOGLE_CLIENT_EMAIL: Service Account email (e.g., xxx@project.iam.gserviceaccount.com)
 * - GOOGLE_PRIVATE_KEY: Full private key including -----BEGIN/END PRIVATE KEY-----
 * - GOOGLE_CALENDAR_ID: Calendar ID to read/write events
 * 
 * GOOGLE CALENDAR PERMISSION REQUIRED:
 * Go to Google Calendar > Settings > Share with specific people
 * Add the Service Account email with "Make changes to events" permission
 */

const { google } = require('googleapis');

// ==========================
// AUTHENTICATION FACTORY
// ==========================
function getAuthClient(scopes) {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    if (!clientEmail || !privateKey) {
        throw new Error('SERVICE_ACCOUNT_CREDENTIALS_MISSING');
    }
    
    // Handle escaped newlines from environment variable
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    
    return new google.auth.JWT(
        clientEmail,
        null,
        formattedKey,
        scopes
    );
}

// ==========================
// GET HANDLER: Fetch Busy Slots
// ==========================
async function handleGet(res) {
    console.log('[CALENDAR_API] GET Request - Fetching busy slots...');
    
    try {
        const auth = getAuthClient(['https://www.googleapis.com/auth/calendar.readonly']);
        const calendar = google.calendar({ version: 'v3', auth });
        
        const calendarId = process.env.GOOGLE_CALENDAR_ID;
        if (!calendarId) {
            throw new Error('GOOGLE_CALENDAR_ID_MISSING');
        }
        
        // Fetch next 60 days of events
        const now = new Date();
        const futureLimit = new Date();
        futureLimit.setDate(futureLimit.getDate() + 60);
        
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: now.toISOString(),
            timeMax: futureLimit.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });
        
        const events = response.data.items || [];
        
        // Extract busy slots
        const busySlots = events.map(event => ({
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            summary: event.summary || 'Busy'
        }));
        
        console.log(`[CALENDAR_API] Found ${busySlots.length} events`);
        
        return res.status(200).json({ 
            status: 'SUCCESS',
            busySlots: busySlots,
            syncTime: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[CALENDAR_API] GET Error:', error.message);
        
        if (error.message === 'SERVICE_ACCOUNT_CREDENTIALS_MISSING') {
            return res.status(503).json({ 
                status: 'OFFLINE',
                error: 'Service Account not configured',
                busySlots: []
            });
        }
        
        return res.status(500).json({ 
            status: 'ERROR',
            error: error.message,
            busySlots: []
        });
    }
}

// ==========================
// POST HANDLER: Create Calendar Event
// ==========================
async function handlePost(req, res) {
    console.log('[CALENDAR_API] POST Request - Creating event...');
    
    try {
        const { name, email, briefing, date, startTime, timezone } = req.body;
        
        // VALIDATION: Ensure required fields are present
        if (!name || !email || !date || !startTime) {
            console.error('[CALENDAR_API] Validation Error: Missing required fields');
            console.error('[CALENDAR_API] Received:', { name, email, date, startTime });
            return res.status(400).json({
                status: 'FAILED',
                error: 'VALIDATION_ERROR: name, email, date, and startTime are required'
            });
        }
        
        
        console.log('[CALENDAR_API] Processing request for:', {
            date,
            startTime,
            timezone,
            hasName: !!name,
            hasEmail: !!email
        }); // LOGGING METADATA ONLY - NO PII
        
        // AUTHENTICATION: Get write-enabled auth client
        const auth = getAuthClient(['https://www.googleapis.com/auth/calendar']);
        const calendar = google.calendar({ version: 'v3', auth });
        
        const calendarId = process.env.GOOGLE_CALENDAR_ID;
        if (!calendarId) {
            throw new Error('GOOGLE_CALENDAR_ID_MISSING');
        }
        
        // TEMPORAL ORCHESTRATION
        // Input: date = "2026-01-10", startTime = "14:00" or "14:00"
        // Output: ISO 8601 timestamps for Google Calendar
        
        let normalizedTime = startTime;
        if (startTime.includes(':')) {
            // "9:00" -> "09:00" or "14:00" -> "14:00"
            const [hours, mins] = startTime.split(':');
            normalizedTime = `${hours.padStart(2, '0')}:${mins.padStart(2, '0')}`;

        } else {
            // "9" -> "09:00"
            normalizedTime = `${startTime.padStart(2, '0')}:00`;
        }
        
        // Construct ISO datetime string
        const startDateTimeStr = `${date}T${normalizedTime}:00`;
        const startDateTime = new Date(startDateTimeStr);
        
        // Validate date parsing
        if (isNaN(startDateTime.getTime())) {
            console.error('[CALENDAR_API] Invalid date/time:', { date, startTime, startDateTimeStr });
            return res.status(400).json({
                status: 'FAILED',
                error: `INVALID_DATE_TIME: Could not parse "${startDateTimeStr}"`
            });
        }
        
        // Calculate end time (60 minutes later)
        const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000));
        
        // Determine timezone (fallback to Europe/Rome)
        const eventTimezone = timezone || 'Europe/Rome';
        
        console.log('[CALENDAR_API] Temporal Mapping:', {
            inputDate: date,
            inputTime: startTime,
            normalizedTime: normalizedTime,
            startISO: startDateTime.toISOString(),
            endISO: endDateTime.toISOString(),
            timezone: eventTimezone
        });
        
        // CONSTRUCT EVENT OBJECT
        const event = {
            summary: `💼 INTERVIEW / ALIGNMENT: ${name}`, 
            location: "Google Meet (Link will be generated)", 
            description: `
🚀 **NEW OPPORTUNITY DETECTED VIA RENALDO.AI**
--------------------------------------------------
👤 **CANDIDATE NAME:** ${name}
📧 **CONTACT EMAIL:** ${email}
📅 **SCHEDULED ON:** ${date} at ${startTime}
--------------------------------------------------
📝 **OBJECTIVE / BRIEFING:**
"${briefing || 'No briefing provided.'}"
--------------------------------------------------
🔧 [SYSTEM_METADATA]
Source: Portfolio Deployment V6.0
Integrity: Verified Uplink
Status: Awaiting Direct Confirmation
            `,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: timezone || 'Europe/Rome',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: timezone || 'Europe/Rome',
            },
            // NOTE: attendees and sendUpdates removed - Service Accounts cannot send invites
            // on personal Google accounts (requires Domain-Wide Delegation for GSuite)
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 60 },
                    { method: 'popup', minutes: 10 }
                ]
            }
            // NOTE: conferenceData removed - Service Accounts often can't create Meet links
        };
        
        console.log('[CALENDAR_API] Event object constructed:', JSON.stringify(event, null, 2));
        
        // EXECUTE INSERTION
        const result = await calendar.events.insert({
            calendarId: calendarId,
            resource: event
            // sendUpdates removed - causes 403 on personal accounts
        });
        
        console.log('[CALENDAR_API] Event created successfully:', result.data.id);
        console.log('[CALENDAR_API] Event link:', result.data.htmlLink);
        
        return res.status(200).json({
            status: 'SUCCESS',
            eventId: result.data.id,
            link: result.data.htmlLink,
            start: result.data.start,
            end: result.data.end,
            syncTime: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[CRITICAL_BACKEND_ERR]', error.message);
        console.error('[CRITICAL_BACKEND_ERR] Full Error:', error);
        
        // Specific error handling
        let statusCode = 500;
        let errorMessage = error.message;
        
        if (error.message === 'SERVICE_ACCOUNT_CREDENTIALS_MISSING') {
            statusCode = 503;
            errorMessage = 'Service Account credentials not configured on server';
        } else if (error.message === 'GOOGLE_CALENDAR_ID_MISSING') {
            statusCode = 503;
            errorMessage = 'Google Calendar ID not configured on server';
        } else if (error.code === 403) {
            statusCode = 403;
            errorMessage = 'PERMISSION_DENIED: Service Account lacks write access to calendar. Grant "Make changes to events" permission in Google Calendar settings.';
        } else if (error.code === 404) {
            statusCode = 404;
            errorMessage = 'CALENDAR_NOT_FOUND: The specified calendar ID does not exist or is not accessible.';
        } else if (error.message && error.message.includes('Invalid')) {
            statusCode = 400;
            errorMessage = `DATE_TIME_ERROR: ${error.message}`;
        }
        
        return res.status(statusCode).json({
            status: 'FAILED',
            error: errorMessage,
            code: error.code || 'UNKNOWN'
        });
    }
}

// ==========================
// MAIN HANDLER (Vercel Serverless)
// ==========================
module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    // Route by method
    if (req.method === 'GET') {
        return handleGet(res);
    }
    
    if (req.method === 'POST') {
        return handlePost(req, res);
    }
    
    // Method not allowed
    return res.status(405).json({
        status: 'ERROR',
        error: 'Method not allowed'
    });
};
