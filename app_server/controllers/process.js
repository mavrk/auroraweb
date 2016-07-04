/**
*
*   Session object is copied in 'res.locals' by all controller which is accessible in views directly.
*   Structure of session object:
*       res.locals.session.authorized
*           {true/undefined}
*           Status of login
*       res.locals.session.teamname
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
    next();
};

exports.login = function(req, res){
    db_utils.getJudgeMode(function(err, judgeMode){
        if(err) {
            throw err;
        }
        if(req.session.authorized){
            req.session.flash = {
                type : "info",
                intro: "Already logged in! ",
                message : "You are already logged in as <strong>" + req.session.teamname + ".</strong>"
            };
            return res.redirect(303, (req.session.prev_url || '/'));
        }else if((!req.body.teamname) || req.body.teamname === ''){
            req.session.flash = {
                type : "info",
                intro: "Needed! ",
                message : "Team name can not be left empty."
            };
            return res.redirect(303, (req.session.prev_url || '/'));
        } else if((!req.body.password) || req.body.password === ''){
            req.session.flash = {
                type : "info",
                intro: "Needed! ",
                message : "Password can not be left empty."
            };
            return res.redirect(303, (req.session.prev_url || '/'));
        } else {
            db_utils.verifyCredentials(req.body.teamname, req.body.password, function (err, rows, field){
                rows = rows[0];
                if(err){
                    throw err;
                }
                if(!rows){
                    req.session.flash = {
                        type : "danger",
                        intro: "Validation error! ",
                        message : "Incorrect Username/Password"
                    };
                    return res.redirect(303, (req.session.prev_url || '/'));
                } else if(judgeMode == 'Lockdown' && rows.status != 'Admin'){
                    req.session.flash = {
                        type : "info",
                        intro: "Lockdown Mode! ",
                        message : "Judge is in Lockdown mode and so no requests are being processed."
                    };
                    return res.redirect(303, (req.session.prev_url || '/'));
                } else if(rows.status != 'Admin' && rows.status != 'Normal'){
                    req.session.flash = {
                        type : "info",
                        intro: "Restricted! ",
                        message : "You can not log in as your current status is : " + rows.status
                    };
                    return res.redirect(303, (req.session.prev_url || '/'));
                } else {
                    req.session.flash = {
                        type : "success",
                        intro: "",
                        message : "Hello, " + rows.teamname
                    };
                    req.session.authorized = true;
                    req.session.teamname = rows.teamname;
                    req.session.userType = rows.status;
                    req.session.isAdmin = (rows.status == 'Admin');
                    return res.redirect(303, (req.session.prev_url || '/'));
                }
            });
        }
    });
};

exports.logout = function(req, res){
    req.session.destroy();
    return res.redirect(303, '/');
}
exports.broadcast = function(req, res){
    res.send(404);
};