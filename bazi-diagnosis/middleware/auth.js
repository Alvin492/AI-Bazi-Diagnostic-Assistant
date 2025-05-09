// 引入 express-jwt 和日志
const { expressjwt: jwt } = require('express-jwt');
const logger = require('../config/logger');

// JWT 认证中间件
const authMiddleware = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: (req) => {
        // 从 Authorization 头获取 token
        console.log(req.headers.authorization,1);
        
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }
        return null;
    }
}).unless({
    path: ['/', '/api/auth/login', '/api/auth/wx-login','/api/auth/register'] // 不需要认证的路由
});

// JWT 错误处理
const authErrorHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        logger.warn(`JWT 认证失败，路径: ${req.path}, 错误: ${err.message}`);
        return res.status(401).json({code:401, error: '未授权，请登录',data: null });
    }
    next(err);
};

module.exports = { authMiddleware, authErrorHandler };