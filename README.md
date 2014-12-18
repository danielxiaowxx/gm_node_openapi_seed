## 作者简介

Daniel.xiao，[环球市场(GlobalMarket)](http://www.globalmarket.com "让'中国制造'成为优质标志")IT研发部架构师

## 如何开始

1. 安装node (略)

2. 下载gm\_node\_openapi\_seed项目，根据实际情况更换名字，如pa\_node\_openapi
 
3. cd进入pa\_node\_openapi目录，执行**npm install**命令

4. 执行**node main.js**命令开启服务

5. 打开浏览器，输入http://127.0.0.1:8080/demo/sayHello?name=daniel，如果显示			

		{"error":false,"result":"hello daniel"}
   恭喜，openapi服务已成功运行

## javascript调用open API示例

以下为指定版本号v的示例，可以不指定版本号，默认调用最新版本的API

*1.POST or GET Call (以下使用jquery)*

	$.ajax( '/[app context]/demo/sayHello?v=1.0.0', {
	　 type: 'POST', // or 'GET'
	   data: {name: 'daniel'},
	   success: function(data) {
	     console.log(data);
	   },
	   error: function(err) {
	     console.log(err.responseText);
	   }
	});

*2.JSONP Call (以下使用jquery)* 	

	$.ajax({
	    type: 'GET',
	    url: 'http://127.0.0.1:8080/demo/sayHello?callback=?&v=1.0.0',
        data: {name: 'daniel'},
	    dataType: 'jsonp',
	    success: function(data) {
	       console.log(data);
	    }
	});

## 如何增加open API方法

在routes目录下，增加js文件以及相应的方法，并在index.js文件中注册服务即可
  
*示例：增加示例服务的sayHello方法*  
*1.增加routes/demo.js文件，增加sayHello方法*

	...
	exports.sayHello = function(name) {
	    return 'hello ' + name;
	}

*2.在inddex.js文件中注册服务*

	var demo = require('./demo'); // 注意1：变量名一定要与文件名相同

	exports.Routes = {
	    '1.0.0': {
	        'Demo': {
	            'demo/sayHello': {handleFnName:'demo.sayHello', handelFn:demo.sayHello} // 注意2：handleFnName与handelFn的值一定要相同，只是一个是字符串，一个是函数
	        }
	    }
	}

## 在API实现中如何打印日志

1. 引入gmframewordk模块

		var gmfw = require('../common/gmframework');

２. 在方法中声明log对象并调用其相应的方法

		exports.sayHello = function(name) {
		    var log = gmfw.util.getLogger(arguments);
		
		    log.info('haha');
		
		    ……
		}

## API方法注释规范

	/**
	 * [comment summary]
	 *
	 * [comment body]
	 *
	 * @param {[String|Array|Object|Number]} [param name] [param description]
	 * @return {[String|Array|Object|Number]} [return description]
	 */

注意：@**的说明必须在同一行，如以下：

*正确*：

	@param {String} name say hello to who

*错误*：

	@param {String} name 
	say hello to who
	
*举例*：

	/**
	 * Just say hello ------------------------------------- [comment summary]
	 *
	 * Examples: ------------------------------------------ [comment body]
	 *
	 *   ......
	 *
	 * @param {String} name say hello to who -------------- [@param]
	 * @return {Object} format:{name:'', message:''} ------ [@return]
	 */
	exports.sayHello = function(name) {	
	    return {name:name, message:'hello ' + name};
	}

## 单元测试

在unittest/unittest.js中按照路由的配置(routes/index.js)对各个路径进行单元测试:

1. 配置

	- 当不启动登录认证时（即config.js中的Auth.required = false），配置如下
	
		    setUp: function (callback) {
		        // config
		        this.server = 'http://localhost:8080';
		
		        this.httpRequest = request.defaults({
		            json: true
		        });
		
		        ......
		    }
	
	- 当启动登录认证时（即config.js中的Auth.required = true），配置如下
	 
		    setUp: function (callback) {
		        // config
		        this.server = 'http://local.globalmarket.com/nodeopenapi';
		
		        this.httpRequest = request.defaults({
		            json: true,
		            headers: {
		                cookie: 'JSESSIONID=3FC1C68B7BBCC87EFFE6237D22FFD180-n1;'
		            }
		        });
		
		        callback();
		    }
	
		*注意几点：*	
		1. local.globalmarket.com指向本地	
		2. 本地nignx的nodeopenapi转向localhost:8080，如下配置
		
				location ~ ^/nodeopenapi/ {
			        proxy_set_header  Host $host;
				    rewrite  /nodeopenapi(.*)$ $1 break;
				    proxy_pass http://localhost:8080;
				}

		3. 浏览器打开http://*.globalmarket.com，用账号登录，然后把登录的JSESSIONID值代换上面的值

2. 增加单元测试方法

	按照路由配置(routes/index.js)，将路径的处理部分换成测试方法，如下所示：

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
			......

	单元测试用到了nodeunit，具体的测试API方法请参考https://github.com/caolan/nodeunit#api-documentation
	
	http请求用到了request，具体的请求方法请参考https://github.com/mikeal/request#convenience-methods

3. 运行单元测试

		grunt unittest

	运行成功后，可将unittest/report/index.html拖到浏览器即可浏览 	

## 如何配置连接mongodb

db/gmMongodb.js管理所有mongodb的连接，当需要增加连接的mongodb，需要配置如下：

1. 在conf/config.js增加mongodb连接参数，如下所示   

		/* format: [dbname]_url */    
		MongoDB.demo_url = 'mongodb://192.168.88.225:27017/demo';

2. 在db/gmMongodb.js增加相关的代码    

		......
		var demoDB; // 1，增加DB对象
		......
		exports.connect = function() {
			......
			// 2.增加连接代码
		    MongoClient.connect(config.MongoDB.demo_url, function (err, db) {
		        demoDB = db;
		    });
		} 
		......
        // 3.增加取DB对象的方法
		exports.getGMDataDB = function() {
		    return demoDB;
		}

## 如何增加DAO层方法

在对应的dao文件增加方法即可，以下为示例模板

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

## 连接oracle数据库注意事项

如果是window7 64位系统，项目已经提供了编译好的node oracle module（debris/oracle.zip）,只需要解压到node_modules目录即可，然后还需要以下步骤

1. 下载oracle instant client

    这里提供window 64位的下载地址：http://www.oracle.com/technetwork/topics/winx64soft-089540.html
    下载instantclient-basic-windows.x64-12.1.0.1.0.zip和instantclient-sdk-windows.x64-12.1.0.1.0.zip
    下载完后都解压到C:\instantclient_12_1

2. 设置环境变量如下　

        OCI_INCLUDE_DIR=C:\instantclient_12_1\sdk\include
        OCI_LIB_DIR=C:\instantclient_12_1\sdk\lib\msvc\vc11
        Path=...;c:\instantclient_12_1\vc11;c:\instantclient_12_1

## 有用的gmOracleDB方法

- executeSql(sql, params)  
  作用：执行sql语句 
  
	*使用例子*：

	    var sql = 'select count(0) count from acc$user';
	    gmOracle.executeSql(sql, []).then(function(result) {
	        deferred.resolve(gmOracle.allFieldsToCamel(result));
	    }, function(err) {
	        deferred.reject(err);
	    });	

- getSequenceVal(seq)    
  作用：取得序列值  

	*使用例子*：

		var seqName = 'SQ_ACC$USER';
		gmOracledb.getSequenceVal(seqName).then(function(seq) {
			......    
		});

- buildPageSql(pageNum, pageSize, strSql)    
  作用：生成分页sql语句

	*使用例子*：

		var pageNum = 1, pageSize = 10, sql = '...';
		var pageSql = gmOracledb.buildPageSql(pageNum, pageSize, sql);

- allFieldsToCamel(result)   
  将数组中的对象元素的所有key格式成camel格式，用于处理executeSql得到的结果(得到的原始result数据里面的字段全部是大写的，所以需要转换成驼峰式的格式)

	*使用例子*：

		deferred.resolve(gmOracle.allFieldsToCamel(result));

## 有用的gmMysqldb方法 

- executeSql(sql, params)  
  作用：执行sql语句

	*使用例子*：

	    var sql = 'select count(0) count from words';
	    gmMysqldb.executeSql(sql, []).then(function(result) {
	        deferred.resolve(result);
	    }, function(err) {
	        deferred.reject(err);
	    });

- buildPageSql(pageNum, pageSize, strSql)    
  作用：生成分页sql语句

	*使用例子*：

		var pageNum = 1, pageSize = 10, sql = '...';
		var pageSql = gmMysqldb.buildPageSql(pageNum, pageSize, sql);

## 如何处理异常

当需要手动处理异常时，直接返回异常对象即可。可用restify已经定义的异常或自定义异常

*1.返回restify已经定义的异常*

	var restify = require('restify'),
		...

	exports.sayHello = function(name) {	
	    if (!name) {
	        return new restify.InvalidArgumentError('name must not be null');
	    }
	}

*2.返回自定义异常*

	var errors = require('../error/errors'),
		...

	exports.sayHello = function(name) {	
	    return new errors.OtherError('I just do not like you!');
	}
 

## 如何自定义异常对象

在error/errors.js中调用regError方法注册异常类型即可。  
 
*示例：增加异常名称为UserNotExist,statusCode为400(statusCode定义的范围最好在400-5\*\*)的自定义异常*


	gmfw.regError('UserNotExist', 400);

## 返回数据格式

正常响应示例：

	{
        result: {...} | [...] | ... // 数据类型返回什么即是什么
    }

异常响应请捕获statusCode为400～5\*\*的响应

    {"code": "...", "message":"..."}

## 如何生成API文档
	
1. 运行genAPIDoc.js文件

		grunt genDoc

2. 直接将apidoc/index.html拖到浏览器即可浏览
