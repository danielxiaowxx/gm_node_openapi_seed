/**
 * Author: Daniel
 */

'use strict';

/* imports */
var defer = require("node-promise").defer;
var gmMongo = require('./gmMongodb');
var gmOracle = require('./gmOracledb');
var gmfw = require('../common/gmframework').fw;

/**
 * 连接mongodb测试
 */
exports.mongoTest = function() {
    var deferred = defer();
    var gm_cat = gmMongo.getGMDataDB().collection('gm_cat');

    gm_cat.findOne({catId: catId}, {fields: {_id: 0, catId: 0, catType: 0, catName: 0, version: 0}}, function (err, cat) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(cat);
    });

    return deferred.promise;
}

/**
 * 连接oracle测试
 */
exports.oracleTest = function() {
    var deferred = defer();
    gmOracle.getGMOracleDBConn().execute('select count(0) count from acc$user', [], function(err, results) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(results);
    });
    return deferred.promise;
}

/*========== Private Methods ==================================================*/

