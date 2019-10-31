'use strict';


angular.module('myApp.controllersquestionnaire', [])
//问卷
.controller('QuestionnaireCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$sce', function($scope, $rootScope, $http, $timeout, $sce){
    $rootScope.IFLogin();

    if(!$rootScope.task_detail) $rootScope.go('/todayTask');
    $rootScope.select_photos = {};
    $scope.put_normal = {
        photos: {},
        put_type: null,
        remark: ''
    };
    $scope.put_exceptional = {
        photos: {},
        put_type: null,
        remark: ''
    };
    $scope.appeal = {
        photos: {},
        remark: ''
    }

    // 离店
    $scope.leave = {
        readed: false,
        business_card: {},
        joint_photo: {},
        sign: null
    };
    
    $scope.goto_page_task = function(){
        $rootScope.questionnaire_back_task = true;
        $rootScope.go('/todayTask');
    }

    // 获取主问卷
    $scope.getMQ = function ($qst_id) {
        $scope.MQData = [];
        $scope.questionnaire_point = {};
        $scope.questionnaire = {
            report_photos: [],
            questionnaire_photos: {}
        };

        $('.questionnaire-wrapper').addClass('hide slide-right');
        $rootScope.showLoading($('.questionnaire-wrapper .workspace-panel'));
        window.setTimeout(function () {
            $('.questionnaire-wrapper').removeClass('hide');
            window.setTimeout(function () {
                $rootScope.slide_page_go('.questionnaire-wrapper');
            }, 50);
        }, 50);
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appMQ/getMQExamPointDetail',//主问卷检查点
            data: {
                token: $rootScope.userinfo.token,
                taskId: $rootScope.task_detail.TASK_ID,
                examPointId: $qst_id || $scope.examPointId || $rootScope.task_detail.MQ_ID,
            },
            callback: function (response) {
                if (response.data.status == 1) {
                    var button_flag = true;
                    $scope.MQExamPoint = response.data;
                    $scope.MQExamPoint.mq_exampoint_standard = $scope.MQExamPoint.mq_exampoint_standard.replace(/\\r\\n/g, "<br>");
                    $scope.MQExamPoint.mq_exampoint_standard = $sce.trustAsHtml($scope.MQExamPoint.mq_exampoint_standard);

                    if ($scope.MQExamPoint.hasrelsq && $scope.MQExamPoint.hasrelsq == 'yes') {
                        if ($scope.MQExamPoint.hassqallcompleted && $scope.MQExamPoint.hassqallcompleted == 'yes') {
                            for (var i = 0; i < $scope.MQExamPoint.photolist.length; i++) {
                                // var access_path = $scope.MQExamPoint.photolist[i]['access_path'];
                                // var access_name = access_path.split('/')[access_path.split('/').length - 1];
                                var photo_name = $scope.MQExamPoint.photolist[i]['photo_name'];
                                $scope.questionnaire.questionnaire_photos[photo_name] = $scope.MQExamPoint.photolist[i]['access_path'];
                                $scope.questionnaire_point[photo_name] = {
                                    isDefault: false,
                                    checkResult: $scope.MQExamPoint.photolist[i]['qualified'] || '1',
                                    mqexamstandard: $scope.get_mq_examstandard_list($scope.MQExamPoint.photolist[i]['unqualified_id']),
                                    reason: "",
                                    remark: "无",
                                    mqExamStandardId: ""
                                }
                            }
                        } else {
                            alert('子问卷未检查！');
                            button_flag = false;
                        }
                    }
                    $rootScope.removeLoading();
                    $scope.set_mq_photo_cat();
                    if(button_flag) $('#submit_MQData_btn').removeAttr('disabled');
                    else $('#submit_MQData_btn').attr('disabled', 'disabled');
                    // console.info($scope.questionnaire.questionnaire_photos);
                }else{
                    if(response.data.message != "") alert(response.data.message);
                }
            }
        });
    }

    $scope.get_mq_examstandard_list = function($unqualified_id){
        var flag = null;
        for(var i=0; i<$scope.MQExamPoint.mqexamstandardlist.length; i++){
            if($unqualified_id == $scope.MQExamPoint.mqexamstandardlist[i].mq_exam_standard_id){
                flag = $scope.MQExamPoint.mqexamstandardlist[i];
                break;
            }
        }
        return flag;
    }

    $rootScope.upload_photos_questionnaire_page_go = function (title) {
        $rootScope.select_photos_page_title = title;
        $rootScope.select_photos = {};
        if($rootScope.select_photos_page_title == "报备照片") {
            if($scope.questionnaire.report_photos) $rootScope.select_photos = $scope.questionnaire.report_photos;
        }else if($rootScope.select_photos_page_title == "整体照片") {
            if($scope.questionnaire.questionnaire_photos) $rootScope.select_photos = $scope.questionnaire.questionnaire_photos;
        }else if($rootScope.select_photos_page_title == "普通报备照片") {
            if($scope.put_normal.photos) $rootScope.select_photos = $scope.put_normal.photos;
        }else if($rootScope.select_photos_page_title == "异常报备照片") {
            if($scope.put_exceptional.photos) $rootScope.select_photos = $scope.put_exceptional.photos;
        }else if($rootScope.select_photos_page_title == "车辆照片") {
            if($scope.current_sq.imageList) $rootScope.select_photos = $scope.current_sq.imageList;
        }else if($rootScope.select_photos_page_title == "名片") {
            if($scope.leave.business_card) $rootScope.select_photos = $scope.leave.business_card;
        }else if($rootScope.select_photos_page_title == "合影") {
            if($scope.leave.joint_photo) $rootScope.select_photos = $scope.leave.joint_photo;
        }else if($rootScope.select_photos_page_title == "申述照片") {
            if($scope.appeal.photos) $rootScope.select_photos = $scope.appeal.photos;
        }

        if($rootScope.select_photos) {
            if (Object.keys($rootScope.select_photos).length > $rootScope.proj_photo_max_nums - 1) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                if($photo_btn) return 'number_error';
            }
        }
    }

    $rootScope.questionnaire_select_photos_btn = function (new_photo_flag, page_title_flag) {
        if(!new_photo_flag || new_photo_flag != 'new_photo') {
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


        if($rootScope.select_photos_page_title == "报备照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.questionnaire.report_photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.questionnaire.report_photos) for (var i in $rootScope.select_photos) {
                    $scope.questionnaire.report_photos[i] = $rootScope.select_photos[i];
                }
            }
            $rootScope.slide_page_back('.questionnaire-wrapper');
        }else if($rootScope.select_photos_page_title == "整体照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.questionnaire.questionnaire_photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.questionnaire.questionnaire_photos) for (var i in $rootScope.select_photos) {
                    $scope.questionnaire.questionnaire_photos[i] = $rootScope.select_photos[i];
                }

                window.setTimeout(function () {
                    if (!!$scope.questionnaire.questionnaire_photos) for (var i in $scope.questionnaire.questionnaire_photos) {
                        if (!$scope.questionnaire_point.hasOwnProperty(i)) $scope.$apply($scope.questionnaire_point[i] = {
                            checkResult: '1',
                            isDefault: false,
                            mqexamstandard: null,
                            reason: "",
                            remark: "",
                            mqExamStandardId: ""
                        });
                    }
                    $scope.set_mq_photo_cat();
                }, 300);
            }
            $rootScope.slide_page_back('.questionnaire-wrapper');
        }else if($rootScope.select_photos_page_title == "普通报备照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.put_normal.photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.put_normal.photos) for (var i in $rootScope.select_photos) {
                    $scope.put_normal.photos[i] = $rootScope.select_photos[i];
                }
            }
            $rootScope.slide_page_back('.questionnaire-put-normal-wrapper');
        }else if($rootScope.select_photos_page_title == "异常报备照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.put_exceptional.photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.put_exceptional.photos) for (var i in $rootScope.select_photos) {
                    $scope.put_exceptional.photos[i] = $rootScope.select_photos[i];
                }
            }
            $rootScope.slide_page_back('.questionnaire-put-exceptional-wrapper');
        }else if($rootScope.select_photos_page_title == "车辆照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.current_sq.imageList).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if(!$scope.sqCheckDataList[$scope.current_sq_index]) $scope.sqCheckDataList[$scope.current_sq_index] = {};
                if ($scope.current_sq.imageList) for (var i in $rootScope.select_photos) {
                    $scope.current_sq.imageList[i] = $rootScope.select_photos[i];
                    // window.setTimeout(function () {
                        if (!$scope.sqCheckDataList[$scope.current_sq_index][i]) $scope.sqCheckDataList[$scope.current_sq_index][i] = {
                            'checkResult': '1',
                            'mqexamstandard': '',
                            'clause': ''
                        };
                    //     $scope.$apply();
                    // }, 50);
                }
                $rootScope.slide_page_back('.questionnaire-sq-check-wrapper');
            }
        }else if($rootScope.select_photos_page_title == "名片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.leave.business_card).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.leave.business_card) for (var i in $rootScope.select_photos) {
                    $scope.leave.business_card[i] = $rootScope.select_photos[i];
                }
            }
            $rootScope.slide_page_back('.task-leave-wrapper');
        }else if($rootScope.select_photos_page_title == "合影") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.leave.joint_photo).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.leave.joint_photo) for (var i in $rootScope.select_photos) {
                    $scope.leave.joint_photo[i] = $rootScope.select_photos[i];
                }
            }
            $rootScope.slide_page_back('.task-leave-wrapper');
        }else if($rootScope.select_photos_page_title == "申述照片") {
            if(new_photo_flag != 'new_photo' && (Object.keys($scope.appeal.photos).length + Object.keys($rootScope.select_photos).length) > $rootScope.proj_photo_max_nums) {
                alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
                return false;
            }
            else {
                if ($scope.appeal.photos) for (var i in $rootScope.select_photos) {
                    $scope.appeal.photos[i] = $rootScope.select_photos[i];
                }
            }
            $rootScope.slide_page_back('.appeal-wrapper');
        }
        $rootScope.select_photos = {};
        if(page_title_flag) $rootScope.select_photos_page_title = "";
        if(new_photo_flag == 'new_photo') $scope.$apply();
    }

    $scope.remove_photo_btn = function (index, title, check_active) {
        var flag = true;
        if(!check_active) flag = confirm('确认要删除吗？');

        if(flag) {
            if ($rootScope.select_photos_page_title == "报备照片" || title == "报备照片") {
                if ($scope.questionnaire.report_photos) delete ($scope.questionnaire.report_photos[index]);
            } else if ($rootScope.select_photos_page_title == "整体照片" || title == "整体照片") {
                if (Object.keys($scope.questionnaire.questionnaire_photos).length > 0) {
                    if ($scope.questionnaire_point[index] && $scope.questionnaire_point[index].checkResult == '1') {
                        $scope.isDefaultList['true'] = false;
                    } else {
                        $scope.isDefaultList[$scope.questionnaire_point[index].mqexamstandard.standard_no] = false;
                    }
                    delete ($scope.questionnaire.questionnaire_photos[index]);
                    delete ($scope.questionnaire_point[index]);
                    $scope.set_mq_photo_cat();
                }
            } else if ($rootScope.select_photos_page_title == "普通报备照片" || title == "普通报备照片") {
                if ($scope.put_normal.photos) delete ($scope.put_normal.photos[index]);
            } else if ($rootScope.select_photos_page_title == "异常报备照片" || title == "异常报备照片") {
                if ($scope.put_exceptional.photos) delete ($scope.put_exceptional.photos[index]);
            } else if ($rootScope.select_photos_page_title == "车辆照片" || title == "车辆照片") {
                if ($scope.current_sq.imageList) {
                    if($scope.current_sq.imageList[index]) delete ($scope.current_sq.imageList[index]);
                    if($scope.current_sq_index && $scope.sqCheckDataList[$scope.current_sq_index]) delete ($scope.sqCheckDataList[$scope.current_sq_index][index]);
                }
            } else if ($rootScope.select_photos_page_title == "名片" || title == "名片") {
                if ($scope.leave.business_card) delete ($scope.leave.business_card[index]);
            } else if ($rootScope.select_photos_page_title == "合影" || title == "合影") {
                if ($scope.leave.joint_photo) delete ($scope.leave.joint_photo[index]);
            } else if ($rootScope.select_photos_page_title == "申述照片" || title == "申述照片") {
                if ($scope.appeal.photos) delete ($scope.appeal.photos[index]);
            }
            $rootScope.delete_photos_active(index);
        }
    }

    // 设置当前操作图片
    $scope.set_current_point = function (index) {
        $scope.current_point = index;
    }

    $scope.isDefaultList = {
        'true': false
    };
    $scope.mq_photo_cat_list = {
        'true': {}
    };
    // 主问卷照片分类
    $scope.set_mq_photo_cat = function(){
        $scope.mq_photo_cat_list = {
            'true': {}
        };
        var num = {
            'true': 0
        };
        for(var i in $scope.questionnaire_point) {
            if ($scope.questionnaire_point[i].checkResult == '1') {
                $scope.mq_photo_cat_list['true'][i] = num['true'];
                if($scope.questionnaire_point[i].isDefault) $scope.isDefaultList['true'] = true;
                num['true']++;
            }else{
                if ($scope.questionnaire_point[i].mqexamstandard && $scope.questionnaire_point[i].mqexamstandard.standard_no) {
                    if(!num[$scope.questionnaire_point[i].mqexamstandard.standard_no]) {
                        num[$scope.questionnaire_point[i].mqexamstandard.standard_no] = 0;
                        $scope.mq_photo_cat_list[$scope.questionnaire_point[i].mqexamstandard.standard_no] = {};
                    }
                    $scope.mq_photo_cat_list[$scope.questionnaire_point[i].mqexamstandard.standard_no][i] = num[$scope.questionnaire_point[i].mqexamstandard.standard_no];
                    if($scope.questionnaire_point[i].isDefault) $scope.isDefaultList[$scope.questionnaire_point[i].mqexamstandard.standard_no] = true;
                    num[$scope.questionnaire_point[i].mqexamstandard.standard_no]++;
                }
            }
        }
        for(var i in $scope.questionnaire_point) {
            if ($scope.questionnaire_point[i].checkResult == '1') {
                if(!$scope.isDefaultList['true'] && $scope.mq_photo_cat_list['true'][i] == 0){
                    $scope.questionnaire_point[i].isDefault = true;
                    break;
                }
            }else{
                if(!$scope.isDefaultList[$scope.questionnaire_point[i].mqexamstandard.standard_no] && $scope.mq_photo_cat_list[$scope.questionnaire_point[i].mqexamstandard.standard_no][i] == 0){
                    $scope.questionnaire_point[i].isDefault = true;
                    break;
                }
            }
        }
        // console.info($scope.mq_photo_cat_list);
    }

    // 主问卷 照片判断
    $scope.goto_mq_photos_check = function($item, $index) {
        if($rootScope.source_photos[$index]) $scope.curren_mq_photo = $rootScope.source_photos[$index];
        else $scope.curren_mq_photo = $scope.questionnaire.questionnaire_photos[$index];

        $scope.curren_mq_photo_seq = $index;

        for(var i in $scope.questionnaire_point) {
            if ($scope.questionnaire_point[i].checkResult == '1') {
                if(!$scope.isDefaultList['true'] && $scope.mq_photo_cat_list['true'][i] == 0){
                    $scope.curren_mq_photo_isDefault = true;
                    break;
                }
            }else{
                if(!$scope.isDefaultList[$scope.questionnaire_point[i].mqexamstandard.standard_no] && $scope.mq_photo_cat_list[$scope.questionnaire_point[i].mqexamstandard.standard_no][i] == 0){
                    $scope.curren_mq_photo_isDefault = true;
                    break;
                }
            }
        }

        $scope.curren_mq_photo_isDefault = $scope.questionnaire_point[$scope.curren_mq_photo_seq].isDefault || false;
        $scope.curren_mq_photo_checkResult = $scope.questionnaire_point[$scope.curren_mq_photo_seq].checkResult;

        $rootScope.slide_page_go('.task-questionnaire-photos-check-wrapper');

        jQuery('.task-questionnaire-photos-check-wrapper .js-switch').each(function () {
            // if ($(this).attr('data-switchery') == "true") return true;
            var switchery_btn = new Switchery(this, {
                color: '#0059a7',
                secondaryColor: '#8e8e8e'
            });

            this.onchange = function () {
                if ($(this).hasClass('checkResult-switch')) $scope.curren_mq_photo_checkResult = this.checked ? '1' : '0';
                else if ($(this).hasClass('isDefault-switch')) $scope.curren_mq_photo_isDefault = this.checked;
                // $scope.questionnaire_point[$scope.curren_mq_photo_seq].mqexamstandard = null;
                // $scope.questionnaire_point[$scope.curren_mq_photo_seq].remark = "";
                $scope.$apply();
            };

            var switchery = $(this).next('.switchery');
            if (($(this).hasClass('checkResult-switch') && $scope.curren_mq_photo_checkResult == '1') || ($(this).hasClass('isDefault-switch') && $scope.curren_mq_photo_isDefault)) {
                switchery[0].style.cssText = "background-color: rgb(0, 89, 167); border-color: rgb(0, 89, 167); box-shadow: rgb(0, 89, 167) 0px 0px 0px 16px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s, background-color 1.2s ease 0s;";
                switchery.find('small')[0].style.cssText = "left: 20px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s; background-color: rgb(255, 255, 255);";
            } else {
                switchery[0].style.cssText = "background-color: rgb(142, 142, 142); border-color: rgb(142, 142, 142); box-shadow: rgb(142, 142, 142) 0px 0px 0px 0px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s;";
                switchery.find('small')[0].style.cssText = "left: 0px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s;";
            }
        });
    }
    $scope.back_mq_photos_check = function() {
        $scope.curren_mq_photo = null;
        $scope.curren_mq_photo_seq = null;
        $scope.curren_mq_photo_checkResult = '1';

        jQuery('.task-questionnaire-photos-check-wrapper .switchery').remove();
        $rootScope.slide_page_back('.questionnaire-wrapper');
    }
    $scope.done_mq_photos_check = function() {
        if ($scope.curren_mq_photo_checkResult == '0') {
            if (!$scope.questionnaire_point[$scope.curren_mq_photo_seq].mqexamstandard) {
                alert('请选择未达到原因');
                return false;
            }
            if (!$scope.questionnaire_point[$scope.curren_mq_photo_seq].remark) {
                alert('请填写描述');
                return false;
            }
        }

        if($scope.curren_mq_photo_isDefault){
            if ($scope.questionnaire_point[$scope.curren_mq_photo_seq].checkResult == '1') {
                for(var i in $scope.mq_photo_cat_list['true']){
                    $scope.questionnaire_point[i].isDefault = false;
                }
            }else{
                for(var i in $scope.mq_photo_cat_list[$scope.questionnaire_point[$scope.curren_mq_photo_seq].mqexamstandard.standard_no]){
                    $scope.questionnaire_point[i].isDefault = false;
                }
            }
        }
        $scope.questionnaire_point[$scope.curren_mq_photo_seq].checkResult = $scope.curren_mq_photo_checkResult;
        $scope.questionnaire_point[$scope.curren_mq_photo_seq].isDefault = $scope.curren_mq_photo_isDefault;
        $scope.set_mq_photo_cat();
        $scope.back_mq_photos_check();
    }


    // 选择判断条款
    $scope.set_mqexamstandard = function (index) {
        $scope.questionnaire_point[$scope.current_point].mqexamstandard = $scope.MQExamPoint.mqexamstandardlist[index];
        $scope.questionnaire_point[$scope.current_point].reason = $scope.MQExamPoint.mqexamstandardlist[index].standard;
    }

    $scope.has_questionnaire_photos = function($cat){
        var flag = false;
        if($scope.questionnaire && Object.keys($scope.questionnaire.questionnaire_photos).length > 0){
            for(var i in $scope.questionnaire.questionnaire_photos){
                if($scope.questionnaire_point[i] && $scope.questionnaire_point[i].checkResult == '1' && $cat == "true"){
                    flag = true;
                }else if ($scope.questionnaire_point[i] && $scope.questionnaire_point[i].mqexamstandard && $cat == $scope.questionnaire_point[i].mqexamstandard.standard_no) {
                    flag = true;
                }
            }
        }else{
            flag = false;
        }
        return flag;
    }

    // 提交主问卷
    $scope.submitMQData = function () {
        $scope.MQData = [];
        var formData = new FormData();
        var uoload_array = [];

        if (!!$scope.questionnaire.questionnaire_photos) {
            for (var i in $scope.questionnaire.questionnaire_photos) {
                // var questionnaire_photos_img = $rootScope.base64ToBlob($scope.questionnaire.questionnaire_photos[i]);
                // var questionnaire_photos_name = $rootScope.Guuid();
                // formData.append(questionnaire_photos_name, questionnaire_photos_img, i + ".jpg");

                $scope.questionnaire_point[i]['imageList'] = {
                    "imageName": i,
                    "imageType": "3",
                    "isDefault": $scope.questionnaire_point[i].isDefault,
                    "isStandard": "0"
                }
            }
        }
        var imageList = {};
        for(var item in $scope.mq_photo_cat_list) {
            for (var i in $scope.mq_photo_cat_list[item]) {
                if(!imageList[item]) imageList[item] = [];
                // console.info($scope.questionnaire_point[i].isDefault);
                var obj = {
                    "imageName": $scope.questionnaire_point[i].imageList.imageName,
                    "imageType": "3",
                    "remark": $scope.questionnaire_point[i].remark
                };
                if($scope.questionnaire_point[i].isDefault){
                    imageList[item].unshift(obj);
                }else {
                    imageList[item].push(obj);
                }
            }
        }
        for(var item in imageList) {
            if(item == "true"){
                $scope.MQData.push({
                    "checkResult": "1",
                    "mqexamstandard": $scope.MQExamPoint.mq_exampoint_no,
                    "reason": "",
                    "mqExamStandardId": "",
                    "imageList": imageList['true']
                });
            }else {
                for (var i = 0; i < $scope.MQExamPoint.mqexamstandardlist.length; i++) {
                    if($scope.MQExamPoint.mqexamstandardlist[i].standard_no == item) $scope.MQData.push({
                        "checkResult": "0",
                        "mqexamstandard": $scope.MQExamPoint.mqexamstandardlist[i].standard_no,
                        "reason": $scope.MQExamPoint.mqexamstandardlist[i].standard,
                        "mqExamStandardId": $scope.MQExamPoint.mqexamstandardlist[i].mq_exam_standard_id,
                        "imageList": imageList[item]
                    });
                }
            }
        }

        if (Object.keys($scope.questionnaire.questionnaire_photos).length > $rootScope.proj_photo_max_nums) {
            alert('最多提交' + $rootScope.proj_photo_max_nums + '张照片');
            return false;
        }else if (Object.keys($scope.questionnaire.questionnaire_photos).length < $rootScope.proj_photo_min_nums) {
            alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
            return false;
        }

        if (!$scope.questionnaire.questionnaire_photos || Object.keys($scope.questionnaire.questionnaire_photos).length == 0) {
            alert('请提交整体照片');
            return false;
        }

        if (!!$scope.questionnaire.questionnaire_photos) for (var i = 0; i < $scope.MQData.length; i++) {
            $scope.MQData[i].checkResult = $scope.MQData[i].checkResult;
            if ($scope.MQData[i].checkResult == "0") {
                if (!$scope.MQData[i].mqexamstandard) {
                    alert('请选择未达到原因');
                    return false;
                }
                // if(!$scope.MQData[i].reason){
                //     alert('请填写未达到原因');
                //     return;
                // }
                if ($scope.MQData[i].imageList) for (var p = 0; p < $scope.MQData[i].imageList.length; p++) {
                    if ($scope.MQData[i].checkResult == '0' && !$scope.MQData[i].imageList[p].remark) {
                        alert('请填写描述');
                        return;
                    }
                }
            }
            // if ($scope.MQData[i].mqexamstandard) {
            //     $scope.MQData[i].mqExamStandardId = $scope.MQData[i].mqexamstandard.mq_exam_standard_id;
            //     delete $scope.MQData[i].mqexamstandard;
            // }
        }
        var submit_confirm = confirm('提交后将不能修改！');
        if (!submit_confirm) return false;

        jQuery('#submit_MQData_btn').attr('disabled', true);

        // if(!!$scope.questionnaire.report_photos) for(var i in $scope.questionnaire.report_photos) {
        //     var img = $rootScope.base64ToBlob($scope.questionnaire.report_photos[i]);
        //     formData.append($rootScope.Guuid(), img, i+".jpg");
        //
        //     uoload_array.push(
        //         {"imageName": i+".jpg", "imageType": "10", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
        //     );
        // }

        formData.append("agencyId", $rootScope.task_detail.AGENCY_ID);
        formData.append("checkDataList", JSON.stringify($scope.MQData));
        formData.append("mqExamPointId", $scope.MQExamPoint.mq_exampoint_id);
        formData.append("mqId", $rootScope.task_detail.MQ_ID);
        formData.append("taskId", $rootScope.task_detail.TASK_ID);
        formData.append("token", $rootScope.userinfo.token);
        //         token: $rootScope.userinfo.token,
        //         taskId: $rootScope.task_detail.TASK_ID,
        //         imageList: JSON.stringify(uoload_array),

        $http.post(
            $rootScope.apiUrl + 'appMQ/submitMQData', //主问卷 提交、照片上传
            formData,
            {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }
        )
        .success(function (response) {
            jQuery('#submit_MQData_btn').attr('disabled', false);
            $rootScope.update_photos_active($scope.questionnaire.questionnaire_photos);

            //提交后返回下一题的qst_step
            //判断是主表还是子表,若是是空则进入离店提交,tonykoo

            if (response.status == 1) {
                $rootScope.task_detail.FINISHEDCOUNT = response.data.over_num;
                $rootScope.task_detail.progress = parseInt((response.data.over_num / $rootScope.task_detail.TOTALCOUNT) * 100);
                $rootScope.task_detail.currentEp = response.data.step_no;
                $rootScope.task_detail.exempt_num = response.data.exempt_num;
                $rootScope.task_detail.record_num = response.data.record_num;

                if (response.data.step_type == "MQ") {
                    $scope.getMQ(response.data.qst_id);
                } else if (response.data.step_type == "SQ") {
                    $scope.getSQ(response.data.qst_id);
                } else if (response.data.step_type == "LEAVE") {
                    //$scope.getSQ(response.data.qst_id);
                }
            } else if (response.status == 2) {
                $rootScope.task_detail.STATUS = '0';
                $scope.leave_wrapper_init();
            } else if (response.status == 3) {
                $scope.getFirstMQ();

            } else if (response.status == 4) {//异常检查下所有题目都已经检查
                $scope.leave_wrapper_init();

            } else if (response.status == 5) {//异常检查下最后一题
                var leave_confirm = confirm('最后一题，是否进行离店提交？');
                if (leave_confirm) {
                    $scope.leave_wrapper_init();
                } else {
                    $scope.getFirstMQ();
                }
            } else {
                if (response.message) alert(response.message);
            }

            //$scope.getNextQuestion('MQ');
        });
    }

    $scope.current_sq = {
        imageList: {}
    };
    $scope.current_sq_index = null;
    $scope.photoVIN = "";
    $scope.checkVIN = "undefined";
    $scope.newSQ = {};
    $scope.sqData = [];
    $scope.sq = [];

    // 获取下一题
    $scope.getNextQuestion = function (type) {
        if(type == "MQ") {//主问卷
            var data = {
                token: $rootScope.userinfo.token,
                qstId: $scope.MQExamPoint.mq_exampoint_id || $scope.MQExamPoint.mqexamstandardlist[0].mq_exampoint_id,
                projectId: $rootScope.currenProject.proj_id,
                taskId: $rootScope.task_detail.TASK_ID,
                mqId: $rootScope.task_detail.MQ_ID,
            };
        }else{//子问卷
            var data = {
                token: $rootScope.userinfo.token,
                qstId: $scope.sqId,
                projectId: $rootScope.currenProject.proj_id,
                taskId: $rootScope.task_detail.TASK_ID,
                mqId: $rootScope.task_detail.MQ_ID,
            };
        }
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appQstStep/getNextQuestionMessage',//问卷下一题
            data: data,
            callback: function (response) {
                if(response.data.status == 1) {//有下一题
                    $rootScope.task_detail.FINISHEDCOUNT = response.data.over_num;
                    $rootScope.task_detail.progress = parseInt((response.data.over_num / $rootScope.task_detail.TOTALCOUNT)*100);
                    $rootScope.task_detail.currentEp = response.data.step_no;
                    $rootScope.task_detail.exempt_num = response.data.exempt_num;
                    $rootScope.task_detail.record_num = response.data.record_num;
                    
                    if (response.data.step_type == "SQ") {
                        $scope.sqId = response.data.qst_id;
                        $scope.getSQ(response.data.qst_id);// 子问卷试驾车列表
                    } else if (response.data.step_type == "MQ") {
                        $scope.examPointId = response.data.qst_id;
                        $scope.getMQ(response.data.qst_id);
                    }
                }else if(response.data.status == 2) {//
                	$rootScope.task_detail.STATUS='0';	
                	$scope.leave_wrapper_init();
                }else if(response.data.status == 3) {//
                	$scope.getFirstMQ();
                	
                }else if(response.data.status == 4) {//异常检查下所有题目都已经检查
                	$scope.leave_wrapper_init();

                }else if(response.data.status == 5) {//异常检查下最后一题
                	var leave_confirm = confirm('最后一题，是否进行离店提交？');
                    if(leave_confirm){
                    	$scope.leave_wrapper_init();
                    } else{
                    	$scope.getFirstMQ();
                    }
                }else{
                	if(response.data.message != "") alert(response.data.message);
                }
            }
        });
    }

    // 获取子问卷列表
    $scope.getSQ = function ($qst_id) {
    	//$scope.sq=[];
        $scope.sqCheckDataList = [];
        $rootScope.photo_vin = false;
        $scope.sqId = $qst_id;

        $('.questionnaire-sq-wrapper').addClass('hide slide-right');
        window.setTimeout(function () {
            $('.questionnaire-sq-wrapper').removeClass('hide');
            window.setTimeout(function () {
                $rootScope.slide_page_go('.questionnaire-sq-wrapper');
            }, 50);
        },50);
        $scope.sqstrulist = [];

        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appSQ/getSQDataList',//子问卷获取
            data: {
                token: $rootScope.userinfo.token,
                taskId: $rootScope.task_detail.TASK_ID,
                sqId: $qst_id,
                agencyId: $rootScope.task_detail.AGENCY_ID
            },
            callback: function (response) {
                // response.data = { "sqname": "测试子问卷1", "sqstrulist": [ { "field_type": "base", "field1": "字段1", "field_checktype": "", "is_title": "1", "orderby": "1" }, { "field_type": "base", "field_checktype": "", "is_title": "0", "field2": "字段2", "orderby": "2" }, { "field_type": "check", "field_checktype": "text", "is_title": "0", "field3": "字段3", "orderby": "3" }, { "field_type": "check", "field_checktype": "radio", "is_title": "0", "orderby": "4", "field4": "字段4" }, { "field_type": "check", "field_checktype": "scan", "is_title": "0", "orderby": "5", "field5": "字段5" } ], "mqexampointlist": [], "status": 1, "message": "" };// ⚡⚡ TEST
                $scope.sq = response.data;
                if(!$scope.sq.sqdatalist) $scope.sq.sqdatalist = [];
                $scope.sqData = $scope.sq.sqdatalist;

                // 列表数据初始化
                if($scope.sqData) for(var i=0;i<$scope.sqData.length;i++){
                    // $scope.sqData.isChecked = false;
                    for(var i in $scope.sqstrulist){
                        if($scope.sqstrulist[i].is_title) $scope.sqData.title = $scope.sqstrulist[i].title;
                    }
                }
                if($scope.sq.sqstrulist) for(var i=0;i<$scope.sq.sqstrulist.length;i++){
                    $scope.sqstrulist.push({
                        'title': $scope.sq.sqstrulist[i]['field' + (i+1)],
                        'type': $scope.sq.sqstrulist[i]['field_type'],
                        'id': 'field' + (i+1),
                        'checktype': $scope.sq.sqstrulist[i]['field_checktype'],
                        'check': true,
                        'field_type': $scope.sq.sqstrulist[i]['field_type'],
                        'is_title': $scope.sq.sqstrulist[i]['is_title'],
                        'orderby': $scope.sq.sqstrulist[i]['orderby'],
                        'is_must': $scope.sq.sqstrulist[i]['is_must'],
                    });
                    if($scope.sq.sqstrulist[i]['is_title'] == "1") $scope.sq_data_title_id = 'field' + (i+1);
                    if($scope.sq.sqstrulist[i]['is_title'] == "1") $scope.sq_data_title_num = i;
                }
                // $scope.sq_code_id = "";
                // $scope.sqstrumap = [];
                // for(var i in $scope.sqstrulist){
                //     $scope.sqstrumap[$scope.sqstrulist[i].id] = $scope.sqstrulist[i].title;
                //     if($scope.sqstrulist[i].is_title) $scope.sq_code_id = $scope.sqstrulist[i].title;
                // }
                // console.info($scope.sqData);
            }
        });

    }

    // 子表 检查页
    $scope.sqCheck = function ($index) {

        $scope.checkVIN = "undefined";
        $scope.current_sq = $scope.sqData[$index];
        if(!$scope.current_sq['imageList']) $scope.current_sq['imageList'] = {};

        $scope.current_sq_index = $index;
        $rootScope.photo_vin = false;
        $rootScope.slide_page_go('.questionnaire-sq-check-wrapper');

        // for(var i=0;i<$scope.sqstrulist.length;i++) {
        //     if ($scope.sqstrulist[i].field_type == "check" && ($scope.sqstrulist[i].checktype == 'radio' || $scope.sqstrulist[i].checktype == 'scan')) {
        //         if(!$scope.current_sq[$scope.sqstrulist[i].id]) $scope.current_sq[$scope.sqstrulist[i].id] = 'true';
        //     }
        // }

        for(var i=0;i<$scope.sqstrulist.length;i++) {
            if ($scope.sqstrulist[i].field_type == "check" && $scope.sqstrulist[i].checktype == 'radio') {
                if(!$scope.current_sq[$scope.sqstrulist[i].id]) $scope.current_sq[$scope.sqstrulist[i].id] = 'true';
            }else if ($scope.sqstrulist[i].field_type == "check" && $scope.sqstrulist[i].checktype == 'scan') {
                if(!$scope.current_sq[$scope.sqstrulist[i].id]) $scope.current_sq[$scope.sqstrulist[i].id] = 'false';
            }
        }

        $timeout(function(){
            jQuery('.questionnaire-sq-check-wrapper .js-switch').each(function () {
                // $scope.$apply($scope.current_sq[$(this).attr('data-num')] = $scope.current_sq[$(this).attr('data-num')]=='1' ? true : false);

                if($(this).attr('data-switchery') == "true") return true;
                var switchery_btn = new Switchery(this, {
                    color: '#0059a7',
                    secondaryColor: '#8e8e8e'
                });
                this.onchange = function () {
                    $scope.$apply($scope.current_sq[$(this).attr('data-num')] = this.checked ? 'true' : 'false');
                    if($(this).attr('data-type') == "scan-vin" && !this.checked){
                        $scope.$apply($scope.checkVIN = "false");
                    }else{
                        $scope.$apply($scope.checkVIN = "true");
                    }
                };
            });
        }, 300);
        // console.info($scope.current_sq);
    }

    // 更新检查数据，检查子问卷数据
    $scope.current_sq_checked = function () {
        var sqData = {};
        for(var i=0;i<$scope.sqstrulist.length;i++){
            if($scope.sqstrulist[i].field_type == "check") {

            	if($scope.sqstrulist[i].checktype == "text" && $scope.sqstrulist[i].is_must == "1" && !$scope.current_sq[$scope.sqstrulist[i].id]) {
                    alert("有未完成的检查项："+$scope.sqstrulist[i].title);
                    return false;
            	}
                if($scope.sqstrulist[i].checktype == "text" || $scope.sqstrulist[i].checktype == "radio" || $scope.sqstrulist[i].checktype == "scan"){
                    sqData[$scope.sqstrulist[i].id] = $scope.current_sq[$scope.sqstrulist[i].id] || false;
                }
            }
        }

        // sqData
        $scope.sq.sqdatalist[$scope.current_sq_index]['sqData'] = sqData;

        // checkDataList
        $scope.sq.sqdatalist[$scope.current_sq_index]['checkDataList'] = [];
        if($scope.sqCheckDataList.length > 0 && !!$scope.sqCheckDataList[$scope.current_sq_index]) {
            for (var i in $scope.sqCheckDataList[$scope.current_sq_index]) {
                if(!$scope.sqCheckDataList[$scope.current_sq_index][i].mqexamstandard){
                    alert("请选择检查点");
                    return false;
                }
                if($scope.sqCheckDataList[$scope.current_sq_index][i].checkResult == "0" && !$scope.sqCheckDataList[$scope.current_sq_index][i].clause){
                    alert("请选择未达到原因");
                    return false;
                }
                $scope.sq.sqdatalist[$scope.current_sq_index]['checkDataList'][i] = {
                    'checkResult': $scope.sqCheckDataList[$scope.current_sq_index][i].checkResult,
                    'mqExamPointId': $scope.sqCheckDataList[$scope.current_sq_index][i].mqexamstandard ? $scope.sqCheckDataList[$scope.current_sq_index][i].mqexamstandard.mq_exampoint_id : null,
                    'clause': $scope.sqCheckDataList[$scope.current_sq_index][i].clause ? $scope.sqCheckDataList[$scope.current_sq_index][i].clause.mq_exam_standard_id : null
                }
            }
        }else{
            alert("请提交照片！");
            return false;
        }

        // photos
        if(!!$scope.current_sq.imageList) {
            $scope.sq.sqdatalist[$scope.current_sq_index]['photos'] = $scope.current_sq.imageList;
        }else{
            alert("请提交照片！");
            return false;
        }

        $scope.current_sq.isChecked = true;
        $rootScope.slide_page_back('.questionnaire-sq-wrapper');
    }

    // 子问卷 照片判断
    $scope.goto_sq_photos_check = function($item, $index) {
        $scope.curren_sq_photo = $rootScope.source_photos[$index];
        $scope.curren_sq_photo_seq = $index;

        if(!$scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq]) $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq] = {
            'checkResult': '1',
            'mqexamstandard': '',
            'clause': ''
        };

        $scope.curren_sq_photo_checkResult = $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq].checkResult;
        $scope.curren_sq_photo_isDefault = $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq].isDefault;
        $scope.curren_sq_photo_mqexamstandard = $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq].mqexamstandard;
        $scope.curren_sq_photo_clause = $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq].clause;

        $rootScope.slide_page_go('.task-sq-photos-check-wrapper');

        $timeout(function () {
            jQuery('.task-sq-photos-check-wrapper .js-switch').each(function () {
                if ($(this).attr('data-switchery') == "true") return true;
                var switchery_btn = new Switchery(this, {
                    color: '#8e8e8e',
                    secondaryColor: '#0059a7'
                });
                this.onchange = function () {
                    $scope.curren_sq_photo_checkResult = this.checked ? '1' : '0';
                    $scope.curren_sq_photo_mqexamstandard = '';
                    $scope.curren_sq_photo_clause = '';
                    $scope.$apply();
                };
                if ($scope.curren_sq_photo_checkResult == '1') {
                    // $(this).attr('checked', true);
                    $(this).next('.switchery')[0].style.cssText = "background-color: rgb(142, 142, 142); border-color: rgb(142, 142, 142); box-shadow: rgb(142, 142, 142) 0px 0px 0px 16px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s, background-color 1.2s ease 0s;";
                    $(this).next('.switchery').find('small')[0].style.cssText = "left: 20px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s; background-color: rgb(255, 255, 255);";
                }else{
                    $(this).next('.switchery')[0].style.cssText = "background-color: rgb(0, 89, 167); border-color: rgb(0, 89, 167); box-shadow: rgb(0, 89, 167) 0px 0px 0px 0px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s;";
                    $(this).next('.switchery').find('small')[0].style.cssText = "left: 0px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s;";
                }
            });
        }, 300);
    }
    $scope.back_sq_photos_check = function() {
        $scope.curren_sq_photo = null;
        $scope.curren_sq_photo_seq = null;
        $scope.curren_sq_photo_checkResult = '1';

        jQuery('.task-sq-photos-check-wrapper .switchery').remove();
        jQuery('.task-sq-photos-check-wrapper .js-switch').removeAttr('data-switchery').removeAttr('checked');
        $rootScope.slide_page_back('.questionnaire-sq-check-wrapper');
    }

    $scope.has_sq_photos = function($cat, $mq_exampoint_id){
        var flag = false;
        if($scope.sqCheckDataList[$scope.current_sq_index] && Object.keys($scope.sqCheckDataList[$scope.current_sq_index]).length > 0){
            for(var i in $scope.sqCheckDataList[$scope.current_sq_index]){
                if($cat == "true" && $scope.sqCheckDataList[$scope.current_sq_index][i] && $scope.sqCheckDataList[$scope.current_sq_index][i].checkResult == '1' && $mq_exampoint_id == $scope.sqCheckDataList[$scope.current_sq_index][i].mqexamstandard.mq_exampoint_id){
                    flag = true;
                }else if ($scope.sqCheckDataList[$scope.current_sq_index][i] && $scope.sqCheckDataList[$scope.current_sq_index][i].clause && $cat == $scope.sqCheckDataList[$scope.current_sq_index][i].clause.mq_exam_standard_id) {
                    flag = true;
                }
            }
        }else{
            flag = false;
        }
        return flag;
    }

    $scope.done_sq_photos_check = function() {
        if (!$scope.curren_sq_photo_mqexamstandard) {
            alert('请选择检查点');
            return false;
        }
        if ($scope.curren_sq_photo_checkResult == '0') {
            if (!$scope.curren_sq_photo_clause) {
                alert('请选择未达到原因');
                return false;
            }
        }

        // if($scope.curren_sq_photo_isDefault){
        //     if ($scope.questionnaire_point[$scope.curren_mq_photo_seq].checkResult) {
        //         for(var i in $scope.mq_photo_cat_list['true']){
        //             $scope.questionnaire_point[i].isDefault = false;
        //         }
        //     }else{
        //         for(var i in $scope.mq_photo_cat_list[$scope.questionnaire_point[$scope.curren_mq_photo_seq].mqexamstandard.standard_no]){
        //             $scope.questionnaire_point[i].isDefault = false;
        //         }
        //     }
        // }
        $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq] = {
            'checkResult': $scope.curren_sq_photo_checkResult,
            'mqexamstandard': $scope.curren_sq_photo_mqexamstandard,
            'clause': $scope.curren_sq_photo_clause
        };
        // $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq].checkResult = ;
        // $scope.sqCheckDataList[$scope.current_sq_index][$scope.curren_sq_photo_seq].isDefault = $scope.curren_sq_photo_isDefault;
        // $scope.set_mq_photo_cat();
        $scope.back_sq_photos_check();
    }


    // 子表 选择主问卷题目
    $scope.set_sq_mqexampointlist = function (item) {
        $scope.curren_sq_photo_mqexamstandard = item;
        $scope.curren_sq_photo_clause = '';
    }

    // 子表 选择判断条款
    $scope.set_sq_mqexamstandard = function (item) {
        $scope.curren_sq_photo_clause = item;
    }

    // 子表 新增
    $scope.addSQ = function () {
        if(Object.keys($scope.newSQ).length < $('.addSQ-form .value').length){
            alert('请填写所有字段');
            return;
        }

        for(var i=0;i<$scope.sqstrulist.length;i++) {
            if ($scope.sqstrulist[i].field_type == "check" && ($scope.sqstrulist[i].checktype == 'radio' || $scope.sqstrulist[i].checktype == 'scan')) {
                $scope.newSQ[$scope.sqstrulist[i].id] = 'true';
            }
        }
        $scope.newSQ.new = true;
        $scope.sqData.push($scope.newSQ);
        $scope.newSQ = {};
        $rootScope.slide_page_back('.questionnaire-sq-wrapper');
    }

    $scope.new_SQ_data = function (item) {
        $scope.new_sq_data_filed = $scope.newSQ[item.id];
        $scope.new_sq_data_id = item.id;
        $scope.new_sq_data_title = item.title;
        $rootScope.slide_page_go('.task-new_SQ_data-wrapper');
    }

    $scope.add_new_SQ_data = function () {
        $scope.newSQ[$scope.new_sq_data_id] = $scope.new_sq_data_filed;
        $rootScope.slide_page_back('.questionnaire-addSQ-wrapper');
    }

    $scope.goto_check_data_filed = function ($i) {
        $scope.current_check_data_filed = $i;
        $scope.add_check_filed_data_title = $i.title;
        // $scope.newSQ[$scope.new_sq_data_id] = $scope.check_data_filed;
        $rootScope.slide_page_go('.task-add_check_filed_data-wrapper');
    }
    $scope.add_check_data_filed = function ($i) {
        $scope.current_sq[$scope.current_check_data_filed.id] = $scope.check_data_filed;
        $scope.check_data_filed = "";

        $rootScope.slide_page_back('.questionnaire-sq-check-wrapper')
    }

    $scope.delNewSQ = function ($index) {
        $scope.sqData.remove($index);
    }

    // 子表 提交
    $scope.submitSQData = function () {
        // var formData = new FormData();
        var sqItemList = [];
        
        for(var i=0; i<$scope.sqData.length; i++){
            if(!$scope.sqData[i].isChecked) {
                alert('有未检查的数据！');
                return false;
            }
        }

        var submit_confirm = confirm('提交后将不能修改！');
        if(!submit_confirm) return false;

        jQuery('#submit_SQData_btn').attr('disabled', true);

        for(var i=0; i<$scope.sq.sqdatalist.length; i++){
            if($scope.sq.sqdatalist[i].isChecked){
                var uoload_array = [];
                if($scope.sq.sqdatalist[i].photos && Object.keys($scope.sq.sqdatalist[i].photos).length > 0) for(var p in $scope.sq.sqdatalist[i].photos){
                    // var sqdata_img = $rootScope.base64ToBlob($scope.sq.sqdatalist[i].photos[p]);
                    // var sqdata_name = $rootScope.Guuid();
                    // formData.append(sqdata_name, sqdata_img, i+".jpg");

                    uoload_array.push({
                        "imageName": p,
                        "imageType": "11",
                        "isDefault": i==0 ? "0" : "1",
                        "isStandard": "0",
                        "checkResult": $scope.sq.sqdatalist[i]['checkDataList'][p]['checkResult'],
                        "clause": $scope.sq.sqdatalist[i]['checkDataList'][p]['clause'],
                        "mqExamPointId": $scope.sq.sqdatalist[i]['checkDataList'][p]['mqExamPointId']
                    });
                }

                // 子表数据集合
                sqItemList[i] = {
                    'sqData': $scope.sq.sqdatalist[i]['sqData'],
                    // 'checkDataList': $scope.sq.sqdatalist[i]['checkDataList'],
                    'imageList': uoload_array,
                    'flag': $scope.sq.sqdatalist[i]['sq_data_id']==null?'app':'back',
                    'orderby': (parseInt(i)+1),
                    'sqDataId':$scope.sq.sqdatalist[i]['sq_data_id']
                }
                for(var j=0; j<$scope.sqstrulist.length; j++){
                    if($scope.sqstrulist[j].field_type == "base") sqItemList[i][$scope.sqstrulist[j].id] = $scope.sqData[i][$scope.sqstrulist[j].id];   //基本数据
                }
            }

        }
        // formData.append("token", $rootScope.userinfo.token);
        // formData.append("taskid", $rootScope.task_detail.TASK_ID);

        // $http.post(
        //     $rootScope.apiUrl+'appImage/uploadOnlyImage', //照片上传
        //     formData,
        //     {
        //         transformRequest: angular.identity,
        //         headers: {'Content-Type': undefined}
        //     }
        // )
        // .success(function(response){
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appSQ/submitSQData',//子问卷提交
                data: {
                    token: $rootScope.userinfo.token,
                    taskId: $rootScope.task_detail.TASK_ID,
                    mqId:$rootScope.task_detail.MQ_ID,
                    agencyId: $rootScope.task_detail.AGENCY_ID,
                    sqId: $scope.sqId,
                    tripId: $rootScope.currenProject.TRIP_ID,
                    sqItemList: JSON.stringify(sqItemList)
                },
                callback: function (response) {
                    jQuery('#submit_SQData_btn').attr('disabled', false);

                    if($scope.sq.sqdatalist) for(var i=0; i<$scope.sq.sqdatalist.length; i++) {
                        $rootScope.update_photos_active($scope.sq.sqdatalist[i].photos);
                    }

                	if(response.data.status == "0") {
	                    if(response.data.message != "") alert(response.data.message);
	                }else if(response.data.status == "1") {
                    	 $rootScope.task_detail.FINISHEDCOUNT = response.data.over_num;
                         $rootScope.task_detail.progress = parseInt((response.data.over_num / $rootScope.task_detail.TOTALCOUNT)*100);
                         $rootScope.task_detail.currentEp = response.data.step_no;
                         $rootScope.task_detail.exempt_num = response.data.exempt_num;
                         $rootScope.task_detail.record_num = response.data.record_num;
                        
                         if(response.data.step_type == "MQ") {
                             $scope.getMQ(response.data.qst_id);
                         }else if(response.data.step_type == "SQ") {
                             $scope.getSQ(response.data.qst_id);
                         }
                    }else if(response.data.status == "2") {
                    	$rootScope.task_detail.STATUS='0';	
                    	$scope.leave_wrapper_init();
	                }else if(response.data.status == "3") {
	                	$scope.getFirstMQ();
	                }else if(response.data.status == 4) {//异常检查下所有题目都已经检查
	                	$scope.leave_wrapper_init();

	                }else if(response.data.status == 5) {//异常检查下最后一题
	                	var leave_confirm = confirm('最后一题，是否进行离店提交？');
	                    if(leave_confirm){
	                    	$scope.leave_wrapper_init();
	                    } else{
	                    	$scope.getFirstMQ();
	                    }
	                }else{
	                	if(response.data.message != "") alert(response.data.message);
	                }
                }
            });
            // $.ajax({
            //     method: 'POST',
            //     traditional: true,
            //     url: $rootScope.apiUrl + '
            //     data: {
            //     },
            // }).then(function successCallback(response) {
            // });
            // $rootScope.ajax({
            //     url: $rootScope.apiUrl + 'appSQ/submitSQData',//子问卷提交
            //     data: {
            //         token: $rootScope.userinfo.token,
            //         taskId: $rootScope.task_detail.TASK_ID,
            //         agencyId: $rootScope.task_detail.AGENCY_ID,
            //         sqId: $scope.sqId,
            //         sqItemList: sqItemList
            //     },
            //     callback: function (response) {
            //         $scope.MQExamPoint = response.data;
            //     }
            // });
        // });

    }

    $scope.btn_photo_vin = function ($id) {
        $rootScope.current_photo_vin_filed_id = $id;
        $rootScope.photo_vin = true;
    }

    $rootScope.baidu_ocr_vin = function (photo) {
        $scope.checkVIN = "upload";
        for(var i=0; i<$scope.sqstrulist.length; i++){
            if($scope.sqstrulist[i].title == "VIN"){
                $scope.current_sq_check_VIN_id = $scope.sqstrulist[i]['id'];
            }
        }

        var formData = new FormData();
        var img = $rootScope.base64ToBlob(photo);
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
            console.info(response);

            $rootScope.photo_vin = false;

            if (response.vin && /^[A-Za-z0-9]{17}$/.test(response.vin)) { //17位VIN码校验
                $scope.current_sq_VIN_value = $scope.photoVIN;
                $scope.photoVIN = response.vin.toLocaleUpperCase();

                if ($scope.photoVIN.indexOf($scope.current_sq[$scope.current_sq_check_VIN_id]) >= 0) {
                    $scope.current_sq[$rootScope.current_photo_vin_filed_id] = 'true';
                    $scope.checkVIN = "true";
                    $scope.current_sq_VIN_value = $scope.current_sq[$scope.current_sq_check_VIN_id];
                    var switchery = jQuery('.js-switch[data-num="' + $rootScope.current_photo_vin_filed_id + '"]').next('.switchery');
                    switchery[0].style.cssText = "background-color: rgb(0, 89, 167); border-color: rgb(0, 89, 167); box-shadow: rgb(0, 89, 167) 0px 0px 0px 16px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s, background-color 1.2s ease 0s;";
                    switchery.find('small')[0].style.cssText = "left: 20px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s; background-color: rgb(255, 255, 255);";
                    return false;
                }else{
                    alert('VIN码不一致，请重试');

                    $scope.checkVIN = "false";
                    $scope.current_sq[$rootScope.current_photo_vin_filed_id] = 'false';
                    var switchery = jQuery('.js-switch[data-num="' + $rootScope.current_photo_vin_filed_id + '"]').next('.switchery');
                    switchery[0].style.cssText = "background-color: rgb(142, 142, 142); border-color: rgb(142, 142, 142); box-shadow: rgb(142, 142, 142) 0px 0px 0px 0px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s;";
                    switchery.find('small')[0].style.cssText = "left: 0px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s;";
                }
            }else {
                alert('未能识别VIN码，请重试');

                $scope.checkVIN = "false";
                $scope.current_sq[$rootScope.current_photo_vin_filed_id] = 'false';
                var switchery = jQuery('.js-switch[data-num="' + $rootScope.current_photo_vin_filed_id + '"]').next('.switchery');
                switchery[0].style.cssText = "background-color: rgb(142, 142, 142); border-color: rgb(142, 142, 142); box-shadow: rgb(142, 142, 142) 0px 0px 0px 0px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s;";
                switchery.find('small')[0].style.cssText = "left: 0px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s;";
            }
        })
        .error(function (response) {
            console.error(response.data);
        });
    }
    // 异常报备
    $scope.abnormalType = null;

    $scope.goto_put_exceptional = function () {
        $scope.put_exceptional.photos = {};

        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appDictionary/getAbnormalReportList',// 获取异常报备类型
            data: {
                token: $rootScope.userinfo.token,
                projectId: $rootScope.currenProject.proj_id,
            },
            callback: function (response) {
                $scope.AbnormalReportList = response.data.dictionarylist;
            }
        });
        $rootScope.slide_page_go('.questionnaire-put-exceptional-wrapper');
    }

    $scope.setAbnormalReport = function (item) {
        $scope.abnormalType = item;
        $rootScope.slide_page_back('.questionnaire-put-exceptional-wrapper');
    }

    $scope.submitAbnormalReport = function ($event) {
        if($scope.abnormalType == null) {
            alert("请选择异常报备类型");
            return false;
        }
//        if(!$scope.put_exceptional.remark || $scope.put_exceptional.remark.length == 0) {
//            alert("请填写异常描述");
//            return false;
//        }
        if(!$scope.put_exceptional.photos || Object.keys($scope.put_exceptional.photos).length == 0) {
            alert("请拍摄或选择异常报备照片");
            return false;
        }//else if (Object.keys($scope.put_exceptional.photos).length < $rootScope.proj_photo_min_nums) {
        //     alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
        //     return false;
        // }

        // var formData = new FormData();
        var uoload_array = [];

        if(!!$scope.put_exceptional.photos) for(var i in $scope.put_exceptional.photos) {
            // var put_exceptional_img = $rootScope.base64ToBlob($scope.put_exceptional.photos[i]);
            // var put_exceptional_name = $rootScope.Guuid();
            // formData.append(put_exceptional_name, put_exceptional_img, i+".jpg");

            uoload_array.push(
                {"imageName": i, "imageType": "5", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
            );
        }
        // formData.append("token", $rootScope.userinfo.token);
        // formData.append("taskid", $rootScope.task_detail.TASK_ID);

        // $http.post(
        //     $rootScope.apiUrl+'appImage/uploadOnlyImage', //照片上传
        //     formData,
        //     {
        //         transformRequest: angular.identity,
        //         headers: {'Content-Type': undefined}
        //     }
        // )
        // .success(function(response){
            $rootScope.getServerTime(function (time) {

                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appAbnormalReport/submitAbnormalRecord',//异常报备提交
                    data: {
                        token: $rootScope.userinfo.token,
                        projectId: $rootScope.currenProject.proj_id,
                        taskId: $rootScope.task_detail.TASK_ID,
                        agencyId: $rootScope.task_detail.AGENCY_ID,
                        abnormalTypeId: $scope.abnormalType.id,
                        abnormalTypeComment: $scope.put_exceptional.remark,
                        reportTime: time,
                        imageList: JSON.stringify(uoload_array),
                    },
                    callback: function (response) {
                        if(response.data.status == "1") {
                            $rootScope.update_photos_active($scope.put_exceptional.photos);
                            alert('异常报备提交成功');
                            // $rootScope.slide_page_back('.questionnaire-more-wrapper');
                            $rootScope.go('/todayTask');
                        }else{
                            if(response.data.message != "") alert(response.data.message);
                        }
                    }
                });
            });
        // });

    }

    // 普通报备
    $scope.normalType = null;
    $scope.goto_put_normal = function () {
        $scope.put_normal.photos = {};

        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appDictionary/getNormalReportList',// 获取普通报备类型
            data: {
                token: $rootScope.userinfo.token,
                projectId: $rootScope.currenProject.proj_id,
            },
            callback: function (response) {
                $scope.NormalReportList = response.data.dictionarylist;
            }
        });
        $rootScope.slide_page_go('.questionnaire-put-normal-wrapper');
    }

    $scope.setNormalReport = function (item, $e) {
        $scope.normalType = item;
        $rootScope.slide_page_back('.questionnaire-put-normal-wrapper');
    }

    $scope.submitNormalReport = function ($event) {
        if($scope.normalType == null) {
            alert("请选择普通报备类型");
            return false;
        }
        if(!$scope.put_normal.photos || Object.keys($scope.put_normal.photos).length == 0) {
            alert("请拍摄或选择普通报备照片");
            return false;
        }//else if (Object.keys($scope.put_normal.photos).length < $rootScope.proj_photo_min_nums) {
        //     alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
        //     return false;
        // }

        // var formData = new FormData();
        var uoload_array = [];

        if(!!$scope.put_normal.photos) for(var i in $scope.put_normal.photos) {
            // var put_normal_img = $rootScope.base64ToBlob($scope.put_normal.photos[i]);
            // var put_normal_name = $rootScope.Guuid();
            // formData.append(put_normal_name, put_normal_img, i+".jpg");

            uoload_array.push(
                {"imageName": i, "imageType": "4", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
            );
        }
        // formData.append("token", $rootScope.userinfo.token);
        // formData.append("taskid", $rootScope.task_detail.TASK_ID);

        // $http.post(
        //     $rootScope.apiUrl+'appImage/uploadOnlyImage', //照片上传
        //     formData,
        //     {
        //         transformRequest: angular.identity,
        //         headers: {'Content-Type': undefined}
        //     }
        // )
        // .success(function(response){
            $rootScope.getServerTime(function (time) {

                $rootScope.ajax({
                    url: $rootScope.apiUrl + 'appNormalReport/submitNormalRecord',//普通报备提交
                    data: {
                        token: $rootScope.userinfo.token,
                        projectId: $rootScope.currenProject.proj_id,
                        taskId: $rootScope.task_detail.TASK_ID,
                        agencyId: $rootScope.task_detail.AGENCY_ID,
                        normalTypeId: $scope.normalType.id,
                        normalTypeComment: $scope.put_normal.remark,
                        reportTime: time,
                        imageList: JSON.stringify(uoload_array),
                    },
                    callback: function (response) {
                        if(response.data.status == "1") {
                            $rootScope.update_photos_active($scope.put_normal.photos);
                            alert('普通报备提交成功');
                            $rootScope.slide_page_back('.questionnaire-more-wrapper');
                        }else{
                            if(response.data.message != "") alert(response.data.message);
                        }
                    }
                });
            });
        // });
    }

    $scope.leave_wrapper_init = function () {
        // 异常店 未完成问卷 未跳过
        if ($rootScope.leave_wrapper_flag || $rootScope.task_detail.STATUS == "0") {
            $('#submit_leave_btn').removeClass('hide');

            if($('.leave_readed_switch').attr('data-switchery') != "true") {
                var switchery_btn = new Switchery($('.leave_readed_switch')[0], {
                    secondaryColor: '#8e8e8e',
                    color: '#0059a7'
                });
            }

            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appLeave/getLeaveData',//获取离店数据
                data: {
                    token: $rootScope.userinfo.token,
                    agencyId: $rootScope.task_detail.AGENCY_ID,
                    taskId: $rootScope.task_detail.TASK_ID,
                },
                callback: function (response) {
                    if(response.data.status == 1) {
                        if(response.data.statement) {
                            var statement = response.data.statement;
                            $scope.statement = statement.replace(/\\r\\n/g, "<br>");
                            $scope.statement = $sce.trustAsHtml($scope.statement);
                        }else{
                            $scope.statement = $sce.trustAsHtml("无");
                        }
                        $scope.unqualifiedList = response.data.unqualifiedList;
                        $scope.leaveData = response.data;

                        $rootScope.slide_page_go('.task-leave-wrapper');
                    }else{
                        if(response.data.message != "") alert(response.data.message);
                    }
                }
            });
        }
