(function() {
    'use strict';    
    angular.module('iisLogController', ['ngMaterial', 'timer', 'googlechart'])
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
})();