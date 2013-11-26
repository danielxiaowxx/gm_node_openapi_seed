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

    // 抛restify自带异常
    if (!name)
        return new restify.InvalidArgumentError('name must not be null');

    return 'Hello ' + name;
}

/**
 * 与mongodb通讯的例子
 *
 * @param {Number} catId gm分类的id (requied)
 * @return {Object} format:{a:1, b:2}
 */
exports.getDataFromMongodb = function (catId) {
    if (!catId) {
        return new restify.InvalidArgumentError('catId is required');
    }
    return demoDao.getGmCategoryKeywords(catId);
};




