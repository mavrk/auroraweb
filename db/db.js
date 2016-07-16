var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 100,
    host: '127.0.0.1',
    user: 'root',
    password: 'simple',
    database: 'aurora_main',
    port: '3306'
});

function query(query, cb){
    pool.getConnection(function(err, connection){
        if(err){
            return cb(err);
        }
        console.log(connection.query(query, cb).sql);
        connection.release();
    });
}

module.exports.query = query;
module.exports.escape = mysql.escape;