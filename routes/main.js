var ctrl = require('../app_server/controllers/main');

module.exports = function(router){
    router.use(ctrl.all);
    router.use(ctrl.lockdown);
    router.get('/', ctrl.index);
    router.get('/register', ctrl.register);
    router.get('/teams/:candidTeam', ctrl.teams);
    router.get('/problems/:problemCode', ctrl.problems);
    router.get('/problems/', ctrl.problems);
    router.use(ctrl.notFound);
}

