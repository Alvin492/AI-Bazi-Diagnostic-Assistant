export type ModelType = 'deepseek-chat' | 'deepseek-coder' | 'deepseek-reasoner';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  content: string;
  sessionId?: string;
  heartbeat?: boolean;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: ModelType;
  files?: FileInfo[];
  sessionId?: string;
}

export interface FileInfo {
  name: string;
  type: string;
  size: number;
  content?: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  model: ModelType;
  messages: ChatMessage[];
  files: FileInfo[];
  createdAt: Date;
  updatedAt: Date;
}
