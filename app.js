var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var msgRouter = require('./routes/msg');
var subRouter = require('./routes/sub');
var photoRouter = require('./routes/photo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files',express.static(path.join(__dirname, 'upload')));
app.use(session({
  secret: 'p94uqijkld1234jfajfdaoijf',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1800000 }
 })
);

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/msg', msgRouter);
app.use('/sub', subRouter);
app.use('/photo', photoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
