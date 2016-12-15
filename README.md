## Gfe Proxy 简介

一款静态资源 (`js/css`) 的代理服务器，代理线上静态资源到本地静态资源挂载的服务上。

此工具还可以解析 `combo` 后的静态资源，并将需要代理的静态资源拆分后，打上本地服务的 Host。

## 使用

 `gfe-proxy` 可以作为命令行工具使用，也可以作为模块使用。

### 作为命令行工具使用

- 首先全局安装 `gfe-proxy`
```bash
npm install gfe-proxy -g
```

- 进入被挂载静态资源目录，启动 `gfe-proxy`
```bash
gfe-proxy start
```

- 在被 `debug` 页面的请求 url 后添加参数 debug=1，页面静态资源即被代理。

- `gfe-proxy` 可用的命令、选项如下:
`start` 启动 gfe-proxy
`stop` 停止 gfe-proxy
`-h` or `--help` 显示帮助信息

- `gfe-proxy-config.json` 默认值如下，请根据自己需求进行配置
```javascript
{
    //debug页面的Host集合
    "debugPageHosts": ["gome.com.cn", "atguat.com.cn", "gomeprelive.com.cn"],

    //本地静态server的端口(静态server：挂载本地目录的server,host为：127.0.0.1)
    "staticServerPort": "10000",

    /**
     * combo示例: http://hostname:80??foo/bar.css,foo/baz.css
     */
    //debug页面是否使用combo来合并js/css文件
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
    //css文件代理是否开启
    "cssProxy": true,
    //css挂载的本地文件夹
    "cssMountFolder": "css",
    //能够表示出js线上url的唯一子串，作为过滤条件使用。可使用文件夹开头的地址，例如：gmpro/2.0.0/
    "cssUrlUniqueSubstr": "gmpro/2.0.0/",

    //js文件代理是否开启
    "jssProxy": true,
    //js挂载的本地文件夹
    "jsMountFolder": "js",
    //能够表示出js线上url的唯一子串，作为过滤条件使用。可使用文件夹开头的地址，例如：gmpro/2.0.0/
    "jsUrlUniqueSubstr": "gmpro/2.0.0/"
}
```

- 注意事项
    1. 如果执行 `gfe-proxy` 的目录下没有 `gfe-proxy-config.json` 文件，则会自动创建，请根据自己需求修改后，重新启动即可
    2. 请使用 `Ctrl+C` 组合键来停止 `gfe-proxy`
    3. 异常关闭 `gfe-proxy`，可能会上不了网，执行 `gfe-proxy reset` 命令后即可上网
    4. 异常关闭指非 `Ctrl+C` 方式停止 `gfe-proxy` 外的所有场景，如：手动关闭或任务管理器结束正在运行 `gfe-proxy` 的命令窗口
    5. 此工具只能在 windows 系统上使用，只能监听 http 请求

### 作为 nodejs 模块引用

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

## 工作原理
1. 创建用来挂载静态资源的本地 `Server`
1. 修改系统注册表，为系统设置一个正向代理：`http://127.0.0.1:17173`
2. 使用 `koa` 做正向代理服务，用来过滤所有的浏览器请求
3. 过滤到符合条件的请求后，去掉 `debug=1` 拉取原始请求内容
4. 得到原始请求响应内容后，解析静态资源并打上本地 Server 的 Host
5. 将修改后的内容渲染到页面上，这样就实现了线上静态资源代理
