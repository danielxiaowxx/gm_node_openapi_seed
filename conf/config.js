/**
 * Author: Daniel
 */

'use strict';

var CONF = module.exports;
var MongoDB = CONF.MongoDB = {};
var Server = CONF.Server = {};
var Auth = CONF.Auth = {};

/* ==== MDB配置信息 ==== */
/**
 * format: [dbname]_url
 */
MongoDB.gm_data_url = 'mongodb://192.168.88.225:27017/gm_data'; // gm_data mongodb server url

/* ==== 认证服务，主服务使用Memcached共享Session信息，这里通过去Memcached取得Session信息来判断是否已经登录 === */
Auth.required = false; // 是否需要认证，如果设置为false，则以下配置都可忽略
Auth.servers = ['192.168.86.88:11211']; // 值的所有格式参考https://github.com/3rd-Eden/node-memcached的Server locations
Auth.serverOptions = {}; // 可用配置参考https://github.com/3rd-Eden/node-memcached的Options
Auth.apiUrls = ['.*']; // 需要登录认证才能调用的API URL，可用正则表达式

Server.port = 8080;
