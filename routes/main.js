var ctrl = require('../app_server/controllers/main');

module.exports = function(app){
    app.use(ctrl.all);
    app.get('/', ctrl.index);

    app.use(ctrl.notFound);
}

