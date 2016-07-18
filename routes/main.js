'use strict';
var ctrl = require('../app_server/controllers/main');

module.exports = function (router) {
	router.use(ctrl.all);
	router.use(ctrl.lockdown);
	router.get('/', ctrl.index);
	router.get('/register', ctrl.register);
	router.get('/teams/:candidTeam', ctrl.teams);
	router.get('/problems/:problemCode', ctrl.problems);
	router.get('/problems/', ctrl.problems);
	router.get('/status/:problemCode,:teamname', ctrl.status);
	router.get('/status/:problemCode', ctrl.status);
	router.get('/status', ctrl.status);
	router.get('/submissions', ctrl.status);
	router.use(ctrl.notFound);
};
