var cp = require('child_process');
var path = require('path');

/**
 * 开启代理
 */
exports.runProxy = function() {
    var cmd = path.join(__dirname, "tools/runproxy.exe");
    cp.execSync(cmd);
};

/**
 * 停止代理
 */
exports.stopProxy = function() {
    var cmd = path.join(__dirname, "tools/stopproxy.exe");
    return cp.execSync(cmd);
};
