/**
 * Author: Daniel
 *
 * 在这里管理所有的oracledb连接
 */

var oracleClient = require("oracle");
var defer = require("node-promise").defer;
var poolModule = require('generic-pool');
var _ = require("underscore");

var gmfw = require('../common/gmframework');
var config = require('../conf/config');

var gmOraclePool = poolModule.Pool({
    name: 'oracle',
    create: function (callback) {
        oracleClient.connect({"tns": config.OracleDB.connStr, "user": config.OracleDB.user, "password": config.OracleDB.password}, function (err, connection) {
            callback(err, connection);
        });
    },
    destroy: function (connection) {
        connection.close();
    },
    max: 10,
    // optional. if you set this, make sure to drain() (see step 3)
    min: 2,
    // specifies how long a resource can stay idle in pool before being removed
    idleTimeoutMillis: 1000 * 60 * 60,
    // if true, logs via console.logs - can also be a function
    log: false,
    //validate connection
    validate: function (connection) {
        if (!connection.disconnected) {
            return false;
        }
        connection.execute("SELECT 1 FROM DUAL", [], function (err, results) {
            if (err) {
                console.error("Unavailable connnection,create new:", err);
                return false;
            } else {
                return true;
            }
        });
    }
});

/**
 * 执行sql语句
 * @param sql
 * @param params
 * @return
 */
exports.executeSql = function(sql, params) {
    var deferred = defer();
    params = params ? params : [];
    gmOraclePool.acquire(function(err, connection) {
        if (err) {
            deferred.reject(err);
        } else {
            connection.execute(sql, params, function(err, result) {
                if (err) {
                    deferred.reject(err);
                } else {
                    gmOraclePool.release(connection);
                    deferred.resolve(result);
                }
            });
        }
    });
    return deferred.promise;
}

/**
 * 取得序列值
 * @param seq
 * @return
 */
exports.getSequenceVal = function(seq) {
    var deferred = defer();

    var sql = 'SELECT ' + seq + '.NEXTVAL seq FROM DUAL';
    exports.executeSql(sql).then(function(result) {
        deferred.resolve(result[0].SEQ);
    }, function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
}

/**
 * 构造Oracle分页语句
 * @param pageNum
 * @param pageSize
 * @param strSql
 * @return {string}
 */
exports.buildPageSql = function(pageNum, pageSize, strSql) {
    var returnStr = "select * from ( "
        + "select row_.*, rownum rownum_ from ("
        + strSql
        + ") row_ where rownum <="
        + (parseInt(pageNum) * parseInt(pageSize))
        + ") where rownum_ >="
        + ((parseInt(pageNum) - 1)*  parseInt(pageSize) + 1);
    return returnStr;
}

/**
 * 将数组中的对象元素的所有key格式成camel格式
 * @param result
 * @return {Array}
 */
exports.allFieldsToCamel = function(result) {
    var returnRes = [];
    _.each(result, function(item) {
        var newItem = {};
        _.each(item, function(val, key) {
            newItem[gmfw.util.toCamel(key)] = val;
        });
        returnRes.push(newItem);
    });
    return returnRes;
}

/*========== Private Methods ==================================================*/