/**
 * Author: Daniel
 */

'use strict';

/**
 * imports
 */
var restify = require('restify');
var errors = require('../error/errors');
var gmfw = require('../common/gmframework');
var demoDao = require('../db/demoDao');
var request = require('request');


/**
 * Just say hello
 *
 * Examples:
 *
 *   ......
 *
 * @param {String} name say hello to who
 * @return {String}
 */
exports.sayHello = function(name) {
    // 打印日志
    var log = gmfw.util.getLogger(arguments);
    log.info('hello daniel');

    // 取得客户端cookie
    var reqCookie = gmfw.util.getReqCookie(arguments);
    console.log('cookie:', reqCookie);

    // 抛restify自带异常
    if (!name)
        return new restify.InvalidArgumentError('name must not be null');

    return 'Hello ' + name;
}

/**
 * 与mongodb通讯的例子
 *
 * @return {Object} data demo: {a:1, b:2}
 */
exports.getDataFromMongodb = function () {
    return demoDao.mongoTest();
};

/**
 * 与oracle通讯的例子
 *
 * @return {Object} data demo: {a:1, b:2}
 */
exports.getDateFromOracledb = function() {
    return demoDao.oracleTest();
}

/**
 * 与mysql通讯的例子
 *
 * @return {Object} data demo: {a:1, b:2}
 */
exports.getDateFromMysqldb = function() {
    return demoDao.mysqlTest();
}




