const pool = require('../config/database');
const logger = require('../config/logger');

const ChatSession = {
  async create({ title = '新对话', model = 'deepseek-chat', messages = [], files = [], userId }) {
    try {
      const validModels = ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'];
      if (!validModels.includes(model)) throw new Error('无效的模型类型');
      
      const [result] = await pool.query(
        'INSERT INTO chat_sessions (title, model, messages, files, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [title, model, JSON.stringify(messages), JSON.stringify(files), userId]
      );
      console.log(result);
      
      // logger.info(`创建聊天会话成功，ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      logger.error(`创建聊天会话失败: ${error.message}`);
      throw error;
    }
  },

  async findByUserId(userId) {
    try {
      const [rows] = await pool.query('SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      console.log(rows);
      
      return rows.map(row => {
        // 辅助函数：安全解析JSON
        const safeParse = (jsonStr) => {
          try {
            return jsonStr ? JSON.parse(jsonStr) : [];
          } catch (e) {
            console.error('JSON解析失败:', jsonStr);
            return []; // 解析失败时返回空数组
          }
        };
        
        return {
          id: row.id,
          title: row.title,
          model: row.model,
          messages: safeParse(row.messages), // 使用安全解析
          files: safeParse(row.files),       // 使用安全解析
          userId: row.user_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
    } catch (error) {
      throw error;
    }
  },

  async update(id, { title, model, messages, files }) {
    try {
      const validModels = ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'];
      if (model && !validModels.includes(model)) throw new Error('无效的模型类型');
      
      const [result] = await pool.query(
        'UPDATE chat_sessions SET title = ?, model = ?, messages = ?, files = ?, updated_at = NOW() WHERE id = ?',
        [title, model, JSON.stringify(messages), JSON.stringify(files), id]
      );
      logger.info(`更新聊天会话成功，ID: ${id}`);
      return result.affectedRows;
    } catch (error) {
      logger.error(`更新聊天会话失败，ID: ${id}, 错误: ${error.message}`);
      throw error;
    }
  }
};

module.exports = ChatSession;