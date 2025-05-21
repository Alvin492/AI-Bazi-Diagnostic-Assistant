import axios from 'axios'
import {ChatSession, FileInfo } from '../src/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function sendMessage(content: string, model: string = 'deepseek-chat', files: FileInfo[] = [], sessionId?: string): Promise<ReadableStream> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2分钟超时

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content
          }
        ],
        model,
        files,
        sessionId
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '网络请求失败');
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    const reader = response.body.getReader();
    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        reader.cancel();
      }
    }); 
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
    throw new Error('未知错误');
  }
}

// 获取所有聊天会话
export async function getChatSessions(): Promise<ChatSession[]> {
  try {
    const response = await api.get('/api/sessions');
    return response.data;
  } catch (error) {
    console.error('获取聊天会话失败', error);
    throw error;
  }
}

// 获取特定聊天会话详情
export async function getChatSession(sessionId: string): Promise<ChatSession> {
  try {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('获取聊天会话详情失败', error);
    throw error;
  }
}

// 创建新的聊天会话
export async function createChatSession(title: string, model: string): Promise<ChatSession> {
  try {
    const response = await api.post('/api/sessions', { title, model });
    return response.data;
  } catch (error) {
    console.error('创建聊天会话失败', error);
    throw error;
  }
}

// 更新聊天会话标题
export async function updateChatSessionTitle(sessionId: string, title: string): Promise<ChatSession> {
  try {
    const response = await api.put(`/api/sessions/${sessionId}`, { title });
    return response.data;
  } catch (error) {
    console.error('更新聊天会话标题失败', error);
    throw error;
  }
}

// 删除聊天会话
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    await api.delete(`/api/sessions/${sessionId}`);
  } catch (error) {
    console.error('删除聊天会话失败', error);
    throw error;
  }
}