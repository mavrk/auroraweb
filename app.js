"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var hbs = require('hbs');
var fs = require('fs');

var routes = require('./routes');
var conf = require('./conf');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server/views'));
app.set('view engine', 'hbs');
app.set('view cache', false);


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(conf.session));
app.use('/' + conf.mountPath, express.static(path.join(__dirname, 'public')));

// hbs.create({defaultLayout: __dirname + '/app_server/views/layouts/layout'});
hbs.registerPartials(path.join(__dirname, 'app_server/views/partials'));
hbs.registerHelper('extend', function (name, context) {
    if (!this.customBlocks) {
        this.customBlocks = {};
    }
    this.customBlocks[name] = context.fn(this);
});
hbs.registerHelper('eq', function (a, b, options) {
    if (a === b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
hbs.registerHelper('noteq', function (a, b, options) {
	if (a !== b) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});
hbs.registerHelper('gt', function (a, b, options) {
    if (a > b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
hbs.registerHelper('lt', function (a, b, options) {
    if (a < b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
hbs.registerHelper('for', function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i <= to; i += incr)
        accum += block.fn(i);
    return accum;
});

routes(app);
// console.log(routes.router);
// app.use('/', routes.router);

// catch 404 and forward to error handler
app.get('/', function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;