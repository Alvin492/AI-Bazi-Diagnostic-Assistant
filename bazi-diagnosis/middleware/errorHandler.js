// 引入日志
const logger = require('../config/logger');

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
    logger.error(`错误: ${err.message}, 堆栈: ${err.stack}`);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
    });
};

module.exports = errorHandler;