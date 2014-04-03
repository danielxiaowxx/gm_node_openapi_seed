/**
 * Author: Daniel
 */

'use strict';

/* import */
var restify = require('restify');
var util = require('util');

/* exports */
var gmfw_util = exports.util = {};
var gmfw_fw = exports.fw = {};

/* constants */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


/*========== framework methods ==================================================*/

/**
 * format response result
 * @param result
 * @returns {*}
 */
gmfw_fw.formatResult = function(result) {
    if (result instanceof Error) {
        result = {
            error: true,
            code: result.statusCode,
            name: result.name,
            message: result.message
        };
    } else {
        result = {
            error: false,
            result: result
        };
    }
    return result;
}

/**
 * common handler,作用是将http method参数解析出来，然后调用真正的普通的js function
 * @param req
 * @param res
 * @param next
 * @param handleFn
 */
gmfw_fw.commonHandler = function(req, res, next, handleFn) {
    var funcParamNames = gmfw_util.getFuncParamNames(handleFn);
    var funcParamVals = [];

    if (funcParamNames) {
        funcParamNames.forEach(function (paramName) {
            var paramVal = req.params[paramName] || req.params[paramName] === 0 ? req.params[paramName] : null; // 允许传参考为0的值
            funcParamVals.push(paramVal);
        });
    }

    funcParamVals.push(req.log); // 将log对象放在函数接收参数的最后

    var result = handleFn.apply(this, funcParamVals);
    if (result && result.then && typeof (result.then) === 'function') { // is promise object
        result.then(function (data) {
            res.send(gmfw_fw.formatResult(data));
            next();
            return;
        }, function (err) {
            res.send(gmfw_fw.formatResult(new restify.RestError(err)));
            next();
            return;
        });
    } else { // is common object or Error object
        res.send(gmfw_fw.formatResult(result));
        next();
        return;
    }
}

/**
 * register error type
 * @param ErrorName
 * @param errorCode
 */
gmfw_fw.regError = function(ErrorName, errorCode, errModule) {
    errModule.exports[ErrorName] = function(message) {
        restify.RestError.call(this, {
            statusCode: errorCode,
            message: message,
            constructorOpt: errModule.exports[ErrorName]
        });
        this.name = ErrorName;
    }
    util.inherits(errModule.exports[ErrorName], restify.RestError);
}

/**
 * 处理DAO层的promise结果
 * @param deferred
 * @param err
 * @param data
 * @param preResolveHandler
 */
gmfw_fw.handleDAOPromiseResult = function(deferred, err, data, preResolveHandler) {
    if (err) {
        deferred.reject(err);
        return;
    }
    if (preResolveHandler && typeof(preResolveHandler) == 'function') {
        preResolveHandler.call();
    }
    deferred.resolve(data);
}

/*========== util methods ==================================================*/

/**
 * get function param names
 * @param func
 * @returns {Array|{index: number, input: string}}
 */
gmfw_util.getFuncParamNames = function(func) {
    var funStr = func.toString();
    funStr = funStr.replace(STRIP_COMMENTS, '');
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

/**
 * common function get logger object
 * @param params
 */
gmfw_util.getLogger = function(params) {
    var log = params[params.length - 1];
    return log;
}

/**
 * parse str to camel format
 *
 * for example:
 *    USER_ID -> userId
 *
 * @param str
 * @returns {string}
 */
gmfw_util.toCamel = function(str) {
    str = str.toLowerCase();
    return str.replace(/([\-_][a-zA-Z])/g, function($1){return $1.toUpperCase().replace(/[\-_]/g,'');});
}
