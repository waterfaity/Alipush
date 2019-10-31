'use strict';


angular.module('myApp.controllersrecenttask', [])
//首页
.controller('recentTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $rootScope.IFLogin();

    $rootScope.ajax({
        url: $rootScope.apiUrl+'appTask/getEachDayTaskCount',//今日任务列表
        data: {
            token: $rootScope.userinfo.token,
            projectId: $rootScope.currenProject.proj_id,
            recentDays: 5,
        },
        callback: function (response) {
            // response.data = { "taskCountList": [ { "PLAN_TIME": "2019-04-22", "TASKCOUNT": 0 }, { "PLAN_TIME": "2019-04-23", "TASKCOUNT": 0 }, { "PLAN_TIME": "2019-04-24", "TASKCOUNT": 0 }, { "PLAN_TIME": "2019-04-25", "TASKCOUNT": 0 }, { "PLAN_TIME": "2019-04-26", "TASKCOUNT": 0 } ], "status": 1, "message": "" };// ⚡⚡ TEST
            if(response.data.taskCountList){
                $scope.task_count_list = [];
                for(var i=0; i<response.data.taskCountList.length; i++) {
                    $scope.task_count_list[i] = {'recent_count': 0, 'title': ''};

                    var PLAN_TIME = response.data.taskCountList[i]['PLAN_TIME'].split('-');
                    if(i == 0) $scope.task_count_list[i]['title'] = "明天";
                    else if(i == 1) $scope.task_count_list[i]['title'] = "后天";
                    else $scope.task_count_list[i]['title'] = PLAN_TIME[1] + "-" + PLAN_TIME[2];
                }
            }else{
                $scope.task_list_error_info = response.data.message;
            }
        }
    });

    // 近期行程
    $scope.sidebar_item_recent_init = function($day) {
        $scope.task_list_error_info = "";
        $scope.current_task_list_day_num = $day;
        $rootScope.showLoading($('.task-list-scroll'));
        $('.task-detail-wrapper').addClass('hide');

        $('.tab-paenl .tab').removeClass('btn-bg-darkgray');
        $('.tab-paenl .tab[data-day="'+$day+'"]').addClass('btn-bg-darkgray');

        window.setTimeout(function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl+'appTask/getDayTaskList',//今日任务列表
                data: {
                    token: $rootScope.userinfo.token,
                    projectId: $rootScope.currenProject.proj_id,
                    days: $day,
                },
                callback: function (response) {
                    if(!!response.data.status) {
                        if($scope.task_count_list) {
                            $scope.task_count_list[$scope.current_task_list_day_num - 1]['recent_count'] = response.data.projectList.length;
                            $scope.task_list = response.data.projectList;
                            // $scope.sidebar_count.recent = $scope.task_list.length;
                        }else {
                            $scope.task_list_error_info = "暂无近期行程";
                            $rootScope.removeLoading();
                            return false;
                        }

                        if($scope.task_list) for(var i=0; i<$scope.task_list.length; i++) {
                            if ($scope.task_list[i]['door_photo']) $scope.task_list[i]['DOOR_PHOTO'] = $scope.task_list[i]['door_photo'];
                            else if (!$scope.task_list[i]['DOOR_PHOTO']) $scope.task_list[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                        }

                        $rootScope.removeLoading();
                    }else {
                        $scope.task_list = [];
                        $scope.task_list_error_info = response.data.message;
                        $rootScope.removeLoading();
                    }
                }
            });
        }, 500);
    }

    window.setTimeout(function () {
        $scope.sidebar_item_recent_init(1);
    }, 300);
}]);
