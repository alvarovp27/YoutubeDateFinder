var express = require('express');
var wagner = require('wagner-core');

var app = express();

wagner.invoke(require('./auth'), {app: app});

app.use('/api', require('./api'));
app.use(express.static(__dirname+'/public/', {maxAge: 4*60*60*1000}));

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
console.log('Listening on port '+app.get('port'));