'use strict'

var async = require('async'),
request  = require('request'),
mongoose = require('mongoose'),
moment   = require('moment'),
_  		 = require('underscore');

// Mongoose model used to store performance logs
var model  ;
// options is a hash with properties perf, db and request equivalent to http.request (https://github.com/mikeal/request#requestoptions-callback) 
var options ;

// ### function init (options,cb)
// sanitize options and call database init
// #### @callback {function} Continuation to respond to when complete//
//
var init = function(cb){
	options.perf.label 		 = options.perf.label 		 || 'defaultLabel';
	options.db.collection    = options.db.collection 	 || 'performance';
	if (options.db.uri === undefined) {
		throw new Error('Cannot log to MongoDB without database uri.');
	}
	database(cb);
}

//
// ### function _database ()
// Configuration method to connect to mongodb instace via mongoose
// @callback(function)
//
var database = function(cb) {
	var uri 			     = options.db.uri; 
	// Register model for performance if not any
	// check if mongoose not already connected
	if (mongoose.connection.readyState === 0) 
		mongoose.connect(uri);
	else cb();
	//mongoose.set('debug', true);
	// check if collection already exists
	
	mongoose.connection.on('connected', function() {
		var isCollectionPerfAlreadyExists = _.some(mongoose.connection.collections, function(col){
			return col.name == options.db.collection +"s"; //FIXME trouver fonction pluriel du paramètre passé
		})

	//	//console.log("isCollectionPerfAlreadyExists " + isCollectionPerfAlreadyExists);
	if (!isCollectionPerfAlreadyExists) {
		var perfSchema = new mongoose.Schema({
			label : String,
			statusCode : Number,
			duration : { type : Number}, 
			date : { type: Date	}
		});
		model = mongoose.model(options.db.collection , perfSchema);
	}
	else model = mongoose.model(options.db.collection);
	cb();
})	
}

//
// ### function process (callback)
// #### @callback {function} Continuation to respond to when complete.
// Core method to process the request and log into mongodb the duration time
//

var process = function(opts, callback) {
	////console.log("process with options " + JSON.stringify(options));

	options = opts;
	async.waterfall([
		function initialization(cb) {
			init(cb);
		},
		function getTime(cb) {
			var start_time = moment();
			cb(null, start_time);		
		},
		function makeRequest(start_time, cb) {
			//console.log("makeRequest " + JSON.stringify(options.request));
			request(options.request, function (err, response, body){
				var duration = moment().diff(start_time, 'milliseconds');
				//console.log("makeRequest request cb  "+ err + " " + response +" " + body);
				if (err) 
					cb(err, response, body);
				else cb(null, start_time, duration, err, response, body);
			})
		},
		function makeLog(start_time, duration, err, response, body, cb) {
			//console.log("makeLog");
			log(start_time, duration, response.statusCode , function(errLog, doc ) {
				cb(err, response, body)
			});
		}
	], function(err, response, body){
		//console.log("final callback with " + err + " " + response +" " + body);
		callback(err, response, body);
	});

}

var log = function( start_time, duration, statusCode, cb) {
	////console.log('log requestperf');
	var x = new model({label: options.perf.label, duration: duration,statusCode: statusCode, date :  start_time});
	x.save(cb);
}

module.exports = 
{
	process : process
}
