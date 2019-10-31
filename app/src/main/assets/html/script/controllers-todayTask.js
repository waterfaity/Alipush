'use strict';


angular.module('myApp.controllerstodaytask', [])
//首页
.controller('TodayTaskCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $rootScope.IFLogin();

    $scope.task_list_header_title = "今日任务";

    // 今日任务
    $scope.sidebar_item_today_init = function($autoLoad) {
        $rootScope.showLoading($('.task-list-scroll'));
        if(!$rootScope.userinfo){
            $rootScope.go('/login');
            return false;
        }
        if($autoLoad) $scope.autoLoad = $autoLoad;
        window.setTimeout(function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl+'appTask/getTodayTaskList',//今日任务列表
                data: {
                    token: $rootScope.userinfo.token,
                    userCode: $rootScope.userinfo.username,
                    projectId: $rootScope.currenProject.proj_id,
                },
                callback: function (response) {
                    // response.data = { "projectList" : [ { "TASK_ID" : "2e79b285aa5649d4a5b7aaf4bf0a4af1", "AGENCY_NAME" : "江苏鼎众汽车销售服务有限公司", "DOOR_PHOTO" : "http://139.224.130.19/photo/uploadFiles/2e79b285aa5649d4a5b7aaf4bf0a4af1/8fcb11c4-902a-52a9-edc4-3e5e9b170952.jpg", "ADDRESS" : "ss", "PLAN_TIME" : "2019-06-03", "TASK_STATUS" : "5", "TASK_STATUS_NAME" : "正常检查", "TASK_CODE" : "201902-2211007-1", "TEACHER_ID" : "f6c023a453064be78096fab8ce97ea25", "NAME" : "顾均涛", "ORDERDATA" : 9 }, { "TASK_ID" : "9cfb10597c10451caaa0d58c9c9359d4", "AGENCY_NAME" : "宁波轿辰甬宸汽车销售服务有限公司", "ADDRESS" : "XX", "PLAN_TIME" : "2019-06-03", "TASK_STATUS" : "1", "TASK_STATUS_NAME" : "任务锁定", "TASK_CODE" : "201902-2201410-1", "TEACHER_ID" : "f6c023a453064be78096fab8ce97ea25", "NAME" : "顾均涛", "ORDERDATA" : 3 } ], "status" : 1, "message" : "" }; // ⚡⚡ TEST
                    if(response.data.status == 1) {
                        $scope.task_list = response.data.projectList;
                        $scope.sidebar_count.task = $scope.task_list.length;
                        if($scope.task_list) for(var i=0; i<$scope.task_list.length; i++){
                            if(!$scope.task_list[i]['DOOR_PHOTO']) $scope.task_list[i]['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;
                        }
                        $rootScope.removeLoading();
                    }else if(response.data.status == 0) {
                        $scope.task_list_error_info = response.data.message;
                        $scope.sidebar_count.task = 0;
                        $scope.task_list = [];
                        $rootScope.removeLoading();
                    }
                    window.setTimeout(function () {
                        if (!!$rootScope.questionnaire_back_task) $rootScope.task_item_click();
                        if($scope.autoLoad && $scope.autoLoad == "first"){
                            $scope.task_item_click(jQuery('.task-wrapper .task-list-scroll .task-item:first-child').attr('data-id'));
                        }
                        $scope.autoLoad = null;
                    }, 100);
                }
            });
        }, 500);
    }

    $rootScope.reloadTodayTask = function () {
        $rootScope.reloadTodayList();
        $rootScope.slide_page_back('.task-detail-wrapper');
        $scope.task_item_click();
    }
    $rootScope.reloadTodayList = function () {
        $('.task-detail-wrapper').addClass('hide');
        $scope.sidebar_item_today_init();
    }

    // 打卡页
    $scope.arrive = {};
    $rootScope.select_photos = {};
    $scope.sidebar_item_today_init();

    $scope.arrive_go = function () {

        $scope.arrive = {
            location: "正在定位",
            longitude_latitude: "-",
            transport_photos: {},
            entrance_photos: {}
        };
        $rootScope.getServerTime(function (date) {
            $scope.arrive.date = date.split(' ')[0];

            var f = new Date().time_range($rootScope.ProjMessage.prop_cardtime_begin, $rootScope.ProjMessage.prop_cardtime_end, date.split(' ')[1]);
            if (!f) {
                $('#arrive_submit_btn').attr('disabled', true);
                alert('当前时间禁止打卡');
            }else{
                $('#arrive_submit_btn').attr('disabled', false);
            }
        });
        $rootScope.getLocation(function () {
            // $rootScope.geolocation.latitude = "31.166288";// ⚡⚡ TEST
            // $rootScope.geolocation.longitude = "121.391314";// ⚡⚡ TEST
            $scope.arrive.longitude_latitude = $rootScope.geolocation.longitude + ', ' + $rootScope.geolocation.latitude;
            // if(!!$scope.agency_detail.agencyData.LONGITUDE && !!$scope.agency_detail.agencyData.LATITUDE && (!$rootScope.geolocation.latitude || !$rootScope.geolocation.longitude)){
            if(!$rootScope.geolocation.latitude || !$rootScope.geolocation.longitude){
                $scope.arrive.location = "无法定位";
                return false;
            }
            $scope.arrive.geolocation = $rootScope.geolocation;
            $scope.arrive.map = $rootScope.baiduMapApiUrl + "staticimage/v2?ak=" + $rootScope.baidumapAK + "&mcode=666666&center="+$rootScope.geolocation.longitude+","+$rootScope.geolocation.latitude+"&coordtype=bd09ll&width=1000&height=420&zoom=17&copyright=1&dpiType=ph&markerStyles=-1,http://139.224.130.19/image/point.png&markers="+$rootScope.geolocation.longitude+","+$rootScope.geolocation.latitude;
            // $scope.arrive.map = $rootScope.baiduMapApiUrl + "staticimage/v2?ak=" + $rootScope.baidumapAK + "&mcode=666666&center="+$rootScope.geolocation.longitude+","+$rootScope.geolocation.latitude+"&coordtype=wgs84ll&width=540&height=300&zoom=17&copyright=1&dpiType=pl&markerStyles=-1,http://139.224.130.19/image/point.png&markers="+$rootScope.geolocation.longitude+","+$rootScope.geolocation.latitude;// ⚡⚡ TEST 高DPI
            $rootScope.ajax({
                method: "GET",
                url: $rootScope.baiduMapApiUrl + "geocoder/v2/?location="+$rootScope.geolocation.latitude+","+$rootScope.geolocation.longitude+"&coordtype=bd09ll&output=json&pois=0&ak=" + $rootScope.baidumapAK,
                callback: function (response) {
                    $scope.arrive.location = response.data.result.formatted_address;
                }
            });

            window.setTimeout(function () {
                if(!$rootScope.geolocation) $scope.arrive.location = "无法定位";
            },3000);
        });
    }

    $scope.arriveSubmit = function () {

        // $rootScope.go('/questionnaire');// ⚡⚡ TEST
        //if(!$scope.arrive.remarks || $scope.arrive.remarks.length == 0){
        //    alert("请填写备注");
        //    return false;
        //}

        if(!$scope.arrive.transport_photos || Object.keys($scope.arrive.transport_photos).length == 0){
            alert("请拍摄交通工具照片");
            return false;
        }//else if (Object.keys($scope.arrive.transport_photos).length < $rootScope.proj_photo_min_nums) {
        //     alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
        //     return false;
        // }
        if(!$scope.arrive.entrance_photos || Object.keys($scope.arrive.entrance_photos).length == 0){
            alert("请拍摄门口照片");
            return false;
        }//else if (Object.keys($scope.arrive.entrance_photos).length < $rootScope.proj_photo_min_nums) {
        //     alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
        //     return false;
        // }
        if(!$rootScope.geolocation.longitude || !$rootScope.geolocation.latitude){
            alert("无法定位");
            return false;
        }

        $scope.uploadArriveImage();
    }

    $scope.uploadArriveImage = function () {
        jQuery('#arrive_submit_btn').attr('disabled', true);

        if(!$scope.arrive.transport_photos || !$scope.arrive.entrance_photos) return;
        var formData = new FormData();
        var uoload_array = [];

        if(!!$scope.arrive.transport_photos) {
            for (var i in $scope.arrive.transport_photos) {
                // var transport_photos_img = $rootScope.base64ToBlob($scope.arrive.transport_photos[i]);
                // var transport_photos_name = $rootScope.Guuid();
                // formData.append(transport_photos_name, transport_photos_img, i+".jpg");

                // 0交通工具
                uoload_array.push(
                    {"imageName": i, "imageType": "0", "isDefault": i == 0 ? "0" : "1", "isStandard": "0"}
                );
            }
        }

        if(!!$scope.arrive.entrance_photos) {
            for (var i in $scope.arrive.entrance_photos) {
                // var entrance_photos_img = $rootScope.base64ToBlob($scope.arrive.entrance_photos[i]);
                // var entrance_photos_name = $rootScope.Guuid();
                // formData.append(entrance_photos_name, entrance_photos_img, i+".jpg");

                // 1门口
                uoload_array.push(
                    {"imageName": i, "imageType": "1", "isDefault": i == 0 ? "0" : "1", "isStandard": "0"}
                );
            }
        }

        var baidu_arrive_map_image = $rootScope.imageToBase64($('#baidu_arrive_map_image')[0], function (map) {
            var baidu_arrive_map_uuid_name = $rootScope.Guuid();
            var baidu_arrive_map_img = $rootScope.base64ToBlob(map);
            formData.append(baidu_arrive_map_uuid_name, baidu_arrive_map_img, baidu_arrive_map_uuid_name+".jpg");
            // 12地图
            uoload_array.push(
                {"imageName": baidu_arrive_map_uuid_name, "imageType": "12", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
            );

            formData.append("token", $rootScope.userinfo.token);
            formData.append("taskId", $rootScope.task_detail.TASK_ID);
            formData.append("projectId", $rootScope.currenProject.proj_id);
            formData.append("agencyId", $rootScope.task_detail.AGENCY_ID);
            formData.append("longitude", $rootScope.geolocation.longitude);
            formData.append("latitude", $rootScope.geolocation.latitude);
            formData.append("address", $scope.arrive.location);
            formData.append("imageList", JSON.stringify(uoload_array));
            formData.append("rmk", $scope.arrive.remarks || '');

            // $http.post(
            //     $rootScope.apiUrl + 'appImage/uploadOnlyImage', //照片上传
            //     formData,
            //     {
            //         transformRequest: angular.identity,
            //         headers: {'Content-Type': undefined}
            //     }
            // )
            // .success(function (response) {
                $rootScope.getServerTime(function (time) {
                    formData.append("arriveTime", time);
                    // $rootScope.ajax({
                    //     url: $rootScope.apiUrl + 'appArrive/arriveInfo',//提交打卡位置
                    //     data: {
                    //         token: $rootScope.userinfo.token,
                    //         projectId: $rootScope.currenProject.proj_id,
                    //         taskId: $rootScope.task_detail.TASK_ID,
                    //         agencyId: $rootScope.task_detail.AGENCY_ID,
                    //         longitude: $rootScope.geolocation.longitude,
                    //         latitude: $rootScope.geolocation.latitude,
                    //         address: $scope.arrive.location,
                    //         arriveTime: time,
                    //         imageList: JSON.stringify(uoload_array),
                    //         rmk: $scope.arrive.remarks || "",
                    //     },
                    //     callback: function (response) {

                    $http.post(
                        $rootScope.apiUrl + 'appArrive/arriveInfo',//提交打卡位置
                        formData,
                        {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        }
                    )
                    .success(function (response) {
                        jQuery('#arrive_submit_btn').attr('disabled', false);
                        if (response.status == 1) {
                            alert('打卡成功');
                            $rootScope.update_photos_active($scope.arrive.transport_photos);
                            $rootScope.update_photos_active($scope.arrive.entrance_photos);
                            window.setTimeout(function () {
                                $rootScope.select_photos = {};
                                $scope.reload_arrive_wrapper();
                            }, 500);
                        } else if (response.status == -2) {
                            if (response.message != "") alert(response.message);
                        } else {
                            alert('打卡失败');
                        }
                    })
                    .error(function (response) {
                        console.error(response.data);
                    });
                });
            // })
            // .error(function (response) {
            //     console.error(response.data);
            // });
        });
    }

    $scope.reload_arrive_wrapper = function () {
        $rootScope.slide_page_back('.task-detail-wrapper');
        $rootScope.showLoading($('.task-detail-wrapper'));
        window.setTimeout(function () {
            $rootScope.removeLoading();
            $scope.sidebar_item_today_init('first');
        },100);
    }

    $rootScope.upload_photos_today_page_go = function (title, $photo_btn) {
        $rootScope.select_photos_page_title = title;
        $rootScope.select_photos = {};
        if($rootScope.select_photos_page_title == "交通工具照片") {
            if($scope.arrive.transport_photos) $rootScope.select_photos = $scope.arrive.transport_photos;
        }else if($rootScope.select_photos_page_title == "门口照片") {
            if($scope.arrive.entrance_photos) $rootScope.select_photos = $scope.arrive.entrance_photos;
        }

        if($rootScope.select_photos) {
            if (Object.keys($rootScope.select_photos).length > $rootScope.proj_photo_max_nums - 1) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                if($photo_btn) return 'number_error';
            }
        }
    }
    $rootScope.todayTask_select_photos_btn = function (new_photo_flag, page_title_flag) {
        if(!new_photo_flag || !new_photo_flag == 'new_photo') {
            $rootScope.select_photos = {};
            // $('.image-panel.active img').each(function (e) {
            $('.image-panel.active .photo').each(function (e) {
                // $rootScope.select_photos[$(this).attr('data-name')] = $(this).attr('src');
                $rootScope.select_photos[$(this).attr('data-name')] = $rootScope.photos[$(this).attr('data-name')]
            });
        }
        if(Object.keys($rootScope.select_photos).length > $rootScope.proj_photo_max_nums) {
            alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
            return false;
        }

        if($rootScope.select_photos_page_title == "交通工具照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.arrive.transport_photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }else {
                if ($scope.arrive.transport_photos) for (var i in $rootScope.select_photos) {
                    $scope.arrive.transport_photos[i] = $rootScope.select_photos[i];
                }
            }
            $scope.slide_page_back('.task-arrive-wrapper');
        }else if($rootScope.select_photos_page_title == "门口照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.arrive.entrance_photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.arrive.entrance_photos) for (var i in $rootScope.select_photos) {
                    $scope.arrive.entrance_photos[i] = $rootScope.select_photos[i];
                }
            }
            $scope.slide_page_back('.task-arrive-wrapper');
        }
        $rootScope.select_photos = {};
        if(page_title_flag) $rootScope.select_photos_page_title = "";
        if(new_photo_flag == 'new_photo') $scope.$apply();
    }

    $scope.remove_photo_btn = function (index, title, check_active) {
        var flag = true;
        if(!check_active) flag = confirm('确认要删除吗？');

        if(flag) {
            if ($rootScope.select_photos_page_title == "交通工具照片" || title == "交通工具照片") {
                if ($scope.arrive.transport_photos) delete ($scope.arrive.transport_photos[index]);
            } else if ($rootScope.select_photos_page_title == "门口照片" || title == "门口照片") {
                if ($scope.arrive.entrance_photos) delete ($scope.arrive.entrance_photos[index]);
            }
            $rootScope.delete_photos_active(index);
        }
    }

    // 备注长度限制
    $('body').on('keyup', '.remarks-panel #remarks', function (e) {
        if(e.target.value.length >= 50) {
            $('.remarks-panel .restrictions').addClass('color-danger');
            $('.remarks-panel .restrictions').html("0字");
        }else {
            $('.remarks-panel .restrictions').removeClass('color-danger');
            $('.remarks-panel .restrictions').html(50 - e.target.value.length + "字");
        }
    });

    // 离店
    $scope.leave_wrapper_init = function () {
        $rootScope.leave_wrapper_flag = true;
        $rootScope.go('/questionnaire');
    }

    $scope.goto_questionnaire = function() {
        $rootScope.go('/questionnaire');
        // $('div[ng-controller="QuestionnaireCtrl"]').scope().getFirstMQ();
    }

    $scope.goto_appeal = function ($id) {
        $scope.unqualifiedData = {};
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appUnqualified/getUnqualifiedById',//不符合项 - 详情
            data: {
                token: $rootScope.userinfo.token,
                unqualifiedId: $id,
            },
            callback: function (response) {
                $scope.unqualifiedData = response.data.unqualifiedData;
            }
        });
    }

    $rootScope.remove_today_active_photos = function(index){
        $scope.remove_photo_btn(index, "交通工具照片", true);
        $scope.remove_photo_btn(index, "门口照片", true);
    }
}]);
