/***
    Serve pages
        /problems
            Displays a list of problems
        /problems/problemname
            Displays a particular problem named problemname
*/
'use strict';
var async = require('async');
var db_utils = require('../../db/db_utils.js');
module.exports = function (req, res, next) {
    function fetchProblemDetails(cb1) {
        db_utils.getProblemDetails(req.params.problemCode, req.session.isAdmin, function (err, problemDetails) {
            if (err) {
                return cb1(err);
            }
            res.locals.problemDetails = problemDetails;
            if (problemDetails) {
                async.parallel([
                    function (callback) {
                        problemDetails.statement = problemDetails.statement.replace(/\r\n/g, "<br />");
                        problemDetails.statement = problemDetails.statement.replace(/\n/g, "<br />");
                        problemDetails.statement = problemDetails.statement.replace(/<image \/>/g, "<img src='data:image/jpeg;base64,{{problemDetails.image}}");
                        callback(null);
                    },
                    function (callback) {
                        if (problemDetails.contest === 'contest') {
                            if (req.session.authorized && req.session.isAdmin) {
                                res.locals.shouldHaveAccess = true;
                                callback(null);
                            } else {
                                db_utils.isContestStarted(problemDetails.pgroup, function (err, isit) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    res.locals.isContestStarted = isit;
									res.locals.shouldHaveAccess = isit;
                                    callback(null);
                                });
                            }
                        } else {
                            res.locals.shouldHaveAccess = true;
                            callback(null);
                        }
                    }
                ], function (err) {
					if (err) {
						return next(err);
					}
					cb1(null);
                });
            } else {
				cb1(null);
			}
        });
    }
    function fetchClars(cb) {
		if (res.locals.problemDetails && res.locals.shouldHaveAccess) {
			db_utils.getClarsForPid(res.locals.problemDetails.pid, function (err, clars) {
				if (err) {
					return cb(err);
				}
				async.series([
					function (callback) {
						var i;
						for (i = 0; i < clars.length; i += 1) {
							clars[i].query = clars[i].query.replace(/\r\n/g, " ");
							clars[i].query = clars[i].query.replace(/\n/g, " ");
							if(clars[i].reply){
								clars[i].reply = clars[i].reply.replace(/\r\n/g, " ");
								clars[i].reply = clars[i].reply.replace(/\n/g, " ");
							}
						}
						callback(null);
					}
				], function (err) {
					if (err) {
						return cb(err);
					}
					res.locals.clars = clars;
					console.log('Printing clars');
					console.log(res.locals.clars);
					cb(null);
				});
			});
		} else {
			cb(null);
		}
	}
	
	if (req.params.problemCode) {
        async.series([
            fetchProblemDetails,
            fetchClars
		], function (err) {
			var re = /custom_thrown*/;
			if (err && !re.test(err.code)) {
				return next(err);
			}
			res.locals.problemCode = req.params.problemCode;
			console.log(res.locals);
			res.render('problems', {layout: 'layouts/layout'});
		});
    } else {
        res.locals.problemCode = false;
		async.series([
			function (callback) {
				db_utils.getAllProblems(req.session.authorized, req.session.isAdmin, req.session.tid, function (err, problemList) {
					if (err) {
						return callback(err);
					}
					res.locals.problemList = problemList;
					callback(null);
				});
			},
			function (callback) {
				var i;
				var lastpgroup = "";
				for (i = 0; i < res.locals.problemList.length; i += 1) {
					if (lastpgroup !== res.locals.problemList[i].pgroup) {
						res.locals.problemList[i].needHeader = true;
					} else {
						res.locals.problemList[i].needHeader = false;
					}
					lastpgroup = res.locals.problemList[i].pgroup;
					if (i === res.locals.problemList.length - 1) {
						return callback(null);
					}
				}
			}
		], function (err) {
			if (err) {
				return next(err);
			}
			res.render('problems', {layout: 'layouts/layout'});
		});
    }
};