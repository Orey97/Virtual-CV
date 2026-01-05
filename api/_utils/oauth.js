const { google } = require('googleapis');

const CLIENT_ID = '732652071804-mlo3vo636rhuvae8pig3q49e1bdnrkn6.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://virtual-d3wn6n6bh-orey97s-projects.vercel.app/api/auth/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

module.exports = {
  oauth2Client,
  CLIENT_ID,
  REDIRECT_URI
};
