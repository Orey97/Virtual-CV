const { oauth2Client } = require('../_utils/oauth');

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code provided.');
  }

  try {
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // We strictly need the 'refresh_token' for the backend to work offline
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return res.status(200).send(`
        <h1>Auth Successful, but No Refresh Token</h1>
        <p>Google did not return a refresh token. This happens if you've already authorized the app.</p>
        <p>Go to <a href="https://myaccount.google.com/permissions">Google Permissions</a>, revoke access for this app, and try <a href="/api/auth/google">/api/auth/google</a> again.</p>
      `);
    }

    // Return the token to the Admin so they can configure Vercel
    res.status(200).send(`
      <h1>System Setup Complete</h1>
      <p><strong>CRITICAL:</strong> Save this Refresh Token to your Vercel Environment Variables.</p>
      <pre style="background:#eee;padding:20px;border-radius:5px;">GOOGLE_REFRESH_TOKEN=${refreshToken}</pre>
      <p>Key: <code>GOOGLE_REFRESH_TOKEN</code></p>
      <p>Value: (The long string above)</p>
    `);

  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).send('Authentication failed: ' + error.message);
  }
}
