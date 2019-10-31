'use strict';


angular.module('myApp.controllersarrivetask', [])
	//打卡确认
    .controller('arriveTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $rootScope.IFLogin();

        $scope.init = function () {
            $scope.getUncheckedArriveList();
        }

        $scope.getUncheckedArriveList = function(){
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appArrive/getArriveCheckStatusList',//督导 打卡确认 列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id: $rootScope.ProjMessage.proj_id,
                    checked: "0", // 未处理,
                },
                callback: function (response) {
                    $scope.uncheckedArriveList = response.data.arriveList;
                    $scope.sidebar_count.arrive = $scope.uncheckedArriveList ? $scope.uncheckedArriveList.length : 0;
                    $scope.uncheckedArriveList_error_info = response.data.message;
                    if($scope.uncheckedArriveList) for(var i=0; i<$scope.uncheckedArriveList.length; i++){
                        if(!$scope.uncheckedArriveList[i]['DOOR_PHOTO']) $scope.uncheckedArriveList[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                }
            });
        }

        $scope.getCheckedArriveList = function(){
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appArrive/getArriveCheckStatusList',//督导 打卡确认 列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id: $rootScope.ProjMessage.proj_id,
                    checked: "1", // 已处理
                },
                callback: function (response) {
                    $scope.checkedArriveList = response.data.arriveList;
                    $scope.checkedArriveList_error_info = response.data.message;
                    if($scope.checkedArriveList) for(var i=0; i<$scope.checkedArriveList.length; i++){
                        if(!$scope.checkedArriveList[i]['DOOR_PHOTO']) $scope.checkedArriveList[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                }
            });
        }

        $scope.get_check_arrive_data = function ($item, type, $event) {
            if(jQuery($event.target).hasClass('active')) return;
            $('.task-arrive-data-wrapper').addClass('hide');
            $('.list-item').removeClass('active');
            $($event.target).addClass('active');
            if(type == "checked"){
                $scope.title = "异常报备处理（已处理）";
            }else{
                $scope.title = "异常报备处理（未处理）";
            }

            $scope.checked = type;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appArrive/getCheckArriveData',//打卡确认详情
                data: {
                    token: $rootScope.userinfo.token,
                    arriveId: $item.ARRIVE_ID,
                },
                callback: function (response) {
                    $scope.arrive_data = response.data;
                    $('.task-arrive-data-wrapper').removeClass('hide');
                }
            });
        }

        $scope.switch_check_arrive = function () {
            $('.task-arrive-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').addClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').removeClass('btn-bg-darkgray');
            $('.unchecked_arrive_list').removeClass('hide');
            $('.checked_arrive_list').addClass('hide');
            $scope.getUncheckedArriveList();
        }
        $scope.switch_uncheck_arrive = function () {
            $('.task-arrive-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').removeClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').addClass('btn-bg-darkgray');
            $('.unchecked_arrive_list').addClass('hide');
            $('.checked_arrive_list').removeClass('hide');
            $scope.getCheckedArriveList();
        }

        $scope.submit_check_Arrive = function (type) {
            $rootScope.submit_check_Arrive_type = type;
            jQuery('.submit_check_arrive_btn').attr('disabled', true);
            $rootScope.getServerTime(function (time) {
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appArrive/submitCheckArriveData',//打卡确认提交
                    data: {
                        token: $rootScope.userinfo.token,
                        type: 0,
                        taskId: $scope.arrive_data.arrivedata.task_id,
                        projId: $scope.arrive_data.arrivedata.proj_id,
                        arriveId: $scope.arrive_data.arrivedata.arrive_id,
                        checkTime: time,
                        checkType: type
                    },
                    callback: function (response) {
                        jQuery('.submit_check_arrive_btn').attr('disabled', false);
                        if(response.data.status == 1){
                            if($rootScope.submit_check_Arrive_type == '0') alert('确认成功');
                            else if($rootScope.submit_check_Arrive_type == '1') alert('退回成功');
                            $scope.arrive_data.checked = true;
                            $scope.reload_check_arrive_wrapper();
                        }
                    }
                });
            });
        }

        $scope.reload_check_arrive_wrapper = function () {
            $('.task-arrive-data-wrapper').addClass('hide');
            $scope.uncheckedArriveList = [];
            $scope.checkedArriveList = [];
            $scope.init();
        }

        $scope.init();
    }]);
