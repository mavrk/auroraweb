'use strict';
var express = require('express');
var router = express.Router();
var conf = require('../conf');

module.exports = function (app) {
    require('./process')(router);
    require('./main')(router);


    app.use('/' + conf.mountPath, router);
};