(function() {
    'use strict';    
    angular.module('twitterController', ['ngMaterial', 'timer'])
            .controller('botTwitterController', TwitterController);

    TwitterController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', 'botService', 'botScrapeService'];
    
    function TwitterController($scope, $http, $timeout, $log, $interval, $location, botService, botScrapeService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;
    
        $scope.userState = 1;
        $scope.states = ('0 0.1 0.2 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

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
        
        $scope.insightAI = function () {            
            $location.path("/insightAI");  
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
                    $log.debug('getTweetsReplies: ' + JSON.stringify(dataTweetReplies));
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
})();