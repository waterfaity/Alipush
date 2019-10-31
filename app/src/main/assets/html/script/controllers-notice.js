'use strict';


angular.module('myApp.controllersnotice', [])
	//消息
    .controller('noticeCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $rootScope.IFLogin();

        $scope.beforeMessageId = null;

        $scope.init = function () {
            $scope.getUncheckedNoticeList();
        }

        $scope.getUncheckedNoticeList = function(){
            $scope.messagelist_error_info = "";
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appMessage/getMessageList',//消息列表
                data: {
                    token: $rootScope.userinfo.token,
                    projectId: $rootScope.currenProject.proj_id,
                    msgStatus: "0", // 未读
                },
                callback: function (response) {
                    $scope.uncheckedMessagelist = response.data.messagelist;
                    $scope.sidebar_count.notice = $scope.uncheckedMessagelist ? $scope.uncheckedMessagelist.length : 0;
                    if(!$scope.uncheckedMessagelist) $scope.messagelist_error_info = response.data.message;
                    window.setTimeout(function () {
                        if (!!$scope.uncheckedMessagelist) {
                            jQuery('.unchecked_notice_list .list-item:first-child').click();
                        }
                    },100);
                }
            });
        }

        $scope.getCheckedNoticeList = function(){
            $scope.messagelist_error_info = "";
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appMessage/getMessageList',//消息列表
                data: {
                    token: $rootScope.userinfo.token,
                    projectId: $rootScope.currenProject.proj_id,
                    msgStatus: "1", // 已读
                },
                callback: function (response) {
                    $scope.checkedMessagelist = response.data.messagelist;
                    if(!$scope.checkedMessagelist) $scope.messagelist_error_info = response.data.message;
                    window.setTimeout(function () {
                        if (!!$scope.checkedMessagelist) {
                            jQuery('.checked_notice_list .list-item:first-child').click();
                        }
                    },100);
                }
            });
        }

        $scope.get_check_notice_data = function ($item, type, $event) {
            $('list-item[data-id="'+$scope.beforeMessageId+'"]').addClass('hide');
            $('.task-notice-data-wrapper').addClass('hide');
            $('.list-item').removeClass('active');
            $($event.target).addClass('active');
            if(type == "checked"){
                $scope.title = "已读消息";
            }else{
                $scope.title = "未读消息";
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appMessage/updateMessageStatus',//设置消息已读
                    data: {
                        token: $rootScope.userinfo.token,
                        msgId: $item.msg_id,
                    },
                    callback: function (response) {
                        if(response.data.status == 1){
                            $scope.beforeMessageId = $item.msg_id;
                        }
                    }
                });
            }

            $scope.checked = type;
            $scope.notice_data = $item;
            $('.task-notice-data-wrapper').removeClass('hide');
        }

        $scope.switch_check_notice = function () {
            $('.task-notice-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').addClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').removeClass('btn-bg-darkgray');
            $('.unchecked_notice_list').removeClass('hide');
            $('.checked_notice_list').addClass('hide');
            $scope.getUncheckedNoticeList();
        }
        $scope.switch_uncheck_notice = function () {
            $('.task-notice-data-wrapper').addClass('hide');
            $('.tab-paenl .tab-1').removeClass('btn-bg-darkgray');
            $('.tab-paenl .tab-2').addClass('btn-bg-darkgray');
            $('.unchecked_notice_list').addClass('hide');
            $('.checked_notice_list').removeClass('hide');
            $scope.getCheckedNoticeList();
        }

        $scope.init();
    }]);
