/**
 * Author: Daniel
 */

'use strict';

/* imports */
var defer = require("node-promise").defer;
var gmMongo = require('./gmMongodb');
var gmfw = require('../common/gmframework').fw;

/**
 * 获取gm的分类对应的关键字
 * @param catId 分类的id
 * @returns {*}
 */
exports.getGmCategoryKeywords = function(catId) {
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

/*========== Private Methods ==================================================*/

