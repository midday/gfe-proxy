var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var readline = require('readline');
var chalk = require('chalk');
var StaticServer = require('static-server');
var proxyTool = require('./lib/proxyTools.js');
var defaults = require('./lib/defaults.js');

/**
 * 初始化gfe-proxy
 */
exports.init = function(config) {
    proxyTool.runProxy();
    stopProxyAddLisener();
    if (config.staticServer) {
        startStaticServer(config.staticServerHostname, config.staticServerPort);
    } else {
        runSuccTipsForGfeProxy();
        friendshipTips();
    }

    var cp = child_process.spawn('node', [
        '--harmony',
        path.join(__dirname, '/lib/app.js'),
        '--config=' + JSON.stringify(config)
    ]);

    cp.on('error', function(err) {
        console.log(err);
    });

    cp.on('exit', function() {
        proxyTool.stopProxy();
    });

    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
};


/**
 * 手动清除代理
 */
exports.stopProxy = function() {
    proxyTool.stopProxy();
};


/**
 * 为停止代理添加监听器，用户退出时重置代理
 */
function stopProxyAddLisener() {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', function() {
        proxyTool.stopProxy();
        console.log(chalk.green.bold('  gfe-proxy 已正常停止!'));
        console.log();
        process.exit();
    });
}


/**
 * 启动static-server，用来代理被挂载目录
 * @param {String} server的端口号
 */
function startStaticServer(hostname, port) {
    var server = new StaticServer({
        rootPath: process.cwd(),
        port: port,
        host: hostname,
        templates: {}
    });

    server.start(function() {
        runSuccTipsForGfeProxy();
        runSuccTipsForStaticServer(hostname, port);
        friendshipTips();
    });
}

/**
 * gfe-proxy启动成功提示
 */
function runSuccTipsForGfeProxy() {
    console.log(chalk.green.bold('  gfe-proxy已成功启动！'));
}

/**
 * static-server启动成功提示
 */
function runSuccTipsForStaticServer(hostname, port) {
    console.log();
    console.log(chalk.blue('*'), '本地静态服务器运行地址 :', chalk.cyan.bold('http://' + hostname + ':' + port));
}

/**
 * 启动成功友情提示
 */
function friendshipTips() {
    console.log();
    console.log(chalk.red.bold('  友情提醒：'));
    console.log(chalk.blue('*'), '      1、请使用', chalk.yellow.bold('Ctrl+C'), '组合键来停止 gfe-proxy！');
    console.log(chalk.blue('*'), '      2、异常关闭 gfe-proxy 会导致不能上网，请执行 gfe-proxy stop 命令！');
    console.log(chalk.blue('*'), '      3、异常关闭指非 Ctrl+C 方式停止 gfe-proxy 外的所有场景，');
    console.log(chalk.blue('*'), '         如：手动关闭或从任务管理器直接结束正在运行 gfe-proxy 的命令窗口！');
    console.log();
}
