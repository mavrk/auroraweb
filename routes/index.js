var express = require('express');
var router = express.Router();
var conf = require('../conf');

module.exports = function (app){
    require('./process')(router);
    require('./main')(router);





    app.use('/' + conf.mountPath, router);
}
// require('./process')(router);
// require('./main')(router);

// module.exports = function(app){
//     require('./process')(app);
//     require('./main')(app);
// }