'use strict';

angular.module('myApp.controllersleavetask', [])
	//打卡确认
    .controller('leaveTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $rootScope.IFLogin();

        $scope.init = function () {
            $scope.getUncheckedLeave();
        }

        $scope.getUncheckedLeave = function(){
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLeave/getLeaveCheckStatusList',//督导 离店确认 列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id:$rootScope.ProjMessage.proj_id,
                    checked: "0", // 未处理
                },
                callback: function (response) {
                    $scope.uncheckedLeaveList = response.data.leaveList;
                    $scope.sidebar_count.leave = $scope.uncheckedLeaveList ? $scope.uncheckedLeaveList.length : 0;
                    $scope.uncheckedLeaveList_error_info = response.data.message;
                    if($scope.uncheckedLeaveList) for(var i=0; i<$scope.uncheckedLeaveList.length; i++){
                        if(!$scope.uncheckedLeaveList[i]['door_photo']) $scope.uncheckedLeaveList[i]['door_photo'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                    // window.setTimeout(function () {
                    //     if (!!$scope.uncheckedLeaveList) {
                    //         // var firstNode = jQuery('.unchecked_leave_list .list-item:first-child');
                    //         // $scope.get_check_leave_data(JSON.parse(firstNode.attr('data-item')), 'unchecked', firstNode);
                    //         jQuery('.unchecked_leave_list .list-item:first-child').click();
                    //     }
                    // },100);
                }
            });
        }

        $scope.getCheckedLeave = function(){
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLeave/getLeaveCheckStatusList',//督导 离店确认 列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id:$rootScope.ProjMessage.proj_id,
                    checked: "1", // 已处理
                },
                callback: function (response) {
                    $scope.checkedLeaveList = response.data.leaveList;
                    $scope.checkedLeaveList_error_info = response.data.message;
                    if($scope.checkedLeaveList) for(var i=0; i<$scope.checkedLeaveList.length; i++){
                        if(!$scope.checkedLeaveList[i]['door_photo']) $scope.checkedLeaveList[i]['door_photo'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                    // window.setTimeout(function () {
                    //     if (!!$scope.checkedLeaveList) {
                    //         jQuery('.checked_leave_list .list-item:first-child').click();
                    //     }
                    // },100);
                }
            });
        }

        $scope.get_check_leave_data = function ($item, type, $event) {
            if(jQuery($event.target).hasClass('active')) return;
            $('.task-leave-data-wrapper').addClass('hide');
            $('.list-item').removeClass('active');
            $($event.target).addClass('active');

            $scope.checked = type;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLeave/getCheckLeaveData',//离店确认
                data: {
                    token: $rootScope.userinfo.token,
                    leaveId: $item.leave_id,
                },
                callback: function (response) {
                    $scope.leave_data = response.data;
                    $('.task-leave-data-wrapper').removeClass('hide');
                }
            });
        }

        $scope.switch_check_leave = function () {
            $('.task-leave-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').addClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').removeClass('btn-bg-darkgray');
            $('.unchecked_leave_list').removeClass('hide');
            $('.checked_leave_list').addClass('hide');
            $scope.getUncheckedLeave();
        }
        $scope.switch_uncheck_leave = function () {
            $('.task-leave-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').removeClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').addClass('btn-bg-darkgray');
            $('.unchecked_leave_list').addClass('hide');
            $('.checked_leave_list').removeClass('hide');
            $scope.getCheckedLeave();
        }

        $scope.submit_check_leave = function (type) {
            jQuery('.submit_check_leave_btn').attr('disabled', true);
            $rootScope.getServerTime(function (time) {
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appLeave/submitCheckLeaveData',//离店确认提交
                    data: {
                        token: $rootScope.userinfo.token,
                        type: 0,
                        taskId: $scope.leave_data.leavedata.task_id,
                        projId: $scope.leave_data.leavedata.proj_id,
                        leaveId: $scope.leave_data.leavedata.leave_id,
                        checkTime: time,
                        checkType: type
                    },
                    callback: function (response) {
                        jQuery('.submit_check_leave_btn').attr('disabled', false);
                        if(response.data.status == 1){
                            alert('提交成功');
                            $scope.leave_data.checked = true;
                            $scope.reload_check_leave_wrapper();
                        }
                    }
                });
            });
        }

        $scope.reload_check_leave_wrapper = function () {
            $('.task-leave-data-wrapper').addClass('hide');
            $scope.uncheckedLeaveList = [];
            $scope.checkedLeaveList = [];
            $scope.init();
        }

        $scope.init();
    }]);
