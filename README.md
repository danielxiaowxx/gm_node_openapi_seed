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
 
*示例：增加异常名称为UserNotExist,errorCode为100002的自定义异常*
    
	gmfw.regError('UserNotExist', 100002);

## 返回数据格式

正常响应示例：

	{
        error: false,
        result: {...} | [...] | ... // 数据类型返回什么即是什么
    }

异常响应示例： 

	{
        error: true,
        code: '10002',
        name: 'OtherError',
        message: 'I just do not like you!'
    }

## 如何生成API文档
	
1. 运行genAPIDoc.js文件

		node genAPIDoc.js

2. 运行http服务器，root目录指向apidoc目录。以下为nginx作为服务器的配置

		location ~ ^/nodeopenapidoc/ {
		    rewrite  /nodeopenapidoc(.*)$ $1 break;
		    root [nodeopenapi project path]/apidoc;
		}

打开浏览器访问http://localhost/nodeopenapidoc/index.html
