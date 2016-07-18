'use strict';
var async = require('async');
var db_utils = require('../../db/db_utils.js');
module.exports = function (req, res, next) {
	function verifyProblemCode(callback) {
		if(req.params.problemCode){
			db_utils.getProblemDetails(req.params.problemCode, req.session.isAdmin, function (err, problemDetails) {
				if (err) {
					return callback(err);
				}
				if (problemDetails) {
					res.locals.pid = problemDetails.pid;
					res.locals.problemCode = problemDetails.code;
					return callback(null);
				} else {
					var newerr = new Error();
					newerr.custom_code = 'INVALID_PROBLEM_CODE';
					return callback(newerr);
				}
			});
		} else {
			return callback(null);
		}
	}
	function verifyTeamName(callback) {
		if (req.params.teamname) {
			db_utils.getTeamDetails(req.params.teamname, function (err, teamDetails) {
				if (err) {
					return callback(err);
				}
				if (teamDetails) {
					res.locals.tid = teamDetails.tid;
					res.locals.teamname = teamDetails.teamname;
					return callback(null);
				} else {
					var newerr = new Error();
					newerr.custom_code = 'INVALID_TEAM_CODE';
					return callback(newerr);
				}
			});
		} else {
			return callback(null);
		}
	}
	function getContent(callback){
		var page = ((req.query.page)?req.query.page:1);
		res.locals.page = Number(page);
		res.locals.prevpage = res.locals.page - 1;
		res.locals.nextpage = res.locals.page + 1;
		db_utils.getPaginatedSubs(req.session.isAdmin, res.locals.pid, res.locals.tid, req.query.filter, page, 25, function (err, count, rows) {
			if (err) {
				return callback(err);
			}
			res.locals.count = count;
			res.locals.subsList = rows;
			res.locals.noofpages = Math.floor((count + 25 - 1)/25);
			if(res.locals.page - 5 > 0){
				res.locals.start = res.locals.page - 5;
			} else {
				res.locals.start = 1;
			}
			if(res.locals.noofpages > res.locals.start + 10){
				res.locals.end = res.locals.start + 10;
			} else res.locals.end = res.locals.noofpages;
			callback(null);
		});
	}
	if(req.params.teamname){
		res.locals.mysubs = true;
	} else if (req.params.problemCode){
		res.locals.allsubs = true;
	}  else {
		res.locals.totalsubs = true;
	}
	async.series([
		verifyProblemCode,
		verifyTeamName,
		getContent
	], function (err) {
		if (err && err.custom_code) {
			return res.render('invalidurl', {layout: 'layouts/layout'});
		} else if(err) {
			return next(err);
		} else {
			res.locals.resopts = [{opt: 'AC'}, {opt: 'RTE'}, {opt: 'WA'}, {opt: 'TLE'}, {opt: 'CE'}, {opt: 'DQ'}, {opt: 'PE'}];
//			console.log(res.locals.start);
//			console.log(res.locals.end);
			return res.render('status', {layout: 'layouts/layout'});
		}
	});
};