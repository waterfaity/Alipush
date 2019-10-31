'use strict';

angular.module('myApp.controllersleave', [])
	//离店
    .controller('LeaveCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $rootScope.IFLogin();
    }]);
