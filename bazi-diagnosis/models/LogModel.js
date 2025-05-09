// 引入数据库连接池
const pool = require('../config/database');
// 操作日志模型
const OperationLog = {
    // 创建操作日志
    async create({ action, details, user_id }) {
        try {
           
            
            await pool.query(
                'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
                [user_id || null, action, details]
            );
        } catch (error) {
            console.error(`写入操作日志到数据库失败: ${error.message}`);
            // 不抛出错误，避免影响主流程
        }
    },

    // 查询操作日志（可选，用于后续查看日志）
    async findByUserId(userId, limit = 100) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM operation_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
                [userId, limit]
            );
            return rows;
        } catch (error) {
            console.error(`查询操作日志失败: ${error.message}`);
            throw error;
        }
    }
};

module.exports = OperationLog;