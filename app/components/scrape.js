var cheerio = require('cheerio');
var Xray = require('x-ray');
var xray = Xray();
var fbconfig = require('../config/appConfig'); 
var request = require('request');
var fs = require('fs');
var moment = require('moment');
var async = require('async');

module.exports = function(app, connections) {
    
    const witAI = require('./witAI.js');
    var wit = new witAI(app, connections);
    //console.log('wit: ' + JSON.stringify(wit));
    //wit.messageIncoming();
    
    app.get('/scrape', function(req, res){
        // Let's scrape Anchorman 2
        //url = 'http://www.imdb.com/title/tt1229340/';
        //url1 = 'http://www.imdb.com/title/tt1386588/';

        var urls = [{url: 'http://www.imdb.com/title/tt1229340/'}, {url: 'http://www.imdb.com/title/tt1386588/'}];

        for(var i = 0; i < urls.length; i++)
        {
        console.log('Scrape this URL :' + urls[i].url);
        request(urls[i].url, function(error, response, html){

            if(!error){
                var $ = cheerio.load(html);

                var title, release, rating;
                var json = { title : "", release : "", rating : ""};

                $('.header').filter(function(){
                    var data = $(this);
                    title = data.children().first().text();
                    release = data.children().last().children().text();

                    json.title = title;
                    json.release = release;
                })

                $('.star-box-giga-star').filter(function(){
                    var data = $(this);
                    rating = data.text();

                    json.rating = rating;
                })
            }


            console.log('Output :' + JSON.stringify(json, null, 4));

            /*fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */

            //res.send('Check your console!')
        })
        }
        res.send('Check your console!')
    })

    app.get('/scrapeTwit', function(req, res){
        // Let's scrape Anchorman 2

        var urls = [{url: 'https://twitter.com/MyMaybank'}];
        for(var i = 0; i < urls.length; i++)
        {
        console.log('Scrape this URL :' + urls[i].url);
        request(urls[i].url, function(error, response, html){

            if(!error){
                var $ = cheerio.load(html);

                var title, release, rating;
                var json = { title : "", release : "", rating : ""};

                $('.stream-item-header').filter(function(){
                    var data = $(this);
                    title = data.children().first().text();
                    release = data.children().last().children().text();

                    json.title = title;
                    json.release = release;
                })

                $('.TweetTextSize').filter(function(){
                    var data = $(this);
                    rating = data.text();

                    json.rating = rating;
                })
            }


            console.log('Output :' + JSON.stringify(json, null, 4));

            /*fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */

            //res.send('Check your console!')
        })
        }
         res.send('Check your console!');
    })

    app.get('/api/exportTweets', function(req, res){
        var url = req.query.urlText;
        //console.log(url); 

        //var url1 = url.parse(req.url, true);
        //console.log(url1);  
        //res.setHeader('Content-Type', 'text/plain');
        //res.setHeader('content-disposition', 'attachment; filename=tweets.json');    

        exportTweets(url, function(response){
            //res.send('200');
            //console.log(JSON.stringify(response, null, 4)); 
            //res.end(JSON.stringify(response, null, 4));
            res.json(response);
        })   
    })

    app.get('/api/exportTweetsReplies', function(req, res){
        var url = req.query.urlText; 
        //console.log(url);  
        //res.setHeader('Content-Type', 'text/plain');
        //res.setHeader('content-disposition', 'attachment; filename=tweetsReplies.json');    

        exportTweetsReplies(url, function(response){
            //res.send('200');
            //console.log(JSON.stringify(response, null, 4));  
            //res.end(JSON.stringify(response, null, 4));
            res.json(response);
        })    
    })

    app.get('/api/exportConversation', function(req, res){
        var url = req.query.urlText; 

        //res.setHeader('Content-Type', 'text/plain');
        //res.setHeader('content-disposition', 'attachment; filename=conversation.json');    

        exportTweets(url, function(response){
            //res.send('200');
            //res.end(JSON.stringify(response, null, 4));
            res.json(response);
        })  
    })

    function exportTweets(url, callback) {    
        xray(url, '.content',
             [{
                 tweet: '.TweetTextSize',
                 image: '.AdaptiveMedia .AdaptiveMedia-container .AdaptiveMedia-singlePhoto .AdaptiveMedia-photoContainer img@src',
                 tweetDetails: xray('.stream-item-header', 
                                 [{    
                                     avatar: 'img@src',
                                     fullname: '.fullname',
                                     username: '.username',
                                     time: '.time a@title',
                                 }]
                                ),
             }]
        )(function(err, obj) {       
            return callback(obj);
        })
    }

    function exportTweetsReplies(url, callback) {    
        xray(url, '.content',
             [{
                 tweet: '.TweetTextSize',  
                 tweetDetails: xray('.stream-item-header', 
                                 [{    
                                     avatar: 'img@src',
                                     fullname: '.fullname',
                                     username: '.username',
                                     time: '.time a@title',
                                 }]
                                )
             }]
        )(function(err, obj) {    
            return callback(obj);
        }) 
    }

    function scrapeTweets(url, callback) {  
        xray(url, '.content',
             [{
                 tweet: '.TweetTextSize',
                 image: '.AdaptiveMedia .AdaptiveMedia-container .AdaptiveMedia-singlePhoto .AdaptiveMedia-photoContainer img@src',
                 //hideCvstLink: '.stream-item-footer a@href',             
                 tweetDetails: xray('.stream-item-header', 
                                 [{               
                                     avatar: 'img@src',
                                     fullname: '.fullname',
                                     username: '.username',
                                     time: '.time a@title',
                                     //timeTweet: xray('a', ['@title']),
                                 }]
                                )
             }]
        )(function(err, obj) {
            //res.send('Output');
            //res.json(obj);         
            return callback(obj);
        })
    }

    function scrapeTweetsReplies(url, callback) {
        var tweetsReplies = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        xray(url, '.content',
             [{
                 tweet: '.TweetTextSize',  
                 hideCvstLink: '.stream-item-footer a@href',  
                 tweetDetails: xray('.stream-item-header', 
                                 [{               
                                     avatar: 'img@src',
                                     fullname: '.fullname',
                                     username: '.username',
                                     time: '.time span@data-time-ms', //'.time a@title',
                                 }]
                                ),
                 gotConversation: '.TweetTextSize',
                 tweetsReplies: tweetsReplies
             }]
        )(function(err, obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var objData = obj[key];
                    objData["gotConversation"] = 'true';

                    for (var prop in objData) {
                        if(objData.hasOwnProperty(prop)){
                            if(prop == 'hideCvstLink') {
                                if(objData[prop] != undefined)
                                    objData["gotConversation"] = 'false';
                            }
                        }
                    }
                }
            }
            //res.json(obj);        
            return callback(obj);
        }) 
    }
    
    function scrapeFB(url, callback) {  
        request(url, function(error, response, body) {
            console.log('scrapeFB : ' + url + '\r\n'); 
            return callback(body);
        });
    }
    
    app.post('/api/scrapeFBPost', function(req, res){
        var access_token = fbconfig.facebook_api_key + "|" + fbconfig.facebook_api_secret;
        var page_id = req.body.fbName; //'Maybank';
        var base = "https://graph.facebook.com/v2.6";
        var node = "/" + page_id + "/feed";
        var num_statuses = "40";
        //var parameters = "/?fields=message,link,created_time,type,name,id,likes.limit(1).summary(true),comments.limit(1).summary(true)," + "shares&limit=" + num_statuses + "&access_token=" + access_token;
        var parameters = "?fields=id,created_time,message,from,full_picture&format=json&limit=" + num_statuses + "&access_token=" + access_token;
        
        var url = base + node + parameters
        //console.log(url);  
        var fbPosts = [];
        scrapeFB(url, function(response){          
            var value = JSON.parse(response);
            //console.log('{' + value.data.length + '] scrapeFBPost : ' + JSON.stringify(value.paging.next, null, 4)); 
            //console.log('until : ' + getQueryString(value.paging.next, 'until')); 
            //console.log('paging_token : ' + getQueryString(value.paging.next, '__paging_token') + '\r\n'); 
            
            //console.log('{' + value.data.length + '] : ' + JSON.stringify(value.data, null, 4)); 
            
            //var pagingNext = value.paging.next;//"&until" + getQueryString(value.paging.next, 'until') + 
                             //"&__paging_token=" + getQueryString(value.paging.next, '__paging_token');
            
            //parameters = parameters + pagingNext;   
            wit.messageIncoming(value, 'FBPost');
            res.json(value);            
        });   
        
    })
    
    app.post('/api/scrapeFBPrevPost', function(req, res){
        //var url = 'https://www.facebook.com/Maybank';//req.body.urlText;
        var access_token = fbconfig.facebook_api_key + "|" + fbconfig.facebook_api_secret;
        var page_id = req.body.fbName; //'Maybank';
        var base = "https://graph.facebook.com/v2.5";
        var node = "/" + page_id + "/feed";
        //var parameters = "/?access_token=" + access_token;
        var num_statuses = "50";
        //var parameters = "/?fields=message,link,created_time,type,name,id,likes.limit(1).summary(true),comments.limit(1).summary(true)," + "shares&limit=" + num_statuses + "&access_token=" + access_token;
        var parameters = "/?fields=id,created_time,message,from,full_picture&limit=" + num_statuses + "&access_token=" + access_token;
        
        var url = base + node + parameters
        console.log(url);        
        scrapeFB(url, function(response){          
            /*var value = JSON.parse(response);
            //console.log('scrapeFB : ' + JSON.stringify(value.data, null, 4)); 
            console.log('scrapeFB : ' + value.data.length); 
            var fbPosts = [];
            for (var i = 0; i < value.data.length; i++) {
                fbPosts.push({
                             message: value.data[i].message,
                             image: value.data[i].full_picture,
                             postDetails: [{               
                                                 fullname: value.data[i].from.name,
                                                 username: value.data[i].from.id,
                                                 time: moment(value.data[i].created_time, "hh:mm a - dd MMM yyyy")
                }]}); 
            }*/
            
            fs.writeFile('output.json', JSON.stringify(JSON.parse(response)), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) 
            
            res.json(response);
        }) 
    })
    
    app.post('/api/scrapeFBPost1', function(req, res){
        var access_token = fbconfig.facebook_api_key + "|" + fbconfig.facebook_api_secret;
        var page_id = req.body.fbName; //'Maybank';
        var base = "https://graph.facebook.com/v2.5";
        var node = "/" + page_id + "/feed";
        var num_statuses = "2";
        //var parameters = "/?fields=message,link,created_time,type,name,id,likes.limit(1).summary(true),comments.limit(1).summary(true)," + "shares&limit=" + num_statuses + "&access_token=" + access_token;
        var parameters = "/?fields=id,created_time,message,from,full_picture&format=json&limit=" + num_statuses + "&access_token=" + access_token;
        
        var url = base + node + parameters
        //console.log(url);  
        var fbPosts = [];
        scrapeFB(url, function(response){          
            var value = JSON.parse(response);
            console.log('scrapeFBPost : ' + JSON.stringify(value.paging.next, null, 4)); 
            console.log('until : ' + getQueryString(value.paging.next, 'until')); 
            console.log('paging_token : ' + getQueryString(value.paging.next, '__paging_token') + '\r\n'); 
            
            for (var i = 0; i < value.data.length; i++) {
                fbPosts.push({
                             message: value.data[i].message,
                             image: value.data[i].full_picture,
                             postDetails: [{               
                                                 fullname: value.data[i].from.name,
                                                 username: value.data[i].from.id,
                                                 time: moment(value.data[i].created_time, "hh:mm a - dd MMM yyyy")
                }]}); 
            }
            
            var pagingNext = value.paging.next;//"&until" + getQueryString(value.paging.next, 'until') + 
                             //"&__paging_token=" + getQueryString(value.paging.next, '__paging_token');
            
            //parameters = parameters + pagingNext;
            
            scrapeFBPrevPost(pagingNext, function(returnData){             
                for (var i = 0; i < returnData.length; i++) {
                    fbPosts.push({
                                 message: returnData[i].message,
                                 image: returnData[i].full_picture,
                                 postDetails: [{               
                                                     fullname: returnData[i].from.name,
                                                     username: returnData[i].from.id,
                                                     time: moment(returnData[i].created_time, "hh:mm a - dd MMM yyyy")
                    }]}); 
                }
            })
            
            fs.writeFile('output.json', JSON.stringify(fbPosts), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) 
            
            //res.json(fbPosts);
            
        });   
        
    })

    function scrapeFBPrevPost(pagingNext, callback) {  
        //var access_token = fbconfig.facebook_api_key + "|" + fbconfig.facebook_api_secret;
        //var page_id = fbName; //'Maybank';
        //var base = "https://graph.facebook.com/v2.5";
        //var node = "/" + page_id + "/feed";
        //var num_statuses = "5";
        //var parameters = "/?fields=id,created_time,message,from,full_picture&limit=" + num_statuses + "&access_token=" + access_token;
        
        //var url = base + node + parameters
        var url = pagingNext;
        console.log('scrapeFBPrevPost 1 : ' + url);        
        scrapeFB(url, function(response){          
            var value = JSON.parse(response);
            //console.log('scrapeFB : ' + JSON.stringify(value.data, null, 4)); 
            console.log('scrapeFBPrevPost 2 : ' + value.data.length); 
            /*var fbPosts = [];
            for (var i = 0; i < value.data.length; i++) {
                fbPosts.push({
                             message: value.data[i].message,
                             image: value.data[i].full_picture,
                             postDetails: [{               
                                                 fullname: value.data[i].from.name,
                                                 username: value.data[i].from.id,
                                                 time: moment(value.data[i].created_time, "hh:mm a - dd MMM yyyy")
                }]}); 
            }*/
            
            console.log('scrapeFBPrevPost 3 : ' + JSON.stringify(response, null, 4)); 
            callback(response);
        }) 
    }
    
    function getQueryString(url, field) {  
        var href = url ? url : window.location.href;
        var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
        var string = reg.exec(href);
        return string ? string[1] : null;
    }

    app.post('/api/scrapeTweets', function(req, res){
        var url = req.body.urlText;
        //console.log(url);        
        scrapeTweets(url, function(response){
            res.json(response);
        }) 
    })

    app.post('/api/scrapeTweetsReplies', function(req, res){
        var url = req.body.urlText; 
        //console.log(url);   
        scrapeTweetsReplies(url, function(response){
            wit.tweetsIncoming(response, 'Tweet');
            res.json(response);
        })    
    })
};