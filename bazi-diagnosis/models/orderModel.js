// 引入数据库连接池和日志
const pool = require('../config/database');
const logger = require('../config/logger');

// 订单模型
const Order = {
    // 创建订单
    async create(orderNo, userId, amount, status) {
        try {
            const [result] = await pool.query(
                'INSERT INTO orders (order_no, user_id, amount, status) VALUES (?, ?, ?, ?)',
                [orderNo, userId, amount, status]
            );
            logger.info(`创建订单成功，订单号: ${orderNo}`);
            return result.insertId;
        } catch (error) {
            logger.error(`创建订单失败，订单号: ${orderNo}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 更新订单状态
    async updateStatus(orderNo, status) {
        try {
            await pool.query('UPDATE orders SET status = ? WHERE order_no = ?', [status, orderNo]);
            logger.info(`更新订单状态成功，订单号: ${orderNo}, 新状态: ${status}`);
        } catch (error) {
            logger.error(`更新订单状态失败，订单号: ${orderNo}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 根据订单号查找订单
    async findByOrderNo(orderNo) {
        try {
            const [rows] = await pool.query('SELECT * FROM orders WHERE order_no = ?', [orderNo]);
            return rows[0];
        } catch (error) {
            logger.error(`查找订单失败，订单号: ${orderNo}, 错误: ${error.message}`);
            throw error;
        }
    }
};

module.exports = Order;