var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var userDAO = require('./lib/UserDAO.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessions({
  cookieName: 'lunchtime', // cookie name dictates the key name added to the request object
  secret: 'these_are_not_the_cookies_youre_looking_for', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));
app.use(function(req, res, next) {
  if(req.lunchtime.uuid == null || req.lunchtime.uuid == undefined) {
    userDAO.createUser(function(err, user) {
      if(err) {
        return res.status(500).send();
      }
      req.lunchtime.uuid = user.uuid;
      next();
    })
  } else {
    next();
  }
}, function(req, res, next) {
  userDAO.getUser(req.lunchtime.uuid, function(err, user) {
    if(user == null) {
      req.lunchtime.reset();
      return res.redirect('/');
    }
    req.user = user;
    next();
  });
});
app.use(express.static(path.join(__dirname, 'public')));
/*app.use(function(req, res, next) {
  if(req.header('uuid') != null) {
    userDAO.getUser(req.header('uuid'), function(err, user) {
      if(user != null) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
});*/

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/api/games', require('./routes/api/games'));
app.use('/api/users', require('./routes/api/users'));
app.use('/games', require('./routes/games'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
