module.exports = {
    //被调试页面的Host集合
    debugPageHosts: ["gome.com.cn", "atguat.com.cn", "gomeprelive.com.cn"],

    //是否开启静态server
    staticServer:true,
    //本地静态server的hostName
    staticServerHostname: "127.0.0.1",
    //本地静态server的端口(本地Server指挂载本地目录的 Server)
    staticServerPort: "10000",

     /**
     * combo示例: http://hostname:80??foo/bar.css,foo/baz.css
     */
    //被调试页面是否使用combo来合并js/css文件
    combo: true,
    //combo的url的分隔符
    comboUrlSplit: "??",
    //combo的查询分隔符
    comboQuerySplit: ",",

    /**
     *注意：目前仅支持以下两种挂载场景
     *1、请求地址和本地文件层级一致
     *  例如：
     *    (1)本地挂载文件夹css
     *    (2)文件位置css/foo/bar.css
     *    (3)线上地址<link ref="stylesheet" href="//hostname:80/css/foo/bar.css">
     *  配置参考：
     *    cssMountFolder: "css",
     *    cssUrlUniqueSubstr: "css/",
     *2、请求地址包含本地文件层级
     *  例如：
     *    (1)本地挂载文件夹css
     *    (2)文件位置css/foo/bar.css
     *    (3)线上地址<link ref="stylesheet" href="//hostname:80/gmlib/2.0.0/xxx/css/foo/bar.css">
     *  配置参考：
     *    cssMountFolder: "css",
     *    cssUrlUniqueSubstr: "gmlib/2.0.0/"
     */
    //是否开启对css文件的代理
    cssProxy: true,
    //挂载css的本地文件夹
    cssMountFolder: "css",
    //能够标识出线上js路径的唯一子串，作为过滤条件使用。可使用文件夹开头的地址，例如：gmpro/2.0.0/
    cssUrlUniqueSubstr: "gmpro/2.0.0/",

    //是否开启对js文件的代理
    jsProxy: true,
    //挂载js的本地文件夹
    jsMountFolder: "js",
     //能够标识出线上css路径的唯一子串，作为过滤条件使用。可使用文件夹开头的地址，例如：gmpro/2.0.0/
    jsUrlUniqueSubstr: "gmpro/2.0.0/"
};
