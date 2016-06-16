var express = require('express');
var sockjs = require('sockjs');
var http = require('http');
var sockjs = require('sockjs');
var fs = require('fs');
var mongoose = require('mongoose');
var appConfig = require('./app/config/appConfig'); 
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();
//var url = require('url');

var mainPath = 'public_html';
//var mainPath = 'public';
    
mongoose.connect(appConfig.dbUrl);

/*********************************************************************************************/

var connections = [];

var chat = sockjs.createServer();
chat.on('connection', function(conn) {
    connections.push(conn);
    var number = connections.length;
    //conn.write("Welcome, User " + number);
    console.log("Welcome, User " + number);
    conn.on('data', function(message) {
        for (var ii=0; ii < connections.length; ii++) {
            //connections[ii].write("User " + number + " says: " + message);
            connections[ii].write(message);
        }
    });
    conn.on('close', function() {
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write("User " + number + " has disconnected");
        }
    });
});

function sendDataMsg(dataLogType, body) {    
    console.log('sendDataMsg : ' + JSON.stringify(body));
    var number = connections.length;
    for (var ii=0; ii < connections.length; ii++) {
        //connections[ii].write("data : " + body);
        connections[ii].write(dataLogType + '|' + body);
    }
}

/*********************************************************************************************/

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: appConfig.facebook_api_key,
    clientSecret: appConfig.facebook_api_secret,
    callbackURL: appConfig.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        console.log(profile.id + ' FacebookStrategy : ' + JSON.stringify(profile, null, 4));
        //console.log(profile.emails[0].value + 'fb abc : ' + profile.name.givenName + ' ' + profile.name.familyName);
        return done(null, profile);
    });
  }
));

// Set Web UI location
app.set('WIT_TOKEN', 'TXYURDOHI3HSY5U7MAZFQJH4357ZDV4K');// 'XFMRB7XCBTCKWFMDHUZGS3ZJCKJ3NSP7');
app.set('port', process.env.PORT || 8080);
app.use(express.static(__dirname + '/'+ mainPath)); 
app.use(bodyParser.json({limit: '10mb'}));                      // parse application/json
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));// parse application/x-www-form-urlencoded
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(passport.initialize());
app.use(passport.session());

require('./app/components/routes.js')(app);
require('./app/components/iisLogServices.js')(app);
require('./app/components/scrape.js')(app, connections);

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

app.get('/abc', function(req, res){
    var user = req.user;
    //console.log(user.facebook.email + 'fb abc : ' + user);
    res.redirect('/');
});

app.post('/api/triggerStatus', function(req, res) {
    var body = req.body.LogStatusData;
    var dataLogType = req.body.dataType;
    
    //console.log('[' + req.body.dataType + '] triggerStatus : ' + JSON.stringify(body));
    //res.redirect('/');
    sendDataMsg(dataLogType, body);
    res.json("200");
});

app.get('/login', function(req, res){
    console.log('fb login : ' + req.user);   
    res.json('200');
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/abc', failureRedirect: '/login' }),
  function(req, res) {
    //res.redirect('/');
    console.log('fb callback : ' + req.user);
});

/*********************************************************************************************/

app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '/'+ mainPath +'/', 'index.html'));
}); 

// Start the server
/*var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
}); */

var server = http.createServer(app).listen(app.get('port'), function(){
      var host = server.address().address;
      var port = server.address().port;
      console.log('Express server [' + host + '] listening on port ' + port);
});
chat.installHandlers(server, {prefix:'/chat'});

//app.listen(process.env.PORT || 8080)//('8081')
//console.log('Magic happens on port 8081');
exports = module.exports = app; 	