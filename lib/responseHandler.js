var url = require('url');
var path = require('path');
var querystring = require('querystring');
var syncrequest = require('syncrequest');

/**
 * 过滤所有http请求。
 * 如果有需要代理的页面请求，则对响应内容进行修改(符合条件的静态资源进行本地代理)
 * @param {Object} 配置参数对象
 */
module.exports = function(config) {
    return function*(next) {
        var requestUrl = this.request.url;
        var urlObj = url.parse(requestUrl);
        var queryObj = querystring.parse(urlObj.query);

        var debugPageHosts = config.debugPageHosts; //debug页面的hosts集合
        var isAssignHost = isBelongAssignHost(config.debugPageHosts, urlObj.host);
        var isOpenDebug = queryObj.debug === 'true' || queryObj.debug === '1';
        if (this.method === 'GET' && isAssignHost && isOpenDebug) {
            var nonDebugUrl = requestUrl.slice(0, requestUrl.lastIndexOf('debug'));
            var result = syncrequest.get.sync(nonDebugUrl);
            var pageContent = result.body;
            //开启对CSS的代理
            if (config.cssProxy) {
                pageContent = replaceLinkTag(config, pageContent);
            }
            //开启对JS的代理
            if (config.jsProxy) {
                pageContent = replaceScriptTag(config, pageContent);
            }

            this.body = pageContent;
            return;
        }
        yield next;
    };
};


/**
 * 判断请求Host是否属于指定Host(主域相同即可)
 * @param  {Array} 指定Host列表
 * @param  {String}请求Host
 * @return {Boolean} true:包含指定Host，false:不包含指定Host
 */
function isBelongAssignHost(debugPageHosts, requestHost) {
    var isBelongs = false;
    debugPageHosts.forEach(function(host) {
        if (~requestHost.indexOf(host)) {
            isBelongs = true;
        }
    });
    return isBelongs;
}


/**
 * 替换Link标签
 * @param  {String} 配置参数对象
 * @param  {String} 页面内容
 * @return {String} 处理后的页面内容
 */
