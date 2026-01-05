const { oauth2Client } = require('../_utils/oauth');

export default function handler(req, res) {
  // Generate a url that asks permissions for Google Calendar scope
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical for getting a Refresh Token
    scope: scopes,
    include_granted_scopes: true,
    prompt: 'consent' // Forces a Refresh Token to be returned
  });

  // Redirect the user (Admin) to Google's consent page
  res.redirect(authorizationUrl);
}
