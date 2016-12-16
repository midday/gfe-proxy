# GFE Proxy
## 目录
- 简介
- 功能
- 使用说明
- 可用的命令、选项
- 配置文件说明
- 示例
- 注意事项
- 工作原理

## 简介

一款无侵入、可插拔的静态资源 (`js/css`) 代理服务器。

## 功能

- 为被代理的静态资源添加本地服务的 Host
- 如果 `combo` 的资源有被代理资源，则会将被代理资源自动拆分并添加本地服务的 Host，便于独立文件调试
- 被代理的静态资源会自动去除 `.min` 和尾部时间戳

## 使用说明

 `gfe-proxy` 可以作为命令行工具使用，也可以作为模块使用。

#### 1、作为命令行工具使用

- 首先全局安装 `gfe-proxy`
```bash
npm install gfe-proxy -g
```

- 进入被挂载静态资源目录，启动 `gfe-proxy`
```bash
gfe-proxy start
```

- 在被 debug 页面的请求路径后添加参数 `debug=1`，符合条件的静态资源即被代理

#### 2、作为 nodejs 模块引用

- 首先安装 `static-proxy` 到你的项目中：
```
npm install static-proxy --save
```

- 在你的 nodejs 脚本中时可以这样写：
```javascript
var gfeProxy = require('gfe-proxy');

// config 对象请参照上面的 gfe-proxy-config.json 格式
gfeProxy.init(config);
```

## 可用的命令、选项

    `start` 启动 gfe-proxy  
    `stop` 停止 gfe-proxy  
    `-h` or `--help` 显示帮助信息 

## 配置文件说明(gfe-proxy-config.json)
**友情提示：请自己需求修改**
```javascript
{
    //被调试页面的Host集合
    "debugPageHosts": ["gome.com.cn", "atguat.com.cn", "gomeprelive.com.cn"],

    //本地静态server的端口(本地Server指挂载本地目录的 Server)
    "staticServerPort": "10000",

    /**
     * combo示例: http://hostname:80??foo/bar.css,foo/baz.css
     */
    //被调试页面是否使用combo来合并js/css文件
    "combo": true,
    //combo的url的分隔符
    "comboUrlSplit": "??",
    //combo的查询分隔符
    "comboQuerySplit": ",",

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
    "cssProxy": true,
    //挂载css的本地文件夹
    "cssMountFolder": "css",
    //能够标识出线上js路径的唯一子串，作为过滤条件使用。可使用文件夹开头的地址，例如：gmpro/2.0.0/
    "cssUrlUniqueSubstr": "gmpro/2.0.0/",

    //是否开启对js文件的代理
    "jsProxy": true,
    //挂载js的本地文件夹
    "jsMountFolder": "js",
    //能够标识出线上css路径的唯一子串，作为过滤条件使用。可使用文件夹开头的地址，例如：gmpro/2.0.0/
    "jsUrlUniqueSubstr": "gmpro/2.0.0/"
}
```

## 示例
1. 调试页面信息及目标需求
    - 请求地址
```bash
http://tuan.gome.com.cn/?intcmp=sy-1000000378-1
```
    - 源码内容
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet"  href="//css.gomein.net.cn/??gmlib/reset/1.1.0/reset.css,gmpro/1.0.0/public/1.0.0/css/top.min.css,gmpro/1.0.0/public/1.0.0/css/foot.min.css,gmpro/1.0.0/public/1.0.0/css/aside.min.css?v=201612151835,gmpro/2.0.0/cheap/groupon/1.0.0/css/common.css,gmpro/2.0.0/cheap/groupon/1.0.0/css/index.css">
</head>
<body>
    ...
    <script src="//js.gomein.net.cn/??gmlib/jq/1.7.1/jquery.js,gmlib/cookie/1.0.0/cookie.js,gmpro/1.0.0/public/1.0.0/js/signtop.min.js,gmlib/unit/bigcode/1.0.0/bigcode.min.js,gmpro/1.0.0/public/1.0.0/js/foot.min.js,gmpro/1.0.0/public/1.0.0/js/aside.min.js?v=201612151835,gmlib/unit/g/1.0.0/g.min.js,gmlib/ui/arttemplate/2.0.4/template.min.js,gmlib/ui/arttemplate/2.0.4/template-simple.min.js,gmlib/ui/gslider/1.0.2/gslider.min.js,gmlib/unit/gtime/1.0.0/gtime.min.js,gmpro/2.0.0/cheap/groupon/1.0.0/js/common/common.js,gmpro/2.0.0/cheap/groupon/1.0.0/js/common/collection.js,gmpro/2.0.0/cheap/groupon/1.0.0/js/common/recentlyBrowse.js,gmpro/2.0.0/cheap/groupon/1.0.0/js/index/cheapIndex.js,gmpro/2.0.0/cheap/groupon/1.0.0/js/index/cheapSolid.js"></script>
