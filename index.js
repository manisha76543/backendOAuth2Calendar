const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();

// Google Calendar API endpoint
const API_ENDPOINT = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// Your Google API client ID and client secret
const CLIENT_ID = '723106556361-d4bliud7mdeak2gpe9dmmrve7jiqjclb.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

// Google OAuth 2.0 authorization endpoint
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

// Google OAuth 2.0 token endpoint
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// Google Calendar redirect URI
const REDIRECT_URI = 'http://localhost:3000/rest/v1/calendar/redirect/';

// Step 1: Initialize the OAuth process
app.get('/rest/v1/calendar/init/', (req, res) => {
  const authorizationURL = `${AUTH_ENDPOINT}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar`;
    console.log("see init  " + req);
  res.redirect(authorizationURL);
});

// Step 2: Handle the redirect request from Google with the authorization code
app.get('/rest/v1/calendar/redirect/', (req, res) => {
  const code = req.query.code;
  console.log("see redirect " + req);

  // Request the access token using the authorization code
  axios.post(TOKEN_ENDPOINT, querystring.stringify({
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  })).then((response) => {
    console.log("check respinse " + response)
    const accessToken = response.data.access_token;

    // Use the access token to get a list of events from the user's calendar
    axios.get(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).then((response) => {
      const events = response.data.items;

      // Render the events in the view
      res.render('calendar_events', { events: events });
    }).catch((error) => {
      console.error(error);
      res.send('An error occurred while getting the events.');
    });
  }).catch((error) => {
    console.error(error);
    res.send('An error occurred whilegetting  the access token.');
  });
});

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
