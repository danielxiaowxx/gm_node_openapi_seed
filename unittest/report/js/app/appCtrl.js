/**
 * User: Daniel
 * 对应页面index.html
 */

(function() {
    var controller = angular.module('openapi.controller', []);

    controller.controller('AppCtrl', ['$scope', function AppCtrl($scope) {

        /*========== Widget Events ==================================================*/

        /*========== Scope Models ==================================================*/

        $scope.testResultDetail = {};

        $scope.testResultSummary = {};

        $scope.showOnlyFail = false;

        /*========== Scope Functions ==================================================*/

        /*========== Listeners ==================================================*/

        /*========== Watches ==================================================*/

        /*========== Private Functions ==================================================*/

        function _init() {
            var data = TEST_DATA;
            $scope.testResultDetail = TEST_DATA.detail['unittest.js'].detail;
            $scope.testResultSummary = TEST_DATA.detail['unittest.js'].summary;
            console.log(data);
        }

        _init();
    }]);

})();

