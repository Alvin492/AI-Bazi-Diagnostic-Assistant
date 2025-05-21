const ChatSession = require('../models/ChatSession');

const chatSessionController = {
  async create(req, res) {
    try {
      const { title, model, messages, files } = req.body;
      const userId = req.user?.id || 1; // 临时测试用，正式环境建议使用鉴权中间件挂载 req.user
      const id = await ChatSession.create({ title, model, messages, files, userId });
      res.status(201).json({ id });
    } catch (err) {
      console.error('创建聊天会话失败:', err);
      res.status(500).json({ error: '创建聊天会话失败' });
    }
  },

  async list(req, res) {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    try {
      const sessions = await ChatSession.findByUserId(userId);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { title, model, messages, files } = req.body;
      const id = req.params.id;
      const updated = await ChatSession.update(id, { title, model, messages, files });
      res.json({ updated });
    } catch (err) {
      console.error('更新聊天会话失败:', err);
      res.status(500).json({ error: '更新聊天会话失败' });
    }
  }
};

module.exports = chatSessionController;
