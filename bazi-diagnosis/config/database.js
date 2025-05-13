const mysql = require('mysql2/promise');
require('dotenv').config();

// 使用与成功代码相同的参数
const pool = mysql.createPool({
    host: '112.125.122.139', // 直接使用成功的主机地址
    user: 'root',
    password: 'Root#2025!',
    database: 'ai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: 3306
});

(async () => {
    let connection;
    try {
        // console.log('连接配置:', {
        //     host: '112.125.122.139',
        //     user: 'root',
        //     database: 'ai'
        // });
        connection = await pool.getConnection();
        console.log('数据库连接成功！🎉');
    } catch (error) {
        console.error('数据库连接失败！❌ 错误信息:', error.code, error.message);
    } finally {
        if (connection) connection.release();
    }
})().catch(err => console.error('Unhandled error:', err));

module.exports = pool;