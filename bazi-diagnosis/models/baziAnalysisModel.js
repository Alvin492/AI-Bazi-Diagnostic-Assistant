// 引入数据库连接池和日志
const pool = require('../config/database');
const logger = require('../config/logger');

// 八字分析模型
const BaziAnalysis = {
    // 创建八字分析记录
    async create(birthDatetime, tenGods, dayMaster, aiComment, paymentStatus) {
        try {
            const [result] = await pool.query(
                'INSERT INTO user_analysis (birth_datetime, ten_gods, day_master, ai_comment, payment_status) VALUES (?, ?, ?, ?, ?)',
                [birthDatetime, JSON.stringify(tenGods), dayMaster, aiComment, paymentStatus]
            );
            logger.info(`创建八字分析记录成功，记录ID: ${result.insertId}`);
            return result.insertId;
        } catch (error) {
            logger.error(`创建八字分析记录失败，错误: ${error.message}`);
            throw error;
        }
    },

    // 根据 ID 查找八字分析记录
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM user_analysis WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            logger.error(`查找八字分析记录失败，ID: ${id}, 错误: ${error.message}`);
            throw error;
        }
    }
};

module.exports = BaziAnalysis;