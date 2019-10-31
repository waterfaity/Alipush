'use strict';


angular.module('myApp.controllersnormalreport', [])
	//普通报备确认
    .controller('normalReportTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $rootScope.IFLogin();

        $scope.init = function () {
            $scope.getUncheckedNormalReportList();
        }

        $scope.getUncheckedNormalReportList = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appNormalReport/getNormalRecordCheckStatusList',//督导 普通报备-列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id:$rootScope.ProjMessage.proj_id,
                    checked: "0", // 未处理
                },
                callback: function (response) {
                    $scope.uncheckedNormalReportList = response.data.normalRecordList;
                    $scope.sidebar_count.normal = $scope.uncheckedNormalReportList ? $scope.uncheckedNormalReportList.length : 0;
                    $scope.uncheckedNormalReportList_error_info = response.data.message;
                    if($scope.uncheckedNormalReportList) for(var i=0; i<$scope.uncheckedNormalReportList.length; i++){
                        if(!$scope.uncheckedNormalReportList[i]['DOOR_PHOTO']) $scope.uncheckedNormalReportList[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                    // window.setTimeout(function () {
                    //     if (!!$scope.uncheckedNormalReportList) {
                    //         jQuery('.unchecked_normal_report_list .list-item:first-child').click();
                    //     }
                    // },100);
                }
            });
        }

        $scope.getCheckedNormalReportList = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appNormalReport/getNormalRecordCheckStatusList',//督导 普通报备-列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id:$rootScope.ProjMessage.proj_id,
                    checked: "1", // 已处理
                },
                callback: function (response) {
                    $scope.checkedNormalReportList = response.data.normalRecordList;
                    $scope.checkedNormalReportList_error_info = response.data.message;
                    if($scope.checkedNormalReportList) for(var i=0; i<$scope.checkedNormalReportList.length; i++){
                        if(!$scope.checkedNormalReportList[i]['DOOR_PHOTO']) $scope.checkedNormalReportList[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                    // window.setTimeout(function () {
                    //     if (!!$scope.checkedNormalReportList) {
                    //         jQuery('.checked_normal_report_list .list-item:first-child').click();
                    //     }
                    // },100);
                }
            });
        }

        $scope.get_check_normal_report_data = function ($item, type, $event) {
            if(jQuery($event.target).hasClass('active')) return;
            $('.task-normal_report-data-wrapper').addClass('hide');
            $('.list-item').removeClass('active');
            $($event.target).addClass('active');
            $scope.checked = type;

            $scope.currenNormalReport = $item;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appNormalReport/getNormalRecordDetailById',//督导 普通报备-详情
                data: {
                    token: $rootScope.userinfo.token,
                    recordId: $item.normal_record_id,
                },
                callback: function (response) {
                    $scope.normal_report_data = response.data;
                    $('.task-normal_report-data-wrapper').removeClass('hide');
                }
            });
        }

        $scope.switch_check_normal_report = function () {
            $('.task-normal_report-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').addClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').removeClass('btn-bg-darkgray');
            $('.unchecked_normal_report_list').removeClass('hide');
            $('.checked_normal_report_list').addClass('hide');
            $scope.getUncheckedNormalReportList();
        }
        $scope.switch_uncheck_normal_report = function () {
            $('.task-normal_report-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').removeClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').addClass('btn-bg-darkgray');
            $('.unchecked_normal_report_list').addClass('hide');
            $('.checked_normal_report_list').removeClass('hide');
            $scope.getCheckedNormalReportList();
        }

        $scope.submit_check_NormalReport = function (type) {
            jQuery('.submit_check_normalReport_btn').attr('disabled', true);
            $rootScope.getServerTime(function (time) {
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appNormalReport/submitCheckNormalRecord',//督导 普通报备-上报
                    data: {
                        token: $rootScope.userinfo.token,
                        normalReportId: $scope.normal_report_data.normalRecordData.normal_record_id,
                        checked: 1,
                        operateTime: time,
                        suggection: type
                    },
                    callback: function (response) {
                        jQuery('.submit_check_normalReport_btn').attr('disabled', false);
                        if(response.data.status == 1){
                            alert( type+'成功！');
                            $scope.normal_report_data.checked = true;
                            $scope.reload_normal_report_wrapper();
                        }
                    }
                });
            });
        }

        $scope.reload_normal_report_wrapper = function () {
            $('.task-normal_report-data-wrapper').addClass('hide');
            $scope.checkedNormalReportList = [];
            $scope.uncheckedNormalReportList = [];
            $scope.init();
        }
        $scope.init();
    }]);
