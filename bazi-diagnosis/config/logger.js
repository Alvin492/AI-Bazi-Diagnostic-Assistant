// 日志配置
// 引入 winston
// const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const Log = require('../models/LogModel');
const Transport = require('winston-transport');
// 自定义传输：将日志写入数据库
class DatabaseTransport extends Transport {
    constructor(options={}) {
        super(options);
        this.name = 'database';
        this.level = options.level || 'info';
    }
    
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        const idMatch = info.message.match(/id:\s*(\d+)/);
        const id = idMatch ? idMatch[1] : null;
        
        // 从 info 中提取 userId（如果存在）
        const userId = id || null;
        const { level, message, action } = info;
        
        // 映射 level 和 message 到 action 和 details
        const logAction = action || level; // 如果有 action 字段则使用，否则用 level
        const details = message;

        // 写入数据库
        Log.create({ action: logAction, details, user_id:userId }).catch((error) => {
            
            console.error(`写入日志到数据库失败: ${error.message}`);
        });

        callback();
    }
}
// 创建日志记录器
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, userId }) => {
            return `${timestamp} [${level.toUpperCase()}]${userId ? ` [UserID: ${userId}]` : ''}: ${message}`;
        })
    ),
    transports: [
        // 错误日志
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // 综合日志
        new transports.File({ filename: 'logs/combined.log' }),
        new DatabaseTransport() // 添加数据库传输
    ]
});

// 如果是开发环境，添加控制台输出
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        // format: winston.format.simple()
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message, userId }) => {
                return `${timestamp} [${level.toUpperCase()}]${userId ? ` [UserID: ${userId}]` : ''}: ${message}`;
            })
        )
    }));
}

module.exports = logger;