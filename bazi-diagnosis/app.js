var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const baziRouter = require('./routes/bazi');
const paymentRouter = require('./routes/payment');
// 引入中间件
const { authMiddleware, authErrorHandler } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
var app = express();

// view engine setup
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// JWT 认证中间件
app.use(authMiddleware);
app.use(authErrorHandler);
// 路由配置
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/bazi', baziRouter);
app.use('/api/payment', paymentRouter);
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
