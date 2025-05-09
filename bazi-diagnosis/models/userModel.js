// 引入数据库连接池和日志
const pool = require('../config/database');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

// 用户模型
const User = {
    // 根据用户名查找用户
    async findByUsername(username) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows[0];
        } catch (error) {
            logger.error(`查找用户失败，username: ${username}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 根据 openid 查找用户
    async findByOpenid(openid) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);
            return rows[0];
        } catch (error) {
            logger.error(`查找用户失败，openid: ${openid}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 根据 ID 查找用户
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            logger.error(`查找用户失败，id: ${id}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 创建新用户
    async create({ openid, username, password }) {
        try {
            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }
            const [result] = await pool.query(
                'INSERT INTO users (openid, username, password) VALUES (?, ?, ?)',
                [openid, username, hashedPassword]
            );
            logger.info(`创建用户成功，username: ${username}, 用户ID: ${result.insertId}`);
            return result.insertId;
        } catch (error) {
            logger.error(`创建用户失败，username: ${username}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 更新用户手机号
    async updatePhone(id, phone) {
        try {
            await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, id]);
            logger.info(`更新用户手机号成功，userId: ${id}`);
        } catch (error) {
            logger.error(`更新用户手机号失败，userId: ${id}, 错误: ${error.message}`);
            throw error;
        }
    }
};

module.exports = User;