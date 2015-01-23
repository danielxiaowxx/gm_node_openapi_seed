/**
 * Author: Daniel
 *
 * 在这里管理所有的mongodb连接
 */

'use strict';

/* imports */
var MongoClient = require('mongodb').MongoClient;
var Promise = require("bluebird");
var config = require('../conf/config');

/* variables */
var gmDataDB;

/**
 * 连接所有配置好的mongodb
 */
exports.connect = function() {
    MongoClient.connect(config.MongoDB.gm_data_url, function (err, db) {
        if (err) {
            console.error("Connect to MongoDB error: ", err);
        }
        gmDataDB = db;
    });
}

/**
 * 取得gm_data db对象
 * @returns {*}
 */
exports.getGMDataDB = function() {
    return gmDataDB;
}

/*========== Private Methods ==================================================*/



