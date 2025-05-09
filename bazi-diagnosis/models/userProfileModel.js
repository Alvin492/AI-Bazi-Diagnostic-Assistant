// 引入数据库连接池和日志
const pool = require('../config/database');
const logger = require('../config/logger');

// 用户档案模型
const UserProfile = {
    // 创建用户档案
    async create(userId, name, gender, birthDate) {
        try {
            const [result] = await pool.query(
                'INSERT INTO user_profiles (user_id, name, gender, birth_date) VALUES (?, ?, ?, ?)',
                [userId, name, gender, birthDate]
            );
            logger.info(`创建用户档案成功，用户ID: ${userId}, 档案ID: ${result.insertId}`);
            return result.insertId;
        } catch (error) {
            logger.error(`创建用户档案失败，用户ID: ${userId}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 根据用户 ID 查找档案
    async findByUserId(userId) {
        try {
            const [rows] = await pool.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
            return rows[0];
        } catch (error) {
            logger.error(`查找用户档案失败，用户ID: ${userId}, 错误: ${error.message}`);
            throw error;
        }
    }
};

module.exports = UserProfile;