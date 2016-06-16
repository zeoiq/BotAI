angular.module('autobotSearch', ['ngRoute', 'twitterController', 'fbController', 'iisLogController', 'livePlotController', 
'insightAIController', 'autobotService', 'autobotScrapeService', 'iisLogService', 'settingService', 
'dataService', 'smart-table', 'myCurrentTime'])
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
        controller: 'botLivePlotController'
    }).
    when('/insightAI', {
        templateUrl: 'view/insightAI.html',
        controller: 'botInsightAIController'
    }).
    otherwise({
        redirectTo: '/main'
    });
}
