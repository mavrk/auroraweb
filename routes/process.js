var process = require('../app_server/controllers/process');

module.exports = function(app){
    app.use(process.all);
    app.post('/login', process.login);
    app.get('/logout', process.logout);
    app.post('/broadcast', process.broadcast);
    app.get('/broadcast', process.broadcast);
}

