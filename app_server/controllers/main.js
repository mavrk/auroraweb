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
*       res.locals.isAdmin
*
*
*
*/

var db_utils = require('../../db/db_utils.js');
var url = require('url');

exports.all = function(req, res, next){
    db_utils.getJudgeMode(function(err, judgeMode){
        if(err) throw err;
        if(judgeMode == 'Lockdown' && req.authorized && res.isAdmin){
            req.session.destroy();
            return res.redirect(303, url.parse(req.url).pathname);
        }
        res.locals.flash = req.session.flash;
        res.locals.session = req.session;
        req.session.prev_url = url.parse(req.url).pathname;
        delete req.session.flash;
        next();
    });
};
exports.index = function(req, res){
    res.render('index', {layout: 'layouts/layout'});
};
exports.notFound = function(req, res){
    res.render('404', {layout: 'layouts/layout'});
}
