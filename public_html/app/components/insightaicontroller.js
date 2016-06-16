(function() {
    'use strict'; 
    angular.module('insightAIController', ['ngMaterial', 'luegg.directives', 'ngAnimate'])
            .controller('botInsightAIController', InsightAIController);

    InsightAIController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botIISLogService', 'DataService'];
    
    //var sock = new SockJS('http://172.16.20.73:8080/chat');
    //var sock = new SockJS('http://localhost:8080/chat');
    var sock = new SockJS('/chat');
    
    function InsightAIController($scope, $http, $timeout, $log, $interval, $location, $filter, botIISLogService, DataService) {
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
            //$scope.messages.push(e.data);
            var smData = e.data;
            /*var iisdata = [
              {
                "timeStamp": new Date().getTime(),//1099195200000, //"2016-04-22T02:30:16.4658237Z",
                "serverName": "D026a",
                "status": "304",
                "noOfHits": Math.floor((Math.random() * 15) + 1)
              },
              {
                "timeStamp": new Date().getTime(),//1099195200000, //"2016-04-22T02:30:16.4658237Z",
                "serverName": "D026a",
                "status": "404",
                "noOfHits": Math.floor((Math.random() * 15) + 1)
              }
            ];*/
            //var jsonObj = angular.fromJson(iisdata);
            //if(angular.isDefined(iisdata.data))
            //$log.debug('data : ' + JSON.stringify(smData));
            //$log.debug('data 1 : ' + dataIIS);
            //$log.debug('data 2 : ' + JSON.stringify(dataIIS));
            if(smData.length > 0) {
                var dataPost =  smData.split("|");
                if(dataPost[0] === 'FBPost')
                    updatePosts(dataPost[1]);
                else if(dataPost[0] === 'Tweet')
                    updateTweets(dataPost[1]);
                else if(dataPost[0] === 'AIReply')
                    updateAIReply(dataPost[1]);
            }
            //$log.debug('e.data : ' + JSON.stringify(e));
            /*var iisdata = dataIIS.split("|");
            var jsonObj = angular.fromJson(iisdata[1]);
            //$log.debug('onmessage: ' + JSON.stringify(jsonObj));
            if(iisdata[0] === 'NoOfStatus')
                updateRealChart(jsonObj);
            else if(iisdata[0] === 'Latency')
                updateRealBarChart(jsonObj);*/
            //$scope.$apply();
        };
        
        /***********************************************************************************************************/
  
        /*$scope.tweetReplies = [{
                 tweet: '',
                 image: '',
                 gotConversation: 'true',
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Auto.bot',
                                     username: '@auto.bot',
                                     time: '2016'
                                }],
        }];*/
        
        $scope.clearCacheData = function () {
            return $timeout(function() {      
                botIISLogService.clearCacheData()
                .success(function(data) {
                    $log.debug('clearCacheData: ');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200); 
        };

        $scope.tweetReplies = [];
        $scope.tweetRepliesLength = 0;

        var AIReplies = [{
                 msgReply: '',         
                 avatar: 'assets/img/AI.png',
                 fullname: 'Insight',
                 username: '.AI',
                 time: '2015'
        }];
        
        function updatePosts(smData1) {
            send();

            var smData = JSON.parse(smData1);
            //$log.debug('updatePosts : ' + JSON.stringify(smData));
            angular.forEach(smData, function(value, key) {            
                //$log.debug('value : ' + value.message); 
                //$log.debug('message : ' + value.message);
                var avatarImg = 'assets/img/fb.ico';
                
                $scope.tweetReplies.reverse();
                
                $scope.tweetReplies.push({
                        tweet: value.message,
                        image: value.image,
                        gotConversation: 'false',
                        tweetDetails: [{               
                                        avatar: avatarImg,
                                        fullname: value.fullname,
                                        username: value.username,
                                        time: $filter('date')(new Date(value.time), 'hh:mm:ss a - dd MMM yyyy')
                        }],
                        AIReplies: []}); 
                           
                $scope.tweetReplies.reverse();
                $scope.tweetRepliesLength = 0;              
            }); 
            $log.debug('updatePosts : ' + JSON.stringify($scope.tweetReplies));
            $scope.$apply(); 
        }
        
        function updateTweets(smData1) {
            send();

            var smData = JSON.parse(smData1);
            //$log.debug('updatePosts : ' + JSON.stringify(smData));
            angular.forEach(smData, function(value, key) {            
                //$log.debug('value : ' + value.message); 
                //$log.debug('message : ' + value.message);
                var avatarImg = 'assets/img/twitter.ico';
                
                $scope.tweetReplies.reverse();
                
                $scope.tweetReplies.push({
                        tweet: value.message,
                        image: value.image,
                        gotConversation: 'false',
                        tweetDetails: [{               
                                        avatar: avatarImg,
                                        fullname: value.fullname,
                                        username: value.username,
                                        time: $filter('date')(new Date(value.time), 'hh:mm:ss a - dd MMM yyyy')
                        }],
                        AIReplies: []}); 
                           
                $scope.tweetReplies.reverse();
                $scope.tweetRepliesLength = 0;              
            }); 
            $log.debug('updateTweets : ' + JSON.stringify($scope.tweetReplies));
            $scope.$apply(); 
        }
        
        function updateAIReply(smData) {
            //var smData = JSON.parse(smData1);
            
            $log.debug('updateAIReply : ' + JSON.stringify(smData));
            $scope.tweetReplies[$scope.tweetRepliesLength].AIReplies = [];
            $scope.tweetReplies[$scope.tweetRepliesLength].AIReplies.push({
                 msgReply: smData,         
                 avatar: 'assets/img/AI.jpg',
                 fullname: 'Insight',
                 username: '.AI',
                 time: $filter('date')(new Date(), 'hh:mm:ss a - dd MMM yyyy')
            });
            
            $scope.$apply();
        }

        /***********************************************************************************************/
        var locked=false;
        var $sendButton=$(".send-button")
		,$sendIcon=$(".send-icon")
		,$sentIcon=$(".sent-icon")
		,$sentBg=$(".sent-bg")
		,$indicatorDots=$(".send-button,.send-indicator-dot")
        
        function setFilter(filter){
            //console.log('setFilter.............. ');
            $(".send").css({
                webkitFilter:filter,
                mozFilter:filter,
                filter:filter,
            });
        }
        function setGoo(){
            //console.log('setGoo.............. ');
            setFilter("url(#goo)");
        }
        function setGooNoComp(){
            //console.log('setGooNoComp.............. ');
            setFilter("url(#goo-no-comp)");
        }

        function send(){
            if(locked) return;

            //console.log('send.............. ');
            locked=true;

            TweenMax.to($sendIcon,0.3,{
                x:100,
                y:-100,
                ease:Quad.easeIn,
                onComplete:function(){
                    setGooNoComp();
                    $sendIcon.css({
                        display:"none"
                    });
                }
            });
            TweenMax.to($sendButton,0.6,{
                scale:0.5,
                ease:Back.easeOut
            });

            $indicatorDots.each(function(i){
                startCircleAnim($(this),50,0.1,1+(i*0.2),1.1+(i*0.3));
            })


            setTimeout(function(){
                // success anim start
                // close circle
                $indicatorDots.each(function(i){
                    stopCircleAnim($(this),0.8+(i*0.1));
                });
                TweenMax.to($sentBg,0.7,{
                    delay:.7,
                    opacity:1
                })

                // show icon
                setTimeout(function(){
                    setGoo();

                    TweenMax.fromTo($sentIcon,1.5,{
                        display:"inline-block",
                        opacity:0,
                        scale:0.1
                    },{
                        scale:1,
                        ease:Elastic.easeOut
                    });
                    TweenMax.to($sentIcon,0.5,{
                        delay:0,
                        opacity:1
                    });
                    TweenMax.to($sendButton,0.3,{
                        scale:1,
                        ease:Back.easeOut
                    });

                    // back to normal
                    setTimeout(function(){
                        TweenMax.to($sentBg,0.4,{
                            opacity:0
                        });
                        TweenMax.to($sentIcon,0.2,{
                            opacity:0,
                            onComplete:function(){
                                locked=false;
                                $sentIcon.css({
                                    display:"none"
                                })
                                TweenMax.fromTo($sendIcon,0.2,{
                                    display:"inline-block",
                                    opacity:0,
                                    x:0,
                                    y:0
                                },{
                                    opacity:1
                                });
                            }
                        });
                    },1800);

                },1000);

            },1000+(Math.random()*1900))
        }
        function setupCircle($obj){
            //console.log('setupCircle.............. ');
            if(typeof($obj.data("circle"))=="undefined"){
                $obj.data("circle",{radius:0,angle:0});

                function updateCirclePos(){
                    var circle=$obj.data("circle");
                    TweenMax.set($obj,{
                        x:Math.cos(circle.angle)*circle.radius,
                        y:Math.sin(circle.angle)*circle.radius,
                    })
                    requestAnimationFrame(updateCirclePos);
                }
                updateCirclePos();
            }
        }

        function startCircleAnim($obj,radius,delay,startDuration,loopDuration){
            //console.log('startCircleAnim.............. ');
            setupCircle($obj);
            $obj.data("circle").radius=0;
            $obj.data("circle").angle=0;
            TweenMax.to($obj.data("circle"),startDuration,{
                delay:delay,
                radius:radius,
                ease:Quad.easeInOut
            });
            TweenMax.to($obj.data("circle"),loopDuration,{
                delay:delay,
                angle:Math.PI*2,
                ease:Linear.easeNone,
                repeat:-1
            });
        }
        function stopCircleAnim($obj,duration){
            //console.log('stopCircleAnim.............. ');
            TweenMax.to($obj.data("circle"),duration,{
                radius:0,
                ease:Quad.easeInOut,
                onComplete:function(){
                    TweenMax.killTweensOf($obj.data("circle"));
                }
            });
        }
    }
})();