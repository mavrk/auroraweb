var db = require('./db');
var crypto = require('crypto');

customHash = function (str){
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    return md5sum.digest('hex');
}

module.exports.getJudgeMode = function(cb){
    var query = 'SELECT value from admin where variable="mode"';
    db.query(query, function(err, rows){
        if(err) cb(err);
        cb(false, rows[0].value);
    });
}

module.exports.verifyCredentials = function(teamname, password, cb){
    teamname = db.escape(teamname);
    password = db.escape(customHash(password));
    var query = 'SELECT * from teams where teamname=' + teamname + 'and pass=' + password;
    db.query(query, cb);
}