
(function(){

	function connectWebViewJavascriptBridge(callback) {
		if (window.WebViewJavascriptBridge) {
			callback(WebViewJavascriptBridge)
		} else {
			document.addEventListener('WebViewJavascriptBridgeReady', function() {
				callback(WebViewJavascriptBridge)
			}, false)
		}
	}

	function registerWebViewJavascriptHandler(bridge, cache) {
		for(var p in cache)
		{  
			(function(name,func){
				bridge.registerHandler(name, function(data, responseCallback){
					var response = func(data);
					responseCallback(response);
				});
			})(p,cache[p]);
		}
	}

	function registerWebViewHandler(cache) {
		connectWebViewJavascriptBridge(function(bridge){registerWebViewJavascriptHandler(bridge,cache)});
	}

	function sendWebViewJavascriptHandler(bridge, cache, responseback) {
		for(var p in cache)
		{
			bridge.callHandler(p, cache[p], function(response) {
				responseback(p,response);
			})
		}
	}

	function sendWebViewHandler(cache,callback) {
		connectWebViewJavascriptBridge(function(bridge){sendWebViewJavascriptHandler(bridge,cache,callback)});
	}

	connectWebViewJavascriptBridge(function(bridge) {
		var uniqueId = 1
		function log(message, data) {
			console.log(uniqueId++ + '. ' + message + ':<br/>' + JSON.stringify(data))
		}
		bridge.init(function(message, responseCallback) {
			log('JS got a message', message)
			var data = { 'Javascript Responds':'Wee!' }
			log('JS responding with', data)
			responseCallback(data);
		})


		/*
			var data = 'Hello from JS button'
			log('JS sending message', data)
			bridge.send(data, function(responseData) {
				log('JS got response', responseData)
			})
		*/
	

        /*	
			log('JS calling handler "testObjcCallback"')
			bridge.callHandler('testObjcCallback', {'foo': 'bar'}, function(response) {
				log('JS got response', response)
			})
		*/
	});
	window.getConViewJsBridge = connectWebViewJavascriptBridge;
	window.registerViewHandler = registerWebViewHandler;
	window.sendViewHandler = sendWebViewHandler;
})()