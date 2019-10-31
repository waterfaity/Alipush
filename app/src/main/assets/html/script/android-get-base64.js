    //安卓传递来的图片base64数据
    function from_android_for_base64(json){
            var appElement = document.querySelector('[ng-controller=MainCtrl]');
            //获取$scope变量
            var $scope = angular.element(appElement).scope();
            //调用msg变量，并改变msg的值
            $scope.receiveBase64StrData(json);
            //上一行改变了msg的值，如果想同步到Angular控制器中，则需要调用$apply()方法即可
            $scope.$apply();
    }