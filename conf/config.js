/**
 * Author: Daniel
 */

'use strict';

var config;
var nconf = require('nconf').argv().env();

var node_env = nconf.get('NODE_ENV') || 'dev';

if ("dev" === node_env) {
    config = require('./config-dev.js');
} else if ("sit" === node_env) {
    config = require('./config-sit.js');
} else if ("uat" === node_env) {
    config = require('./config-uat.js');
} else if ("prd" === node_env) {
    config = require('./config-prd.js');
}
console.log("server environment: %s", node_env);
module.exports = config;