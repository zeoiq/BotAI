(function() {
    'use strict'; 
    angular.module('livePlotController', ['ngMaterial', 'timer', 'googlechart', 'nvd3'])
            .controller('botLivePlotController', LivePlotController);

    LivePlotController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botIISLogService', 'DataService'];
    
    //var sock = new SockJS('http://172.16.20.73:8080/chat');
    //var sock = new SockJS('http://localhost:8080/chat');
    //var sock = new SockJS('/chat');
    
    function LivePlotController($scope, $http, $timeout, $log, $interval, $location, $filter, botIISLogService, DataService) {
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
        
        $scope.insightAI = function () {            
            $location.path("/insightAI");  
        };
        
        /***********************************************************************************************************/    
        
        $scope.messages = [];
        $scope.sendMessage = function() {
            sock.send($scope.messageText);
            $scope.messageText = "";
        };

        sock.onmessage = function(e) {
            //$scope.messages.push(e.data);
            var dataIIS = e.data;
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
            //    $log.debug('data : ' + JSON.stringify(iisdata));
            //$log.debug('e.data : ' + JSON.stringify(e));
            var iisdata = dataIIS.split("|");
            var jsonObj = angular.fromJson(iisdata[1]);
            //$log.debug('onmessage: ' + JSON.stringify(jsonObj));
            if(iisdata[0] === 'NoOfStatus')
                updateRealChart(jsonObj);
            else if(iisdata[0] === 'Latency')
                updateRealBarChart(jsonObj);
            //$scope.$apply();
        };
        
        /***********************************************************************************************************/
                     
        $scope.optionsBar = {
            chart: {
                type: 'multiBarChart',
                height: 300,
                margin : {
                    top: 20,
                    right: 50,
                    bottom: 40,
                    left: 50
                },
                "clipEdge": true,
                "duration": 500,
                "stacked": false, 
                xAxis: {
                    axisLabel: 'Time (sec)',
                    tickFormat: function(d) {                        
                        var parseDate = d3.time.format("%d-%b %H:%M:%S")(new Date(d));
                        return parseDate;
                    },
                    tickValues: $scope.tickvaluesBar,
                    showMaxMin: true,
                    //staggerLabels: true
                },
                yAxis: {
                    axisLabel: 'Time Taken',
                    tickFormat: function(d){
                        return d3.format('.01f')(d);
                        //return d3.format(',.1%')(d);
                    },
                    axisLabelDistance: -10
                },
            },
            title: {
                enable: true,
                text: 'Latency By Date Time'
            },
        };            

        $scope.tickvaluesBar = [];
        $scope.dataBar = initBarChart(); 
        $scope.runBar = true;
        
        function initBarChart() {
            var averageTimeTaken = [], maxTimeTaken = [], minTimeTaken = [];

            var d1 = new Date ();
            var currenttime = new Date();
            d1.setHours(currenttime.getHours());// + 8);
            
            averageTimeTaken.push({x: d1, y: 0});
            maxTimeTaken.push({x: d1, y: 0});
            minTimeTaken.push({x: d1, y: 0});

            $scope.tickvaluesBar.push(d1);
            //Line chart data should be sent as an array of series objects.
            return [                
                {
                    values: minTimeTaken,
                    key: 'Min Time Taken',
                    color: '#ff0000',
                },
                {
                    values: maxTimeTaken,
                    key: 'Max Time Taken',
                    color: '#7777ff',
                },
                {
                    values: averageTimeTaken,      //values - represents the array of {x,y} data points
                    key: 'Average Time Taken', //key  - the name of the series.
                    color: '#2ca02c',  //color - optional: choose your own line color.
                },                
            ];
        };
        
        function updateRealBarChart(iisdata) {
            var averageTimeTaken, maxTimeTaken, minTimeTaken;
            if (!$scope.run) return;
            
            angular.forEach(iisdata, function(value, key) {
                //$log.debug('updateRealBarChart: ' + JSON.stringify(value)); 

                averageTimeTaken = {x: value.timeStamp, y: parseFloat(value.averageTimeTaken).toFixed(2), "series":0};
                maxTimeTaken = {x: value.timeStamp, y: parseFloat(value.maxTimeTaken).toFixed(2), "series":0};
                minTimeTaken = {x: value.timeStamp, y: parseFloat(value.minTimeTaken).toFixed(2), "series":0};
            });
            
            //$log.debug($scope.dataBar.length + ' $scope.dataBar: ' + JSON.stringify($scope.dataBar));
            //$log.debug($scope.dataBar.length + ' $scope.dataBar[0].values: ' + JSON.stringify($scope.dataBar[0].values));
            //$scope.data.values[0].push(sin);
            //$scope.data.values[1].push(cos);
            $scope.dataBar[0].values.push(minTimeTaken);
            $scope.dataBar[1].values.push(maxTimeTaken);
            $scope.dataBar[2].values.push(averageTimeTaken);
            //$log.debug('[' + $scope.dataBar[0].values.length + '] after $scope.dataBar[0].values: ' + JSON.stringify($scope.dataBar[0].values));
            
            $scope.tickvaluesBar.push(averageTimeTaken.x);
            
            $log.debug('[' + $scope.tickvaluesBar.length + '] $scope.tickvaluesBar: ' + JSON.stringify($scope.tickvaluesBar));
            //$scope.messages.push('[' + $scope.tickvaluesBar.length + '] $scope.tickvaluesBar: ' + JSON.stringify($scope.tickvaluesBar));
            
            if ($scope.dataBar[0].values.length > 30) {
                $scope.dataBar[0].values.shift();
                $scope.dataBar[1].values.shift();
                $scope.dataBar[2].values.shift();
                $scope.tickvaluesBar.shift();
            }
            $scope.$apply(); // update both chart
        };     
        
        /****************************************************************************************************************/
        
        $scope.options = {
            chart: {
                type: 'lineChart',
                height: 300,
                margin : {
                    top: 20,
                    right: 50,
                    bottom: 40,
                    left: 50
                },
                x: function(d){ return d.x; },
                y: function(d){ return d.y; },
                useInteractiveGuideline: true,
                duration: 0, 
                //color: d3.scale.category10().range(),                
                //clipVoronoi: false,
                xAxis: {
                    axisLabel: 'Time (sec)',
                    tickFormat: function(d) {
                        //$log.debug('tickFormat: ' + JSON.stringify(d));
                        
                        var parseDate = d3.time.format("%d-%b %H:%M:%S")(new Date(d))
                        //var parseDate = d3.time.format("%d-%b-%y %H:%M:%S")(new Date(d))
                        //var parseDate1 = parseDate.parse;
                        //$log.debug(parseDate + ' tickFormat: ' + parseDate1);
                        return parseDate//d3.time.format('%m/%d/%y')(new Date(d))
                    },
                    tickValues: $scope.tickvalues,
                    showMaxMin: true,
                    //staggerLabels: true
                },
                yAxis: {
                    axisLabel: 'No of hits',
                    tickFormat: function(d){
                        return d3.format('.01f')(d);
                        //return d3.format(',.1%')(d);
                    },
                    axisLabelDistance: -10
                },
            },
            title: {
                enable: true,
                text: 'No of Hits for Status'
            },
        };
        
        $scope.tickvalues = [];
        $scope.data = initChart(); //[{ values: [], key: 'Status' }];
        $scope.run = true;

        function initChart() {
            //var sin = [], cos = [], tan = [];
            var status200 = [], status302 = [], status304 = [];
            var status403 = [], status404 = [], status500 = [];
            //Data is represented as an array of {x,y} pairs.
            /*for (var i = 0; i < 10; i++) {
                //sin.push({x: i, y: Math.sin(i/10)});
                //sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
                //cos.push({x: i, y: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
                //sin.push({x: '2016-04-22 14:08:51', y: 2});
                //sin.push({x: '2016-04-22 14:08:56', y: 9});
                //sin.push({x: new Date().getTime(), y: 0});
                //cos.push({x: new Date().getTime(), y: 0});
                sin.push({x: i, y: Math.floor((Math.random() * 15) + 1)});
                //sin.push({x: 1088568000000, y: 3});
                //sin.push({x: 1099195200000, y: 5});
                //cos.push({x: '2016-04-22 14:08:51', y: 4});
                //cos.push({x: '2016-04-22 14:08:56', y: 8});
                cos.push({x: i, y: Math.floor((Math.random() * 15) + 1)});
                //cos.push({x: 1099195200000, y: 7});
            } */
            var d1 = new Date ();
            var currenttime = new Date();
            d1.setHours(currenttime.getHours());// + 8);
            //sin.push({x: d1, y: 0});
            //cos.push({x: d1, y: 0});
            //tan.push({x: d1, y: 0});
            
            status200.push({x: d1, y: 0});
            status302.push({x: d1, y: 0});
            status304.push({x: d1, y: 0});
            status403.push({x: d1, y: 0});
            status404.push({x: d1, y: 0});
            status500.push({x: d1, y: 0});
            
            //var currenttime = new Date().getTime();
            //sin.push({x: currenttime, y: 0});
            //cos.push({x: currenttime, y: 0});
            $scope.tickvalues.push(d1);
            //sin.push({x: 1461339195295, y: 0});
            //cos.push({x: 1461339195295, y: 0});

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    values: status200,      //values - represents the array of {x,y} data points
                    key: '200', //key  - the name of the series.
                    color: '#ff7f0e',  //color - optional: choose your own line color.
                    strokeWidth: 2,
                    classed: 'dashed'
                },
                {
                    values: status302,
                    key: '302',
                    color: '#4b0707',
                },
                {
                    values: status304,
                    key: '304',
                    color: '#e6e600',
                    //area: true      //area - set to true if you want this line to turn into a filled area chart.
                },
                {
                    values: status403,
                    key: '403',
                    color: '#2ca02c',
                },
                {
                    values: status404,
                    key: '404',
                    color: '#7777ff',
                    //area: true      //area - set to true if you want this line to turn into a filled area chart.
                },
                {
                    values: status500,
                    key: '500',
                    color: '#ff0000',
                    //area: true      //area - set to true if you want this line to turn into a filled area chart.
                } 
            ];
        };
        
        function updateRealChart(iisdata) {
            //var sin, cos, tan;
            var status200, status302, status304, status403, status404, status500;

            if (!$scope.run) return;
            
            angular.forEach(iisdata, function(value, key) {
                $log.debug('updateRealChart: ' + JSON.stringify(value)); 
                            
                if(value.status == '200')
                    status200 = {x: value.timeStamp, y: parseInt(value.noOfHits), "series":0};
                if(value.status == '302')
                    status302 = {x: value.timeStamp, y: parseInt(value.noOfHits), "series":0};
                if(value.status == '304')
                    status304 = {x: value.timeStamp, y: parseInt(value.noOfHits), "series":0};
                if(value.status == '403')
                    status403 = {x: value.timeStamp, y: parseInt(value.noOfHits), "series":0};
                if(value.status == '404')
                    status404 = {x: value.timeStamp, y: parseInt(value.noOfHits), "series":0};
                if(value.status == '500')
                    status500 = {x: value.timeStamp, y: parseInt(value.noOfHits), "series":0};
            });
            
            //$log.debug(' sin: ' + JSON.stringify(sin));
            $log.debug($scope.data.length + ' $scope.data: ' + JSON.stringify($scope.data));
            $log.debug($scope.data.length + ' $scope.data[0].values: ' + JSON.stringify($scope.data[0].values));
            //$scope.data.values[0].push(sin);
            //$scope.data.values[1].push(cos);
            $scope.data[0].values.push(status200);
            $scope.data[1].values.push(status302);
            $scope.data[2].values.push(status304);
            $scope.data[3].values.push(status403);
            $scope.data[4].values.push(status404);
            $scope.data[5].values.push(status500);
            $log.debug('[' + $scope.data[0].values.length + '] after $scope.data[0].values: ' + JSON.stringify($scope.data[0].values));
            
            $scope.tickvalues.push(status200.x);
            
            $log.debug('[' + $scope.tickvalues.length + '] $scope.tickvalues: ' + JSON.stringify($scope.tickvalues));
            //$scope.messages.push('[' + $scope.tickvalues.length + '] $scope.tickvalues: ' + JSON.stringify($scope.tickvalues));
            
            if ($scope.data[0].values.length > 20) {
                $scope.data[0].values.shift();
                $scope.data[1].values.shift();
                $scope.data[2].values.shift();
                $scope.data[3].values.shift();
                $scope.data[4].values.shift();
                $scope.data[5].values.shift();
                $scope.tickvalues.shift();
            }
            //    x++;

            $scope.$apply(); // update both chart
        };        
        
    }
})();