var db = require('./db');
var crypto = require('crypto');
var async = require('async');

function customHash(str){
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    return md5sum.digest('hex');
}
module.exports.customHash = customHash;

/**
*   Escapes some special characters and quotify the string.
*/
function customEscape(str){
    return db.escape(str);
}
module.exports.customEscape = customEscape;


module.exports.getJudgeMode = function(cb){
    var query = 'SELECT value from admin where variable="mode"';
    db.query(query, function(err, rows){
        if(err) cb(err);
        var mode = rows[0].value;
        var judge = {};
        judge.Mode = mode;
        judge.Active = (judge.Mode == 'Active');
        judge.Passive = (judge.Mode == 'Passive');
        judge.Disabled = (judge.Mode == 'Disabled');
        judge.Lockdown = (judge.Mode == 'Lockdown');
        cb(false, judge);
    });
};

module.exports.verifyCredentials = function(teamname, password, cb){
    teamname = customEscape(teamname);
    password = customHash(customEscape(password));
    var query = 'SELECT * from teams where teamname=' + teamname + 'and pass=' + password;
    db.query(query, cb);
};

module.exports.getGroupsList = function(cb){
    // var query = 'SELECT * from groups';
    // db.query(query, function(err, rows){
    //     if(err){
    //         return cb(err);
    //     }
    //     async.series([
    //         function(callback){
    //             var groups = [];
    //             for(var i = 0;i < rows.length;++i){
    //                 groups.push({gid: rows[i].gid, groupname: rows[i].groupname});
    //             }
    //             callback(null, groups);
    //         }
    //     ],function(err, results){
    //         console.log('Calling back with');
    //         console.log(results[0]);
    //         cb(null, results[0]);
    //     });
    // });
    var query = 'SELECT gid, groupname from groups';
    db.query(query, function(err, rows){
        if(err){
            return cb(err);
        }
        cb(null, rows);
    });
};

module.exports.getTeamDetails = function(teamname, cb){
    teamname = customEscape(teamname);
    var query = 'SELECT * from teams where teamname=' + teamname;
    db.query(query, function(err, rows, fields){
        if(rows == []){
            cb(null, null);
        } else cb(null, rows[0]);
    });
};

module.exports.registerTeam = function(reg, cb){
    if(!reg.hasOwnProperty){
        reg.hasOwnProperty = Object.hasOwnProperty;
    }
    async.series([
    function(callback){
        for(var key in reg){
            if(reg.hasOwnProperty(key)){
                reg[key] = customEscape(reg[key]);
            }
        }
        callback(null);
    },
    function(callback){
        reg.password = customHash(reg.password.slice(1, -1));
        callback(null);
    }
    ], afterEscaped);
    function afterEscaped(err){
        if(err){
            cb(err);
        }
        var query = 'INSERT into teams' +
                    '(teamname, pass, status, name1, roll1, branch1, email1, phone1, name2, roll2, branch2, email2, phone2, name3, roll3, branch3, email3, phone3, score, penalty, gid)' +
                         'values (' + reg.teamname + ', "' + reg.password + '", ' + '"Normal"' + ', ' + reg.name1 + ', ' + reg.roll1 + ', ' + reg.branch1 + ', ' + reg.email1 + ', ' + reg.phno1 + ', ' + reg.name2 + ', ' + reg.roll2 + ', ' + reg.branch2 + ', ' + reg.email2 + ', ' + reg.phno2 + ', ' + reg.name3 + ', ' + reg.roll3 + ', ' + reg.branch3 + ', ' + reg.email3 + ', ' + reg.phno3 + ', ' + '"0"' + ', ' + '"0"' + 
                         ", " + reg.group + ')';
        db.query(query, function(err, rows, fields){
            return cb(err);
            var success = false;
            var query = 'SELECT * from teams where teamname=' + reg.teamname;
            db.query(query, function(err, rows, fields){
                if(err) {
                    cb(err);
                }
                if(rows.length == 1){
                    success = true;
                }
                cb(null, success);
            });
        });
    }
};