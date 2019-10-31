'use strict';

angular.module('myApp.restServices', ['ngResource'])
    .filter('nl2br', function ($sce) {
        return function (text) {
            return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
        };
    });




Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
Date.prototype.time_range = function (beginTime, endTime, nowTime) {
    var strb = beginTime.split(":");
    if (strb.length == 3) {
        strb = strb.splice(':')[0] + strb.splice(':')[1];
    }
    var stre = endTime.split(":");
    if (stre.length != 3) {
        stre = stre.splice(':')[0] + stre.splice(':')[1];
    }
    var strn = nowTime.split(":");
    if (strn.length != 3) {
        strn = strn.splice(':')[0] + strn.splice(':')[1];
    }
    var b = new Date();
    var e = new Date();
    var n = new Date();
    b.setHours(strb[0]);
    b.setMinutes(strb[1]);
    e.setHours(stre[0]);
    e.setMinutes(stre[1]);
    n.setHours(strn[0]);
    n.setMinutes(strn[1]);
    if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
        return true;
    } else {
        return false;
    }
}

Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) { return false; }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
}

window.deleteIterative = function (oldArr, newArr){
    var resultArr = newArr;
    if (oldArr) for (var i in newArr) {
        if (i in oldArr) {
            delete resultArr[i];
        }
    }
    return resultArr;
}

/*remove url of alert/confirm*/
var wAlert = window.alert;
window.alert = function (message) {
    try {
        var iframe = document.createElement("IFRAME");
        iframe.style.display = "none";
        iframe.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(iframe);
        var alertFrame = window.frames[0];
        var iwindow = alertFrame.window;
        if (iwindow == undefined) {
            iwindow = alertFrame.contentWindow;
        }
        iwindow.alert(message);
        iframe.parentNode.removeChild(iframe);
    }
    catch (exc) {
        return wAlert(message);
    }
}

var wConfirm = window.confirm;
window.confirm = function (message) {
    try {
        var iframe = document.createElement("IFRAME");
        iframe.style.display = "none";
        iframe.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(iframe);
        var alertFrame = window.frames[0];
        var iwindow = alertFrame.window;
        if (iwindow == undefined) {
            iwindow = alertFrame.contentWindow;
        }
        var result=iwindow.confirm(message);
        iframe.parentNode.removeChild(iframe);
        return result;
    }
    catch (exc) {
        return wConfirm(message);
    }
}

window.setupWebViewJavascriptBridge = function(callback) {
    // https://www.jianshu.com/p/d12ec047ce52
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback);
    }
    
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0);
}