function replaceLinkTag(config, content) {
    var linkTagRegExp = /<link[^>]*?href\s*=\s*(['"])([^"']*?)(['"])[^>]*?\/?>/gi;
    content = content.replace(linkTagRegExp, function(linkTag) {
        return generateNewLinkTag(config, linkTag, linkTagRegExp);
    });

    return content;
}


/**
 * 生成新的link标签
 * @param  {String} 配置参数对象
 * @param  {String} 被处理的link标签
 * @param  {Object} 匹配link标签的正则表达式
 * @return {String} 新的link标签
 */
function generateNewLinkTag(config, linkTag, linkTagRegExp) {
    var newLinkTag;
    var isSupportCombo = config.combo;
    var comboUrlSplit = config.comboUrlSplit;
    var comboQuerySplit = config.comboQuerySplit;
    var stylesheetRegExp = /rel\s*=\s*['"]stylesheet['"]\s*/gi;
    var cssUrlUniqueSubstr = config.cssUrlUniqueSubstr; //cssUrl开头规则
    var newLineChar = '\r\n'; //换行符

    if (!stylesheetRegExp.test(linkTag)) { //非样式表的link原样返回
        newLinkTag = linkTag;
    } else {
        var cssUrl = linkTag.replace(linkTagRegExp, '$2');

        //路径是否需要处理
        if (~cssUrl.indexOf(cssUrlUniqueSubstr)) {
            //是否支持Combo
            if (isSupportCombo) {
                //combo多个资源
                if (cssUrl.indexOf(comboUrlSplit) && cssUrl.split(comboQuerySplit).length > 1) {
                    var urlStore = splitComboUrl(config, cssUrl, "URL_FROM_LINK");
                    var linkStore = urlStore.map(function(url) {
                        return _generateLinkTag(url);
                    });
                    newLinkTag = linkStore.join(newLineChar) + newLineChar;
                } else {
                    cssUrl = generateNewUrl(config, cssUrl);
                    newLinkTag = _generateLinkTag(cssUrl);
                }
            } else {
                cssUrl = generateNewUrl(config, cssUrl);
                newLinkTag = _generateLinkTag(cssUrl);
            }
        } else {
            newLinkTag = linkTag;
        }
    }

    return newLinkTag;
}


/**
 * 替换Script标签
 * @param  {Object} 配置参数对象
 * @param  {String} 页面内容
 * @return {String} 处理后的页面内容
 */
function replaceScriptTag(config, content) {
    var scriptTagRegExp = /<script[^>]*?src=(['"])([^"']*?)(['"])[^>]*?>\s*<\s*\/script\s*>/gi;

    content = content.replace(scriptTagRegExp, function(scriptTag) {
        return generateNewScriptTag(config, scriptTag, scriptTagRegExp);
    });

    return content;
}


/**
 * 生成新的script标签
 * @param  {Object} 配置参数对象
 * @param  {String} 被处理的script标签
 * @param  {Object} 匹配script标签的正则表达式
 * @return {String} 新的script标签
 */
function generateNewScriptTag(config, scriptTag, scriptTagRegExp) {
    var newScriptTag;
    var isSupportCombo = config.combo;
    var comboUrlSplit = config.comboUrlSplit;
    var comboQuerySplit = config.comboQuerySplit;
    var jsUrlUniqueSubstr = config.jsUrlUniqueSubstr; //jsUrl开头规则
    var newLineChar = '\r\n'; //换行符

    var jsUrl = scriptTag.replace(scriptTagRegExp, '$2');

    //路径是否需要处理
    if (~jsUrl.indexOf(jsUrlUniqueSubstr)) {
        //是否支持Combo
        if (isSupportCombo) {
            //combo多个资源
            if (jsUrl.indexOf(comboUrlSplit) && jsUrl.split(comboQuerySplit).length > 1) {
                var urlStore = splitComboUrl(config, jsUrl, "URL_FROM_SCRIPT");
                var scriptStore = urlStore.map(function(url) {
                    return _generateScriptTag(url);
                });
                newScriptTag = scriptStore.join(newLineChar) + newLineChar;
            } else {
                jsUrl = generateNewUrl(config, jsUrl);
                newScriptTag = _generateScriptTag(jsUrl);
            }
        } else {
            jsUrl = generateNewUrl(config, jsUrl);
            newScriptTag = _generateScriptTag(jsUrl);
        }
    } else {
        newScriptTag = scriptTag;
    }

    return newScriptTag;
}


/**
 * 替换单链接(无combo)的cssUrl，生成新的cssUrl
 * @param  {Object} 配置参数对象
 * @param  {String} 原始cssUrl
 * @param  {String} url类型，"URL_FROM_LINK":来自link标签，"URL_FROM_SCRIPT"来自script标签
 * @return {String} 替换后的cssUrl
 */
function generateNewUrl(config, singleUrl, urlType) {
    var localServerHost = '//127.0.0.1:' + config.staticServerPort + '/';
    var mountFolder; //挂载文件夹
    if (urlType === "URL_FROM_LINK") {
        mountFolder = config.cssMountFolder; //css挂载的本地文件夹
    } else {
        mountFolder = config.jsMountFolder; //js挂载的本地文件夹
    }

    singleUrl = singleUrl.slice(singleUrl.lastIndexOf(mountFolder + '/'));
    singleUrl = singleUrl.replace(/(\?.*$)|(.min)/g, ''); //去".min"和"?v=201612141858"
    singleUrl = localServerHost + singleUrl;

    return singleUrl;
}


/**
 * 拆分comboUrl，并添加CDN
 * @param  {Object} 配置参数对象
 * @param  {String} comboUrl
 * @param  {String} url类型，"URL_FROM_LINK":来自link标签，"URL_FROM_SCRIPT"来自script标签
 * @return {Array} url生成的标签数组
 */
function splitComboUrl(config, comboUrl, urlType) {
    var urlStore = []; //存放为处理的URL，格式[{"url":"xxx/xxx","requireProxy":true},{"url":"xxx/xxx","requireProxy":false}]
    var newUrlStore = []; //存放处理过的URL
    var comboUrlSplit = config.comboUrlSplit;
    var comboQuerySplit = config.comboQuerySplit;
    var localServerHost = '//127.0.0.1:' + config.staticServerPort + '/';
    var comboUrlSplitIndex = comboUrl.indexOf(comboUrlSplit);
    var comboUrlHost = comboUrl.slice(0, comboUrlSplitIndex);
    var comboUrlQuery = comboUrl.slice(comboUrlSplitIndex + 2);

    var mountFolder; //挂载文件夹
    var urlUniqueSubstr; //url打头内容
    if (urlType === "URL_FROM_LINK") {
        mountFolder = config.cssMountFolder; //css挂载的本地文件夹
        urlUniqueSubstr = config.cssUrlUniqueSubstr; //cssUrl开头规则
    } else {
        mountFolder = config.jsMountFolder; //js挂载的本地文件夹
        urlUniqueSubstr = config.jsUrlUniqueSubstr; //jsUrl开头规则
    }

    comboUrlQuery.split(comboQuerySplit).forEach(function(singleUrl) {
        var urlObj = {};
        if (~singleUrl.indexOf(urlUniqueSubstr)) {
            urlObj.requireProxy = true;
            singleUrl = singleUrl.slice(singleUrl.lastIndexOf(mountFolder + '/'));
            singleUrl = singleUrl.replace(/(\?.*$)|(.min)/g, ''); //去".min"和"?v=201612141858"
        } else {
            urlObj.requireProxy = false;
        }
        urlObj.url = singleUrl;
        urlStore.push(urlObj);
    });

    //有连续不需要处理的资源进行combo
    var urlCacheArray = []; //用来存放不需要代理的Url，如果有多个则进行combo
    urlStore.forEach(function(urlObj, index) {
        if (urlObj.requireProxy) {
            if (urlCacheArray.length > 0) {
                newUrlStore.push(comboUrlHost + comboUrlSplit + urlCacheArray.join(comboQuerySplit));
                urlCacheArray = [];
            }
            newUrlStore.push(localServerHost + urlObj.url);
        } else {
            urlCacheArray.push(urlObj.url);
            //如果最后一个是不需要处理的，则手动处理
            if (index === urlStore.length - 1) {
                if (urlCacheArray.length > 0) {
                    newUrlStore.push(comboUrlHost + comboUrlSplit + urlCacheArray.join(comboQuerySplit));
                    urlCacheArray = [];
                }
            }
        }
    });

    return newUrlStore;
}


/**
 * 生成link标签
 * @param  {String} url
 * @return {String} 生成的link标签
 */
function _generateLinkTag(url) {
    return '<link rel="stylesheet" href="' + url + '">';
}


/**
 * 生成script标签
 * @param  {String} url
 * @return {String} 生成的script标签
 */
function _generateScriptTag(url) {
    return '<script src="' + url + '"></script>';
}
