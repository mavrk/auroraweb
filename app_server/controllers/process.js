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
*       res.locals.session.isAdmin
*			{true/false/undefined}
*		res.locals.session.tid
*			{{tid of current user}}
*/

var db_utils = require('../../db/db_utils.js');
var url = require('url');
var conf = require('../../conf');

exports.all = function(req, res, next){
    next();
};

exports.login = function(req, res, next){

    db_utils.getJudgeMode(function(err, judge){
        if(err) {
            return next(err);
        }
        if(req.session.authorized){
            req.session.flash = {
                type : "info",
                intro: "Already logged in! ",
                message : "You are already logged in as <strong>" + req.session.teamname + ".</strong>"
            };
            return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
        }else if((!req.body.teamname) || req.body.teamname === ''){
            req.session.flash = {
                type : "info",
                intro: "Needed! ",
                message : "Team name can not be left empty."
            };
            return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
        } else if((!req.body.password) || req.body.password === ''){
            req.session.flash = {
                type : "info",
                intro: "Needed! ",
                message : "Password can not be left empty."
            };
            return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
        } else {
            db_utils.verifyCredentials(req.body.teamname, req.body.password, function (err, rows, field){
                if(err){
                    return next(err);
                }
                rows = rows[0];
                if(!rows){
                    console.log('Invalid');
                    req.session.flash = {
                        type : "danger",
                        intro: "Validation error! ",
                        message : "Incorrect Username/Password"
                    };
                    return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
                } else if(judge.Lockdown && rows.status != 'Admin'){
                    console.log('Lockdown');
                    req.session.flash = {
                        type : "info",
                        intro: "Lockdown Mode! ",
                        message : "Judge is in Lockdown mode and so no requests are being processed."
                    };
                    return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
                } else if(rows.status != 'Admin' && rows.status != 'Normal'){
                    console.log('restricted');
                    req.session.flash = {
                        type : "info",
                        intro: "Restricted! ",
                        message : "You can not log in as your current status is : " + rows.status
                    };
                    return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
                } else {
                    console.log('success');
                    req.session.flash = {
                        type : "success",
                        intro: "",
                        message : "Hello, " + rows.teamname
                    };
                    req.session.authorized = true;
                    req.session.teamname = rows.teamname;
                    req.session.userType = rows.status;
                    req.session.isAdmin = (rows.status == 'Admin');
					req.session.tid = rows.tid;
                    return res.redirect(303, (req.session.prev_url || '/' + conf.mountPath));
                }
            });
        }
    });
};

exports.logout = function(req, res, next){
    req.session.destroy();
    return res.redirect(303, '/' + conf.mountPath);
};

exports.register = function(req, res, next){
    /***
    *   Server side validation checking levels:
    *       1. Validate if satisfiable data is sent.
    *       2. Validate for teamname constraints
    *       3. Validate password and repassword equality
    *       4. Check if team already registered
    *       5. Success and verify success
    *
    */
    var reg = req.body;
    
    if(!(reg.teamname && reg.teamname !== "" && reg.password && reg.password !== "" && reg.repassword && reg.repassword !== "" && reg.name1 && reg.name1 !== "" && reg.roll1 && reg.roll1 !== "" && reg.branch1 && reg.branch1 !== "" && reg.email1 && reg.email1 !== "" && reg.phno1 && reg.phno1 !== "")){

        req.session.flash = {
            type : "info",
            intro: "",
            message : "Not enough information provided to process the registration."
        };
        return res.redirect(303, '/' + conf.mountPath + '/register');
    }
    if(!(/^[a-zA-Z0-9_@]+$/.test(reg.teamname))){
        req.session.flash = {
            type : "info",
            intro: "",
            message : "Team name should contain only alphabets numbers @ and _."
        };
        return res.redirect(303, '/' + conf.mountPath + '/register');
    }
    if(db_utils.customEscape(reg.password) !== db_utils.customEscape(reg.repassword)){
        req.session.flash = {
            type : "info",
            intro: "",
            message : "Password mismatch."
        };
        return res.redirect(303, '/' + conf.mountPath + '/register');
    }
    db_utils.getTeamDetails(reg.teamname, function(err, teamDetails){
        if(err) next(err);
        if(teamDetails){
            req.session.flash = {
                type : "info",
                intro: "",
                message : "Teamname already registered."
            };
            return res.redirect(303, '/' + conf.mountPath + '/register');
        } else {
            db_utils.registerTeam(reg, function(err, success){
                if(err){
                    next(err);
                }
                if(success){
                    req.session.flash = {
                        type : "success",
                        intro: "Success! ",
                        message : "Teamname already registered."
                    };
                    return res.redirect(303, '/' + conf.mountPath + 'register');
                } else {
                    req.session.flash = {
                        type : "error",
                        intro: "Error! ",
                        message : "Some error occured. Try again. If the problem continues contact admin."
                    };
                    return res.redirect(303, '/' + conf.mountPath + 'register');
                }
            });
        }
    });
};
exports.broadcast = function(req, res, next){
    res.send(404);
};
exports.lastCall = function(req, res){
    //Change it to no such page found error code
    res.sendStatus(404);
}