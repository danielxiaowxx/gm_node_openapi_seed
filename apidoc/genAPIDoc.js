/**
 * Author: Daniel
 */

var _ = require("underscore");
var dox = require('dox');
var fs = require('fs');
var all = require('node-promise').all;
var defer = require('node-promise').defer;

var routes = require('../routes').Routes;

var routeDirPath = process.cwd() + '/routes';


/**
 * 取得所有routes目录下的js文件（除index.js外）的注释信息（JSON格式）
 */
function getAllDoxData() {
    var deferred = defer();
    fs.readdir(routeDirPath, function(err, files) {
        var promises = [];
        files.forEach(function(file) {
            if (file != 'index.js') {
                promises.push(parseDox(routeDirPath + '/' +  file));
            }
        });

        all(promises).then(function(datas) {
            var allDoxData = {};
            datas.forEach(function(data) {
                allDoxData[data.service] = allDoxData[data.service] || {};
                for (var i = 0, leng = data.dox.length; i < leng; i++) {
                    var commentItem = data.dox[i];
                    var displayItem = {};
                    if (commentItem.ctx && commentItem.ctx.receiver == 'exports') { // 暴露的API
                        commentItem.tags.forEach(function(tag) {
                            if (tag.type == 'return' || tag.type == 'returns') {
                                displayItem.returnVal = {type:tag.types[0], desc:tag.description};
                            } else if (tag.type == 'param') {
                                displayItem.paramVals = displayItem.paramVals || [];
                                displayItem.paramVals.push({type:tag.types[0], name:tag.name, desc:tag.description});
                            }
                        });
                        displayItem.commentSummary = commentItem.description.summary;
                        displayItem.commentBody = commentItem.description.body;
                        displayItem.name = commentItem.ctx.name;

                        allDoxData[data.service][displayItem.name] = displayItem;
                    }
                }
            });

            deferred.resolve(allDoxData);
        });
    });

    return deferred.promise;
}


/**
 * 通过dox解析出文件的注释信息
 * @param filePath
 * @returns {*}
 */
function parseDox(filePath) {
    var deferred = defer();
    fs.readFile(filePath, function(err, data) {
        if (err) {
            deferred.reject();
        }
        else {
            var doxObj = dox.parseComments(data.toString(), { raw: true });
            deferred.resolve({service:filePath.match(/(\w+)\.js$/)[1], dox:doxObj});
        }
    });
    return deferred.promise;
}

/**
 * 生成API文档需要的JSON数据
 */
function genAPIDoc() {
    getAllDoxData().then(function(allDoxData) {
        var docData = _.clone(routes);
        _.each(docData, function (services, version) {
            _.each(services, function (handlers, service) {
                _.each(handlers, function (handleFn, path) {
                    var handleFnInfo = handleFn['handleFnName'].split('.');
                    docData[version][service][path] = allDoxData[handleFnInfo[0]][handleFnInfo[1]]
                });
            });
        });

        fs.writeFile(process.cwd() + '/apidoc/data/data.json', 'var API_DATA = ' + JSON.stringify(docData), function(err) {
            if (err) throw err;
            console.log('Generate api doc data successful!');
            process.exit();
        });
    });
}

genAPIDoc();
