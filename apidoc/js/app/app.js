/**
 * User: Daniel
 */

(function() {

    var app = angular.module('openapi', ['openapi.controller',  'ui.bootstrap']);


    /**
     * 定义全局常量
     */
    var APPConst = {
    };
    app.constant('APPConst', APPConst);

    /**
     * 程序配置
     */
    app.config(['$httpProvider', '$locationProvider', '$routeProvider', 'APPConst', function config($httpProvider, $locationProvider, $routeProvider, APPConst) {
    }]);


    /**
     *
     */
    app.run(['$rootScope', '$http', '$route', function run($rootScope, $http, $route) {
    }]);

})();


