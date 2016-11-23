var express = require('express');
var status = require('http-status');
var session = require("express-session");

var router = express.Router();
router.use(session({secret: 'this is a secret'}));


router.get("/test", function(req, res){
  console.log(req.session.token);
  console.log(req.session.channelName);
  res.send(req.session.channelName);
});

module.exports = router;