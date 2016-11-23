var express = require('express');
var google = require("googleapis");
var secrets = require('./secrets.json');
var session = require("express-session");


function getOAuth2Client(){
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = 
        new OAuth2(secrets.web.client_id, secrets.web.client_secret, secrets.web.redirect_uris[0]);

    return oauth2Client;
}

function getAuthenticatingUrl(){
    var oauth2Client = getOAuth2Client();
    var scopes = [
        'https://www.googleapis.com/auth/youtube.readonly'
    ];

    //That's for generating the login url
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', 
        scope: scopes
    });

    return url;
}

//We've to call to this method in order to authorize the petitions to
//the Google's API. We just have to passs the tokens from the session as
//parameter.
function getOAuth2ClientAuthenticated(tokens){
    var oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
}

//Middleware function
function setupAuth(app){
    app.use(session({secret: 'xFcSksjlaowNgEsXgGHjhB&57624kjBgf390dvJHaZq'}));

    //Creates the oauth2Client object
    var oauth2Client = getOAuth2Client();

    //Sign in button
    app.get('/login', function(req, res){
        if(!req.session.channelName){
            res.redirect(getAuthenticatingUrl());
        } else {
            res.send({error: "You're already logged in."})
        }
    });

    //Callback procedure
    app.get("/callback", function(req, res) {
        var code = req.query.code;
        //Let's take the tokens
        oauth2Client.getToken(code, function(err, tokens) {
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            //Now we're to take the name of the user's channel.
            //First of all, we create the youtube variable which will let us do petitions
            var youtube = google.youtube({
                version: 'v3',
                auth: getOAuth2ClientAuthenticated(tokens)
            });
            //Now we do the petition to the google's API
            youtube.channels.list({
                part: 'snippet',
                mine: true
            }, function(err, data){
                if(!err){
                    req.session.channelName = data.items[0].snippet.title;
                    console.log('channel name!!: '+req.session.channelName);
                    req.session.tokens = tokens;
                    res.redirect('/');
                } else {
                    console.log(err);
                    req.send({error: 'an error happened when authenticating', trace: err});
                }
            });
        });
    });

    //the logount endpoint will destroy the current user's session
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

