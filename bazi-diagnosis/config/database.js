// 数据库配置
// 引入 mysql2 和 dotenv
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试数据库连接
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接成功！🎉');
        connection.release();
    } catch (error) {
        console.error('数据库连接失败！❌ 错误信息：', error.message);
    }
})();
module.exports = pool;