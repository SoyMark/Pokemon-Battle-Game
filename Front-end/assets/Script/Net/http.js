module.exports = {
    request: function(obj) {
        var httpRequest = new XMLHttpRequest();
        var time = 5*1000;
        var timeout = false;

        // 超时设置
        var timer = setTimeout(function(){
            timeout = true;
            httpRequest.abort();
        }, time);

        var url = obj.url;

        httpRequest.open(obj.method?obj.method:'GET', url, true);
        
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=utf-8")

        httpRequest.onreadystatechange = function () {
            var response = httpRequest.responseText;
            console.info('http url cb:' +  url + ' readyState:' + httpRequest.readyState + ' status:' + httpRequest.status);
            clearTimeout(timer);

            if (httpRequest.readyState == 4) {
                if(httpRequest.status == 200) {
                    console.info('http success:' + url + ' resp:' + response);
                    if (typeof obj.success == 'function') {
                        obj.success(response);
                    }
                }
                else {
                    // console.info('http fail:' + url);
                    if (typeof obj.fail == 'function') {
                        obj.fail(response);
                    }
                }
            } 
        };
        httpRequest.send(JSON.stringify(obj.data))
    }
}