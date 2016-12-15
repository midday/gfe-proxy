var request = require('request');
var url = require('url');

/**
 * 将代理的请求返回到客户端
 */
module.exports = function() {
    return function*() {
        var urlObj = url.parse(this.request.url);

        this.body = this.req.pipe(request(this.request.url));
    };
};
