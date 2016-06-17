(function() {
    'use strict';     
    angular.module('settingService', []).factory('SettingService', SettingService); 
    
    SettingService.$inject = ['$http', '$log'];
        
    function SettingService($http, $log) {
        var apiURL = '', debug = false;
        if(debug)
            apiURL = 'http://localhost:8080';

        return {
            getAPIURL : function() {
                return apiURL;
            }
        };
    }    
})();