/**
*
*   Session object is copied in 'res.locals' by all controller which is accessible in views directly.
*   Structure of session object:
*       res.locals.session.authorized
*           {true/undefined}
*           Status of login
*       res.locals.session.team
*           {string}
*           Name of the team
*       res.locals.session.userType
*           {Normal/Admin/undefined}
*       res.locals.session.isAdmin
*           {true/false/undefined}
*           true when current user is admin
*
*
*   Standards for res.locals (only defined when needed):
*       res.local.judge.Mode
*           {Active/Disabled/LockDown/Passive/undefined}
*           Denotes mode of judge.
*       res.local.judge.Active
*           {true/false}
*           intuitive
*       res.local.judge.Passive
*           {true/false}
*           intuitive
*       res.local.judge.Lockdown
*           {true/false}
*           intuitive
*       res.local.judge.Passive
*           {true/false}
*           intuitive
*       
*
*
*
*
*
*
*
*
*

*/

var db_utils = require('../../db/db_utils.js');
var url = require('url');
var async = require('async');
var conf = require('../../conf');

exports.all = function(req, res, next){
    res.locals.mountPath = conf.mountPath;
    db_utils.getJudgeMode(function(err, judge){
        if(err) {
            return next(err);
        }
        if(judge.Lockdown && req.session.authorized && (!req.session.isAdmin)){
            req.session.destroy();
            return res.redirect(303, url.parse(req.url).pathname);
        }
        res.locals.judge = judge;
        res.locals.flash = req.session.flash;
        res.locals.session = req.session;
        req.session.prev_url = '/' + conf.mountPath + url.parse(req.url).pathname;
        delete req.session.flash;
        next();
    });
};
exports.lockdown = function(req, res, next){
    if(res.locals.judge.Lockdown){
        if(!res.locals.session.authorized  || !res.locals.session.isAdmin){
            return res.render('lockdown', {layout: 'layouts/layout'});
        }
    }
    next();
}
exports.index = function(req, res, next){
    res.render('index', {layout: 'layouts/layout'});
};
exports.register = function(req, res, next){
    if(req.session.authorized){
        return res.redirect(303, '/' + conf.mountPath);
    }
    db_utils.getGroupsList(function(err, groups){
        if(err){
            next(err);
        }
        res.locals.groups = groups;
        res.render('register', {layout: 'layouts/layout'});
    });
}
exports.teams = function(req, res, next){
    function teamVerify(callback){
        db_utils.getTeamDetails(req.params.candidTeam, function(err, teamDetails){
            if(err) {
                return callback(err);
            }
            res.locals.teamDetails = teamDetails;
            if(teamDetails){
                return callback(null);
            } else {
                return callback(new Error('NO_SUCH_TEAM'));
            }
        });
    }
    function fetchData(callback1){
        async.parallel([
            function(callback){
                //get groups
                db_utils.getGroupWithGid(res.locals.teamDetails.gid, function(err, groupname){
                    if(err){
                        return callback(err);
                    }
                    res.locals.groupname = groupname;
                    callback(null);
                });
            },
            function(callback){
                db_utils.getRankWithTid(res.locals.teamDetails.tid, function(err, rank){
                    if(err){
                        return callback(err);
                    }
                    res.locals.rank = rank;
                    callback(null);
                });
            },
            function(callback){
                db_utils.getScoreWithTid(res.locals.teamDetails.tid, function(err, score){
                    if(err){
                        return callback(err);
                    }
                    res.locals.score = score;
                    callback(null);
                });
            },
            // function(callback){
            //     db_utils.getPracticeScoreWithTid(res.locals.teamDetails.tid, function(err, practiceScore){
            //         if(err){
            //             next(err);
            //         }
            //         // console.log(practiceScore);
            //         // res.locals.practiceScore = practiceScore;
            //         // callback(null);
            //     });
            // }
            ], function(err){
                if(err){
                    return callback1(err);
                }
                callback1(null);
            });
    }
    function afterDone(err){
        if(err && err.message !== 'NO_SUCH_TEAM'){
            return next(err);
        }
        res.render('teams', {layout: 'layouts/layout'});
    }
    async.series([
        teamVerify,
        fetchData
    ], afterDone);
};

module.exports.problems = require('./problems');

















exports.notFound = require('./viewnotfound');