/**
 * Author: Daniel
 *
 * 在这里管理所有的oracledb连接
 */

var oracleClient = require("oracle");
var config = require('../conf/config');

/* variables */
var gmOracleDBConn;

/**
 * 连接所有配置好的oracledb
 */
exports.connect = function() {
    oracleClient.connect({"tns": config.OracleDB.connStr, "user": config.OracleDB.user, "password": config.OracleDB.password}, function (err, connection) {
        if (err) {
            console.log(err);
        } else {
            gmOracleDBConn = connection;
        }
    });
}

/**
 * 取得gmOracleDBConn对象
 * @returns {*}
 */
exports.getGMOracleDBConn = function() {
    return gmOracleDBConn;
}

/*========== Private Methods ==================================================*/




