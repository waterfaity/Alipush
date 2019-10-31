'use strict';

angular.module('myApp', [
    'ngTouch',
    'ngRoute',
    'ngAnimate',
    'cp.ngConfirm',
    'myApp.controllers',
    'myApp.controllerslogin',
    'myApp.controllerstodaytask',
    'myApp.controllersrecenttask',
    'myApp.controllersfinishedtask',
    'myApp.controllersother',
    'myApp.controllersquestionnaire',
    'myApp.controllersarrivetask',
    'myApp.controllersleave',
    'myApp.controllersleavetask',
    'myApp.controllersleavetask',
    'myApp.controllersabnormalreport',
    'myApp.controllersnormalreport',
    'myApp.controllersnotice',
    'myApp.controllerstest',
])
.config(['$routeProvider', function ($routeProvider) {


    // 今日任务 首页
    $routeProvider.when('/todayTask',
        {
            templateUrl: 'pages/todayTask.html?v=20181010',
            controller: 'TodayTaskCtrl'
        }
    );

    // 近期任务
    $routeProvider.when('/recentTask',
        {
            templateUrl: 'pages/recentTask.html?v=20181010',
            controller: 'recentTaskCtrl'
        }
    );

    // 已完成
    $routeProvider.when('/finishedTask',
        {
            templateUrl: 'pages/finishedTask.html?v=20181010',
            controller: 'finishedTaskCtrl'
        }
    );

    // 登录
	$routeProvider.when('/login', 
		{
			templateUrl: 'pages/login.html?v=20181010',
			controller: 'LoginCtrl'
		}
	);

    // 项目统计
    $routeProvider.when('/schedule',
        {
            templateUrl: 'pages/schedule.html?v=20181010',
            controller: 'ScheduleCtrl'
        }
    );

    // logo页
    $routeProvider.when('/other',
        {
            templateUrl: 'pages/other.html?v=20181010',
            controller: 'OtherCtrl'
        }
    );

    // 问卷
    $routeProvider.when('/questionnaire',
        {
            templateUrl: 'pages/questionnaire.html?v=20181010',
            controller: 'QuestionnaireCtrl'
        }
    );

    // 离店
    $routeProvider.when('/leave',
        {
            templateUrl: 'pages/leave.html?v=20181010',
            controller: 'LeaveCtrl'
        }
    );

    // 打卡确认
    $routeProvider.when('/arriveTask',
        {
            templateUrl: 'pages/arriveTask.html?v=20181010',
            controller: 'arriveTaskCtrl'
        }
    );

    // 离店确认
    $routeProvider.when('/leaveTask',
        {
            templateUrl: 'pages/leaveTask.html?v=20181010',
            controller: 'leaveTaskCtrl'
        }
    );

    // 异常报备确认
    $routeProvider.when('/abnormalReportTask',
        {
            templateUrl: 'pages/abnormalReportTask.html?v=20181010',
            controller: 'abnormalReportTaskCtrl'
        }
    );

    // 普通报备确认
    $routeProvider.when('/normalReportTask',
        {
            templateUrl: 'pages/normalReportTask.html?v=20181010',
            controller: 'normalReportTaskCtrl'
        }
    );

    // 消息
    $routeProvider.when('/notice',
        {
            templateUrl: 'pages/notice.html?v=20181010',
            controller: 'noticeCtrl'
        }
    );

    // 测试
    $routeProvider.when('/test',
        {
            templateUrl: 'pages/test.html?v=20181010',
            controller: 'TestCtrl'
        }
    );

    $routeProvider.otherwise({redirectTo: '/todayTask'});
}]);

