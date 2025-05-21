var express = require('express');
var router = express.Router();
var OpenAI = require('openai');
var ChatSession = require('../models/ChatSession');

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-3ae305069f554bada2ffe3c909cb8c44'
});

/* GET AI response */
router.get('/ai', async function(req, res, next) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "deepseek-chat",
    });
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    next(error);
  }
});

/* POST chat */
router.post('/chat', async function(req, res, next) {
  // 设置请求超时
  req.setTimeout(120000); // 2分钟超时
  
  try {
    const { messages, model, files, sessionId } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '无效的消息格式' });
    }

    // 验证模型参数
    const modelMapping = {
      'deepseek-chat': 'deepseek-chat',
      'deepseek-coder': 'deepseek-coder',
      'deepseek-reasoner': 'deepseek-reasoner'
    };
    const supportedModels = Object.keys(modelMapping);
    if (!model || !supportedModels.includes(model)) {
      return res.status(400).json({ error: '不支持的模型类型' });
    }

    // 处理文件内容
    let systemMessage = "You are a helpful assistant.";
    if (files && files.length > 0) {
      const fileContexts = files.map(file => `文件名：${file.name}\n内容：\n${file.content}`).join('\n\n');
      systemMessage = `You are a helpful assistant. Please analyze the following files and answer user's questions:\n\n${fileContexts}`;
    }
    
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let heartbeatInterval;
    // 设置心跳，每15秒发送一次
    heartbeatInterval = setInterval(() => {
      if (!res.writableEnded) {
        res.write('data: {"heartbeat":true}\n\n');
      }
    }, 15000);

    const apiMessages = [
      { role: "system", content: systemMessage },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      messages: apiMessages,
      model: modelMapping[model],
      stream: true,
    });

    // 处理客户端断开连接
    req.on('close', () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      completion.controller.abort();
    });

    let buffer = '';
    const flushBuffer = () => {
      if (buffer && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
        buffer = '';
      }
    };

    let assistantResponse = '';

    try {
      for await (const chunk of completion) {
        if (res.writableEnded) {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          return;
        }
        
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          buffer += content;
          assistantResponse += content;
          // 当buffer达到一定大小或遇到标点符号时发送
          if (buffer.length >= 20 || /[。！？，.!?,]$/.test(buffer)) {
            flushBuffer();
          }
        }
      }

      // 发送剩余的buffer
      if (buffer) flushBuffer();

      if (!res.writableEnded) {
        res.write('data: [DONE]\n\n');
      }

      // 保存或更新聊天会话
      try {
        let session;
        
        // 如果提供了sessionId，更新现有会话
        console.log('sessionId', sessionId);
        
        if (sessionId) {
          session = await ChatSession.findById(sessionId);
          if (session) {
            // 添加用户消息
            const userMessage = messages[messages.length - 1];
            if (userMessage && userMessage.role === 'user') {
              await ChatSession.addMessage(sessionId, {
                role: 'user',
                content: userMessage.content
              });
            }
            
            // 添加助手回复
            await ChatSession.addMessage(sessionId, {
              role: 'assistant',
              content: assistantResponse
            });
            
            // 如需更新 title/model，可调用 ChatSession.update(sessionId, { title, model });
          }
        } 
        // 否则创建新会话
        else {
          // 将系统消息也加入到保存的消息中
          const allMessages = [
            { role: 'system', content: systemMessage },
            ...messages,
            { role: 'assistant', content: assistantResponse }
          ];
          
          session = new ChatSession({
            title: messages[0]?.content.substring(0, 30) + '...',
            model: model,
            messages: allMessages,
            files: files || []
          });
          
          await session.save();
        }
        
        // 发送会话ID
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ sessionId: session._id })}\n\n`);
          res.end();
        }
      } catch (dbError) {
        console.error('Error saving chat session:', dbError);
        // 即使保存会话失败，也不影响聊天功能
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: '流处理错误' })}\n\n`);
        res.end();
      }
    } finally {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    }
  } catch (error) {
    console.error('API error:', error);
    if (!res.writableEnded) {
      res.status(500).json({ error: error.message || '请求处理失败' });
    }
  }
});

module.exports = router;
