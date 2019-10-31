'use strict';


angular.module('myApp.controllersother', [])
//logo页
.controller('OtherCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $rootScope.IFLogin();

    $scope.reset_pwd = {};

    $scope.logout = function () {
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appLogin/logout',//登出
            data: {
                token: $rootScope.userinfo.token,
            },
            callback: function (response) {
                $rootScope.resetGlobalData();
                $rootScope.go('/login');
            }
        });
    }

    $scope.list_item_highlight = function ($event) {
        $('.list-item').removeClass('active');
        $($event.target).addClass('active');
    }

    $scope.goto_application_info = function () {
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appSoft/getSoftMessage',//软件信息
            data: {
                token: $rootScope.userinfo.token,
            },
            callback: function (response) {
                if(!!response.data.softMessage) {
                    $scope.softMessage = response.data.softMessage;
                    $rootScope.slide_page_switch('.application-info-wrapper');
                }
            }
        });
    }

    $scope.reset_password = function () {
        if(!$scope.reset_pwd.old_pwd || !$scope.reset_pwd.new_pwd || !$scope.reset_pwd.new_pwd2){
            alert('请输入密码！');
            return false;
        }
        if($scope.reset_pwd.old_pwd != $rootScope.userinfo.password){
            alert('旧密码不正确！');
            return false;
        }
        if($scope.reset_pwd.new_pwd != $scope.reset_pwd.new_pwd2){
            alert('密码与确认密码不一致！');
            return false;
        }

        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appLogin/changePwd',//密码重置
            data: {
                token: $rootScope.userinfo.token,
                password: $scope.reset_pwd.new_pwd
            },
            callback: function (response) {
                if(response.data.status == 1) {
                    alert('密码更改成功！请重新登录');
                    $rootScope.go('/login');
                }else{
                    if(response.data.message != "") alert(response.data.message);
                }
            }
        });
    }
}]);
