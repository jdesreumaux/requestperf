requestperf
===

A node HTTP request module logging performance & status into mongodb via mongooose

# Exemple Usage

			var requestPerf = require('requestperf');
			var options = {
				perf : {label : 'testlog'} ,
				db  : {uri : 'mongodb://localhost/requestperf', collection : 'performance' } ,
				request : { url : 'http://www.google.com'} 
			};
			requestPerf.process(options,function(err, response, body) {
				// err, response, body are equivalent to http.request module
			})			

# Exemple Storage
			{
			    "label" : "testlog",
			    "duration" : 305,
			    "statusCode" : 200,
			    "date" : ISODate("2014-11-11T13:14:28.000Z"),
			    "_id" : ObjectId("54620bb4d68e5d5104dc00fc"),
			    "__v" : 0
			}

		
Where options is a standard object with 3 attributes : 
- perf with label attribute
- db with uri and collection attributes
- request like the options object of http.request (https://github.com/mikeal/request#requestoptions-callback)


# Installation

Install via NPM

npm install requestperf
You will also need a working mongo database (2.4+) to point it to.