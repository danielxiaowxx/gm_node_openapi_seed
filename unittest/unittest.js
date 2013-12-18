/**
 * Author: Daniel
 * 单元测试用到了nodeunit，具体的测试API方法请参考https://github.com/caolan/nodeunit#api-documentation
 * http请求用到了request，具体的请求方法请参考https://github.com/mikeal/request#convenience-methods
 */

var request = require('request');
var qs = require('querystring');
var fs = require('fs');
var reporter = require('./reporters/jsonReporter');

exports.openapi_unittest = {
    setUp: function (callback) {

        // config
        this.server = 'http://localhost:8080';

        this.httpRequest = request.defaults({
            json: true
        });

        callback();
    },
    tearDown: function (callback) {
        callback();
    },
    '1.0.0': {
        'Demo': {
            'demo/sayHello': {
                // 测试传参数
                test1: function (test) {
                    var name = 'daniel';
                    this.httpRequest.get(this.server + '/demo/sayHello?' + qs.stringify({name:name}), {}, function(error, response, body) {
                        test.ifError(error);
                        test.equal(body.result, 'Hello ' + name, JSON.stringify(body));
                        test.done();
                    });
                },
                // 测试不传参数
                test2: function(test) {
                    this.httpRequest.get(this.server + '/demo/sayHello', {}, function(error, response, body) {
                        test.ifError(error);
                        test.ok(body.error);
                        test.done();
                    });
                }
            },
            'demo/getDataFromMongodb': {
                test1: function (test) {
                    test.ok(true);
                    test.done();
                }
            },
            'demo/getDataFromOracledb': {
                test1: function(test) {
                    this.httpRequest.get(this.server + '/demo/getDataFromOracledb', {}, function(error, response, body) {
                        test.ifError(error);
                        test.equal(body.result[0]['COUNT'], 356907);
                        test.done();
                    });
                }
            }
        }
    }
}


reporter.run(['unittest/unittest.js'], {}, function(err, result) {
    fs.writeFile(process.cwd() + '/unittest/report/data/data.json', 'var TEST_DATA = ' + JSON.stringify(result), function(err) {
        if (err) throw err;
        console.log('Generate test result data successful!');
        process.exit();
    });
});
