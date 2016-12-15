var koa = require('koa');
var argv = require('yargs').argv;
var responseHandler = require('./responseHandler.js');
var httpProxy = require('./httpProxy.js');
var app = koa();

var config = JSON.parse(argv.config);

app.use(responseHandler(config));
app.use(httpProxy());

app.listen(17173);