</body>
</html>
 ```
    - 目标：将 `gmpro/2.0.0` 开头的 js/css 从 combo 串中拆分并代理到本地 Server

    - 挂载静态资源的根目录为 css、js (需要在 groupon 目录中启动 gfe-proxy)
```base
+ groupon
    + css
    + js
```
    
2. 进入 groupon 目录下，启动 gfe-proxy
    ```bash
        gfe-proxy start
    ```
3. 在访问 debug 页面的 url 后追加参数  `debug=1` 
```bash
    http://tuan.gome.com.cn/?intcmp=sy-1000000378-1&debug=1
```

4. `gmpro/2.0.0` 开头的 js/css 即被代理到本地，(可以修改本地文件进行调试了)源码如下：
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="//css.gomein.net.cn/??gmlib/reset/1.1.0/reset.css,gmpro/1.0.0/public/1.0.0/css/top.min.css,gmpro/1.0.0/public/1.0.0/css/foot.min.css,gmpro/1.0.0/public/1.0.0/css/aside.min.css?v=201612160924">
    <link rel="stylesheet" href="//127.0.0.1:10000/css/common.css">
    <link rel="stylesheet" href="//127.0.0.1:10000/css/index.css">
</head>
<body>
    ...
    <script src="//js.gomein.net.cn/??gmlib/jq/1.7.1/jquery.js,gmlib/cookie/1.0.0/cookie.js,gmpro/1.0.0/public/1.0.0/js/signtop.min.js,gmlib/unit/bigcode/1.0.0/bigcode.min.js,gmpro/1.0.0/public/1.0.0/js/foot.min.js,gmpro/1.0.0/public/1.0.0/js/aside.min.js?v=201612160924,gmlib/unit/g/1.0.0/g.min.js,gmlib/ui/arttemplate/2.0.4/template.min.js,gmlib/ui/arttemplate/2.0.4/template-simple.min.js,gmlib/ui/gslider/1.0.2/gslider.min.js,gmlib/unit/gtime/1.0.0/gtime.min.js"></script>
    <script src="//127.0.0.1:10000/js/common/common.js"></script>
    <script src="//127.0.0.1:10000/js/common/collection.js"></script>
    <script src="//127.0.0.1:10000/js/common/recentlyBrowse.js"></script>
    <script src="//127.0.0.1:10000/js/index/cheapIndex.js"></script>
    <script src="//127.0.0.1:10000/js/index/cheapSolid.js"></script>
</body>
</html>
```

## 注意事项
- 如果执行 `gfe-proxy` 的目录下没有 `gfe-proxy-config.json` 文件，则会自动创建，请根据自己需求修改后，重新启动即可
- 请使用 `Ctrl+C` 组合键来停止 `gfe-proxy`
- 异常关闭 `gfe-proxy`，会导致不能上网，解决方案有如下两个：
    - 打开命令窗口，执行 `gfe-proxy reset` 命令后即可上网
    - 打开IE浏览器手动清除代理，步骤如下：  
      转到“工具”>“Internet 选项”>“连接”>单击“局域网设置”>去掉所有"对勾"即可
- 异常关闭指非 `Ctrl+C` 方式停止 `gfe-proxy` 外的所有场景，如：手动关闭或任务管理器强制结束正在运行 `gfe-proxy` 的命令窗口
- 此工具只能在 windows 系统上使用，并只能监听 http 请求

## 工作原理
1. 创建用来挂载静态资源的本地 `Server`
1. 修改系统注册表，为系统设置一个正向代理：`http://127.0.0.1:17173`
2. 使用 `koa` 做正向代理服务，用来过滤所有的浏览器请求
3. 过滤到符合条件的请求后，去掉 `debug=1` 拉取原始请求内容
4. 得到原始请求响应内容后，解析静态资源并打上本地 Server 的 Host
5. 将修改后的内容渲染到页面上，这样就实现了线上静态资源代理
