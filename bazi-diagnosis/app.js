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
var sessionsRouter = require('./routes/sessions');
const chatSessionRouter = require('./routes/chatSessionRoutes');
// 引入中间件
const { authMiddleware, authErrorHandler } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
var app = express();

// view engine setup
app.use(cors({
  origin: '*',  // 允许所有来源访问，或者设置具体的域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// JWT 认证中间件 (放在需要认证的路由之前)
// app.use(authMiddleware);
// app.use(authErrorHandler);

// 路由配置
app.use('/', indexRouter); // 首页路由通常不需要认证
app.use('/users', usersRouter); // 用户相关路由可能部分需要认证，这里先放在认证中间件之后
app.use('/api/sessions', sessionsRouter);
app.use('/api/auth', authRouter); // 认证路由本身不需要认证，考虑将其放在 authMiddleware 之前
app.use('/api/bazi', baziRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/chat-sessions', chatSessionRouter);
// 自定义通用错误处理中间件 (捕获其他未处理的错误并返回 JSON)
app.use(errorHandler);

// catch 404 and forward to error handler (捕获所有未匹配的路由)
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler - 注释掉或移除默认的 HTML 错误处理
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
