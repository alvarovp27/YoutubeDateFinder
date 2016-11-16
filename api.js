var express = require('express');
var status = require('http-status');

var router = express.Router();

router.get('/helloWorld', function(req, res){
    res.json({
        helloWorld: "It worked!"
    });
    console.log("It worked!")
});

module.exports = router;