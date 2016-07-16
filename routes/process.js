'use strict';
var process = require('../app_server/controllers/process');

module.exports = function (router) {
    router.use('/process', process.all);
    router.post('/process/login', process.login);
    router.get('/process/logout', process.logout);
    router.post('/process/register', process.register);
    router.post('/process/broadcast', process.broadcast);
    router.get('/process/broadcast', process.broadcast);
    router.use('/process', process.lastCall);
};