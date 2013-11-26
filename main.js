/**
 * Author: Daniel
 */

'use strict';

/* import */
var restify = require('restify');
var Logger = require('bunyan');
var _ = require("underscore");
var querystring = require('querystring');
var Memcached = require('memcached');
var cookie = require('cookie');
var defer = require("node-promise").defer;
var when = require("node-promise").when;

var routes = require('./routes');
var gmMongodb = require('./db/gmMongodb');
var config = require('./conf/config');
var gmfw = require('./common/gmframework');

function startServer() {
    // connect db
    gmMongodb.connect();

    // connect memcached server
    var memcachedClient = null;
    // 存储认证url map，加快每个请求的判断速度，格式{url:true}
    var authUrlMap = {};
    if (config.Auth.required) {
        memcachedClient = new Memcached(config.Auth.servers, config.Auth.serverOptions);

        // TODO 连接不了应该采取什么措施？停止服务？邮件通知？……

        // 将所有匹配的需要认证的url存储进authUrlMap
        _.each(routes.Routes, function (services) {
            _.each(services, function (handlers) {
                _.each(handlers, function (handleFn, path) {
                    for (var i=0, leng=config.Auth.apiUrls.length; i<leng; i++) {
                        if (path.search(config.Auth.apiUrls[i]) >=0) {
                            authUrlMap[path] = true;
                            break;
                        }
                    }
                });
            });
        });
    }

    // create Logger
    var log = new Logger({
        name: 'open api',
        streams: [
            {
                level: 'info',
                path: 'log/info.log',
                type: 'rotating-file',
                period: '1d',
                count: 3
            },
            {
                level: 'error',
                path: 'log/error.log',
                type: 'rotating-file',
                period: '1d',
                count: 3
            }
        ],
        serializers: restify.bunyan.serializers
    });

    // create openapi server
    var server = restify.createServer({
        name: 'gm node open api',
        log: log
    });

    // server pre
    server.pre(function (req, res, next) {
        var authPromise = null;
        if (memcachedClient) { // 进行认证判断
            var cookies = cookie.parse(req.headers.cookie);
            var key = cookies ? cookies['JSESSIONID'] : null;
            var authLoginFn = function(key) {
                var deferred = defer();
                memcachedClient.get(key, function(err, data) {
                    if (err) {
                        deferred.reject(err);
                        return;
                    }
                    // TODO 判断是否登录，判断逻辑可能需要更改
                    if (data && data.indexOf('GM_USER') != -1) { // 已登录
                        deferred.resolve(true);
                    } else {
                        deferred.resolve(false);
                    }

                });
                return deferred.promise;
            }

            // 如果访问的url是需要认证并且用户已登录，则允许访问
            if (authUrlMap[req.getPath().substring(1)] && key) {
                authPromise = authLoginFn(key);
            }
        }

        when(authPromise || true, function(isLogin) {
            if (isLogin) {
                // handle app version no
                var qs = querystring.parse(req.getQuery());
                if (qs.v) {
                    req.headers['accept-version'] = qs.v;
                }
                // record start time
                req.startTime = new Date().getTime();
                return next();
            } else {
                return next(new restify.NotAuthorizedError('Login first'));
            }
        });
    });

    // server use
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.gzipResponse());
    server.use(restify.jsonp());
    server.use(restify.bodyParser()); // 使得body参数,即用post时的参数也可以通过req.params取得,这样取参数时就不用区分get和post,都是用req.params来取得参数
    server.use(restify.queryParser()); // 使得query参数,即用get时的参数也可以通过req.params取得,这样取参数时就不用区分get和post,都是用req.params来取得参数

    // server after
    server.on('after', function (req, res, next, error) {
        var duration = new Date().getTime() - req.startTime;
        req.log.info({req: req}, {duration: duration, params: req.params});
    });

    // mapping path and handler, all methods support GET, POST and JSONP
    _.each(routes.Routes, function (services, version) {
        _.each(services, function (handlers) {
            _.each(handlers, function (handleFn, path) {
                server.get({path: path, version: version}, function (req, res, next) {
                    gmfw.fw.commonHandler.call(this, req, res, next, handleFn['handelFn']);
                });
                server.post({path: path, version: version}, function (req, res, next) {
                    gmfw.fw.commonHandler.call(this, req, res, next, handleFn['handelFn']);
                });
            });
        });
    });

    // listen
    server.listen(config.Server.port, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
}

startServer();
