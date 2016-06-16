(function() {
    'use strict';     
    angular.module('iisLogService', []).factory('botIISLogService', IISLogService); 
    
    IISLogService.$inject = ['$http', '$log', 'SettingService'];
        
    function IISLogService($http, $log, SettingService) {
        var apiURL = SettingService.getAPIURL();

        return {
            clearCacheData : function() {
                return $http.get(apiURL + '/api/clearCacheData');
            },
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
})();