
var moment = require('moment');
var momentTimeZone = require('moment-timezone');
var nodemailer = require('nodemailer');

moment.locale('en-MY');

module.exports = function(app, connections) {  
    /**************************************** Wit.AI setup ***************************************/
    //var app = require('express');
    const Wit = require('node-wit').Wit;

    // Wit.ai parameters
    //app.set('WIT_TOKEN', 'XFMRB7XCBTCKWFMDHUZGS3ZJCKJ3NSP7');
    
    const WIT_TOKEN = app.get('WIT_TOKEN');
    const sessions = {};
    //console.log('usage: ' + WIT_TOKEN);

    function firstEntityValue (entities, entity) {
        const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value;
            
            if (!val) {
                return null;
            }
            return typeof val === 'object' ? val.value : val;
    }

    const actions = {
        say(sessionId, context, message, cb) {
            console.log('actions : ' + message);
            //sendMessage(message);
            cb();
        },
        merge(sessionId, context, entities, message, cb) {
            // Retrieve the location entity and store it into a context field
            const loc = firstEntityValue(entities, 'location');
            if (loc) {
            context.loc = loc;
            }
            cb(context);
        },
        error(sessionId, context, error) {
            console.log('error : ' + error.message);
        },
        ['fetch-weather'](sessionId, context, cb) {
            // Here should go the api call, e.g.:
            // context.forecast = apiCall(context.loc)
            console.log('fetch-weather : ' + context.loc);
            context.forecast = 'sunny';
            cb(context);
        },
    };

    
    
    // End
    const client = new Wit(WIT_TOKEN, actions);
    client.interactive();
    
    /**************************************** Wit.AI End ***************************************/

    /**************************************** Nodemailer setup ***************************************/

    var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: "insight.ai2000@gmail.com",
            pass: "Password#2016"
        }
    });

    function sendEMail(subjects, message) { 
        //console.log(subjects + '  : ' + message); 
        smtpTransport.sendMail({
                from: "no-reply@insightAI.com", // sender address
                to: "saiyien@macrokiosk.com",// km.teh@macrokiosk.com", // comma separated list of receivers
                subject: "" + subjects, // Subject line
                text: "" + message // plaintext body
            }, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });
    }
    /**************************************** Nodemailer End ****************************************/

    const storePostID = [];
    const storeTweet = [];
    const monitorFBName = ['Kim Ming'];
    const monitorTWName = ['@MaxisListens'];

    this.messageIncoming = function(value, typeMsg) {        
        //console.log('scrapeFB : ' + JSON.stringify(value.data, null, 4)); 
        console.log('messageIncoming : ' + value.data.length); 
        var msgType = "Facebook";
        var fbPosts = [];
        var message = "", username = "";
        for (var i = 0; i < value.data.length; i++) {
            if(value.data[i].from.name === monitorFBName[0]) {
                
                console.log('storePostID : ' + storePostID.length);
                for (var a = 0; a < storePostID.length; a++) {
                    if(value.data[i].id === storePostID[a].id) {
                        return;
                    }
                }
                
                username = value.data[i].from.name;
                message = value.data[i].message;

                fbPosts.push({
                    message: message,
                    image: value.data[i].full_picture,              
                    fullname: value.data[i].from.name,
                    username: value.data[i].from.id,
                    time: moment(value.data[i].created_time, "hh:mm a - dd MMM yyyy")
                }); 
                
                // Wit AI
                //processMessageIncoming(message);
                var reply = 'Product enquiries by customer. Email is triggered to Product team for further explaination.'; 
                
                setTimeout(function() {
                    sendMessage(reply);
                }, 3500);
                
                storePostID.push({id : value.data[i].id});

                /************************************* Send mail ***************************************/
                var subjects = 'Product enquiries';
                var msg = 
                'Hi Product Team,\n\n\n' +
                '[Source] Maxis ' + msgType + '\n' +
                '[Text: ] ' + message + '\n' +
                '[Sender:] ' + username + '\n\n' +
                '[Action: ] Product enquiries on internet.' + '\n\n\n' +
                'From\nInsight.AI';

                sendEMail(subjects, msg);
                
                /************************************* Broadcast UI ***************************************/
                for (var ii=0; ii < connections.length; ii++) {
                    //connections[ii].write("data : " + body);
                    var fbpost = typeMsg + '|' + JSON.stringify(fbPosts);
                    connections[ii].write(fbpost);
                }
            }
        }
        console.log('\nfbPosts ---> ' + JSON.stringify(fbPosts));         
    }
    
    
    this.tweetsIncoming = function(value, typeMsg) {        
        //console.log('tweetsIncoming : ' + JSON.stringify(value, null, 4)); 
        console.log('tweetsIncoming : ' + value.length); 
        var msgType = "Twitter";
        var tweets = [];
        var message = "", username = "", msg = "", tweetName = "@kampungboy2000";
        for (var i = 0; i < value.length; i++) {
            var dataTweet =  value[i].tweet.split(" ");
            username = dataTweet[0];
            message = value[i].tweet.replace(username + ' ', "");
            //console.log('username : ' + value[i].tweet);
            if(username === monitorTWName[0]) {
                
                console.log('storeTweet : ' + storeTweet.length);
                var msgSplit =  message.split(" ");                
                for (var a = 0; a < storeTweet.length; a++) {
                    var msgStoreSplit =  storeTweet[a].split(" ");
                    //console.log(tweetName + ' = ' + storeTweet[a].username);
                    //console.log(tweetDateTime + ' = ' + sTweetDateTime);
                    if(tweetName === storeTweet[a].username && msgSplit[0] === msgStoreSplit[0]) {
                        return;
                    }
                }

                //var tweetDateTime = value[i].tweetDetails[0].time;// .split(" - ");
                var tweetDateTime = momentTimeZone.tz(parseInt(value[i].tweetDetails[0].time), "Asia/Kuala_Lumpur").format();
                //var timestamp = parseInt(tweetDateTime), date = new Date(timestamp);  
                //console.log('tweetDateTime : ' + Date.parse(tweetDateTime.toString()));
                console.log(tweetDateTime + ' = username : ' + moment(tweetDateTime, "hh:mm a - dd MMM yyyy"));
                tweets.push({
                    message: message,
                    image: '',              
                    fullname: tweetName,
                    username: tweetName,
                    time: moment(tweetDateTime, "hh:mm a - dd MMM yyyy")
                }); 
                
                // Wit AI
                //processMessageIncoming(message);
                var reply = 'Customer complaint about the line. This complaint is triggering email to ' + 
                'Customer support for further follow up and action.';               
                setTimeout(function() {
                    sendMessage(reply);
                }, 3500);
                
                msg = message;
                storeTweet.push({
                    message: message,
                    image: '',              
                    fullname: tweetName,
                    username: tweetName,
                    time: moment(tweetDateTime, "hh:mm a - dd MMM yyyy")
                });

                /************************************* Send mail ***************************************/
                var subjects = 'Customer complaint';
                var msg = 
                'Hi Customer Support,\n\n\n' +
                '[Source] MaxisListen at ' + msgType + '\n' +
                '[Text: ] ' + msg + '\n' +
                '[Sender:] ' + tweetName + '\n\n' +
                '[Action: ] Customer complaint / churn. Kindly follow up closely.' + '\n\n\n' +
                'From\nInsight.AI';

                sendEMail(subjects, msg);
                
                /************************************* Broadcast UI ***************************************/
                
                for (var ii=0; ii < connections.length; ii++) {
                    //connections[ii].write("data : " + body);
                    var tweet = typeMsg + '|' + JSON.stringify(tweets);
                    connections[ii].write(tweet);
                }
            }
        }
        
        console.log('\ntweets ---> ' + JSON.stringify(tweets)); 
        //console.log('storeTweet ---> ' + JSON.stringify(storeTweet)); 
    }
    
    function sendMessage(msg) {          
        console.log('sendMessage  : ' + msg); 
        for (var ii=0; ii < connections.length; ii++) {
            //connections[ii].write("data : " + body);
            var aiReply = 'AIReply|' + msg;
            connections[ii].write(aiReply);
        }
    }
    
    function processMessage(msg1) {  
        console.log('processMessage : ' + msg1 + '\r\n'); 
        
        const msg = 'What is the weather in Paris';
        const context = {};
        client.message(msg, context, (error, data) => {
            if (error) {
                console.log('Oops! Got an error: ' + error);
            } else {
                console.log('1. Yay, got Wit.ai response: ' + JSON.stringify(data));
            }
        }); 
    }
    
    
    function processMessageIncoming(msg1) {
        // We retrieve the message content
        const msg = 'What is the weather in Paris?';
        
        /*const context = {};
        client.message(msg, context, (error, data) => {
        if (error) {
            console.log('Oops! Got an error: ' + error);
        } else {
            console.log('1. Yay, got Wit.ai response: ' + JSON.stringify(data));
        }
        }); 
        
        client.converse('my-user-session-42', 'what is the weather in London?', {}, (error, data) => {
            if (error) {
                console.log('Oops! Got an error: ' + error);
            } else {
                console.log('2. Yay, got Wit.ai response: ' + JSON.stringify(data));
            }
        });*/
        
        const session = new Date().toISOString();
        const context0 = {};
        client.runActions(session, msg, context0, (e, context1) => {
            if (e) {
                console.log('Oops! Got an error: ' + e);
                return;
            }
            console.log('1. The session state is now: ' + JSON.stringify(context1));
            /*client.runActions(session, 'and in Brussels?', context1, (e, context2) => {
                if (e) {
                console.log('Oops! Got an error: ' + e);
                return;
                }
                console.log('2. The session state is now: ' + JSON.stringify(context2));
            });*/
        });
    }

    app.get('/api/clearCacheData', function(req, res){        
        storePostID.splice(0, storePostID.length)
        storeTweet.splice(0, storeTweet.length)
        console.log('clearCacheData: [' + storePostID.length + '][' + storeTweet.length + ']');
    });

    app.get('/messageIncoming', function(req, res){
        console.log('fb login : ' + req.user);
        
        // We retrieve the message content
        const msg = 'What is the weather in Paris';
        
        const context = {};
        client.message(msg, context, (error, data) => {
            if (error) {
                console.log('Oops! Got an error: ' + error);
            } else {
                console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
            }
        }); 
        
        const session = new Date().toISOString();
        const context0 = {};
        client.runActions(session, msg, context0, (e, context1) => {
            if (e) {
                console.log('Oops! Got an error: ' + e);
                return;
            }
            console.log('1. The session state is now: ' + JSON.stringify(context1));
            res.json(context1);
            client.runActions(session, 'and in Brussels?', context1, (e, context2) => {
                if (e) {
                console.log('Oops! Got an error: ' + e);
                return;
                }
                console.log('2. The session state is now: ' + JSON.stringify(context2));
            });
        });
        
        
    });
};

/*module.exports = function(name, age) {
    this.name = name;
    this.age = age;
    this.about = function() {
        console.log(this.name +' is '+ this.age +' years old');
    };
};

//module.exports = 'witAI!';
module.exports.messageIncoming = function() {
    console.log('messageIncoming');
    this.messageIncoming();
}; */


