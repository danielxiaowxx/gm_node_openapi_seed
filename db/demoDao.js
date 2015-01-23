/**
 * Author: Daniel
 */

'use strict';

/* imports */
var Promise = require("bluebird");
var gmMongo = require('./gmMongodb');
var gmOracle = require('./gmOracledb');
var gmMysql = require('./gmMysqldb');

/**
 * 连接mongodb测试
 */
exports.mongoTest = function() {
    var collection = gmMongo.getGMDataDB().collection('m_landing_page');
    return Promise.promisify(collection.findOne, collection)({channelType: 'lighting'})
        .then(function(data) { // 可对数据进行加工
            //如果有异常可直接抛出 throw new restify.InvalidArgumentError('name must not be null');
            return data.data;
        });
}

/**
 * 连接oracle测试
 */
exports.oracleTest = function() {
    var sql = 'select * from acc$user';
    sql = gmOracle.buildPageSql(1, 10, sql);
    return gmOracle.executeSql(sql, [])
        .then(function(result) {
            return gmOracle.allFieldsToCamel(result);
        });
}

/**
 * 连接Mysql测试
 */
exports.mysqlTest = function() {
    var sql = 'select * from sales_order';
    sql = gmMysql.buildPageSql(1, 10, sql);
    return gmMysql.executeSql(sql, []);
}

/*========== Private Methods ==================================================*/

