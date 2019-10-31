'use strict';

angular.module('myApp.controllers', [])
    .controller('MainCtrl', ['$scope', '$rootScope', '$window', '$location', '$ngConfirm', '$http', function ($scope, $rootScope, $window, $location, $ngConfirm, $http) {

        //基础函数
        $rootScope.pageReady = false;
        $rootScope.geolocation = {latitude: 0, longitude: 0};
        $rootScope.deviceWidth = document.body.clientWidth;
        $rootScope.apiUrl = "";
        if(window.localStorage.getItem('lianji-app-apiUrl')) $rootScope.apiUrl = window.localStorage.getItem('lianji-app-apiUrl');
        // $rootScope.apiUrl = "http://127.0.0.1:8080/Car1/";
        $rootScope.webSocketUrl = "";
        if(window.localStorage.getItem('lianji-app-webSocketUrl')) $rootScope.webSocketUrl = window.localStorage.getItem('lianji-app-webSocketUrl');
        $rootScope.baiduMapApiUrl = "https://api.map.baidu.com/";
        $rootScope.baidumapAK = "rbDjZOptAi0rjfTuquqENXNDhi5ik5Mn";
        $rootScope.version_type = window.localStorage.getItem('lianji-app-version_type');

        // 初始化数据
        $rootScope.userinfo = JSON.parse(window.localStorage.getItem('lianji-app-userinfo')) || null;
        $rootScope.ProjMessage = JSON.parse(window.localStorage.getItem('lianji-app-ProjMessage')) || null;
        $rootScope.proj_photo_max_nums = $rootScope.ProjMessage ? parseInt($rootScope.ProjMessage.prop_photo_nums) : 0;
        $rootScope.proj_photo_min_nums = $rootScope.ProjMessage ? parseInt($rootScope.ProjMessage.prop_photo_minimun) : 0;
        // prop_photo_minimun
        $rootScope.deviceId = window.localStorage.getItem('lianji-app-deviceId') || null;
        $rootScope.photos = {};
        $rootScope.source_photos = {};
        $rootScope.photos_active = [];
        $rootScope.photos_orderby = [];
        if(window.localStorage.getItem('lianji-app-photos')) $rootScope.photos = JSON.parse(window.localStorage.getItem('lianji-app-photos'));
        if(window.localStorage.getItem('lianji-app-source_photos')) $rootScope.source_photos = JSON.parse(window.localStorage.getItem('lianji-app-source_photos'));
        if(window.localStorage.getItem('lianji-app-photos_active')) $rootScope.photos_active = JSON.parse(window.localStorage.getItem('lianji-app-photos_active'));
        if(window.localStorage.getItem('lianji-app-photos_orderby')) $rootScope.photos_orderby = JSON.parse(window.localStorage.getItem('lianji-app-photos_orderby'));
        $rootScope.currenProject = JSON.parse(window.localStorage.getItem('lianji-app-currenProject')) || {};
        $rootScope.serverDate = null;
        $rootScope.project_switch_id = $rootScope.ProjMessage ? $rootScope.ProjMessage.proj_basic_tone : null;
        $rootScope.select_photos_check = false;
        $rootScope.loginHeader = {};

        $rootScope.leave_wrapper_flag = false;
        $rootScope.sidebar_count = [];
        $rootScope.sidebar_count.task = 0;
        $rootScope.sidebar_count.notice = 0;
        $rootScope.new_photo = false;
        $rootScope.photos_orderby_list = [];
        $rootScope.questionnaire_back_task = false;
        // userinfo role_code:   ROLE_LS 老师     ROLE_DD 督导      ROLE_PROJADMIN 管理员

        // 项目配置
        $rootScope.projectList = {
            "blue": {id: 1, name:"大众", colorCode: "theme-blue", logoUrl: "vw-logo.png", color: "#0059a7", loginPageLogo: "login-logo-1.png", loginPageLogoWidth: 169, loginPageTitle: "上汽大众硬件检查系统"},
            // "blue": {id: 1, name:"依维柯", colorCode: "theme-blue", logoUrl: "iveco-logo.png", color: "#0059a7", loginPageLogo: "login-logo-2.png", loginPageLogoWidth: 180, loginPageTitle: "依维柯巡检app"},
            "green": {id: 2, name:"斯柯达", colorCode: "theme-green", logoUrl: "SKODA-logo.png", color: "#5bae52", loginPageLogo: "login-logo-1.png", loginPageTitle: "斯柯达巡检app"},
            "red": {id: 3, name:"联绩", colorCode: "theme-red", logoUrl: "lianji-logo.png", color: "#942828", loginPageLogo: "lianji-logo.png", loginPageTitle: "联绩巡检app"},
            "blue1": {id: 4, name:"依维柯", colorCode: "theme-blue", logoUrl: "iveco-logo.png", color: "#0059a7", loginPageLogo: "login-logo-2.png", loginPageLogoWidth: 180, loginPageTitle: "依维柯巡检app"},
        }
        $rootScope.loginHeader = $rootScope.projectList['red'];

        $rootScope.setLoginHeader = function() {
            // if(!$rootScope.project_switch_id) $rootScope.project_switch_id = Object.keys($rootScope.projectList)[0];
            if(!$rootScope.project_switch_id) $rootScope.project_switch_id = "red";
            $rootScope.loginHeader = $rootScope.projectList[$rootScope.project_switch_id];
        }
        $rootScope.setLoginHeader();

        $rootScope.ajax = function (obj) {
            if(!$rootScope.apiUrl || $rootScope.apiUrl == "") {
                $rootScope.getApiUrl(function () {
                    $rootScope.ajaxFunc(obj);
                });
            }else {
                $rootScope.ajaxFunc(obj);
            }
        }

        $rootScope.ajaxFunc = function (obj) {
            $http({
                method: obj.method || 'POST',
                url: obj.url,
                headers: obj.headers || {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
                params: obj.data,
                transformRequest:function(obj){
                    var str=[];
                    for(var p in obj){
                        str.push(encodeURIComponent(p) + "-"+encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                }
            }).then(function successCallback(response) {
                if(response.status == 200){
                    if(response.data.message == "token已失效，请重新登录" && $location.$$path != "/login"){
                        // $rootScope.resetGlobalData();
                        $rootScope.reLogin();
                    }
                    else if(response.data.status == -1){
                        console.error(response);
                    }else if(response.data.status == 0){
                        console.error(response);
                    }
                    if(obj.callback) obj.callback(response);
                }else{
                    //网络错误
                    alert('网络错误');
                }
            },function errorCallback(response) {
                alert('网络错误');
            });
        }

        $rootScope.getApiUrl = function(callback){
            $http({
                method: 'POST',
                 url: 'http://47.103.88.68:8080/AppCar/appSoft/getApi',//获取Api路径
//                url: 'http://139.224.130.19:8080/AppCar/appSoft/getApi',//获取Api路径
                headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
            }).then(function successCallback(response) {
                if(response.status == 200){
                    // response.data.api.api_url = '139.224.130.19'; // 测试服务器
                    if(response.data.api.api_url){
                        $rootScope.apiUrl = "http://" + response.data.api.api_url + ":8080/AppCar/";
                        $rootScope.webSocketUrl = "ws://" + response.data.api.api_url + ":8887";
                        $rootScope.version_type = response.data.api.version_type;
                        window.localStorage.setItem('lianji-app-apiUrl', $rootScope.apiUrl);
                        window.localStorage.setItem('lianji-app-webSocketUrl', $rootScope.webSocketUrl);
                        window.localStorage.setItem('lianji-app-version_type', response.data.api.version_type);
                        if(callback) callback();
                    }else{
                        alert("无法获取服务器信息");
                    }
                }else{
                    //网络错误
                    alert('网络错误');
                }
            },function errorCallback(response) {
//                alert('网络错误');
                     $rootScope.go('/test');
            });
        }

        // 清空暂存数据
        $rootScope.resetGlobalData = function () {
            $rootScope.ws.close();
            window.localStorage.removeItem('lianji-app-ProjMessage');
            window.localStorage.removeItem('lianji-app-userinfo');
            $rootScope.proj_photo_max_nums = 0;
            $rootScope.proj_photo_min_nums = 0;
            $rootScope.userinfo = null;
            $rootScope.ProjMessage = null;
            $rootScope.sidebar_count = [];
            window.localStorage.removeItem('lianji-app-webSocketUrl');
            window.localStorage.removeItem('lianji-app-apiUrl');
            window.localStorage.removeItem('lianji-app-version_type');
            // $rootScope.photos = {};
        }

        $rootScope.back = function() {
            $window.history.back();
        }
        $rootScope.go = function(path){
            $location.url(path);
            $rootScope.highlight_sidebar();
        }

        // 自动重新登录
        $rootScope.reLogin = function (callback) {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLogin/getDeviceIdFlag',//是否校验DeviceId
                callback: function (response) {
                    if (response.data.deviceidflag != null) {
                        $rootScope.deviceidflag = response.data.deviceidflag;
                        $rootScope.getDeviceId($rootScope.deviceidflag, function (flag) {
                            var data = {};
                            if ($rootScope.deviceidflag) {
                                data = {
                                    userCode: $.trim($scope.user),
                                    password: $.trim($scope.password),
                                    deviceId: $rootScope.deviceId
                                }
                            } else {
                                data = {
                                    userCode: $.trim($scope.user),
                                    password: $.trim($scope.password),
                                }
                            }
                            $rootScope.ajax({
                                url: $rootScope.apiUrl + 'appLogin/login',//登录
                                data: data,
                                callback: function (response) {
                                    alert(response.data.message);
                                    if (response.data.status == 1) {
                                        $scope.password = $rootScope.userinfo.password;
                                        $rootScope.userinfo = response.data;
                                        $rootScope.userinfo.password = $scope.password;
                                        window.localStorage.setItem('lianji-app-userinfo', JSON.stringify(response.data));
                                        alert("token已失效，正在重新登录");
                                        window.location.reload();
                                    } else {
                                        if (response.data.message == "usererror") {
                                            alert("token已失效，请重新登录");
                                            $rootScope.go('/login');
                                        }
                                    }
                                }
                            });
                        });
                    }else{
                        if(response.data.message != "") alert(response.data.message);
                    }
                }
            });
        }

        $rootScope.highlight_sidebar = function () {
            window.setTimeout(function () {
                $('.sidebar-wrapper .sidebar-item').removeClass('active');
                $rootScope._path = $location.$$path;
                $(".main-slide[ng-view]").attr('data-path', false).attr('data-path', $rootScope._path.split('/')[1]);

                if ($rootScope._path == "/todayTask" || $rootScope._path == "/questionnaire") $('.sidebar-wrapper .sidebar-item-today').addClass('active');
                else if ($rootScope._path == "/arriveTask") $('.sidebar-wrapper .sidebar-item-arrive').addClass('active');
                else if ($rootScope._path == "/recentTask") $('.sidebar-wrapper .sidebar-item-backlog').addClass('active');
                else if ($rootScope._path == "/finishedTask") $('.sidebar-wrapper .sidebar-item-completed').addClass('active');
                else if ($rootScope._path == "/leaveTask") $('.sidebar-wrapper .sidebar-item-leave').addClass('active');
                else if ($rootScope._path == "/abnormalReportTask") $('.sidebar-wrapper .sidebar-item-put-exceptional').addClass('active');
                else if ($rootScope._path == "/normalReportTask") $('.sidebar-wrapper .sidebar-item-put-normal').addClass('active');
            },50);
        }
        // window.setTimeout(function () {
        // },300);

        $rootScope.sidebar_load = function(){
            $rootScope.highlight_sidebar();
        }

        $rootScope.removeLoading = function ($parentNode) {
            $parentNode = $parentNode || $('body');
            $parentNode.find('.loading').remove();
        }
        $rootScope.showLoading = function ($node) {
            $node.append('<div class="loading"></div>');
        }

        // 验证设备
        $scope.checkIMEIE = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLogin/checkAppIMEIExists',//IMEI验证
                data: {
                    imeiCode: "1"
                },
                callback: function (response) {
                    console.info(response.data);
                    // $scope.task_list = response.data.projectList;
                    // $rootScope.removeLoading();
                }
            });
        }

        $rootScope.getDeviceId = function(flag, callback){
            if(flag == "false"){
                if (callback) callback(false);
            }else {
                if (!$rootScope.deviceId) {
                    if (window.localStorage.getItem('lianji-app-deviceId')) {
                        $rootScope.deviceId = window.localStorage.getItem('lianji-app-deviceId');
                    } else {
                         if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
                            // ios webview
                            setupWebViewJavascriptBridge(function (bridge) {
                                bridge.callHandler('getDeviceId', {key: 'deviceId'}, function (response) {
                                    console.log('JS got response', response);
                                });

                                bridge.registerHandler('setDeviceId', function (data, responseCallback) {
                                    if (data != "") {
                                        $rootScope.deviceId = data;
                                        window.localStorage.setItem('lianji-app-deviceId', $rootScope.deviceId);
                                        if (callback) callback(true);
                                    }
                                });
                            });

                        } else if (/(Android)/i.test(navigator.userAgent)) {
                            // Android webview
                            // 安卓的代码
                             var data = jsb.require_str('getDeviceId', {});

                             if (data != "") {
                                 $rootScope.deviceId = data;
                                 window.localStorage.setItem('lianji-app-deviceId', $rootScope.deviceId);
                                 if (callback) callback(true);
                             }
                        }
                    
                     }

                } else {
                    if (callback) callback(true);
                }

                window.setTimeout(function () {
                    if (!$rootScope.deviceId) alert('无法获取硬件信息');
                }, 2000);
            }
        }

        $rootScope.last_slide = null;
        // slide页切换
        $rootScope.slide_page_switch = function (pageName) {
            window.setTimeout(function () {
                $('.current-slide').addClass('hide').removeClass('current-slide');
                $(pageName).removeClass('hide').addClass('current-slide');
            }, 50);
        }
        // slide页前进
        $rootScope.slide_page_go = function (pageName) {
            window.setTimeout(function () {
                $rootScope.last_slide = $('.current-slide');
                $('.current-slide').addClass('slide-left').removeClass('current-slide');
                $(pageName).removeClass('slide-right slide-left').addClass('current-slide');
            }, 50);
        }
        // slide页后退
        $rootScope.slide_page_back = function (pageName) {
            if(!pageName) pageName = $rootScope.last_slide;
            window.setTimeout(function () {
                $('.workspace-panel-body .cell').removeClass('active');
            }, 50);
            $('.current-slide').addClass('slide-right').removeClass('current-slide');
            $(pageName).removeClass('slide-left slide-right').addClass('current-slide');
        }

        // 侧边栏切换
        $rootScope.sidebar_item_click = function($event, $page) {
            if($page == 'logo') {
                $rootScope.go('/other');
            }
            if($page == 'today'){
                $rootScope.go('/todayTask');
            }
            if($page == 'backlog'){
                $rootScope.go('/recentTask');
            }
            if($page == 'completed'){
                $rootScope.go('/finishedTask');
            }
            if($page == 'arrive'){
                $rootScope.go('/arriveTask');
            }
            if($page == 'leave'){
                $rootScope.go('/leaveTask');
            }
            if($page == 'put-exceptional'){
                $rootScope.go('/abnormalReportTask');
            }
            if($page == 'put-normal'){
                $rootScope.go('/normalReportTask');
            }
            if($page == 'notice'){
                $rootScope.go('/notice');
            }

            // window.setTimeout(function () {
            //     $('.sidebar-item').removeClass('active');
            //     $('.' + $page).addClass('active');
            // },100);
        }

        // $('body').on('touchstart click', '.task-wrapper-expansion-btn, .workspace-wrapper-expansion-btn', function (e) {
        $rootScope.workspace_expansion_btn =  function () {
            $('.task-wrapper').removeClass('expansion');
            $('.workspace-header').removeClass('expansion');
            $('.workspace-wrapper-expansion-btn').addClass('hide').removeClass('show');
            $('.workspace-wrapper-expansion-placeholder').removeClass('show');
            $('.workspace-wrapper').removeClass('expansion');
        }
        $rootScope.tasklist_expansion_btn =  function () {
            if (!jQuery('.slide.current-slide:not(.hide)')[0]) return false;
            $('.task-wrapper').addClass('expansion');
            $('.workspace-header').addClass('expansion');
            $('.workspace-wrapper-expansion-btn').addClass('show').removeClass('hide');
            $('.workspace-wrapper-expansion-placeholder').addClass('show');
            $('.workspace-wrapper').addClass('expansion');
        }

        $('body').on('touchstart', '.workspace-panel-body .cell', function (e) {
            $('.workspace-panel-body .cell').removeClass('active');
            $(this).addClass('active');
        });


        // 项目切换
        $rootScope.project_switch = function () {
            // $rootScope.project_switch_id = parseInt($($event.target).attr('data-id'));
            // $('.sidebar-wrapper .sidebar-nav .avatar').css('background-image', "url('assets/demo/"+$rootScope.projectList[$rootScope.project_switch_id]['logoUrl']+"')");
            // $('#project-switch-modal .project-switch-btn').removeClass('active');
            // $('#project-switch-modal .project-switch-btn:nth-child('+($rootScope.project_switch_id+1)+')').addClass('active');
            // $('.body').addClass($rootScope.project_switch_id);
        }

        // $('body').on('touchstart', '.workspace-wrapper-expansion-btn', function (e) {
        //     if($('.task-wrapper').hasClass('expansion')) {
        //         $('.task-wrapper').removeClass('expansion');
        //         $('.workspace-wrapper-expansion-btn').hide();
        //     } else {
        //         $('.task-wrapper').addClass('expansion');
        //         $('.workspace-wrapper-expansion-btn').show();
        //     }
        // })

        $rootScope.getServerTime = function (callback) {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appImage/getServerTime',//获取服务器时间
                data: {token: $rootScope.userinfo.token},
                callback: function (response) {
                    if (callback) callback(response.data.serverTime);
                }
            });
        }

        $rootScope.getServerDate = function (callback) {
            if ($rootScope.serverDate){
                if (callback) callback($rootScope.serverDate);
            } else {
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appImage/getServerTime',//获取服务器时间
                    data: {token: $rootScope.userinfo.token},
                    callback: function (response) {
                        $rootScope.serverDate = response.data.serverTime.split(' ')[0];
                        if (callback) callback($rootScope.serverDate);
                    }
                });
            }
        }

        // 拍照
        $scope.photo_model = {};
        $rootScope.photo_btn = function($title) {
             var flag = 'true';
            if ($location.$$path == '/todayTask'){
                flag = $rootScope.upload_photos_today_page_go($title, true);
            }
            else if ($location.$$path == '/questionnaire'){
                flag = $rootScope.upload_photos_questionnaire_page_go($title, true);
            }
            if(flag != 'number_error') {
                $rootScope.new_photo = true;
                if ($rootScope.geolocation.latitude == 0 || $rootScope.geolocation.longitude == 0) $rootScope.getLocation();

                $('#photo_input').click();
                jsb.require_str('takePhoto', {});
            }
        };

        $('body').on('change', '#photo_input', function($event) {
            console.log("photo123");
            alert(1);
            var imageName = $rootScope.Guuid();
            $scope.newPhoto(imageName, "assets/icon/loading.gif");

            $rootScope.get_photo(this, imageName);
            var parent = $('#photo_input').parent();
            $('#photo_input').remove();
            parent.append('<input id="photo_input" type="file" accept="image/*;" multiple capture="camera" class="hide">');
        });



        $scope.receiveBase64StrData = function (json) {
            //①接收到Android传递过来的json信息
            var base64Str = json.base64EncodeImgStr;

            var base64 = new Base64();
            var onject = base64.decode(base64Str);
            onject = onject.replace(/[\r\n]/g, "");
            document.getElementById("photo_input").src = "data:image/jpeg;base64," + onject;

        };

        $rootScope.get_photo = function($node, imageName) {
            var file = $node.files[0];

            if (!/^(image\/jpeg|image\/png)$/i.test(file.type)) {
                alert('照片文件格式错误');
                return false;
            }
            $rootScope.getThumbnail(file, imageName);
            var reader = new FileReader();
            var imgFile;

            reader.onload = function (e) {
                imgFile = e.target.result;
                var $image = $('.croppable_img_content');
                var imgNode = $image[0];
                imgNode.setAttribute('src', imgFile);

                window.setTimeout(function () {
                    var croppable = false;
                    $image.cropper({
                        dragMode: 'none',
                        autoCropArea: 1,
                        viewMode: 2,
                        checkOrientation: true,
                        ready: function () {
                            croppable = true;

                            var compress_width = 800;
                            var canvas = $image.cropper("getCroppedCanvas", {
                                width: $image.width(),
                                height: $image.height()
                            });

                            var location = $rootScope.geolocation,
                                watermark_location = location ? location.latitude + ", " + location.longitude : "0, 0",
                                fsz = 16,
                                drawer = canvas.getContext("2d");
                            $rootScope.getServerTime(function (watermark_timestamp) {
                                //开始绘制图片(压缩之后)
                                drawer.restore();
                                drawer.font = fsz + "px Arial";
                                drawer.textBaseline = 'middle';
                                drawer.textAlign = 'center';
                                drawer.shadowColor = 'rgba(0, 0, 0, 0.8)';
                                drawer.shadowOffsetX = 2;
                                drawer.shadowOffsetY = 2;
                                drawer.shadowBlur = 2;
                                drawer.fillStyle = "#ffffff";

                                //获取水印内容
                                drawer.fillText(watermark_timestamp, (canvas.width - (drawer.measureText(watermark_timestamp).width) / 2) - 10, (canvas.height - fsz / 2) - 20);//时间戳 水印
                                drawer.fillText(watermark_location, (canvas.width - (drawer.measureText(watermark_location).width) / 2) - 10, (canvas.height - fsz / 2) - 2);//时间戳 水印
                                //获取压缩之后的 base64 编码的数据
                                var bodyData = canvas.toDataURL("image/jpeg", 0.8);

                                $image.cropper("destroy");
                                $('.cropper-container').remove();
                                $('.croppable_img_content').attr('src', '');
                                window.setTimeout(function () {$('.photos-thumb-buttons .photo_btn').attr('disabled', false)},50);

                                if ($rootScope.photo_vin) {
                                    $scope.newPhoto(imageName, bodyData);
                                }else {
                                    var formData = new FormData();
                                    formData.append("token", $rootScope.userinfo.token);
                                    formData.append("taskid", $rootScope.task_detail ? $rootScope.task_detail.TASK_ID : null);
                                    formData.append(imageName, $rootScope.base64ToBlob(bodyData), imageName + ".jpg");
                                    $http.post(
                                        $rootScope.apiUrl + 'appImage/uploadOnlyImage', //照片上传
                                        formData,
                                        {
                                            transformRequest: angular.identity,
                                            headers: {'Content-Type': undefined}
                                        }
                                    ).success(function (response) {
                                        if (response.fileUpload) {
                                            $rootScope.source_photos[imageName] = response[imageName];
                                            window.localStorage.setItem('lianji-app-source_photos', JSON.stringify($rootScope.source_photos));
                                        } else {
                                            alert(response.Message || response.message);
                                        }
                                    }).error(function(){
                                        // $scope.remove_photo_btn(imageName);
                                        $rootScope.confirm_remove_select_photos(imageName);
                                        $rootScope.remove_today_active_photos(imageName);
                                        $rootScope.remove_questionnaire_active_photos(imageName);
                                        alert('照片提交失败，请重新拍照');
                                    });
                                }
                            });
                        }
                    });
                },100);
            };

            reader.readAsDataURL(file);
        }

        // 添加图片
        $scope.newPhoto = function (imageName, bodyData) {
            if (!$rootScope.select_photos) return false;

            $rootScope.select_photos[imageName] = bodyData;

            // window.setTimeout(function () {
            //     $('.photos-panel .image-panel').last().addClass('active');
            // }, 100);
            if(bodyData == "assets/icon/loading.gif") {
                if ($location.$$path == '/todayTask') $rootScope.todayTask_select_photos_btn('new_photo', false);
                else if ($location.$$path == '/questionnaire') $rootScope.questionnaire_select_photos_btn('new_photo', false);
            }else{
                if ($rootScope.photo_vin) {
                    $rootScope.baidu_ocr_vin(bodyData);
                    $rootScope.select_photos = {};
                } else {
                    if ($rootScope.new_photo) {
                        if ($location.$$path == '/todayTask') $rootScope.todayTask_select_photos_btn('new_photo', true);
                        else if ($location.$$path == '/questionnaire') $rootScope.questionnaire_select_photos_btn('new_photo', true);
                        $rootScope.new_photo = false;
                    }
                }
            }
        }

        // 获取GPS
        $rootScope.getLocation = function(callback) {
            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function (r) {
                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                    var mk = new BMap.Marker(r.point);
                    $rootScope.geolocation = {latitude:r.point.lat,longitude:r.point.lng};
                    if(callback) callback($rootScope.geolocation);
                }else{
                    $rootScope.geolocation = {latitude:0,longitude:0};
                    if(callback) callback($rootScope.geolocation);
                }
            });
        }

        // 生成缩略图base64
        $rootScope.getThumbnail = function(file, name) {
            var reader = new FileReader();
            var imgFile;

            reader.onload = function (e) {
                $('.photos-thumb-buttons .photo_btn').attr('disabled', true);

                imgFile = e.target.result;
                var $image = $('.thumbnail_img_content');
                var imgNode = $image[0];
                imgNode.setAttribute('src', imgFile);

                window.setTimeout(function () {
                    var croppable = false;
                    $image.cropper({
                        dragMode: 'none',
                        autoCropArea: 1,
                        viewMode: 2,
                        checkOrientation: true,
                        ready: function () {
                            croppable = true;

                            var canvas = $image.cropper("getCroppedCanvas", {
                                width: $image.width(),
                                height: $image.height(),
                                minWidth: $image.width(),
                                minHeight: $image.height(),
                                maxWidth: $image.width(),
                                maxHeight: $image.height(),
                            });

                            //获取压缩之后的 base64 编码的数据
                            var bodyData = canvas.toDataURL("image/jpeg", 0.6);

                            $rootScope.photos[name] = bodyData;
                            $rootScope.photos_orderby.unshift(name);
                            window.localStorage.setItem('lianji-app-photos', JSON.stringify($rootScope.photos));
                            window.localStorage.setItem('lianji-app-photos_orderby', JSON.stringify($rootScope.photos_orderby));
                            $rootScope.goto_photos();
                            if (!$rootScope.photo_vin) $scope.newPhoto(name, bodyData);

                            $image.cropper("destroy");
                            $('.cropper-container').remove();
                            $('.thumbnail_img_content').attr('src', '');
                        }
                    });
                }, 50);
            };

            reader.readAsDataURL(file);
        }

        // 图片转base64
        $rootScope.imageToBase64 = function(imgNode, callback) {
            imgNode.setAttribute('crossOrigin', 'anonymous');

            var compress_width = 800,
                width = 0,
                height = 0,
                quality = 0.7,
                canvas = document.createElement("canvas"),
                drawer = canvas.getContext("2d"),
                rectCenterPoint = {};
            var rotate = 0;

            canvas.width = compress_width;
            canvas.height = compress_width * (imgNode.height / imgNode.width);
            drawer.clearRect(0, 0, canvas.width, canvas.height);

            // drawer.translate(canvas.width / 2, canvas.height / 2);
            // drawer.rotate(rotate * Math.PI / 180);
            // drawer.translate(-canvas.width / 2, -canvas.height / 2);
            // drawer.drawImage(imgNode, canvas.width / 2 - canvas.width / 2, canvas.height / 2 - canvas.height / 2);
            drawer.drawImage(imgNode, 0, 0,canvas.width,canvas.height);
            // drawer.translate(canvas.width / 2, canvas.height / 2);
            // drawer.rotate(-rotate * Math.PI / 180);
            // drawer.translate(-canvas.width / 2, -canvas.height / 2);
            drawer.save();
            drawer.restore();

            var location = $rootScope.geolocation,
                watermark_location = location ? location.latitude + ", " + location.longitude : "0, 0",
                fsz = 16;
            $rootScope.getServerTime(function (watermark_timestamp) {
                //开始绘制图片(压缩之后)
                drawer.restore();
                drawer.font = fsz + "px Arial";
                drawer.textBaseline = 'middle';
                drawer.textAlign = 'center';
                drawer.shadowColor = 'rgba(0, 0, 0, 0.8)';
                drawer.shadowOffsetX = 2;
                drawer.shadowOffsetY = 2;
                drawer.shadowBlur = 2;
                drawer.fillStyle = "#ffffff";

                //获取水印内容
                drawer.fillText(watermark_timestamp, (canvas.width - (drawer.measureText(watermark_timestamp).width) / 2) - 10, (canvas.height - fsz / 2) - 20);//时间戳 水印
                drawer.fillText(watermark_location, (canvas.width - (drawer.measureText(watermark_location).width) / 2) - 10, (canvas.height - fsz / 2) - 2);//时间戳 水印
                //获取压缩之后的 base64 编码的数据
                var bodyData = canvas.toDataURL("image/jpeg", quality);

                if (callback) callback(bodyData);
            });
        }
        // $rootScope.imageToBase64 = function(imgFile, callback) {
        //     var $image = $('.croppable_img_content');
        //     var imgNode = $image[0];
        //     imgNode.setAttribute('src', imgFile);
        //     var croppable = false;
        //     $image.cropper({
        //         dragMode: 'none',
        //         autoCropArea: 1,
        //         viewMode: 3,
        //         checkOrientation: true,
        //         ready: function () {
        //             croppable = true;
        //
        //             var compress_width = 800;
        //             var canvas = $image.cropper("getCroppedCanvas", {
        //                 width: $image.width(),
        //                 height: $image.height()
        //             });
        //
        //             var location = $rootScope.geolocation,
        //                 watermark_location = location ? location.latitude + ", " + location.longitude : "0, 0",
        //                 fsz = 32,
        //                 drawer = canvas.getContext("2d");
        //             $rootScope.getServerTime(function (watermark_timestamp) {
        //                 //开始绘制图片(压缩之后)
        //                 drawer.restore();
        //                 drawer.font = fsz + "px Arial";
        //                 drawer.textBaseline = 'middle';
        //                 drawer.textAlign = 'center';
        //                 drawer.shadowColor = 'rgba(0, 0, 0, 0.8)';
        //                 drawer.shadowOffsetX = 2;
        //                 drawer.shadowOffsetY = 2;
        //                 drawer.shadowBlur = 2;
        //                 drawer.fillStyle = "#ffffff";
        //
        //                 //获取水印内容
        //                 drawer.fillText(watermark_timestamp, (canvas.width - (drawer.measureText(watermark_timestamp).width) / 2) - 10, (canvas.height - fsz / 2) - 20);//时间戳 水印
        //                 drawer.fillText(watermark_location, (canvas.width - (drawer.measureText(watermark_location).width) / 2) - 10, (canvas.height - fsz / 2) - 2);//时间戳 水印
        //                 //获取压缩之后的 base64 编码的数据
        //                 var bodyData = canvas.toDataURL("image/jpeg", 0.8);
        //
        //                 // $scope.newPhoto(bodyData);
        //                 $image.cropper("destroy");
        //                 if(callback) callback(bodyData);
        //             });
        //         }
        //     });
        // }

        // 计算文件尺寸
        $rootScope.base64Size = function ($data) {
            var tag="base64,";
            var baseStr=$data.substring($data.indexOf(tag)+tag.length);
            var eqTagIndex=baseStr.indexOf("=");
            baseStr=eqTagIndex!=-1?baseStr.substring(0,eqTagIndex):baseStr;
            var strLen=baseStr.length;
            var fileSize=strLen-(strLen/8)*2;
            return fileSize;
        }

        // base64转文件
        $rootScope.base64ToBlob = function(urlData) {
            var arr = urlData.split(',');
            var mime = arr[0].match(/:(.*?);/)[1] || 'image/jpeg';
            // 去掉url的头，并转化为byte
            var bytes = window.atob(arr[1]);
            // 处理异常,将ascii码小于0的转换为大于0
            var ab = new ArrayBuffer(bytes.length);
            // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
            var ia = new Uint8Array(ab);

            for (var i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i);
            }

            return new Blob([ab], {
                type: mime
            });
        }

        // 生成uuid
        $rootScope.Guuid = function() {
            function S4() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            }
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }

        // 获取GPS
        $rootScope.getLocation();
        $rootScope.pageReady = true;

        //跳转登录
        $rootScope.IFLogin = function () {
            if (!$rootScope.userinfo && $location.$$path != "/login") {
                $rootScope.go('/login');
                return false;
            }
        }
        window.setTimeout(function () {$rootScope.IFLogin()}, 20);


        // 照片库
        $rootScope.photo_preview_open = function(e) {
            var image = "";
            if($(e.target).attr('data-name') && $rootScope.source_photos[$(e.target).attr('data-name')]){
                image = $rootScope.source_photos[$(e.target).attr('data-name')];
            }else {
                image = $(e.target).attr('src') || $(e.target).css('background-image').split('url(')[1].split(')')[0];
            }
            $('.workspace-wrapper').addClass('showmodal');
            $('#photo-preview .modal-body .image-box').css('background-image','').css('background-image', 'url('+image+')');
            $('#photo-preview').modal('show');
        }
        $rootScope.photo_preview_close = function(e) {
            $('.workspace-wrapper').removeClass('showmodal');
        }
        $rootScope.check_photos_btn = function (e) {
            var panel = $(e.target).parents('.image-panel');
            if(panel.hasClass('active')){
                panel.removeClass('active');
            }else{
                panel.addClass('active');
            }
        }

        $rootScope.select_photos_check_btn = function ($title) {
            if ($location.$$path == '/todayTask') $rootScope.upload_photos_today_page_go($title);
            else if ($location.$$path == '/questionnaire') $rootScope.upload_photos_questionnaire_page_go($title);

            $('.photos-panel .photos-list .image-panel').removeClass('active');
            $rootScope.select_photos_check = true;
            $rootScope.goto_photos();
            $rootScope.slide_page_go('.task-photos-wrapper');
        }

        $rootScope.cancel_select_photos_btn = function () {
            $rootScope.select_photos_check = false;
        }

        // 未读消息推送
        $rootScope.unread_messages = function () {
            if (!$rootScope.webSocketUrl || $rootScope.webSocketUrl == "") {
                $rootScope.getApiUrl(function () {
                    $rootScope.webSocketFunc();
                });
            } else {
                $rootScope.webSocketFunc();
            }
        }

        $rootScope.webSocketFunc = function () {
            if(!!$rootScope.userinfo && !!$rootScope.userinfo.token){
                $rootScope.ws = new WebSocket(encodeURI($rootScope.webSocketUrl));

                $rootScope.ws.onopen = function () {
                    //Web Socket连接上，先把当前用户账号提交到WebSocket服务器记录
                    $rootScope.ws.send('appUserLogin:{"userCode":"' + $rootScope.userinfo.username + '"}');
                    if(!!$rootScope.ProjMessage && !!$rootScope.ProjMessage.proj_id) {
                        // Web Socket 已连接上，使用 send() 方法发送数据
                        $rootScope.ws.send('appPushMsg:{"userCode":"' + $rootScope.userinfo.username + '","projectId":"' + $rootScope.ProjMessage.proj_id + '"}');
                    }
                    console.info("数据发送中...");
                };

                $rootScope.ws.onerror = function (evt) {
                    var received_msg = evt.data;
                    console.info("发生错误...");
                };

                $rootScope.ws.onmessage = function (evt) {
                    var received_msg = JSON.parse(evt.data);

                    if (received_msg.type && received_msg.type == "getDataCountMessage") {
                        $scope.$apply($rootScope.sidebar_count.task = received_msg.taskcount || 0);
                        $scope.$apply($rootScope.sidebar_count.notice = received_msg.messagecount || 0);
                        $scope.$apply($rootScope.sidebar_count.arrive = received_msg.arrivecount || 0);
                        $scope.$apply($rootScope.sidebar_count.leave = received_msg.leavecount || 0);
                        $scope.$apply($rootScope.sidebar_count.abnormal = received_msg.abnormalrecordcount || 0);
                        $scope.$apply($rootScope.sidebar_count.normal = received_msg.normalrecordcount || 0);
                        // console.info(received_msg);
                    }
                };

                $rootScope.ws.onclose = function () {
                    // 关闭 websocket
                    console.info("连接已关闭...");
                };
            }
        }
        $rootScope.unread_messages();

        // widget 任务详情

        $rootScope.task_item_click = function($id) {
            if(!!$rootScope.questionnaire_back_task){
                $id = $rootScope.current_task_id;
                $rootScope.questionnaire_back_task = false;
            }else{
                if($id) $rootScope.current_task_id = $id;
            }

            var node = jQuery('.task-list .task-item[data-id="'+$id+'"]');
            if(!node[0] || node.hasClass('active')) return false;

            $rootScope.slide_page_go('.task-detail-wrapper');
            $('.task-detail-wrapper').removeClass('hide');
            $('.task-detail-wrapper .workspace-panel').removeClass('hide');
            $('.workspace-panel').removeClass("hide");
            $rootScope.showLoading($('.task-detail-wrapper'));
            if(node[0]) {
                $('.list-item').removeClass('active');
                node.addClass('active');
                // $('.task-list .task-item').removeClass('active').find('.lock').addClass('show');
                // $($event.target).parents('.task-item').addClass('active').find('.lock').removeClass('show');
            }

            $rootScope.ajax({
                url: $rootScope.apiUrl+'appTask/getTaskDetailList',//任务详情
                data: {
                    token: $rootScope.userinfo.token,
                    taskId: $rootScope.current_task_id   // ⚡⚡ TEST
                    // taskId: "7d116abeb34d461ca8b9a001800fa3cc"  // ⚡⚡ TEST
                },
                callback: function (response) {
                    if (response.data.status == 1) {
                        $rootScope.task_detail = response.data.projectDetail;
                        if (!$rootScope.task_detail.TASKFINISHPERCENT) $rootScope.task_detail.TASKFINISHPERCENT = 0;
                        $rootScope.task_detail.progress = parseInt($rootScope.task_detail.TASKFINISHPERCENT);
                        if (!$scope.task_detail['DOOR_PHOTO']) $scope.task_detail['DOOR_PHOTO'] = "assets/logo/" + $rootScope.loginHeader.logoUrl;

                        $rootScope.ajax({
                            url: $rootScope.apiUrl + 'appAgency/getAgencyDetail',//经销商详情
                            data: {
                                token: $rootScope.userinfo.token,
                                agencyId: $rootScope.task_detail.AGENCY_ID,
                            },
                            callback: function (response) {
                                $rootScope.agency_detail = response.data;
                                $rootScope.agency_detail.LONGITUDE_LATITUDE = ($rootScope.agency_detail.agencyData.LONGITUDE && $rootScope.agency_detail.agencyData.LATITUDE) ? $rootScope.agency_detail.agencyData.LONGITUDE + ", " + $rootScope.agency_detail.agencyData.LATITUDE : "-";
                            }
                        });
                    }else{
                        $('.task-detail-wrapper .workspace-panel').addClass('hide');
                        $rootScope.task_detail_error_info = response.data.message;
                    }
                    $rootScope.removeLoading();
                }
            });
        }
        // $rootScope.task_item_click();    // ⚡⚡ TEST

        $rootScope.goto_agency_detail = function () {
            $rootScope.slide_page_go('.task-agency-detail-wrapper');
        }

        $rootScope.goto_MQModuleList = function () {//3层级目录
            $rootScope.showLoading($('.questionnaire-MQModuleList-wrapper .workspace-panel'));
            $rootScope.slide_page_go('.questionnaire-MQModuleList-wrapper');
            $rootScope.mqmodulelist_error_info = null;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appMQ/getMQModuleList',//主问卷获取检查模块
                data: {
                    token: $rootScope.userinfo.token,
                    mqId: $rootScope.task_detail.MQ_ID,
                },
                callback: function (response) {
                    if(response.data.status != 0){
                        $rootScope.mqmodulelist_error_info = response.data.message;
                    }
                    $rootScope.mqmodulelist = response.data.mqmodulelist;
                    $rootScope.removeLoading();
                }
            });
        }
        $rootScope.goto_agency_record_list = function ($title, $id) {
            if(!$rootScope.task_detail.AGENCYRECORDCOUNT) return false;
            $rootScope.showLoading($('.task-agency-record-wrapper .workspace-panel'));
            $rootScope.slide_page_go('.task-agency-record-wrapper');
            $rootScope.ajax({
                url: $rootScope.apiUrl+'appAgency/getAgencyRecordList',//经销商报备
                data: {
                    token: $rootScope.userinfo.token,
                    agencyId: $rootScope.task_detail.AGENCY_ID,
                    taskId: $rootScope.task_detail.TASK_ID,
                },
                callback: function (response) {

                    if(response.data.status == 0) $rootScope.agency_record_list = {"error_info": response.data.message};
                    else $rootScope.agency_record_list = response.data.agencyrecordlist;
                    $rootScope.removeLoading();
                }
            });
        }

        $rootScope.goto_user_detail = function ($title, $id) {
            $rootScope.showLoading($('.task-user-detail-wrapper .workspace-panel'));
            $rootScope.slide_page_go('.task-user-detail-wrapper');
            $rootScope.user_detail_title = $title;
            $rootScope.ajax({
                url: $rootScope.apiUrl+'appUser/getUserMessage',//用户信息
                data: {
                    token: $rootScope.userinfo.token,
                    userId: $id,
                },
                callback: function (response) {
                    $rootScope.user_detail = response.data;
                    $rootScope.removeLoading();
                }
            });
        }

        $rootScope.goto_arrive_data_wrapper = function () {
            if(!!$rootScope.task_detail.CARD_TIME) {
                $rootScope.showLoading($('.task-arrive-data-wrapper .workspace-panel'));
                $rootScope.slide_page_go('.task-arrive-data-wrapper');
            }

            $rootScope.ajax({
                url: $rootScope.apiUrl+'appArrive/getCheckArriveData',//打卡确认时间
                data: {
                    token: $rootScope.userinfo.token,
                    arriveId: $rootScope.task_detail.ARRIVE_ID,
                },
                callback: function (response) {
                    if (response.data.status == -1) {
                        $rootScope.arrive_data = {
                            'arrivedata': {mark_time: '-'}
                        };
                    } else {
                        $rootScope.arrive_data = response.data;
                    }
                    $('.workspace-panel').removeClass("hide");
                    $rootScope.removeLoading();
                }
            });
        }
        $rootScope.goto_abnormal_data_list = function () {
            if($rootScope.task_detail.ABNORMAL_COUNT != 0) {
                $rootScope.showLoading($('.task-abnormal_report-list-wrapper .workspace-panel'));
                $rootScope.slide_page_go('.task-abnormal_report-list-wrapper');
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appAbnormalReport/getAbnormalRecordById',// 异常报备列表
                    data: {
                        token: $rootScope.userinfo.token,
                        agencyId: $rootScope.task_detail.AGENCY_ID,
                        taskId: $rootScope.task_detail.TASK_ID,
                    },
                    callback: function (response) {
                        if (response.data.status == 1) {
                            $rootScope.abnormal_report_list = response.data.abnormalRecordList;
                            $rootScope.removeLoading();
                        }else{
                            if(response.data.message != "") alert(response.data.message);
                        }
                    }
                });
            }
        }

        $rootScope.goto_normal_data_list = function () {
            if($rootScope.task_detail.NORMAL_COUNT != 0) {
                $rootScope.showLoading($('.task-normal_report-list-wrapper .workspace-panel'));
                $rootScope.slide_page_go('.task-normal_report-list-wrapper');
                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appNormalReport/getNormalRecordById',// 异常报备列表
                    data: {
                        token: $rootScope.userinfo.token,
                        agencyId: $rootScope.task_detail.AGENCY_ID,
                        taskId: $rootScope.task_detail.TASK_ID,
                    },
                    callback: function (response) {
                        if (response.data.status == 1) {
                            $rootScope.normal_report_list = response.data.normalRecordList;
                            $rootScope.removeLoading();
                        }else{
                            if(response.data.message != "") alert(response.data.message);
                        }
                    }
                });
            }
        }

        $rootScope.goto_unqualified_list = function () {
            if(!!$rootScope.task_detail.APPEAL_COUNT) {
                $rootScope.showLoading($('.unqualified-list-wrapper .workspace-panel'));
                $rootScope.slide_page_go('.unqualified-list-wrapper');
            }
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appUnqualified/getUnqualifiedList',//不符合项 - 列表
                data: {
                    token: $rootScope.userinfo.token,
                    taskId: $rootScope.task_detail.TASK_ID,
                },
                callback: function (response) {
                    $rootScope.unqualifiedList = response.data.unqualifiedList;
                    $rootScope.removeLoading();
                }
            });
        }
        $scope.goto_appeal = function ($id) {
            $scope.unqualifiedData = {};
            // $rootScope.clear_appeal_photos();
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

        $rootScope.goto_leave_data_wrapper = function () {
            if(!!$rootScope.task_detail.LEAVE_TIME) {
                $rootScope.showLoading($('.task-leave-data-wrapper .workspace-panel'));
                $rootScope.slide_page_go('.task-leave-data-wrapper');
            }

            $rootScope.ajax({
                url: $rootScope.apiUrl+'appLeave/getCheckLeaveData',//离店确认
                data: {
                    token: $rootScope.userinfo.token,
                    leaveId: $rootScope.task_detail.LEAVE_ID,
                },
                callback: function (response) {
                    if (response.data.status == -1) {
                        $rootScope.leave_data = {
                            'leavedata': {leave_time: '-'}
                        };
                    } else {
                        $rootScope.leave_data = response.data;
                    }
                    $('.workspace-panel').removeClass("hide");
                    $rootScope.removeLoading();
                }
            });
        }

        $rootScope.goto_MQCheckList = function ($id) {
            $rootScope.mqchecklist_error_info = null;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appMQ/getMQCheckList',//主问卷检查项
                data: {
                    token: $rootScope.userinfo.token,
                    mqModuleId: $id,
                },
                callback: function (response) {
                    if(response.data.status != 0){
                        $rootScope.mqchecklist_error_info = response.data.message;
                    }else {
                        if(!!response.data.mqpointlist) {
                            $rootScope.mqexampointlist = response.data.mqpointlist;
                            $rootScope.slide_page_go('.questionnaire-MQExamPointList-wrapper');
                        }else if(!!response.data.mqchecklist){
                            $rootScope.mqchecklist = response.data.mqchecklist;
                            $rootScope.slide_page_go('.questionnaire-MQCheckList-wrapper');
                        }
                    }
                }
            });
        }

        $rootScope.goto_MQExamPointList = function ($id) {
            $rootScope.mqexampointlist_error_info = null;
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appMQ/getMQExamPointList',//主问卷检查点
                data: {
                    token: $rootScope.userinfo.token,
                    mqCheckListId: $id,
                },
                callback: function (response) {
                    if(response.data.status != 0){
                        $rootScope.mqexampointlist_error_info = response.data.message;
                    }
                    $rootScope.mqexampointlist = response.data.mqchecklist;
                    $rootScope.slide_page_go('.questionnaire-MQExamPointList-wrapper');
                }
            });
        }


        $rootScope.goto_abnormal_data_detail = function (item) {
            $rootScope.showLoading($('.task-abnormal_report-data-wrapper .workspace-panel'));
            $rootScope.slide_page_go('.task-abnormal_report-data-wrapper');
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appAbnormalReport/getAbnormalRecordDetailById',// 异常报备
                data: {
                    token: $rootScope.userinfo.token,
                    agencyId: $rootScope.task_detail.AGENCY_ID,
                    taskId: $rootScope.task_detail.TASK_ID,
                    recordId: item.abnormal_record_id,
                },
                callback: function (response) {
                    if (response.data.status == 1) {
                        $rootScope.abnormal_report_data = response.data;
                        $rootScope.removeLoading();
                    }else{
                        if(response.data.message != "") alert(response.data.message);
                    }
                }
            });
        }

        $rootScope.goto_normal_data_detail = function (item) {
            $rootScope.showLoading($('.task-normal_report-data-wrapper .workspace-panel'));
            $rootScope.slide_page_go('.task-normal_report-data-wrapper');
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appNormalReport/getNormalRecordDetailById',// 异常报备
                data: {
                    token: $rootScope.userinfo.token,
                    recordId: item.normal_record_id,
                },
                callback: function (response) {
                    if (response.data.status == 1) {
                        $rootScope.normal_report_data = response.data;
                        $rootScope.removeLoading();
                    }else{
                        if(response.data.message != "") alert(response.data.message);
                    }
                }
            });
        }

        $rootScope.goto_member_detail = function ($m) {
            $rootScope.member_detail = $m;
            $rootScope.slide_page_go('.task-member-detail-wrapper');
        }

        $rootScope.finish_task = function () {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLeave/submitFinishTask',// 结束任务
                data: {
                    token: $rootScope.userinfo.token,
                    taskId: $rootScope.task_detail.TASK_ID,
                },
                callback: function (response) {
                    if (response.data.status == 1) {
                        // 清空照片库
                        alert('任务结束');
                        window.localStorage.removeItem('lianji-app-photos');
                        window.localStorage.removeItem('lianji-app-photos_active');
                        window.localStorage.removeItem('lianji-app-source_photos');
                        window.localStorage.removeItem('lianji-app-photos_orderby');
                        $rootScope.photos = {};
                        $rootScope.photos_active = [];
                        $rootScope.source_photos = {};
                        $rootScope.photos_orderby = [];
                        $rootScope.photos_orderby_list = [];
                        $rootScope.reloadTodayList();
                    } else {
                        if(response.data.message != "") alert(response.data.message);
                    }
                }
            });
        }

        $rootScope.remove_select_photos_btn = function ($key) {
            var c = confirm("确认要删除该照片？");
            if(c) {
                if ($rootScope.photos) {
                    $rootScope.ajax({
                        url: $rootScope.apiUrl + 'appImage/deleteImage',//删除照片
                        data: {
                            token: $rootScope.userinfo.token,
                            imageName: $key,
                        },
                        callback: function (response) {
                            if (response.data.status == 1) {
                                $rootScope.confirm_remove_select_photos($key);
                                $rootScope.goto_photos();
                            }
                        }
                    });
                }
            }
        }
        $rootScope.confirm_remove_select_photos = function ($key) {
            delete ($rootScope.photos[$key]);
            delete ($rootScope.photos_active[$key]);
            delete ($rootScope.source_photos[$key]);
            for(var i=0; i<$rootScope.photos_orderby.length; i++){
                if($rootScope.photos_orderby[i] == $key) $rootScope.photos_orderby.splice(i, 1);
            }
            if (!!$rootScope.remove_today_active_photos) $rootScope.remove_today_active_photos($key);
            if (!!$rootScope.remove_questionnaire_active_photos) $rootScope.remove_questionnaire_active_photos($key);

            window.localStorage.setItem('lianji-app-photos', JSON.stringify($rootScope.photos));
            window.localStorage.setItem('lianji-app-photos_active', JSON.stringify($rootScope.photos_active));
            window.localStorage.setItem('lianji-app-photos_orderby', JSON.stringify($rootScope.photos_orderby));
            window.localStorage.setItem('lianji-app-source_photos', JSON.stringify($rootScope.source_photos));
        }
        // $rootScope.set_photos_active = function () {
        //     $('.image-panel .remove_photo_btn').removeClass('hide');
        //     $('.image-panel .photo').each(function (e) {
        //         for(var i=0; i<$rootScope.photos_active.length; i++) {
        //             if($(this).attr('data-name') == $rootScope.photos_active[i]){
        //                 $(this).parents('.box').find('.remove_photo_btn').addClass('hide');
        //                 continue;
        //             }
        //         }
        //     });
        // }
        $rootScope.update_photos_active = function ($list) {
            if($list) {
                var arr = Object.keys($list);
            }else {
                var arr = Object.keys($rootScope.select_photos);
            }
            for(var i=0; i<arr.length; i++) {
                $rootScope.photos_active.push(arr[i]);
            }
            window.localStorage.setItem('lianji-app-photos_active', JSON.stringify($rootScope.photos_active));
        }
        $rootScope.delete_photos_active = function ($index) {
            for(var i=0; i<$rootScope.photos_active.length; i++) {
                if($rootScope.photos_active[i] == $index) delete $rootScope.photos_active[i];
            }
        }

        $rootScope.goto_photos = function () {
            $rootScope.photos_orderby_list = [];
            for(var i=0; i<$rootScope.photos_orderby.length; i++){
                if($rootScope.photos_orderby[i]) $rootScope.photos_orderby_list[i] = {
                    id: $rootScope.photos_orderby[i],
                    photo: $rootScope.photos[$rootScope.photos_orderby[i]],
                    order: i
                }
            }
        }

        $scope.photo_box_img_num = $('.photos-thumb-panel .photos-thumb .photo-box img.photo').length;
        $('.photos-thumb-panel .photos-thumb .photo-box img.photo').on('load', function(){
            if(!--photo_box_img_num){
                console.info('完成');
            }
        });



//    //安卓传递来的图片base64数据
//    function from_android_for_base64(json){
//
//    }
    }])
    .directive('repeatLazyload', function() {
        return {
            link: function(scope, element, attrs) {
                if (scope.$last) {                   // 这个判断意味着最后一个 OK
                    scope.$eval(attrs.repeatDone);    // 执行绑定的表达式
                    window.setTimeout(function () {
                        $(".lazy").lazyload();
                    }, 300);
                }

            }
        }
    })
    .directive('repeatPhoto', function() {
        return {
            link: function(scope, element, attrs) {
                if (scope.$last) {                   // 这个判断意味着最后一个 OK
                    scope.$eval(attrs.repeatDone);    // 执行绑定的表达式
                }
            }
        }
    })
    .filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    });
//



