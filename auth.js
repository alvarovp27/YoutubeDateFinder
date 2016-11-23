var express = require('express');
var google = require("googleapis");
var secrets = require('./secrets.json');
var session = require("express-session");

function setupAuth(app){
    app.use(session({secret: 'this is a secret'}));

    var OAuth2 = google.auth.OAuth2;

    var oauth2Client = 
    new OAuth2(secrets.web.client_id, secrets.web.client_secret, secrets.web.redirect_uris[0]);

    var scopes = [
        'https://www.googleapis.com/auth/youtube'
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', 
        scope: scopes
    });

    app.get('/signIn', function(req, res){
        res.redirect(url)
    });

    app.get("/callback", function(req, res) {
        var code = req.query.code;

        console.log(code);

        oauth2Client.getToken(code, function(err, tokens) {
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            
            oauth2Client.setCredentials(tokens);
            var youtube = google.youtube({
                version: 'v3',
                auth: oauth2Client
            });
            
            youtube.channels.list({
                part: 'snippet',
                mine: true
            }, function(err, data){
                console.log(err);
                console.log('datossss: '+data);
                if(!err){
                    console.log(data.items[0].snippet.title);
                    //does not work
                    req.session.channelName = data.items[0].snippet.title;
                    //console.log("showing req var "+hola);
                }
                console.log('channel name!!: '+req.session.channelName);
                req.session.token = tokens;
                res.redirect('/');
            });

        });
    });

    app.get('/logout', function(req, res) {
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    });
}



module.exports = setupAuth;

