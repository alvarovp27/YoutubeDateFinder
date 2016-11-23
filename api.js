var express = require('express');
var status = require('http-status');
var session = require("express-session");
var google = require('googleapis');
var auth = require('./auth');

var router = express.Router();
router.use(session({secret: 'this is a secret'}));


router.get("/test", function(req, res){
  console.log(req.session.tokenn);
  console.log(req.session.channelName);
  res.send(req.session.channelName);
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
      
      res.send({nextPageToken: nextPageToken, totalResults: totalResults, videos: videos});
    }
  });

});

module.exports = router;