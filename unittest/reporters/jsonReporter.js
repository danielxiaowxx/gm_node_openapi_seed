/*!
 * Nodeunit
 * Copyright (c) 2013 Daniel.xiao
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var nodeunit = require('nodeunit'),
    utils = require('nodeunit').utils,
    fs = require('fs'),
    path = require('path'),
    AssertionError = require('assert').AssertionError;

/**
 * Reporter info string
 */

exports.info = "Report tests result as JSON";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

exports.run = function (files, options, callback) {

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.join(process.cwd(), p);
    });
    var result = {};
    var moduleStart;
    var currentModule;

    nodeunit.runFiles(paths, {
        moduleStart: function (name) {
            moduleStart = new Date().getTime();
            currentModule = name;
            result.detail = {};
            result.detail[currentModule] = {detail:{}, summary:{}};
        },
        testDone: function (name, assertions) {
            if (!assertions.failures()) {
                var curObj = result.detail[currentModule].detail;
                name.forEach(function(path) {
                    path = path.trim();
                    if (!curObj[path]) {
                        curObj[path] = {};
                    }
                    curObj = curObj[path];
                });
                curObj['pass'] = true;
            }
            else {
                var curObj = result.detail[currentModule].detail;
                name.forEach(function(path) {
                    path = path.trim();
                    if (!curObj[path]) {
                        curObj[path] = {};
                    }
                    curObj = curObj[path];
                });
                curObj['pass'] = false;
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError && a.message) {
                            curObj['assertionMessage'] = a.message;
                        }
                        curObj['stackMessage'] = a.error.stack;
                    }
                });
            }
        },
        moduleDone: function (name, assertions) {
            var end = new Date().getTime();
            var duration = end - moduleStart;
            if (assertions.failures()) {
                result.detail[currentModule].summary = {ok:false, failures:assertions.failures(), total:assertions.length, duration:assertions.duration};
            }
            else {
                result.detail[currentModule].summary = {ok:true, total:assertions.length, duration:assertions.duration};
            }
        },
        done: function (assertions) {
            var end = new Date().getTime();
            var duration = end - start;
            if (assertions.failures()) {
                result.summary = {ok:false, failures:assertions.failures(), total:assertions.length, duration:assertions.duration};
            }
            else {
                result.summary = {ok:true, total:assertions.length, duration:assertions.duration};
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined, result);
        }
    });
};

