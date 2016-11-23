var express = require('express');
var status = require('http-status');
var google = require("googleapis");
var secrets = require('./secrets.json');

var router = express.Router();

var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(secrets.web.client_id, secrets.web.client_secret, "http://localhost:5000");

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/youtube'
];

var url = oauth2Client.generateAuthUrl({
  access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token)
  scope: scopes // If you only need one scope you can pass it as string
});

router.get('/signIn', function(req, res){
    res.redirect(url)
    
});

router.get("/tokens", function(req, res) {

  var code = req.query.code;

  console.log(code);

  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log(err);
      res.send(err);
      return;
    }

    console.log("allright!!!!");

    console.log(err);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    res.send(tokens);
  });
});

module.exports = router;