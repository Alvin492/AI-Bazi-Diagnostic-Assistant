const mongoose = require('mongoose');

// 消息模式
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// 文件信息模式
const fileInfoSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: Number,
  content: String
});

// 聊天会话模式
const chatSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '新对话'
  },
  model: {
    type: String,
    enum: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    default: 'deepseek-chat'
  },
  messages: [messageSchema],
  files: [fileInfoSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新updatedAt字段
chatSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ChatSession', chatSessionSchema); 