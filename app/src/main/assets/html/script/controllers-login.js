'use strict';


angular.module('myApp.controllerslogin', [])
	//登录
    .controller('LoginCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    	$scope.loginSubmit = function() {
            $scope.getUser();
    	}

        $rootScope.getApiUrl();

    	$scope.getUser = function () {
            // $rootScope.SaveUserInfos(res.data.data);
            // $rootScope.go('/todayTask');
        }

        $scope.login = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLogin/getDeviceIdFlag',//是否校验DeviceId
                callback: function (response) {
                    if (response.data.deviceidflag != null) {
                        $rootScope.deviceidflag = response.data.deviceidflag;
                        $rootScope.getDeviceId($rootScope.deviceidflag, function (flag) {
                            $('.input-panel.input-panel-error').removeClass('input-panel-error');
                            if ($.trim($scope.user) == "") {
                                $('.input-panel.user-panel').addClass('input-panel-error');
                            } else if ($.trim($scope.password) == "") {
                                $('.input-panel.password-panel').addClass('input-panel-error');
                            } else {

                                jQuery('#login_btn').attr('disabled', true);
                                var data = {};
                                if($rootScope.deviceidflag){
                                    data = {
                                        userCode: $.trim($scope.user),
                                        password: $.trim($scope.password),
                                        deviceId: $rootScope.deviceId
                                    }
                                }else {
                                    data = {
                                        userCode: $.trim($scope.user),
                                        password: $.trim($scope.password),
                                    }
                                }
                                $rootScope.ajax({
                                    url: $rootScope.apiUrl + 'appLogin/login',//登录
                                    data: data,
                                    callback: function (response) {
                                        jQuery('#login_btn').attr('disabled', false);
                                        if (response.data.status == 1) {
                                            $rootScope.userinfo = response.data;
                                            $rootScope.userinfo.password = $scope.password;
                                            window.localStorage.setItem('lianji-app-userinfo', JSON.stringify($rootScope.userinfo));
                                            $rootScope.go('/schedule');
                                        } else {
                                            if (response.data.message == "usererror") {
                                                $('.input-panel.user-panel').addClass('input-panel-error');
                                                alert('用户名称不存在或密码错误');
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }else{
                        if(response.data.message != "") alert(response.data.message);
                    }
                }
            });
        }

    }])
    //项目统计
    .controller('ScheduleCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
        $scope.loginSubmit = function() {
            $scope.getUser();
        }

        $scope.getUser = function () {
            // $rootScope.SaveUserInfos(res.data.data);
            // $rootScope.go('/todayTask');
        }

        $rootScope.getServerDate(function (date) {
            $scope.scheduleData = date;
        });

        $rootScope.ajax({
            url: $rootScope.apiUrl+'appProj/getProjScheduleList',//任务统计
            data: {
                token: $rootScope.userinfo.token,
                userCode: $rootScope.userinfo.username,
                roleCode: $rootScope.userinfo.role_code
            },
            callback: function (response) {
                $scope.taskTitle = response.data.taskTitle;
                $scope.scheduleList = response.data.projectList;

                window.setTimeout(function () {
                    $('.proj_name').each(function () {
                        // var name = response.data.projectList[i].proj_name;
                        var name = $(this).html();
                        if (name == "大众") {
                            $(this).html('<div class="icon" style="background-image: url(\'assets/schedule/logo-vw.png\')"></div>' + name);
                        } else if (name == "斯柯达") {
                            $(this).html('<div class="icon" style="background-image: url(\'assets/schedule/logo-skoda.png\')"></div>' + name);
                        } else if (name == "总计") {
                            $(this).html('<div class="icon"><i class="icon-total"></i></div>' + name);
                        }
                    })
                }, 50);
            }
        });

        $rootScope.gotoHomePage = function ($index, proj_id) {
            $scope.getProjMessage(proj_id, function () {
                $rootScope.unread_messages();
                $rootScope.currenProject = $scope.scheduleList[$index];
                window.localStorage.setItem('lianji-app-currenProject', JSON.stringify($rootScope.currenProject));
                $rootScope.go('/todayTask');
            });

            // if($rootScope.userinfo.role_code == 'ROLE_LS') $rootScope.go('/todayTask');
            // else if($rootScope.userinfo.role_code == 'ROLE_DD') $rootScope.go('/arriveTask');
            // else if($rootScope.userinfo.role_code == 'ROLE_PROJADMIN') $rootScope.go('/abnormalReportTask');
        }

        $scope.getProjMessage = function (proj_id, callback) {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appProj/getProjMessage',//获取项目信息
                data: {
                    token: $rootScope.userinfo.token,
                    projectId: proj_id
                },
                callback: function (response) {
                    window.localStorage.setItem('lianji-app-ProjMessage', JSON.stringify(response.data));
                    $rootScope.ProjMessage = response.data;
                    $rootScope.project_switch_id = $rootScope.ProjMessage.proj_basic_tone;
                    $rootScope.proj_photo_max_nums = $rootScope.ProjMessage ? parseInt($rootScope.ProjMessage.prop_photo_nums) : 0;
                    $rootScope.proj_photo_min_nums = $rootScope.ProjMessage ? parseInt($rootScope.ProjMessage.prop_photo_minimun) : 0;
                    $rootScope.setLoginHeader();
                    if(callback) callback();
                }
            });
        }

    }]);
