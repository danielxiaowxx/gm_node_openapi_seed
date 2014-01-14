/**
 * Author: Daniel
 */

'use strict';

var demo = require('./demo');

exports.Routes = {
    '1.0.0': {
        'Demo': {
            'demo/sayHello': {handleFnName:'demo.sayHello', handelFn:demo.sayHello},
            'demo/getDataFromMongodb': {handleFnName:'demo.getDataFromMongodb', handelFn:demo.getDataFromMongodb},
            'demo/getDataFromOracledb': {handleFnName:'demo.getDateFromOracledb', handelFn:demo.getDateFromOracledb},
            'demo/getDateFromMysqldb': {handleFnName:'demo.getDateFromMysqldb', handelFn:demo.getDateFromMysqldb}
        }
    }
};
