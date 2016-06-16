(function() {
    'use strict';    
    angular.module('fbController', ['ngMaterial', 'timer'])
            .controller('botFBController', FBController);

    FBController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botService', 'botScrapeService'];

    function FBController($scope, $http, $timeout, $log, $interval, $location, $filter, botService, botScrapeService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;

        /***********************************************************************************************************/

        $scope.userState = 1;
        $scope.states = ('0 0.1 0.2 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

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
            $scope.itemFBPosts = [
                        {fbPostName: 'Maybank', fbPostImage: 'assets/img/maybank.jpg', 
                         fbPageID : 'Maybank', linkFBPost : 'https://www.facebook.com/Maybank'}, 
                        {fbPostName: 'CIMB Malaysia', fbPostImage: 'assets/img/cimb.jpeg', 
                         fbPageID : 'CIMBMalaysia', linkFBPost : 'https://www.facebook.com/CIMBMalaysia'},
                        {fbPostName: 'Maxis', fbPostImage: 'assets/img/cimb.jpeg', 
                         fbPageID : 'maxis', linkFBPost : 'https://www.facebook.com/maxis'},
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
                    var data1 = data;//JSON.parse(data);
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
})();