//        else if ($rootScope.task_detail.STATUS != "0") {
//            $('#submit_leave_btn').addClass('hide');
//            alert('问卷未完成，请完成问卷');
//            return false
//        }
        else if ($rootScope.task_detail.STATUS == "0") {
        }
        $rootScope.leave_wrapper_flag = false;
    }

    // 声明文件
    $scope.readed_checkbox = false;

    $scope.leave_readed_switch = function () {
        if(!$('.leave_readed_switch')[0].checked){
            $rootScope.slide_page_go('.task-readed-file-wrapper');
        }else{
            $scope.leave.readed = false;
            $('.leave_readed_switch')[0].checked = false;
            $('.leave_readed_switch_panel .switchery')[0].style.cssText = "box-shadow: rgb(142, 142, 142) 0px 0px 0px 0px inset; border-color: rgb(142, 142, 142); background-color: rgb(142, 142, 142); transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s;";
            $('.leave_readed_switch_panel .switchery small')[0].style.cssText = "left: 0px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s;";
        }
    }

    $scope.readed_checked = function () {
        // if($scope.readed_checkbox) {
        $scope.readed_checkbox = true;
        $scope.leave.readed = $scope.readed_checkbox;
        $('.leave_readed_switch')[0].checked = true;
        $('.leave_readed_switch_panel .switchery')[0].style.cssText = "box-shadow: rgb(0, 89, 167) 0px 0px 0px 16px inset; border-color: rgb(0, 89, 167); background-color: rgb(0, 89, 167); transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s, background-color 1.2s ease 0s;";
        $('.leave_readed_switch_panel .switchery small')[0].style.cssText = "left: 20px; transition: background-color 0.4s ease 0s, left 0.2s ease 0s; background-color: rgb(255, 255, 255);.leave_readed_switch_panel ";
        $rootScope.slide_page_back('.task-leave-wrapper');
        // }
    }

    // 签名
    $scope.signPane = null;
    $scope.signPanelInit = function () {

        var tablet;
        if(!$('.sign_panel #Tablet_LYN_0')[0]) {
            $(function () {
                tablet = new Tablet(".sign_panel", {
                    defaultColor: "#000000",
                    defaultBackgrondColor:"white",
                    imgType:"jpeg",
                    otherHtml: $("#temp").html(),
                    onInit: function () {
                        $scope.signPane = this;
                        var container = this.container;

                        $scope.signPane.setLineWidth(5);
                        $('.sign_panel_bg').css('width', '100%').css('height', window.innerHeight * 1 - 50);
                        $scope.signPane.setCanvasWH(window.innerWidth, window.innerHeight * 1 - 50);
                        $('#Tablet_LYN_0 .tablet-btns').remove();
                        container.find(".get_blob").on('touchend', function () {
                            $scope.signPane.getBlob();
                        });
                        window.setTimeout(function () {
                            $('.sign_panel').removeClass('hide');
                        }, 300);
                    }
                });
                // console.log(tablet);
            });
        }else{
            window.setTimeout(function () {
                $('.sign_panel').removeClass('hide');
            }, 300);
        }
        $rootScope.slide_page_go('.task-sign-wrapper');
    }

    $scope.clearSign = function () {
        $scope.signPane.clear();
    }

    $scope.submitSign = function () {
        var data = $scope.signPane.getBase64("jpeg");
        // $('.sign_image').attr('src', data);
        $scope.leave.sign = data;
        // console.log(data);
        $('.sign_panel').addClass('hide');
        $rootScope.slide_page_go('.task-leave-wrapper');
    }

    $scope.sign_page_back = function () {
        // $scope.clearSign();
        $('.sign_panel').addClass('hide');
        $rootScope.slide_page_go('.task-leave-wrapper');
    }

    // 离店提交
    $scope.submitLeave = function () {

        if(!$scope.leave.readed) {
            alert("请阅读声明文件");
            return false;
        }
        if(!$scope.leave.business_card || Object.keys($scope.leave.business_card).length == 0) {
            alert("请拍摄名片");
            return false;
        }//else if (Object.keys($scope.leave.business_card).length < $rootScope.proj_photo_min_nums) {
        //     alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
        //     return false;
        // }
        if(!$scope.leave.joint_photo || Object.keys($scope.leave.joint_photo).length == 0) {
            alert("请拍摄合影");
            return false;
        }//else if (Object.keys($scope.leave.joint_photo).length < $rootScope.proj_photo_min_nums) {
        //     alert('最少提交' + $rootScope.proj_photo_min_nums + '张照片');
        //     return false;
        // }
        if(!$scope.leave.sign) {
            alert("请提交签名");
            return false;
        }

        jQuery('#submit_leave_btn').attr('disabled', true);
        var uoload_array = [];

        if(!!$scope.leave.business_card) for(var i in $scope.leave.business_card) {
            // var business_card_img = $rootScope.base64ToBlob($scope.leave.business_card[i]);
            // var business_card_name = $rootScope.Guuid();
            // formData.append(business_card_name, business_card_img, i+".jpg");

            uoload_array.push(
                {"imageName": i, "imageType": "6", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
            );
        }

        if(!!$scope.leave.joint_photo) for(var i in $scope.leave.joint_photo) {
            // var joint_photo_img = $rootScope.base64ToBlob($scope.leave.joint_photo[i]);
            // var joint_photo_name = $rootScope.Guuid();
            // formData.append(joint_photo_name, joint_photo_img, i+".jpg");

            uoload_array.push(
                {"imageName": i, "imageType": "7", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
            );
        }

        var formData = new FormData();
        var signImg = $rootScope.base64ToBlob($scope.leave.sign);
        var sign_name = $rootScope.Guuid();
        formData.append(sign_name, signImg, sign_name+".jpg");

        uoload_array.push(
            {"imageName": sign_name, "imageType": "8", "isDefault": "1", "isStandard": "0"}
        );

        formData.append("token", $rootScope.userinfo.token);
        formData.append("taskId", $rootScope.task_detail.TASK_ID);
        formData.append("projectId", $rootScope.currenProject.proj_id);
        formData.append("agencyId", $rootScope.task_detail.AGENCY_ID);
        formData.append("sqStatus", 0);
        formData.append("readed", $scope.leave.readed);
        formData.append("imageList", JSON.stringify(uoload_array));

        // $http.post(
        //     $rootScope.apiUrl+'appImage/uploadOnlyImage', //照片上传
        //     formData,
        //     {
        //         transformRequest: angular.identity,
        //         headers: {'Content-Type': undefined}
        //     }
        // )
        // .success(function(response){
            $rootScope.getServerTime(function (time) {
                formData.append("leaveTime", time);
                // $rootScope.ajax({
                //     url: $rootScope.apiUrl + 'appLeave/submitLeave',//离店提交
                //     data: {
                //         token: $rootScope.userinfo.token,
                //         projectId: $rootScope.currenProject.proj_id,
                //         taskId: $rootScope.task_detail.TASK_ID,
                //         agencyId: $rootScope.task_detail.AGENCY_ID,
                //         sqStatus: 0,
                //         readed: $scope.leave.readed,
                //         leaveTime: time,
                //         imageList: JSON.stringify(uoload_array),
                //     },
                //     callback: function (response) {

                $http.post(
                    $rootScope.apiUrl + 'appLeave/submitLeave',//离店提交
                    formData,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }
                )
                .success(function (response) {
                    jQuery('#submit_leave_btn').attr('disabled', false);
                    if (response.status == 1) {
                        alert('离店提交成功');
                        $rootScope.update_photos_active($scope.leave.business_card);
                        $rootScope.update_photos_active($scope.leave.joint_photo);

                        $rootScope.go('/todayTask');
                        $rootScope.reloadTodayTask();
                    }else{
                        alert('提交错误');
                    }
                });
            });
        // });
    }
    $scope.checkLeaveForm = function () {
        if($scope.unqualifiedList && $scope.unqualifiedList.length != 0) {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appUnqualified/getUnqualifiedList',//不符合项 - 列表
                data: {
                    token: $rootScope.userinfo.token,
                    taskId: $rootScope.task_detail.TASK_ID,
                },
                callback: function (response) {
                    $scope.unqualifiedList = response.data.unqualifiedList;
                    var flag = true;
                    for(var i=0; i<$scope.unqualifiedList.length; i++){
                        if($scope.unqualifiedList[i].status == '0') {
                            flag = false;
                            break;
                        }
                    }
                    if(!flag) {
                        alert('请完成所有不符合项申诉');
                    }else{
                        $scope.submitLeave();
                    }
                }
            });
        }else {
            $scope.submitLeave();
        }
    }

    $scope.refresh_unqualified_list = function () {
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appUnqualified/getUnqualifiedList',//不符合项 - 列表
            data: {
                token: $rootScope.userinfo.token,
                taskId: $rootScope.task_detail.TASK_ID,
            },
            callback: function (response) {
                $scope.unqualifiedList = response.data.unqualifiedList;
            }
        });
    }

    $scope.goto_more_page = function (page) {
        $scope.more_page_back = page;
        $rootScope.slide_page_go('.questionnaire-more-wrapper')
    }
    $scope.back_more_page = function () {
        $scope.slide_page_back($scope.more_page_back);
    }

    $scope.goto_all_question = function () {

        $rootScope.ajax({
            url: $rootScope.apiUrl+'appQstStep/getAllQuestionByTask',//全部问卷
            data: {
                token: $rootScope.userinfo.token,
                mqId: $rootScope.task_detail.MQ_ID,
                taskId: $rootScope.task_detail.TASK_ID,
            },
            callback: function (response) {
                if(response.data.status == 1) {
                    $scope.all_question_list = response.data.allquestionlist;
                }else{
                    $scope.all_question_list = {'error_info': response.data.message};
                }
                $rootScope.slide_page_go('.all-question-wrapper');
            }
        });
    }

    $scope.goto_appoint_question = function ($q) {
        if(!!$q.finishedflag) return false;
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appQstStep/getCurrentQuestionMessage',//问卷下一页
            data: {
                token: $rootScope.userinfo.token,
                qstId: $q.qst_id,
                projectId: $rootScope.currenProject.proj_id,
                taskId: $rootScope.task_detail.TASK_ID,
                mqId: $rootScope.task_detail.MQ_ID,
            },
            callback: function (response) {
                if(response.data.status == 1) {
                    
                    $rootScope.task_detail.FINISHEDCOUNT = response.data.over_num;
                    $rootScope.task_detail.progress = parseInt((response.data.over_num / $rootScope.task_detail.TOTALCOUNT)*100);
                    $rootScope.task_detail.currentEp = response.data.step_no;
                    $rootScope.task_detail.exempt_num = response.data.exempt_num;
                    $rootScope.task_detail.record_num = response.data.record_num;
                    
                    if (response.data.step_type == "SQ") {
                        $scope.sqId = response.data.qst_id;
                        $scope.getSQ(response.data.qst_id);// 子问卷
                    } else if (response.data.step_type == "MQ" ) {
                        $scope.examPointId = response.data.qst_id;
                        $scope.getMQ(response.data.qst_id);
                    }
                }
                //以下情况不太会发生
                else if(response.data.message == "无下一问题信息") {
                    if(response.data.message != "") alert(response.data.message);
                    $scope.leave_wrapper_init();
                    // if(response.data.message != "") alert(response.data.message);
                }else{
                    if(response.data.message != "") alert(response.data.message);
                }
            }
        });
        // if($event.step_type == "MQ") {
        //     $scope.examPointId =
        // }else{
        //
        // }
    }

    //获取第一道题目，可能是主问卷，也可能是子问卷
    $scope.getFirstMQ = function () {
        if(!$rootScope.task_detail) return false;
        $rootScope.ajax({
            url: $rootScope.apiUrl + 'appQstStep/getFirstMQExamPoint',//获取第一题
            data: {
                token: $rootScope.userinfo.token,
                mqId: $rootScope.task_detail.MQ_ID,
                TASK_ID: $rootScope.task_detail.TASK_ID,
            },
            callback: function (response) {
               if(response.data.status == "1") {//有下一题
            	   $rootScope.task_detail.FINISHEDCOUNT = response.data.over_num;
                   $rootScope.task_detail.progress = parseInt((response.data.over_num / $rootScope.task_detail.TOTALCOUNT)*100);
                   $rootScope.task_detail.currentEp = response.data.step_no;
                   $rootScope.task_detail.exempt_num = response.data.exempt_num;
                   $rootScope.task_detail.record_num = response.data.record_num;
                  
                   if(response.data.step_type == "MQ") {
                       $scope.getMQ(response.data.qst_id);
                   }else if(response.data.step_type == "SQ") {
                       $scope.getSQ(response.data.qst_id);
                   }
               }else if(response.data.status == "2") {//全部检查完毕
            	   $scope.leave_wrapper_init();
               }else if(response.data.status == "0"){
                   //$scope.getFirstMQ();
            	   if(response.data.message != "") alert(response.data.message);
               }else{
            	   if(response.data.message != "") alert(response.data.message);
               }
            }
        });
    }


    $scope.goto_unqualified_list = function () {
        if($scope.unqualifiedList && $scope.unqualifiedList.length != 0) {
            $rootScope.showLoading($('.unqualified-list-wrapper .workspace-panel'));
            $rootScope.slide_page_go('.unqualified-list-wrapper');
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
    }

    $scope.appealSubmit = function ($id) {
        // if(!$scope.appeal.photos || Object.keys($scope.appeal.photos).length == 0){
        //     alert("请拍摄申诉照片");
        //     return false;
        // }
        // if(!$scope.unqualifiedData.appeal_comment || $scope.unqualifiedData.appeal_comment == ""){
        //     alert("请填写申诉意见");
        //     return false;
        // }
        // var formData = new FormData();
        var uoload_array = [];

        if(!!$scope.appeal.photos) for(var i in $scope.appeal.photos) {
            // var appeal_img = $rootScope.base64ToBlob($scope.appeal.photos[i]);
            // var appeal_name = $rootScope.Guuid();
            // formData.append(appeal_name, appeal_img, i+".jpg");

            uoload_array.push(
                {"imageName": i, "imageType": "14", "isDefault": i==0 ? "0" : "1", "isStandard": "0"}
            );
        }
        // formData.append("token", $rootScope.userinfo.token);
        // formData.append("taskid", $rootScope.task_detail.TASK_ID);
        // $http.post(
        //     $rootScope.apiUrl + 'appImage/uploadOnlyImage', //照片上传
        //     formData,
        //     {
        //         transformRequest: angular.identity,
        //         headers: {'Content-Type': undefined}
        //     }
        // ).success(function (response) {
            $rootScope.ajax({
                url: $rootScope.apiUrl + 'appUnqualified/updateUnqualifiedStatus',//不符合项 - 申诉
                data: {
                    token: $rootScope.userinfo.token,
                    unqualifiedId: $id,
                    taskId: $rootScope.task_detail.TASK_ID,
                    remark: $scope.unqualifiedData.appeal_comment,
                    imageList: JSON.stringify(uoload_array),

                },
                callback: function (response) {
                    if(response.data.status == 1){
                        $scope.refresh_unqualified_list();
                        alert('不符合项经销商现场申述提交成功');
                        // $rootScope.slide_page_back('.unqualified-list-wrapper');
                        $scope.goto_unqualified_list();
                    }
                }
            });
        // });
    }

    $scope.goto_appeal = function ($id) {
        $scope.unqualifiedData = {};
        $scope.appeal.photos = {};
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

    $scope.goto_standard_value = function (value) {
        $scope.standard_value = value;
        $rootScope.slide_page_go('.task-mqstandardvalue-wrapper');
    }

    if (!$rootScope.leave_wrapper_flag) $scope.getFirstMQ();
    else $scope.leave_wrapper_init();

    $rootScope.remove_questionnaire_active_photos = function(index){
        $scope.remove_photo_btn(index, "报备照片", true);
        $scope.remove_photo_btn(index, "普通报备照片", true);
        $scope.remove_photo_btn(index, "异常报备照片", true);
        $scope.remove_photo_btn(index, "整体照片", true);
        $scope.remove_photo_btn(index, "车辆照片", true);
        $scope.remove_photo_btn(index, "名片", true);
        $scope.remove_photo_btn(index, "合影", true);
        $scope.remove_photo_btn(index, "申述照片", true);
    }
}]);
