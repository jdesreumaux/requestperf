'use strict'

var expect = require('chai').expect;
var should = require('chai').should();
var mongoose = require('mongoose');
var lib = require('../lib/requestperf');

describe('#requestperf' , function() {
	var options = {
		perf : {label : 'testlog'} ,
		request : {} ,
		db  : {uri : 'mongodb://localhost/requestperf', collection : 'performance' } 
	};

	describe('process()' , function() {

		it('should return a 200 code', function(done) {
			options.request.url = 'http://google.com';
			lib.process(options,function(err, response, body) {
				expect(response.statusCode).equal(200);
				done();
			})	
		})
		
		it('should have stored a mongodb document', function(done) {
			var perfModel = mongoose.model(options.db.collection);
			perfModel.findOne({label : options.perf.label }, function(err, doc) {
				should.not.exist(err, 'err is ' + err);
				should.exist(doc);
				expect(doc).to.have.property('_id');
				done();
			})
		})
	})
	describe('process() #errors' , function() {
		it('should return a Error: getaddrinfo ENOTFOUND', function(done) {
			console.log('should return a Error: getaddrinfo ENOTFOUND');
			options.request.url = 'http://urldoesnotexist.com';
			 lib.process(options,function(err, response, body) {
			 	expect(err.code.toString()).equal('ENOTFOUND');
			 	done();
			 })
		})
		it('should return a 404 http code', function(done1) {
			options.request.url = 'http://www.google.com/erreur404';
			lib.process(options,function(err, response, body) {
				expect(response.statusCode).equal(404);
				done1();
			})
		})
		it('should have stored a mongodb document with 404 status', function(done2) {
			var perfModel = mongoose.model(options.db.collection);
			perfModel.findOne({label : options.perf.label, statusCode : 404 }, function(err, doc) {
				should.not.exist(err, 'err is ' + err);
				should.exist(doc);
				expect(doc).to.have.property('_id');
				done2();
			})
		})
	})

})