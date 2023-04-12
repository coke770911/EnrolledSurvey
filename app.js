require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var stdlist = require('./routes/stdlist');
var userauth = require('./routes/userauth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//static path add
app.use(express.static(path.join(__dirname, 'public')));
//CSS add
app.use('/bootstrap/css',express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
//JS add
app.use('/bootstrap/js',express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/axios',express.static(path.join(__dirname, 'node_modules/axios/dist')));

app.use(session({
  store: new SQLiteStore,
  secret: 'your secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

//router add
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stdlist', stdlist);
app.use('/userauth', userauth);

//sys process
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
