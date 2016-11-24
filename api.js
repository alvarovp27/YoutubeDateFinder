var express = require('express');
var status = require('http-status');
var session = require("express-session");
var google = require('googleapis');
var auth = require('./auth');
var bodyparser = require('body-parser');

var router = express.Router();
router.use(session({secret: 'this is a secret'}));


router.get("/test", function(req, res){
  console.log(req.session.tokenn);
  console.log(req.session.channelName);
  res.send(req.session.channelName);
});

router.get("/search", function(req, res){

  if(!req.session.tokens){
    res.send({error: "You have to be authenticated."});
  } else {
    var query = req.query.query;
    var publishedAfter = req.query.publishedAfter;
    var publishedBefore = req.query.publishedBefore;
    var nextPageToken = req.query.nextPageToken;

    var queryJson = {
      part: 'id,snippet',
      q: query,
      maxResults: '50',
      order: 'date',
      publishedAfter: publishedAfter,
      publishedBefore: publishedBefore,
      type: 'video'
    }

    if(nextPageToken){
      queryJson['pageToken'] = nextPageToken;
      console.log(queryJson)
    }

    var youtube = auth.youtube(req.session.tokens);
    youtube.search.list(queryJson, function (err, data) {
      if (err) {
        console.error('Error: ' + err);
      }
      if (data) {   
        console.log("number of videos retrieved: "+data.items.length)
        var formatedData = buildVideoResponse(data);
        console.log(formatedData.videos.length)
        res.send(formatedData);
      }
    });
  }
});

router.get("/testSearchVideo", function(req, res){
  /*parameters to use:
  - maxResults: set it to the max (50)
  - publishedAfter
  - publishedBefore
  - pageToken: in case of pagination. Pay attention to
  nextPageToken property of response, which will indicate
  whether there are more pages
 */ 
  
  var youtube = auth.youtube(req.session.tokens);

  youtube.search.list({
    part: 'id,snippet',
    q: 'birds at the beach',
    maxResults: '50',
    order: 'date',
    publishedAfter: '2008-01-01T00:00:00Z',
    publishedBefore: '2010-01-01T00:00:00Z',
    type: 'video'
    
  }, function (err, data) {
    if (err) {
      console.error('Error: ' + err);
    }
    if (data) {   
      res.send(buildVideoResponse(data));
    }
  });

});

function buildVideoResponse(data){
  var nextPageToken = data.nextPageToken;
  var totalResults = data.pageInfo.totalResults;
  var videos = [];

  data.items.forEach(function(value){
    var video = {
              title: value.snippet.title,
              thumbnails: value.snippet.thumbnails.url,
              channel: value.snippet.channelTitle,
              description: value.snippet.description,
              videoId: value.id.videoId,
              publishedAt: value.snippet.publishedAt
              };

    videos.push(video);
  });

  return {nextPageToken: nextPageToken, totalResults: totalResults, videos: videos};
}

module.exports = router;