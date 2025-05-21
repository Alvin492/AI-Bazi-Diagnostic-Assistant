const ChatSession = require('../models/ChatSession');

const validModels = ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'];

const chatSessionService = {
  async createChatSession(data) {
    if (!validModels.includes(data.model)) {
      throw new Error('无效的模型类型');
    }
    return await ChatSession.create(data);
  },

  async getUserSessions(userId) {
    return await ChatSession.findByUserId(userId);
  },

  async updateChatSession(id, data) {
    if (data.model && !validModels.includes(data.model)) {
      throw new Error('无效的模型类型');
    }
    return await ChatSession.update(id, data);
  }
};

module.exports = chatSessionService;
