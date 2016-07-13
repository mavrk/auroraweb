/***
    Serve pages
        /problems
            Displays a list of problems
        /problems/problemname
            Displays a particular problem named problemname
*/
function(req, res){
    if(req.params.problemCode){
        async.series([
            fetchProblemDetails,
            fetchClars
            ],function(err){
                var re = /custom_thrown*/;
                if(!re.test(err.code)){
                    next(err);
                }
            });
        res.locals.problemCode = req.params.problemCode;
    } else {
        res.locals.problemCode = false;
    }

    function fetchProblemDetails(cb1){
        db_utils.getProblemDetails(res.locals.problemCode, req.session.isAdmin, function(err, problemDetails){
            if(err){
                return cb1(err);
            }
            res.locals.problemDetails = problemDetails;
            if(problemDetails){
                async.series([
                    function (callback){
                        problemDetails.statement = problemDetails.statement.replace(/\r\n/g, "<br />");
                        problemDetails.statement = problemDetails.statement.replace(/\n/g, "<br />");
                        problemDetails.statement = problemDetails.statement.replace(/<image \/>/g, "<img src='data:image/jpeg;base64,{{problemDetails.image}}");
                        callback(null);
                    },
                    function (callback){
                        if(problemDetails.contest === 'contest'){
                            if(req.session.authorized && req.session.isAdmin){
                                shouldHaveAccess = true;
                                callback(null);
                            } else {
                                db_utils.isContestStarted(problemDetails.pgroup, function(err, isit){
                                    if(err){
                                        return callback(err);
                                    }
                                    res.locals.isContestStarted = isit;
                                    callback(null);
                                });
                            }
                        } else {
                            res.locals.shouldHaveAccess = true;
                            callback(null);
                        }
                    }
                ], function(err){

                })
            }
        }
    }

    if(res.locals.problemCode){
        db_utils.getProblemDetails(res.locals.problemCode, req.session.isAdmin, function(err, problemDetails){
            if(err){
                return next(err);
            }
            res.locals.problemDetails = problemDetails;
            if(problemDetails){
                async.series([
                    function (callback){
                        problemDetails.statement = problemDetails.statement.replace(/\r\n/g, "<br />");
                        problemDetails.statement = problemDetails.statement.replace(/\n/g, "<br />");
                        problemDetails.statement = problemDetails.statement.replace(/<image \/>/g, "<img src='data:image/jpeg;base64,{{problemDetails.image}}");
                        callback(null);
                    },
                    function (callback){
                        if(problemDetails.contest === 'contest'){
                            if(req.session.authorized && req.session.isAdmin){
                                shouldHaveAccess = true;
                                callback(null);
                            } else {
                                db_utils.isContestStarted(problemDetails.pgroup, function(err, isit){
                                    if(err){
                                        return callback(err);
                                    }
                                    res.locals.isContestStarted = isit;
                                    callback(null);
                                });
                            }
                        } else {
                            res.locals.shouldHaveAccess = true;
                            callback(null);
                        }
                    },
                    function (callback){
                        if(res.locals.shouldHaveAccess){
                            db_utils.getClarsForPid(problemDetails.pid, function(err, clars){
                                if(err){
                                    callback(err);
                                }
                                async.series([
                                    function(callback){
                                        for(var i = 0;i < clars.length;++i){
                                            clars[i].query = clars[i].query.replace(/\r\n/g, " ");
                                            clars[i].query = clars[i].query.replace(/\n/g, " ");

                                            clars[i].reply = clars[i].reply.replace(/\r\n/g, " ");
                                            clars[i].reply = clars[i].reply.replace(/\n/g, " ");
                                        }
                                        callback(null);
                                    }
                                    ], function(err){
                                        if(err){
                                            return callback(err);
                                        }
                                        res.locals.clars = clars;
                                        console.log(res.locals);
                                        callback(null);
                                    });
                            });
                        } else {
                            callback(null);
                        }
                    }], function (err){
                        if(err){
                            return next(err);
                        }
                        res.render('problems', {layout: 'layouts/layout'});
                    });
            } else {
                res.render('problems', {layout: 'layouts/layout'});
            }
        });
    } else {
        res.render('problems', {layout: 'layouts/layout'});
    }
};
