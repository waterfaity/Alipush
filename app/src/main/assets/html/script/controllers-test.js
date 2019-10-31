'use strict';


angular.module('myApp.controllerstest', [])
//测试
    .controller('TestCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){

        $scope.userinfos = {};
        // $scope.userinfos = $rootScope.IFLogin(false);
        if(!$scope.userinfos) {
            $rootScope.go('/login');
            return false;
        }

        setupWebViewJavascriptBridge(function(bridge) {
            bridge.registerHandler('testJavascriptHandler', function(data, responseCallback) {
                alert(data);
                alert(responseCallback);
                var responseData = { 'Javascript Says':'Right back atcha!' };
                console.log('JS responding with', responseData);
                responseCallback(responseData);
            });

            document.body.appendChild(document.createElement('br'));

            $('#ios-push-btn').on('touchend', function (e) {
                var tag = "0";
                if($(e.target).hasClass('open')) {
                    $(e.target).removeClass('open btn-success').html('启用');
                    tag = "0";
                }else {
                    $(e.target).addClass('open btn-success').html('停用');
                    tag = "1";
                }

                e.preventDefault();
                bridge.callHandler('getUrlFromJs', {'tag': tag}, function(response) {
                    console.log('JS got response', response)
                });

            });
            $('#jsbridge-btn').on('touchend', function (e) {
                bridge.callHandler('getDeviceId', {}, function(response) {
                    console.log('JS got response', response)
                });
                bridge.callHandler(
                    'getDeviceId',
                    {'param':'1'},
                    function(responseData) {
                        alert(responseData);
                        console.info(responseData);
                    }
                )

            });
        });

        $('.workspace-panel').css("display","block");


        $('.btn-orc').on('touchend', function () {
            var file = $("#photo_input")[0].files[0];
            var access_token = "";
            var img_data = $(".test_img_content").attr('src');
            // img_data = img_data.split(",")[1];
            // console.info(img_data);



            var formData = new FormData();
            var img = $rootScope.base64ToBlob(img_data);
            var name = $rootScope.Guuid();
            formData.append(name, img, name+".jpg");

            formData.append("token", $rootScope.userinfo.token);

            $http.post(
                $rootScope.apiUrl+'appSQ/getVinDataByImage', //vin码照片上传
                formData,
                {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }
            )
            .success(function(response) {
                if(response.vin) {
                    console.info(response.vin);
                }
            });
            // $.ajax({
            //     beforeSend:function(jqXHR,options){
            //         jqXHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            //     },
            //     headers:{
            //         // X-Ca-Key: 60022326,
            // Authorization:'APPCODE fc722002ef9a48deaa38f95cea1955f0'
            //     },
            //     method: 'POST',
            //     url: 'https://vin.market.alicloudapi.com/api/predict/ocr_vin',
            //     data: {
            //         "image": img_data
            //     },
            // }).then(function successCallback(response) {
            //     console.info(response);
            // }, function errorCallback(response) {
            //     console.info(response);
            // });
            // $.ajax({
            //     method: 'POST',
            //     url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
            //     data: {
            //         "image": $('.test_img_content').attr('src'),
            //     },
            // }).then(function successCallback(response) {
            // });


            // $.ajax({
            //     method: 'POST',
            //     url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=AlXbGMbpetcL69YLTf4tCLMw&client_secret=nygY6rLUBmqVGQGusDZ1PBcGlnK2wYzB',
            //     // data: {
            //     //     "grant_type": "client_credentials",
            //     //     "client_id" : "AlXbGMbpetcL69YLTf4tCLMw",
            //     //     "client_secret" : "nygY6rLUBmqVGQGusDZ1PBcGlnK2wYzB"
            //     // },
            // }).then(function successCallback(response) {
            //
            //     access_token = response.access_token;
            //
            //     $.ajax({
            //         beforeSend:function(jqXHR,options){
            //             jqXHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            //         },
            //         method: 'POST',
            //         url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/qrcode/general?access_token='+access_token,
            //         // url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token='+access_token,
            //         data: {
            //             "image": img_data
            //         },
            //     }).then(function successCallback(response) {
            //
            //         for(var i in response.words_result) {
            //             $('.orc-panel').html($('.orc-panel').html()+response.words_result[i]['words']+"<br>");
            //         }
            //     }, function errorCallback(response) {
            //     });
            // }, function errorCallback(response) {
            // });


        });

        // var quaggaJSApp = {
        //     init: function() {
        //         quaggaJSApp.attachListeners();
        //     },
        //     attachListeners: function() {
        //         var self = this;
        //         $(".btn-orc").on("click", function(e) {
        //             var file = $("#photo_input")[0].files[0];
        //             quaggaJSApp.decode($rootScope.imageToBase64($('.test_img_content')[0]));
        //
        //             Quagga.start();
        //             // var input = document.querySelector(".controls input[type=file]");
        //             // if (input.files && input.files.length) {
        //             //     App.decode(URL.createObjectURL(input.files[0]));
        //             // }
        //         });
        //     },
        //     decode: function(src) {
        //         var self = this,
        //             config = $.extend({}, self.state, {src: src});
        //         Quagga.decodeSingle(config, function(result) {
        //             //识别结果
        //             if(result.codeResult){
        //                 console.log(result.codeResult.code);
        //                 alert("图片中的条形码为：" + result.codeResult.code);
        //             }else{
        //                 alert("未识别到图片中的条形码！");
        //             }
        //         });
        //     },
        //     state: {
        //         inputStream: {
        //             size: 800,
        //             singleChannel: false
        //         },
        //         locator: {
        //             patchSize: "medium",
        //             halfSample: true
        //         },
        //         decoder: {
        //             readers: [{
        //                 format: "code_128_reader",
        //                 config: {}
        //             }]
        //         },
        //         locate: true,
        //         src: null
        //     }
        // };

        // var quaggaJSApp = {
        //     init: function() {
        //         var config = this.config[this.state.decoder.readers[0].format] || this.config.default;
        //         config = $.extend(true, {}, config, this.state);
        //         Quagga.init(config, function() {
        //             quaggaJSApp.attachListeners();
        //             Quagga.start();
        //         });
        //     },
        //     config: {
        //         "default": {
        //             inputStream: { name: "Test",
        //                 type: "ImageStream",
        //                 length: 10,
        //                 size: 800
        //             },
        //             locator: {
        //                 patchSize: "medium",
        //                 halfSample: true
        //             }
        //         },
        //         "i2of5_reader": {
        //             inputStream: {
        //                 size: 800,
        //                 type: "ImageStream",
        //                 length: 5
        //             },
        //             locator: {
        //                 patchSize: "small",
        //                 halfSample: false
        //             }
        //         }
        //     },
        //     attachListeners: function() {
        //         var self = this;
        //
        //         $(".controls").on("click", "button.next", function(e) {
        //             e.preventDefault();
        //             Quagga.start();
        //         });
        //
        //         $(".controls .reader-config-group").on("change", "input, select", function(e) {
        //             e.preventDefault();
        //             var $target = $(e.target),
        //                 value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
        //                 name = $target.attr("name"),
        //                 states = self._convertNameToStates(name);
        //
        //             console.log("Value of "+ states + " changed to " + value);
        //             self.setState(states, value);
        //         });
        //     },
        //     detachListeners: function() {
        //         $(".controls").off("click", "button.next");
        //         $(".controls .reader-config-group").off("change", "input, select");
        //     },
        //     _accessByPath: function(obj, path, val) {
        //         var parts = path.split('.'),
        //             depth = parts.length,
        //             setter = (typeof val !== "undefined") ? true : false;
        //
        //         return parts.reduce(function(o, key, i) {
        //             if (setter && (i + 1) === depth) {
        //                 o[key] = val;
        //             }
        //             return key in o ? o[key] : {};
        //         }, obj);
        //     },
        //     _convertNameToStates: function(names) {
        //         return names.split(";").map(this._convertNameToState.bind(this));
        //     },
        //     _convertNameToState: function(name) {
        //         return name.replace("_", ".").split("-").reduce(function(result, value) {
        //             return result + value.charAt(0).toUpperCase() + value.substring(1);
        //         });
        //     },
        //     setState: function(paths, value) {
        //         var self = this;
        //
        //         paths.forEach(function(path) {
        //             var mappedValue;
        //
        //             if (typeof self._accessByPath(self.inputMapper, path) === "function") {
        //                 mappedValue = self._accessByPath(self.inputMapper, path)(value);
        //             }
        //             self._accessByPath(self.state, path, mappedValue);
        //         });
        //
        //         console.log(JSON.stringify(self.state));
        //         quaggaJSApp.detachListeners();
        //         Quagga.stop();
        //         quaggaJSApp.init();
        //     },
        //     inputMapper: {
        //         decoder: {
        //             readers: function(value) {
        //                 if (value === 'ean_extended') {
        //                     return [{
        //                         format: "ean_reader",
        //                         config: {
        //                             supplements: [
        //                                 'ean_5_reader', 'ean_2_reader'
        //                             ]
        //                         }
        //                     }];
        //                 }
        //                 return [{
        //                     format: value + "_reader",
        //                     config: {}
        //                 }];
        //             }
        //         },
        //         inputStream: {
        //             src: function(value) {
        //                 return "../test/fixtures/" + value + "/"
        //             }
        //         }
        //     },
        //     state: {
        //         inputStream: {
        //             src: "../test/fixtures/code_128/"
        //         },
        //         decoder : {
        //             readers : [{
        //                 format: "code_128_reader",
        //                 config: {}
        //             }]
        //         }
        //     }
        // };
        //
        // quaggaJSApp.init();

        $('#photo_input').on('touchend', function($event) {
            jsb.require_str("takePhoto", {});
        });

        $scope.signInit = function () {

            var tablet;
            $(function (){
                tablet = new Tablet(".sign_panel",{
                    defaultColor: "#0000000",
                    otherHtml: $("#temp").html(),
                    onInit: function (){
                        var that = this,
                            container = this.container;

                        that.setLineWidth(5);
                        that.setCanvasWH(590,400);
                        $('#Tablet_LYN_0 .tablet-btns').remove();
                        $(".btn-sign_clear").on("touchstart", function (){
                            that.clear();
                        })
                        $(".btn-sign_create").on("touchstart", function (){
                            var data = that.getBase64();
                            $('.sign_image').attr('src', data);
                            // console.log(data);
                        });
                        container.find(".get_blob").on("touchstart", function (){
                            that.getBlob();
                        });
                    }
                });
                console.log(tablet);
            });
        }

        $('.btn-images_upload').on('touchend', function() {

            var files = $( "#images_upload" )[0].files;
            var formData = new FormData(files);
            for(var i=0;i<files.length;i++){
                formData.append("file"+(i+1), files[i], "file"+(i+1)+".jpg");
            }

            $http.post(
                $rootScope.apiUrl+'appImage/uploadOnlyImage',
                formData,
                {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }
            )
            .success(function(response){
            })
            .error(function(response){
                console.error(response.data);
            });

        });

        // $scope.sidebar_item_today_init();
        $scope.signInit();

        $scope.geocoder = function () {
            // $rootScope.geolocation.latitude = "31.166288";// ⚡⚡ TEST
            // $rootScope.geolocation.longitude = "121.391314";// ⚡⚡ TEST
            // $rootScope.geolocation.latitude = "28.6568294717";// ⚡⚡ TEST
            // $rootScope.geolocation.longitude = "115.8795354903";// ⚡⚡ TEST
            $rootScope.geolocation.latitude = "28.654751977694264";// ⚡⚡ TEST
            $rootScope.geolocation.longitude = "115.86803590762314";// ⚡⚡ TEST

            $rootScope.ajax({
                method: "GET",
                url: $rootScope.baiduMapApiUrl + "geocoder/v2/?location="+$rootScope.geolocation.latitude+","+$rootScope.geolocation.longitude+"&output=json&pois=0&latest_admin=1&ak=" + $rootScope.baidumapAK,
                callback: function (response) {
                    console.info(response.data);
                    // $scope.arrive.location = response.data.result.formatted_address;
                }
            });
        }
    }]);
