angular.module('autobotSearch', ['ngRoute', 'twitterController', 'fbController', 'iisLogController', 'autobotService', 'autobotScrapeService', 'iisLogService', 'settingService', 'smart-table', 'myCurrentTime'])
        .config(AbotConfig);
    
AbotConfig.$inject = ['$mdThemingProvider', '$routeProvider'];
    
function AbotConfig($mdThemingProvider, $routeProvider) {
  //$mdThemingProvider.theme("customTheme").primaryPalette("blue").accentPalette("green");
  $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('blue-grey');
    
  $routeProvider.
    when('/main', {
        templateUrl: 'view/main.html',
        controller: 'botTwitterController'
    }).
    when('/fb', {
        templateUrl: 'view/fb.html',
        controller: 'botFBController'
    }).
    when('/iislog', {
        templateUrl: 'view/iislog.html',
        controller: 'botIISLogController'
    }).
    when('/opencpu', {
        templateUrl: 'view/r.html',
        controller: 'botIISLogController'
    }).
    when('/liveplot', {
        templateUrl: 'view/liveplot.html',
        controller: 'botIISLogController'
    }).
    otherwise({
        redirectTo: '/main'
    });
}
;(function() {
    'use strict';    
    angular.module('twitterController', ['ngMaterial', 'ngMessages', 'timer'])
            .controller('botTwitterController', TwitterController);

    TwitterController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', 'botService', 'botScrapeService'];

    var sock = new SockJS('http://localhost:8080/chat');
    function TwitterController($scope, $http, $timeout, $log, $interval, $location, botService, botScrapeService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;

        /***********************************************************************************************************/

        
        
        $scope.messages = [];
        $scope.sendMessage = function() {
            sock.send($scope.messageText);
            $scope.messageText = "";
        };

        sock.onmessage = function(e) {
            $scope.messages.push(e.data);
            $scope.$apply();
        };
        
        /***********************************************************************************************************/
        
        $scope.userState = 1;
        $scope.states = ('0 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

        $scope.intervals = 1000;
        $scope.countdownTimer = $scope.userState * 60;

        $scope.callbackTimerFinished = function(){
            $scope.getTweet($scope.tweetData, undefined);
            $scope.$digest();
        };

        $scope.changeInterval = function(){
            $scope.stopClock();
            $scope.countdownTimer = $scope.userState * 60;
            $scope.$broadcast('timer-set-countdown', $scope.countdownTimer);
            $scope.resetClock();

            if($scope.countdownTimer > 0) {
                if(angular.isDefined($scope.tweetData))
                    $scope.startClock();
            }
        };

        $scope.timerRunning = false;
        var timeStarted = false;

        $scope.startClock = function() {
            if (!timeStarted) {
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
                timeStarted = true;
            } else if ((timeStarted) && (!$scope.timerRunning)) {
                $scope.$broadcast('timer-resume');
                $scope.timerRunning = true;
            }
        };

        $scope.stopClock = function() {
            if ((timeStarted) && ($scope.timerRunning)) {
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }
        };

        $scope.resetClock = function() {
            if ((!$scope.timerRunning))
                $scope.$broadcast('timer-reset');
        };

        $scope.$on('timer-stopped', function(event, data) {
            timeStarted = true;
        });

        $scope.getFB = function () {
            /*$http.post('http://localhost:8080/api/scrapeFB', {urlText: 'ab'})
                .success(function(data) {
                    $log.debug(data);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); */
            
            $location.path("/fb");  
        };
        
        $scope.getTwitter = function () {            
            $location.path("/main");  
        };
        
        $scope.getIISLog = function () {            
            $location.path("/iislog");  
        };
        
        $scope.getR = function () {            
            $location.path("/opencpu");  
        };
        
        $scope.liveplot = function () {            
            $location.path("/liveplot");  
        };
        
        /***********************************************************************************************************/    

        $scope.itemTwitters = [];    
        $scope.isAdd = true;

        $scope.getTweetsLink = function () {
            botService.get()
                .success(function(data) {
                    $scope.itemTwitters = [];
                    angular.forEach(data, function(value, key) {            
                        $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                  linkTweetsReplies : value.tweetsRepliesLink});            
                    });
                    //$log.debug(JSON.stringify($scope.itemTwitters, null, 4) + ' addTweetsLink: ' + JSON.stringify(data, null, 4));
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

            /*$scope.itemTwitters = [{tweetName: 'Maybank Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/MyMaybank', linkTweetsReplies : 'https://twitter.com/MyMaybank/with_replies'}, 
                              {tweetName: 'CIMB Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/cimbmalaysia', linkTweetsReplies : 'https://twitter.com/CIMBMalaysia/with_replies'},
                              {tweetName: 'HLB Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/myhongleong', linkTweetsReplies : 'https://twitter.com/MYHongLeong/with_replies'},
                               {tweetName: 'OCBC Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/OCBCmy', linkTweetsReplies : 'https://twitter.com/OCBCmy/with_replies'},
                              ]; */
        };

        $scope.addTweetsLink = function (twitData) {        
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.create(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemTwitters = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                      linkTweetsReplies : value.tweetsRepliesLink});             
                        });
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }
        };

        $scope.editTwitterLink = function (twit, id, event) {
            //$log.debug(JSON.stringify($scope.itemTwitters, null, 4) + ' editTwitterLink: ' + event);
            $scope.isAdd = false;
            angular.forEach($scope.itemTwitters, function(value, key) { 
                if(value.id === id) {
                    $scope.twit = {id: value.id, twitterName: value.tweetName, tweetsLink: value.linkTweets,
                    tweetsRepliesLink: value.linkTweetsReplies};
                }
            }); 
        };

        $scope.cancelTwitterLink = function () {
            $scope.twit = undefined;
            $scope.isAdd = true;
        };

        $scope.updateTwitterLink = function (twitData) {
            //$log.debug(JSON.stringify(twitData, null, 4) + ' updateTwitterLink: ' + event);
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.put(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemTwitters = [];
                        //$log.debug(JSON.stringify(data, null, 4) + ' updateTwitterLink: ');
                        angular.forEach(data, function(value, key) {            
                            $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                      linkTweetsReplies : value.tweetsRepliesLink});              
                        });                    
                        $scope.isAdd = true;
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }        
        };

        $scope.deleteTwitterLink = function (id, event) {
            if (!$.isEmptyObject(id)) {
                // call the create function from our service (returns a promise object)
                botService.delete(id)
                    .success(function(data) {                       
                        $scope.itemTwitters = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                      linkTweetsReplies : value.tweetsRepliesLink});              
                        });                   
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }    
        };

        /***********************************************************************************************************/

        $scope.tweet = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.tweetReplies = [{
                 tweet: '',
                 image: '',
                 gotConversation: 'true',
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }],
        }];        

        $scope.tweetData = undefined;

        $scope.getTweet = function (tweet, event) {
            if (angular.isDefined(event)) {
                if (event.target.tagName === 'A')
                    return;
            }

            $scope.isLoading = false;
            $scope.tweetData = tweet; 

            return $timeout(function() {              
                var urlTweets = tweet.linkTweets;
                
                botScrapeService.scrapeTweets(urlTweets)
                .success(function(data) {
                    $log.debug(JSON.stringify(data));
                    $scope.tweet = data;
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

                /****************************************************************************************/
                var urlTweetsReplies = tweet.linkTweetsReplies;

                botScrapeService.scrapeTweetsReplies(urlTweetsReplies)
                .success(function(data) {
                    $scope.tweetReplies = data;
                    $scope.isLoading = true;
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

                if(!angular.isDefined($scope.tweetData))
                    $scope.startClock();
                else {
                    $scope.stopClock();
                    $scope.resetClock();
                    $scope.startClock();
                }
            }, 200); 
        };

        $scope.tweetsReplies = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.getTweetsReplies = function (linkTweetsReplies, dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = linkTweetsReplies;

                botScrapeService.scrapeTweets(urlTweetsReplies)
                .success(function(data) {
                    dataTweetReplies.tweetsReplies = [];
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].tweetDetails.length > 0)
                            dataTweetReplies.tweetsReplies.push(data[i]);
                    }
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200); 
        };

        $scope.export = function (data, fileName) {
            /*var a = document.createElement('a');
            a.href = 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4));
            a.target = '_blank';
            a.download = 'tweets.json';

            document.body.appendChild(a);
            a.click(); */

            var anchor = angular.element('<a/>');
            anchor.attr({ href: 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4)),
                 target: '_blank', download: fileName + '.json'
            })[0].click();
        };

        $scope.exportTweets = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.tweetData.linkTweets;

                botScrapeService.exportTweets(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweets');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportTweetsReplies = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.tweetData.linkTweetsReplies;

                botScrapeService.exportTweetsReplies(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweetsReplies');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportConversation = function (dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = dataTweetReplies.hideCvstLink;

                botScrapeService.exportConversation(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'conversation');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };
    }
})();;(function() {
    'use strict';    
    angular.module('fbController', ['ngMaterial', 'ngMessages', 'timer'])
            .controller('botFBController', FBController);

    FBController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botService', 'botScrapeService'];

    function FBController($scope, $http, $timeout, $log, $interval, $location, $filter, botService, botScrapeService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;

        /***********************************************************************************************************/

        $scope.userState = 1;
        $scope.states = ('0 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

        $scope.intervals = 1000;
        $scope.countdownTimer = $scope.userState * 60;

        $scope.callbackTimerFinished = function(){
            $scope.getPosts($scope.postData, undefined);
            $scope.$digest();
        };

        $scope.changeInterval = function(){
            $scope.stopClock();
            $scope.countdownTimer = $scope.userState * 60;
            $scope.$broadcast('timer-set-countdown', $scope.countdownTimer);
            $scope.resetClock();

            if($scope.countdownTimer > 0) {
                if(angular.isDefined($scope.postData))
                    $scope.startClock();
            }
        };

        $scope.timerRunning = false;
        var timeStarted = false;

        $scope.startClock = function() {
            if (!timeStarted) {
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
                timeStarted = true;
            } else if ((timeStarted) && (!$scope.timerRunning)) {
                $scope.$broadcast('timer-resume');
                $scope.timerRunning = true;
            }
        };

        $scope.stopClock = function() {
            if ((timeStarted) && ($scope.timerRunning)) {
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }
        };

        $scope.resetClock = function() {
            if ((!$scope.timerRunning))
                $scope.$broadcast('timer-reset');
        };

        $scope.$on('timer-stopped', function(event, data) {
            timeStarted = true;
        });

        $scope.getFB = function () {            
            $location.path("/fb");  
        };
        
        $scope.getTwitter = function () {            
            $location.path("/main");  
        };
        
        $scope.getIISLog = function () {            
            $location.path("/iislog");  
        };
        
        $scope.getR = function () {            
            $location.path("/opencpu");  
        };
        
        $scope.liveplot = function () {            
            $location.path("/liveplot");  
        };
        
        /***********************************************************************************************************/    

        $scope.itemFBPosts = [];    
        $scope.isAdd = true;

        $scope.getFBsLink = function () {
            /*botService.get()
                .success(function(data) {
                    $scope.itemFBPosts = [];
                    angular.forEach(data, function(value, key) {            
                        $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                  linkFBPost : value.tweetsRepliesLink});            
                    });
                    //$log.debug(JSON.stringify($scope.itemFBPosts, null, 4) + ' addTweetsLink: ' + JSON.stringify(data, null, 4));
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
            */
            $scope.itemFBPosts = [{fbPostName: 'Maybank', fbPostImage: 'assets/img/maybank.jpg', 
                    fbPageID : 'Maybank', linkFBPost : 'https://www.facebook.com/Maybank'}, 
                              {fbPostName: 'CIMB Malaysia', fbPostImage: 'assets/img/cimb.jpeg', 
                    fbPageID : 'CIMBMalaysia', linkFBPost : 'https://www.facebook.com/CIMBMalaysia'}
                              ]; 
        };

        $scope.addTweetsLink = function (twitData) {        
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.create(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemFBPosts = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                      linkFBPost : value.tweetsRepliesLink});             
                        });
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }
        };

        $scope.editTwitterLink = function (twit, id, event) {
            //$log.debug(JSON.stringify($scope.itemFBPosts, null, 4) + ' editTwitterLink: ' + event);
            $scope.isAdd = false;
            angular.forEach($scope.itemFBPosts, function(value, key) { 
                if(value.id === id) {
                    $scope.twit = {id: value.id, twitterName: value.fbPostName, tweetsLink: value.fbPageID,
                    tweetsRepliesLink: value.linkFBPost};
                }
            }); 
        };

        $scope.cancelTwitterLink = function () {
            $scope.twit = undefined;
            $scope.isAdd = true;
        };

        $scope.updateTwitterLink = function (twitData) {
            //$log.debug(JSON.stringify(twitData, null, 4) + ' updateTwitterLink: ' + event);
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.put(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemFBPosts = [];
                        //$log.debug(JSON.stringify(data, null, 4) + ' updateTwitterLink: ');
                        angular.forEach(data, function(value, key) {            
                            $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                      linkFBPost : value.tweetsRepliesLink});              
                        });                    
                        $scope.isAdd = true;
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }        
        };

        $scope.deleteTwitterLink = function (id, event) {
            if (!$.isEmptyObject(id)) {
                // call the create function from our service (returns a promise object)
                botService.delete(id)
                    .success(function(data) {                       
                        $scope.itemFBPosts = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                      linkFBPost : value.tweetsRepliesLink});              
                        });                   
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }    
        };

        /***********************************************************************************************************/

        $scope.tweet = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.fbPosts = [{
                 message: '',
                 image: '',
                 gotComments: 'true',
                 postDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }],
        }];        

        $scope.postData = undefined;

        $scope.getPosts = function (postLinkInfo, event) {
            if (angular.isDefined(event)) {
                if (event.target.tagName === 'A')
                    return;
            }

            $scope.isLoading = false;
            $scope.postData = postLinkInfo; 

            return $timeout(function() {                              
                botScrapeService.scrapeFBPost(postLinkInfo.fbPageID)
                .success(function(data) {
                    var data1 = JSON.parse(data);
                    //$log.debug(data1.data);   
                    $scope.fbPosts = [];
                    angular.forEach(data1.data, function(value, key) {            
                        //$log.debug(JSON.stringify(value)); 
                        //$log.debug('message : ' + value.message);
                        var avatarImg = 'assets/img/fb.png';
                        if(value.from.name == $scope.postData.fbPostName) {
                            avatarImg = $scope.postData.fbPostImage;
                        }
                        $scope.fbPosts.push({
                             message: value.message,
                             image: value.full_picture,
                             gotComments: 'true',
                             postDetails: [{               
                                                 avatar: avatarImg,
                                                 fullname: value.from.name,
                                                 username: value.from.id,
                                                 time: $filter('date')(new Date(value.created_time), 'hh:mm a - dd MMM yyyy')
                        }]});                        
                    });     
                    //$log.debug(JSON.stringify($scope.fbPosts)); 
                    $scope.isLoading = true;
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

                if(!angular.isDefined($scope.postData))
                    $scope.startClock();
                else {
                    $scope.stopClock();
                    $scope.resetClock();
                    $scope.startClock();
                }
            }, 200); 
        };

        $scope.tweetsReplies = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.getTweetsReplies = function (linkFBPost, dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = linkFBPost;

                botScrapeService.scrapeTweets(urlTweetsReplies)
                .success(function(data) {
                    dataTweetReplies.tweetsReplies = [];
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].tweetDetails.length > 0)
                            dataTweetReplies.tweetsReplies.push(data[i]);
                    }
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200); 
        };

        $scope.export = function (data, fileName) {
            /*var a = document.createElement('a');
            a.href = 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4));
            a.target = '_blank';
            a.download = 'tweets.json';

            document.body.appendChild(a);
            a.click(); */

            var anchor = angular.element('<a/>');
            anchor.attr({ href: 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4)),
                 target: '_blank', download: fileName + '.json'
            })[0].click();
        };

        $scope.exportTweets = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.postData.fbPageID;

                botScrapeService.exportTweets(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweets');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportTweetsReplies = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.postData.linkFBPost;

                botScrapeService.exportTweetsReplies(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweetsReplies');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportConversation = function (dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = dataTweetReplies.hideCvstLink;

                botScrapeService.exportConversation(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'conversation');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };
    }
})();;(function() {
    'use strict';    
    angular.module('iisLogController', ['ngMaterial', 'ngMessages', 'timer', 'googlechart'])
            .controller('botIISLogController', IISLogController);

    IISLogController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botIISLogService'];

    function IISLogController($scope, $http, $timeout, $log, $interval, $location, $filter, botIISLogService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;

        /***********************************************************************************************************/

        $scope.userState = 1;
        $scope.states = ('0 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

        $scope.intervals = 1000;
        $scope.countdownTimer = $scope.userState * 60;

        $scope.callbackTimerFinished = function(){
            $scope.getPosts($scope.postData, undefined);
            $scope.$digest();
        };

        $scope.changeInterval = function(){
            $scope.stopClock();
            $scope.countdownTimer = $scope.userState * 60;
            $scope.$broadcast('timer-set-countdown', $scope.countdownTimer);
            $scope.resetClock();

            if($scope.countdownTimer > 0) {
                if(angular.isDefined($scope.postData))
                    $scope.startClock();
            }
        };

        $scope.timerRunning = false;
        var timeStarted = false;

        $scope.startClock = function() {
            if (!timeStarted) {
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
                timeStarted = true;
            } else if ((timeStarted) && (!$scope.timerRunning)) {
                $scope.$broadcast('timer-resume');
                $scope.timerRunning = true;
            }
        };

        $scope.stopClock = function() {
            if ((timeStarted) && ($scope.timerRunning)) {
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }
        };

        $scope.resetClock = function() {
            if ((!$scope.timerRunning))
                $scope.$broadcast('timer-reset');
        };

        $scope.$on('timer-stopped', function(event, data) {
            timeStarted = true;
        });

        $scope.getFB = function () {            
            $location.path("/fb");  
        };
        
        $scope.getTwitter = function () {            
            $location.path("/main");  
        };
        
        $scope.getIISLog = function () {            
            $location.path("/iislog");  
        };
        
        $scope.getR = function () {            
            $location.path("/opencpu");  
        };
        
        $scope.liveplot = function () {            
            $location.path("/liveplot");  
        };
        
        /***********************************************************************************************************/    

        $scope.itemsByPage = 10; 
        $scope.iisLogStatusCollection = [];    
        $scope.iisLogNoOfHitsAPICollection = []; 
        $scope.iisLogErrorStatusCollection = [];    
        $scope.iisLogErrorStatusByDateTimeCollection = [];  
        $scope.itemIISLogStatus = [].concat($scope.iisLogStatusCollection);
        $scope.itemIISLogNoOfHitsAPI = [].concat($scope.iisLogNoOfHitsAPICollection);
        $scope.itemIISLogErrorStatus = [].concat($scope.iisLogErrorStatusCollection);
        $scope.itemIISLogErrorStatusByDateTime = [].concat($scope.iisLogErrorStatusByDateTimeCollection);
        
        
        $scope.load_iislogstatus_lib = function () {            
            $scope.getIISLogStatusReport();  
            $scope.getIISLogErrorStatusReport();  
            $scope.getIISLogNoOfHitsAPIReport();  
            $scope.getIISLogErrorStatusByDateTimeReport();
        };
        
        $scope.getIISLogStatusReport = function () {
            botIISLogService.getIISLogStatus()
                .success(function(data) {
                    var rowData = [];
                    var rowData1 = [];
                    var serverName = '';
                    angular.forEach(data, function(value1, key) {  
                        //$log.debug('getIISLogStatusReport: ' + JSON.stringify(value1.iisLogStatus.iisLogStatusDetails));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogStatus.iisLogStatusDetails;
                        var count = 0;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogStatusCollection.push({apiLink : value.apiLink, averageTimeTaken: value.averageTimeTaken, maxTimeTaken : value.maxTimeTaken, minTimeTaken : value.minTimeTaken});  
                            
                            if (count < logdata.length/2) {
                                rowData.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.averageTimeTaken)},
                                    {v: parseInt(value.maxTimeTaken)},
                                    {v: parseInt(value.minTimeTaken)}
                                ]});
                            }
                            else {
                                rowData1.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.averageTimeTaken)},
                                    {v: parseInt(value.maxTimeTaken)},
                                    {v: parseInt(value.minTimeTaken)}
                                ]});
                            }
                            count++;
                        });
                    });
                    $scope.getIISlogStatusColChart(serverName, rowData);
                    $scope.getIISlogStatusColChart1(serverName, rowData1);
                    //$scope.$apply(); 
                    //$log.debug(JSON.stringify($scope.itemTwitters, null, 4) + ' addTweetsLink: ' + JSON.stringify(data, null, 4));
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        $scope.getIISLogNoOfHitsAPIReport = function () {
            botIISLogService.getIISLogNoOfHitsAPI()
                .success(function(data) {
                    var rowData = [];
                    var rowData1 = [];
                    var serverName = '';
                    //$log.debug('getIISLogErrorStatusReport: ' + JSON.stringify(data));
                
                    angular.forEach(data, function(value1, key) {  
                        serverName = value1.serverName;
                        var logdata = value1.iisLogNoOfHitsAPI.iisLogNoOfHitsAPIDetails;
                        var count = 0;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogNoOfHitsAPICollection.push({apiLink : value.apiLink, noOfHits: value.noOfHits });  
                            
                            if (count < logdata.length/2) {
                                rowData.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.noOfHits)}
                                ]});
                            }
                            else {
                                rowData1.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.noOfHits)}
                                ]});
                            }
                            count++;
                        });
                    });
                    $scope.getIISLogNoOfHitsAPIColChart(serverName, rowData);
                    $scope.getIISLogNoOfHitsAPIColChart1(serverName, rowData1);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        $scope.getIISLogErrorStatusReport = function () {
            botIISLogService.getIISLogErrorStatus()
                .success(function(data) {
                    var rowData = [];
                    var serverName = '';
                
                    angular.forEach(data, function(value1, key) {  
                        //$log.debug('getIISLogErrorStatusReport: ' + JSON.stringify(value1.iisLogErrorStatus.iisLogErrorStatusDetails));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogErrorStatus.iisLogErrorStatusDetails;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogErrorStatusCollection.push({status : value.status, total: value.total}); 
                            
                            rowData.push({c: [
                                {v: value.status },
                                {v: parseInt(value.total)}
                            ]});
                        });
                    });
                    $scope.getIISlogErrorStatusBarChart(serverName, rowData);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        $scope.getIISLogErrorStatusByDateTimeReport = function () {
            botIISLogService.getIISLogErrorStatusByDateTime()
                .success(function(data) {
                    var rowData = [];
                    var serverName = '';
                    angular.forEach(data, function(value1, key) {  
                        $log.debug('getIISLogErrorStatusByDateTimeReport: ' + JSON.stringify(value1.iisLogErrorStatusByDateTime));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogErrorStatusByDateTime;                        
                        angular.forEach(logdata, function(value1, key) {  
                            var rowData1 = [];
                            angular.forEach(value1.iisLogErrorStatusByDateTimeDetails, function(value, key) {
                                $scope.iisLogErrorStatusByDateTimeCollection.push({timeStamp: value1.timeStamp, status : value.status, noOfHits: value.noOfHits}); 

                                rowData1.push({status : value.status, noOfHits: value.noOfHits});
                            });
                            $log.debug('rowData1: ' + JSON.stringify(rowData1));
                            
                            var status200 = '0', status302 = '0', status404 = '0', status500 = '0';
                            for(var i = 0; i < rowData1.length; i++) {
                                if(rowData1[i].status == '200')
                                    status200 = rowData1[i].noOfHits;
                                if(rowData1[i].status == '302')
                                    status302 = rowData1[i].noOfHits;
                                if(rowData1[i].status == '404')
                                    status404 = rowData1[i].noOfHits;
                                if(rowData1[i].status == '500')
                                    status500 = rowData1[i].noOfHits;
                            }
                            rowData.push({c: [
                                    {v: value1.timeStamp },
                                    //{v: parseInt(status200)},
                                    {v: parseInt(status302)},
                                    //{v: parseInt(status404)},
                                    {v: parseInt(status500)}
                            ]});
                        });
                        $log.debug('logdata: ' + JSON.stringify(rowData));
                    });
                    $scope.getIISlogErrorStatusByDateTimeLineChart(serverName, rowData);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        /********************************************************************************************************/   
        
        var dataLogStatus = [
                    {id: "api", label: "API Link", type: "string"},
                    {id: "ave", label: "Average Time", type: "number"},
                    {id: "max", label: "Max Time", type: "number"},
                    {id: "min", label: "Min Time", type: "number"}
                ];
        var dataLogStatusTitle = 'Time taken based on API link - Server : ';
        
        $scope.getIISlogStatusColChart = function (serverName, rowData) {
            $scope.iisLogStatusColChart = {};    
            $scope.iisLogStatusColChart.type = "ColumnChart";

            $scope.iisLogStatusColChart.data = {
                "cols": dataLogStatus, 
                "rows": rowData
            };

            $scope.iisLogStatusColChart.options = {
                'title': dataLogStatusTitle + serverName
            };
        };
        
        $scope.getIISlogStatusColChart1 = function (serverName, rowData) {
            $scope.iisLogStatusColChart1 = {};    
            $scope.iisLogStatusColChart1.type = "ColumnChart";

            $scope.iisLogStatusColChart1.data = {
                "cols": dataLogStatus, 
                "rows": rowData
            };

            $scope.iisLogStatusColChart1.options = {
                'title': dataLogStatusTitle + serverName
            };
        };
        
        /********************************************************************************************************/   
        
        var dataNoOfHitsAPI = [
                    {id: "api", label: "API Link", type: "string"},
                    {id: "noh", label: "No of Hits", type: "number"}
                ];
        var dataNoOfHitsAPITitle = 'No of hits based on API link - Server : ';
        
        $scope.getIISLogNoOfHitsAPIColChart = function (serverName, rowData) {
            $scope.iisLogNoOfHitsAPIColChart = {};    
            $scope.iisLogNoOfHitsAPIColChart.type = "ColumnChart";

            $scope.iisLogNoOfHitsAPIColChart.data = {
                "cols": dataNoOfHitsAPI, 
                "rows": rowData
            };

            $scope.iisLogNoOfHitsAPIColChart.options = {
                'title': dataNoOfHitsAPITitle + serverName
            };
        };
        
        $scope.getIISLogNoOfHitsAPIColChart1 = function (serverName, rowData) {
            $scope.iisLogNoOfHitsAPIColChart1 = {};    
            $scope.iisLogNoOfHitsAPIColChart1.type = "ColumnChart";

            $scope.iisLogNoOfHitsAPIColChart1.data = {
                "cols": dataNoOfHitsAPI, 
                "rows": rowData
            };

            $scope.iisLogNoOfHitsAPIColChart1.options = {
                'title': dataNoOfHitsAPITitle + serverName
            };
        };
        
        /********************************************************************************************************/   
        
        $scope.getIISlogErrorStatusBarChart = function (serverName, rowData) {
            var chartData = {
                "cols": [
                    {id: "s", label: "Status Code", type: "string"},
                    {id: "t", label: "Total of hits", type: "number"}
                ], 
                "rows": rowData
            };
            
            /*$scope.iisLogErrorStatusPieChart = {};    
            $scope.iisLogErrorStatusPieChart.type = "PieChart";

            $scope.iisLogErrorStatusPieChart.data = chartData;

            $scope.iisLogErrorStatusPieChart.options = {
                'title': 'Status Report'
            }; */
            
            $scope.iisLogErrorStatusBarChart = {};
            $scope.iisLogErrorStatusBarChart.type = "BarChart";

            $scope.iisLogErrorStatusBarChart.data = chartData;

            $scope.iisLogErrorStatusBarChart.options = {
                'title': 'Status Code Report - Server : ' + serverName
            };
        };        
        
        /********************************************************************************************************/   
        
        $scope.getIISlogErrorStatusByDateTimeLineChart = function (serverName, rowData) {
            var chartData = {
                /*"cols": [
                    {id: "s", label: "Status Code", type: "string"},
                    {id: "t", label: "Total of hits", type: "number"}
                    
                ], */
                "cols": [{
                    id: "month",
                    label: "Date Time",
                    type: "string"
                }, /*{
                    id: "laptop-id",
                    label: "200",
                    type: "number"
                }, */{
                    id: "302",
                    label: "302",
                    type: "number"
                }, /*{
                    id: "404",
                    label: "404",
                    type: "number"
                }, */{
                    id: "500",
                    label: "500",
                    type: "number"
                }],
                "rows": rowData
            };
            
            
            
            /*$scope.iisLogErrorStatusPieChart = {};    
            $scope.iisLogErrorStatusPieChart.type = "PieChart";

            $scope.iisLogErrorStatusPieChart.data = chartData;

            $scope.iisLogErrorStatusPieChart.options = {
                'title': 'Status Report'
            }; */
            
            $scope.iisLogErrorStatusByDateTimeLineChart = {};
            $scope.iisLogErrorStatusByDateTimeLineChart.type = "LineChart";

            $scope.iisLogErrorStatusByDateTimeLineChart.data = chartData;

            $scope.iisLogErrorStatusByDateTimeLineChart.options = {
                'title': 'No of Hits of Error Code By Date Time - Server : ' + serverName,
                "isStacked": "true",
                "fill": 20,
                "displayExactValues": true,
                "vAxis": {
                    "title": "No of Hits",
                    "gridlines": {
                        "count": 10
                    }
                },
                "hAxis": {
                    "title": "Date"
                }
            };
        };
        
        /********************************************************************************************************/ 

        $scope.hideSeries = function (selectedItem) {
            if(selectedItem !== undefined) {
                if(selectedItem.column !== undefined) {
                //if (selectedItem.column === null) {
                    var col = selectedItem.column;
                    var row = selectedItem.row;
                    $log.debug('col: ' + JSON.stringify(col) + ' - row: ' + JSON.stringify(row));
                    var data = $scope.iisLogNoOfHitsAPIColChart.data.rows[row].c;
                    $log.debug(data.length + ' - ' + data[0].v);
                    
                    var apiLink = data[0].v;
                    botIISLogService.getIISLogNoOfHitsAPICIP(apiLink)
                        .success(function(data) {
                            var rowData = [];
                            var rowData1 = [];
                            var serverName = 'B';
                            //$log.debug('getIISLogErrorStatusReport: ' + JSON.stringify(data));

                            angular.forEach(data, function(value, key) {  
                                //serverName = value1.serverName;
                                //var logdata = value1.iisLogNoOfHitsAPI.iisLogNoOfHitsAPIDetails;
                                //var count = 0;
                                rowData.push({c: [
                                            {v: value.sourceIP },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                                /*angular.forEach(logdata, function(value, key) {
                                    $scope.iisLogNoOfHitsAPICollection.push({apiLink : value.apiLink, noOfHits: value.noOfHits });  

                                    if (count < logdata.length/2) {
                                        rowData.push({c: [
                                            {v: value.apiLink },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                                    }
                                    else {
                                        rowData1.push({c: [
                                            {v: value.apiLink },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                                    }
                                    count++;
                                }); */
                            });
                            $scope.getIISLogNoOfHitsAPIColChart(serverName, rowData);
                            //$scope.getIISLogNoOfHitsAPIColChart1(serverName, rowData1);
                        })
                        .error(function(data) {
                            $log.debug('Error: ' + data);
                        }); 
                    /*for (var i = 0; i < data.length; i++) {
                        $log.debug('hideSeries1: ' + JSON.stringify(data[i]));
                    }
                    angular.forEach(data, function(value, key) {  
                        $log.debug('hideSeries2: ' + JSON.stringify(value.v));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogErrorStatus.iisLogErrorStatusDetails;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogErrorStatusCollection.push({status : value.status, total: value.total}); 
                            
                            rowData.push({c: [
                                {v: value.status },
                                {v: parseInt(value.total)}
                            ]});
                        }); 
                    });*/
                    
                }
                if (selectedItem.row === null) {

                    /*if ($scope.iisLogNoOfHitsAPIColChart.view.columns[col] == col) {
                        $scope.iisLogNoOfHitsAPIColChart.view.columns[col] = {
                            label: $scope.iisLogNoOfHitsAPIColChart.data.cols[col].label,
                            type: $scope.iisLogNoOfHitsAPIColChart.data.cols[col].type,
                            calc: function() {
                                return null;
                            }
                        };
                        $scope.iisLogNoOfHitsAPIColChart.options.colors[col - 1] = '#CCCCCC';
                    }
                    else {
                        $scope.iisLogNoOfHitsAPIColChart.view.columns[col] = col;
                        $scope.iisLogNoOfHitsAPIColChart.options.colors[col - 1] = $scope.iisLogNoOfHitsAPIColChart.options.defaultColors[col - 1];
                    }*/
                }
            }
        };
        
        $scope.errorStatusAPI = function (selectedItem) {
            if(selectedItem !== undefined) {
                if(selectedItem.column !== undefined) {
                //if (selectedItem.column === null) {
                    var col = selectedItem.column;
                    var row = selectedItem.row;
                    $log.debug('col: ' + JSON.stringify(col) + ' - row: ' + JSON.stringify(row));
                    var data = $scope.iisLogErrorStatusBarChart.data.rows[row].c;
                    $log.debug(data.length + ' - ' + data[0].v);
                    
                    var errorCode = data[0].v;
                    botIISLogService.getIISLogErrorStatusByAPI(errorCode)
                        .success(function(data) {
                            var rowData = [];
                            var rowData1 = [];
                            var serverName = 'B';
                            //$log.debug('getIISLogErrorStatusByAPI: ' + JSON.stringify(data));

                            angular.forEach(data, function(value, key) {  
                                rowData.push({c: [
                                            {v: value.apiLink },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                            });
                            $scope.getIISlogErrorStatusBarChart(serverName, rowData);
                        })
                        .error(function(data) {
                            $log.debug('Error: ' + data);
                        });                     
                }
                if (selectedItem.row === null) {

                }
            }
        };
        
    }
})();;(function() {
    'use strict';     
    angular.module('settingService', []).factory('SettingService', SettingService); 
    
    SettingService.$inject = ['$http', '$log'];
        
    function SettingService($http, $log) {
        var apiURL = '', debug = true;
        if(debug)
            apiURL = 'http://localhost:8080';

        return {
            getAPIURL : function() {
                return apiURL;
            }
        };
    }    
})();;(function() {
    'use strict';     
    angular.module('autobotService', []).factory('botService', AutobotService); 
    
    AutobotService.$inject = ['$http', '$log', 'SettingService'];
        
    function AutobotService($http, $log, SettingService) {
        var apiURL = SettingService.getAPIURL();

        return {
            get : function() {
                return $http.get(apiURL + '/api/twitterLink');
            },
            put : function(twitterLinkData) {
                //$log.debug(JSON.stringify(twitterLinkData, null, 4) + ' put:');
                return $http({ method: 'PUT', url: apiURL + '/api/twitterLink', params: {twitterLinkData: twitterLinkData}});
            },
            create : function(twitterLinkData) {  
                return $http({ method: 'POST', url: apiURL + '/api/twitterLink', params: {twitterLinkData: twitterLinkData}});
                //return $http.post(apiURL + '/api/twitterLink', {twitterLinkData: twitterLinkData});
            },
            delete : function(id) {
                return $http.delete(apiURL + '/api/twitterLink/' + id);
            }
        };
    }    
})();;(function() {
    'use strict';     
    angular.module('autobotScrapeService', []).factory('botScrapeService', AutobotScrapeService); 
    
    AutobotScrapeService.$inject = ['$http', '$log', 'SettingService'];
        
    function AutobotScrapeService($http, $log, SettingService) {
        var apiURL = SettingService.getAPIURL();

        return {
            exportTweets : function(urlTweetsReplies) {
                return $http({ method: 'GET', url: apiURL + '/api/exportTweets', params: {urlText: urlTweetsReplies} });
            },
            
            exportTweetsReplies : function(urlTweetsReplies) {
                return $http({ method: 'GET', url: apiURL + '/api/exportTweetsReplies', params: {urlText: urlTweetsReplies} });
            },
            
            exportConversation : function(urlTweetsReplies) {
                return $http({ method: 'GET', url: apiURL + '/api/exportConversation', params: {urlText: urlTweetsReplies} });
            },
            
            scrapeTweets : function(urlTweets) {  
                return $http.post(apiURL + '/api/scrapeTweets', {urlText: urlTweets});
            },
            
            scrapeTweetsReplies : function(urlTweetsReplies) {  
                return $http.post(apiURL + '/api/scrapeTweetsReplies', {urlText: urlTweetsReplies});
            },
            
            scrapeFBPost : function(fbPageID) {  
                return $http.post(apiURL + '/api/scrapeFBPost', {fbName: fbPageID});
            }
        };
    }    
})();;(function() {
    'use strict';     
    angular.module('iisLogService', []).factory('botIISLogService', IISLogService); 
    
    IISLogService.$inject = ['$http', '$log', 'SettingService'];
        
    function IISLogService($http, $log, SettingService) {
        var apiURL = SettingService.getAPIURL();

        return {
            getIISLogStatus : function() {
                return $http.get(apiURL + '/api/iisLogStatus');
            },
            getIISLogErrorStatus : function() {
                return $http.get(apiURL + '/api/iisLogErrorStatus');
            },
            getIISLogNoOfHitsAPI : function() {
                return $http.get(apiURL + '/api/iisLogNoOfHitsAPI');
            },
            getIISLogErrorStatusByDateTime : function() {
                return $http.get(apiURL + '/api/iisLogErrorStatusByDateTime');
            },
            getIISLogNoOfHitsAPICIP : function(apiLink) {
                $log.debug('-->' + apiLink);
                return $http({ method: 'GET', url: apiURL + '/api/iisLogNoOfHitsAPICIP', params: {apiLink: apiLink}});
            },
            getIISLogErrorStatusByAPI : function(errorCode) {
                $log.debug('-->' + errorCode);
                return $http({ method: 'GET', url: apiURL + '/api/iisLogErrorStatusByAPI', params: {errorCode: errorCode}});
            },
            put : function(twitterLinkData) {
                //$log.debug(JSON.stringify(twitterLinkData, null, 4) + ' put:');
                return $http({ method: 'PUT', url: apiURL + '/api/twitterLink', params: {twitterLinkData: twitterLinkData}});
            },
            create : function(twitterLinkData) {  
                return $http({ method: 'POST', url: apiURL + '/api/twitterLink', params: {twitterLinkData: twitterLinkData}});
                //return $http.post(apiURL + '/api/twitterLink', {twitterLinkData: twitterLinkData});
            },
            delete : function(id) {
                return $http.delete(apiURL + '/api/twitterLink/' + id);
            }
        };
    }    
})();;angular.module('myCurrentTime', ['timer'])
        .directive('myCurrentTime', CurrentTimeDirective);

    CurrentTimeDirective.$inject = ['$interval', 'dateFilter'];

    function CurrentTimeDirective($interval, dateFilter) {
        return function(scope, element, attrs) {
            var format,  // date format
                  stopTime; // so that we can cancel the time updates

              // used to update the UI
              function updateTime() {
                element.text(dateFilter(new Date(), format));
              }

              // watch the expression, and update the UI on change.
              scope.$watch(attrs.myCurrentTime, function(value) {
                format = value;
                updateTime();
              });

              stopTime = $interval(updateTime, 1000);

              // listen on DOM destroy (removal) event, and cancel the next UI update
              // to prevent updating time after the DOM element was removed.
              element.on('$destroy', function() {
                $interval.cancel(stopTime);
              });
        };
    }