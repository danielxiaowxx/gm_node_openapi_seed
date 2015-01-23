/**
 * Author: Daniel
 */

var _ = require("underscore");
var mysql = require('mysql');
var Promise = require("bluebird");

var config = require('../conf/config');

var gmMysqlPool  = mysql.createPool({
    host: config.MysqlDB.host,
    user: config.MysqlDB.user,
    password: config.MysqlDB.password,
    database: config.MysqlDB.database
});

exports.executeSql = function(sql, params) {
    var conn;
    return Promise.promisify(gmMysqlPool.getConnection, gmMysqlPool)()
        .then(function(connection) {
            conn = connection;
            return Promise.promisify(connection.query, connection)(sql, params || []);
        })
        .then(function(result) {
            return result[0];
        })
        .finally(function() {
            if (conn) conn.release();
        });
}

/**
 * 构造Mysql分页语句
 * @param pageNum
 * @param pageSize
 * @param strSql
 * @returns {string}
 */
exports.buildPageSql = function(pageNum, pageSize, strSql) {
    var returnStr = strSql + " limit " + ((parseInt(pageNum)-1) * parseInt(pageSize)) + "," + parseInt(pageSize);
    return returnStr;
}
