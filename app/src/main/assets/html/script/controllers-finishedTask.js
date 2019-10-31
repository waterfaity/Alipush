'use strict';


angular.module('myApp.controllersfinishedtask', [])
//首页
.controller('finishedTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $rootScope.IFLogin();

    // 已完成任务
    $scope.sidebar_item_finished_init = function() {
        $rootScope.showLoading($('.task-list-scroll'));
        window.setTimeout(function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl+'appTask/getFinishedTaskList',//已完成任务列表
                data: {
                    token: $rootScope.userinfo.token,
                    roleCode: $rootScope.userinfo.role_code,
                    projectId: $rootScope.currenProject.proj_id
                },
                callback: function (response) {
                    if(!!response.data.status) {
                        $scope.task_list = response.data.finishedTaskList;
                        $scope.sidebar_count.finished = $scope.task_list ? $scope.task_list.length : 0;
                        if($scope.task_list) for(var i=0; i<$scope.task_list.length; i++){
                            if($scope.task_list[i]['door_photo']) $scope.task_list[i]['DOOR_PHOTO'] = $scope.task_list[i]['door_photo'];
                            else if(!$scope.task_list[i]['DOOR_PHOTO']) $scope.task_list[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                        }
                        $rootScope.removeLoading();
                    }else{
                        $scope.task_list = [];
                        $scope.task_list_error_info = response.data.message;
                        $rootScope.removeLoading();
                    }
                }
            });
        }, 500);
    }

    $scope.sidebar_item_finished_init();
}]);
