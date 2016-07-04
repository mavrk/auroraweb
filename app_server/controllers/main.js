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

exports.all = function(req, res, next){
    db_utils.getJudgeMode(function(err, judge){
        if(err) next(err);
        if(judge.Lockdown && req.session.authorized && (!req.session.isAdmin)){
            req.session.destroy();
            return res.redirect(303, url.parse(req.url).pathname);
        }
        res.locals.judge = judge;
        res.locals.flash = req.session.flash;
        res.locals.session = req.session;
        req.session.prev_url = url.parse(req.url).pathname;
        delete req.session.flash;
        next();
    });
};
exports.index = function(req, res, next){
    res.render('index', {layout: 'layouts/layout'});
};
exports.register = function(req, res, next){
    if(req.session.authorized){
        return res.redirect(303, '/');
    }
    db_utils.getGroupsList(function(err, groups){
        if(err){
            next(err);
        }
        res.locals.groups = groups;
        res.render('register', {layout: 'layouts/layout'});
    });
}























exports.notFound = function(req, res, next){
    res.render('404', {layout: 'layouts/layout'});
}