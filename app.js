var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var User = require('./models/user');
var es = require('express-session');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

passport.use(new LocalStrategy({ usernameField: 'username' }, function(username, password, done){
  if(!username){
    return done(false);
  }

  User.findOne({username: username}, function(err, user){
      if (!user) {
          return done(null, false, { msg: 'User was not found.' });
      }
      user.comparePassword(password, function(err, isMatch){
        if(isMatch) {
            return done(null, user);
        }else{
          return done(null, false, { msg: 'Invalid email or password.' });
        }
      });
  });
}));

passport.serializeUser(function(username, done){
  if(username) {
      done(null, username.id);
  }else{
    done(null, false);
  }
});

passport.deserializeUser(function(user, done){
  if(user) {
      //var id = mongoose.Types.ObjectId('587389959e17411644639ad1');
      User.findById(user, function (err, data) {
          return done(err, {username: data.username, fullname: data.fullname, id: data.id});
      });
  }else {
      return done(null, false);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(es({
    resave: true,
    saveUninitialized: true,
    secret: 'yabadabadoo1234'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Node modules:
app.use('/modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/partials', express.static(path.join(__dirname, 'views', 'partials')));

app.use('/', index);
app.use('/users', users);
app.use('/api', api);

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

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
