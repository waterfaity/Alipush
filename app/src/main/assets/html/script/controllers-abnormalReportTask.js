'use strict';


angular.module('myApp.controllersabnormalreport', [])
	//异常报备确认
    .controller('abnormalReportTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $rootScope.IFLogin();

        $scope.init = function () {
            $scope.getUncheckedAbnormalReportList();
        }
        $scope.getUncheckedAbnormalReportList = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appAbnormalReport/getAbnormalRecordCheckStatusList',//督导 异常报备-列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id:$rootScope.ProjMessage.proj_id,
                    checked: "0", // 未处理
                },
                callback: function (response) {
                    $scope.uncheckedAbnormalReportList = response.data.abnormalRecordList;
                    $scope.sidebar_count.abnormal = $scope.uncheckedAbnormalReportList ? $scope.uncheckedAbnormalReportList.length : 0;
                    $scope.uncheckedAbnormalReportList_error_info = response.data.message;
                    if($scope.uncheckedAbnormalReportList) for(var i=0; i<$scope.uncheckedAbnormalReportList.length; i++){
                        if(!$scope.uncheckedAbnormalReportList[i]['DOOR_PHOTO']) $scope.uncheckedAbnormalReportList[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                    // window.setTimeout(function () {
                    //     if (!!$scope.uncheckedAbnormalReportList) {
                    //         jQuery('.unchecked_abnormal_report_list .list-item:first-child').click();
                    //     }
                    // },100);
                }
            });
        }

        $scope.getCheckedAbnormalReportList = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appAbnormalReport/getAbnormalRecordCheckStatusList',//督导 异常报备-列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    proj_id:$rootScope.ProjMessage.proj_id,
                    checked: "1", // 已处理
                },
                callback: function (response) {
                    $scope.checkedAbnormalReportList = response.data.abnormalRecordList;
                    $scope.checkedAbnormalReportList_error_info = response.data.message;
                    if($scope.checkedAbnormalReportList) for(var i=0; i<$scope.checkedAbnormalReportList.length; i++){
                        if(!$scope.checkedAbnormalReportList[i]['DOOR_PHOTO']) $scope.checkedAbnormalReportList[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                    }
                    // window.setTimeout(function () {
                    //     if (!!$scope.checkedAbnormalReportList) {
                    //         jQuery('.checked_abnormal_report_list .list-item:first-child').click();
                    //     }
                    // },100);
                }
            });
        }

        $scope.get_check_abnormal_report_data = function ($item, type, $event) {
            if(jQuery($event.target).hasClass('active')) return;
            $('.task-abnormal_report-data-wrapper').addClass('hide');
            $('.list-item').removeClass('active');
            $($event.target).addClass('active');
            $scope.checked = type;

            $scope.currenAbnormalReport = $item;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appAbnormalReport/getAbnormalRecordDetailById',//督导 异常报备-详情
                data: {
                    token: $rootScope.userinfo.token,
                    recordId: $item.abnormal_record_id,
                },
                callback: function (response) {
                    $scope.abnormal_report_data = response.data;
                    $('.task-abnormal_report-data-wrapper').removeClass('hide');
                }
            });
        }

        $scope.switch_check_abnormal_report = function () {
            $('.task-abnormal_report-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').addClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').removeClass('btn-bg-darkgray');
            $('.unchecked_abnormal_report_list').removeClass('hide');
            $('.checked_abnormal_report_list').addClass('hide');
            $scope.getUncheckedAbnormalReportList();
        }
        $scope.switch_uncheck_abnormal_report = function () {
            $('.task-abnormal_report-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').removeClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').addClass('btn-bg-darkgray');
            $('.unchecked_abnormal_report_list').addClass('hide');
            $('.checked_abnormal_report_list').removeClass('hide');
            $scope.getCheckedAbnormalReportList();
        }

        $scope.submit_check_AbnormalReport = function (type, checked) {
            jQuery('.submit_check_abnormalReport_btn').attr('disabled', true);
            $rootScope.getServerTime(function (time) {
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appAbnormalReport/submitCheckAbnormalRecord',//督导 异常报备-同意
                    data: {
                        token: $rootScope.userinfo.token,
                        abnormalReportId: $scope.abnormal_report_data.abnormalRecordData.abnormal_record_id,
                        checked: checked,
                        operateTime: time,
                        suggection: type
                    },
                    callback: function (response) {
                        jQuery('.submit_check_abnormalReport_btn').attr('disabled', false);
                        if(response.data.status == 1){
                            alert(type+'成功！');
                            $scope.abnormal_report_data.checked = true;
                            $scope.reload_abnormal_report_wrapper();
                        }
                    }
                });
            });
        }

        $scope.reload_abnormal_report_wrapper = function () {
            $('.task-abnormal_report-data-wrapper').addClass('hide');
            $scope.checkedNormalReportList = [];
            $scope.uncheckedNormalReportList = [];
            $scope.init();
        }
        $scope.init();
    }]);
